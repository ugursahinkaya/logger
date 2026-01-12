/**
 * @module
 *
 * A lightweight, cross-platform logger for Deno, Node.js, and browsers.
 *
 * @example
 * ```ts
 * import { Logger } from "@mecra/logger";
 *
 * const logger = new Logger("app");
 * logger.info("Application started");
 * logger.warn("This is a warning");
 * logger.error("An error occurred");
 * ```
 */

import type {
  LoggerOptions,
  LogLevel,
  LogMessage,
  LogMetadata,
  TransportConfig,
  RuntimeEnvironment,
} from "./types.ts";

export * from "./types.ts";

/**
 * All available log levels in order of severity
 */
export const LOG_LEVELS: readonly LogLevel[] = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
] as const;

/**
 * ANSI color codes for terminal output
 */
const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
} as const;

/**
 * Color mapping for each log level
 */
const LEVEL_COLORS: Record<LogLevel, string> = {
  fatal: ANSI.red,
  error: ANSI.red,
  warn: ANSI.yellow,
  info: ANSI.blue,
  debug: ANSI.magenta,
  trace: ANSI.cyan,
};

/**
 * Detects the current runtime environment
 */
function detectEnvironment(): RuntimeEnvironment {
  // deno-lint-ignore no-explicit-any
  const globalAny = globalThis as any;

  if (typeof globalAny.Deno !== "undefined") {
    return "deno";
  }

  if (
    typeof globalAny.process !== "undefined" &&
    globalAny.process.versions?.node
  ) {
    return "node";
  }

  if (typeof globalAny.document !== "undefined") {
    return "browser";
  }

  return "unknown";
}

/**
 * Current runtime environment
 */
const RUNTIME: RuntimeEnvironment = detectEnvironment();

/**
 * A flexible, cross-platform logger with support for multiple log levels,
 * colored output, and custom transports.
 *
 * @example
 * ```ts
 * // Basic usage
 * const logger = new Logger("myapp");
 * logger.info("Hello, world!");
 *
 * // With custom color and level
 * const debugLogger = new Logger("debug", {
 *   color: "#FF6B6B",
 *   level: "debug"
 * });
 *
 * // With transports
 * const logger = new Logger("api", {
 *   transports: [
 *     { url: "https://logs.example.com", levels: ["error", "fatal"] },
 *     { filePath: "./app.log", levels: ["info", "warn", "error"] }
 *   ]
 * });
 * ```
 */
export class Logger {
  readonly name: string;
  readonly color: string;
  readonly level: LogLevel;
  readonly levelIndex: number;

  private readonly fetchTransports = new Map<string, Set<LogLevel>>();
  private readonly fileTransports = new Map<string, Set<LogLevel>>();

  /**
   * Creates a new Logger instance
   *
   * @param name - The logger name/namespace
   * @param options - Optional configuration
   */
  constructor(name: string, options: LoggerOptions = {}) {
    this.name = name;
    this.color = options.color ?? "#3399EE";
    this.level = options.level ?? "info";
    this.levelIndex = LOG_LEVELS.indexOf(this.level);

    if (options.transports) {
      const transports = Array.isArray(options.transports)
        ? options.transports
        : [options.transports];

      for (const transport of transports) {
        this.addTransport(transport);
      }
    }
  }

  /**
   * Adds a transport for logging to external destinations
   */
  private addTransport(config: TransportConfig): void {
    const levels = Array.isArray(config.levels)
      ? config.levels
      : [config.levels];
    const levelSet = new Set<LogLevel>(levels);

    if (config.url) {
      this.fetchTransports.set(config.url, levelSet);
    }

    if (config.filePath) {
      this.fileTransports.set(config.filePath, levelSet);
    }
  }

  /**
   * Formats the current time for log output
   */
  private formatTime(): string {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
  }

  /**
   * Formats a log message to a string
   */
  private formatMessage(message: LogMessage): string {
    if (typeof message === "string") {
      return message;
    }

    if (typeof message === "number" || typeof message === "boolean") {
      return String(message);
    }

    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }

  /**
   * Formats metadata to a string
   */
  private formatMetadata(metadata?: LogMetadata): string {
    if (!metadata) {
      return "";
    }

    if (typeof metadata === "string") {
      return metadata;
    }

    if (Array.isArray(metadata)) {
      return metadata.join(" ");
    }

    try {
      return JSON.stringify(metadata);
    } catch {
      return String(metadata);
    }
  }

  /**
   * Logs a message to the console with browser-specific formatting
   */
  private logBrowser(
    level: LogLevel,
    time: string,
    message: string,
    metadata: string,
  ): void {
    const sections = [
      `%c[${time}]`,
      `%c[${this.name.toUpperCase()}]`,
      `%c[${level.toUpperCase()}]`,
      `%c${message}`,
    ];

    const styles = [
      "color: gray;",
      `color: ${this.color}; font-weight: bold;`,
      `color: ${LEVEL_COLORS[level]}; font-weight: bold;`,
      "color: inherit;",
    ];

    if (metadata) {
      sections.push(`%c(${metadata})`);
      styles.push("color: #4db7a1; font-style: italic;");
    }

    console.log(sections.join(" "), ...styles);
  }

  /**
   * Logs a message to the console with terminal-specific ANSI formatting
   */
  private logTerminal(
    level: LogLevel,
    time: string,
    message: string,
    metadata: string,
  ): void {
    const color = LEVEL_COLORS[level];
    const parts = [
      `${ANSI.gray}[${time}]${ANSI.reset}`,
      `${ANSI.bold}${color}[${this.name.toUpperCase()}]${ANSI.reset}`,
      `${color}[${level.toUpperCase()}]${ANSI.reset}`,
      message,
    ];

    if (metadata) {
      parts.push(`${ANSI.cyan}(${metadata})${ANSI.reset}`);
    }

    console.log(parts.join(" "));
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: LogMessage,
    metadata?: LogMetadata,
  ): void {
    const levelIdx = LOG_LEVELS.indexOf(level);

    if (this.levelIndex < levelIdx) {
      return;
    }

    const time = this.formatTime();
    const messageStr = this.formatMessage(message);
    const metadataStr = this.formatMetadata(metadata);

    if (RUNTIME === "browser") {
      this.logBrowser(level, time, messageStr, metadataStr);
    } else {
      this.logTerminal(level, time, messageStr, metadataStr);
    }

    if (RUNTIME !== "browser") {
      this.executeTransports(level, message, metadataStr).catch(() => {});
    }
  }

  /**
   * Executes all configured transports for the given log level
   */
  private async executeTransports(
    level: LogLevel,
    message: LogMessage,
    metadata: string,
  ): Promise<void> {
    const logEntry = {
      level,
      message,
      metadata: metadata || undefined,
      timestamp: new Date().toISOString(),
      logger: this.name,
    };

    const logData = JSON.stringify(logEntry) + "\n";

    const promises: Promise<void>[] = [];

    for (const [url, levels] of this.fetchTransports) {
      if (levels.has(level)) {
        promises.push(
          fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: logData,
          })
            .then(() => {})
            .catch(() => {}),
        );
      }
    }

    for (const [filePath, levels] of this.fileTransports) {
      if (levels.has(level)) {
        promises.push(this.writeToFile(filePath, logData));
      }
    }

    await Promise.allSettled(promises);
  }

  /**
   * Writes log data to a file (Deno or Node.js)
   */
  private async writeToFile(
    filePath: string,
    data: string,
  ): Promise<void> {
    try {
      if (RUNTIME === "deno") {
        // deno-lint-ignore no-explicit-any
        await (globalThis as any).Deno.writeTextFile(filePath, data, {
          append: true,
        });
      } else if (RUNTIME === "node") {
        const fs = await import("node:fs/promises");
        await fs.appendFile(filePath, data);
      }
    } catch {
      // Silently fail
    }
  }

  /**
   * Logs a fatal message (highest severity)
   */
  fatal(message: LogMessage, metadata?: LogMetadata): void {
    this.log("fatal", message, metadata);
  }

  /**
   * Logs an error message
   */
  error(message: LogMessage, metadata?: LogMetadata): void {
    this.log("error", message, metadata);
  }

  /**
   * Logs a warning message
   */
  warn(message: LogMessage, metadata?: LogMetadata): void {
    this.log("warn", message, metadata);
  }

  /**
   * Logs an info message
   */
  info(message: LogMessage, metadata?: LogMetadata): void {
    this.log("info", message, metadata);
  }

  /**
   * Logs a debug message
   */
  debug(message: LogMessage, metadata?: LogMetadata): void {
    this.log("debug", message, metadata);
  }

  /**
   * Logs a trace message (lowest severity)
   */
  trace(message: LogMessage, metadata?: LogMetadata): void {
    this.log("trace", message, metadata);
  }
}