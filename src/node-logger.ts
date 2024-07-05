import chalk from "chalk";
import { appendFile } from "fs";

import { LogLevel, LogMessage } from "@ugursahinkaya/shared-types";
import { levels, parseSections } from "./utils.js";

type TransportArgs = {
  url?: string;
  filePath?: string;
  levels: LogLevel | LogLevel[];
};
export class Logger {
  levelIndex: number;
  fetchTransports = new Map<string, LogLevel[]>();
  fileTransports = new Map<string, LogLevel[]>();
  constructor(
    readonly name: string,
    readonly color: string = "#3399EE",
    readonly level: LogLevel = "info",
    readonly transport?: TransportArgs | TransportArgs[]
  ) {
    this.levelIndex = levels.indexOf(level);
    if (this.transport) {
      if (Array.isArray(this.transport)) {
        this.transport.map((t) => {
          this.defineTransport(t);
        });
      } else {
        this.defineTransport(this.transport);
      }
    }
  }
  private defineTransport(args: TransportArgs) {
    if (args.url) {
      if (process.env.deviceId) {
        throw new Error(
          "deviceId env must be provided for http transport logs"
        );
      }
      if (Array.isArray(args.levels)) {
        this.fetchTransports.set(args.url, args.levels);
      } else {
        this.fetchTransports.set(args.url, [args.levels]);
      }
    }
    if (args.filePath) {
      if (Array.isArray(args.levels)) {
        this.fileTransports.set(args.filePath, args.levels);
      } else {
        this.fileTransports.set(args.filePath, [args.levels]);
      }
    }
  }
  private appendToFile(
    level: LogLevel,
    message: LogMessage,
    meta?: string | string[]
  ) {
    if (this.fileTransports.size === 0) {
      return;
    }
    const line = JSON.stringify({
      level,
      message,
      meta,
      date: new Date(),
      provider: this.name,
    });
    this.fileTransports.forEach((logLevels, path) => {
      if (logLevels.includes(level)) {
        void appendFile(path, line + "\n", () => {});
      }
    });
  }
  private fetch(
    level: LogLevel,
    message: LogMessage,
    meta?: string | string[]
  ) {
    if (this.fetchTransports.size === 0) {
      return;
    }
    const body = JSON.stringify({
      level,
      message,
      meta,
      date: new Date(),
      provider: this.name,
    });
    this.fetchTransports.forEach((logLevels, url) => {
      if (logLevels.includes(level)) {
        void fetch(url, {
          method: "POST",
          mode: "cors",
          credentials: "include",
          referrerPolicy: "same-origin",
          headers: {
            "Content-Type": "application/json",
            Cookie: `deviceId=${process.env.deviceId};`,
          },
          body,
        }).catch((reason) => {
          throw new Error(`Log transport by fetch fail: ${reason}`);
        });
      }
    });
  }
  private log(level: LogLevel, message: LogMessage, meta?: string | string[]) {
    if (this.levelIndex < levels.indexOf(level)) {
      return;
    }
    this.fetch(level, message, meta);
    const { sections, styles } = parseSections(
      this,
      level,
      message,
      meta,
      false
    );
    this.appendToFile(level, message, meta);

    const formattedSections: string[] = [];

    styles.map((s, i) => {
      const style = JSON.parse(s) as { color?: string; bold?: boolean };
      if (style.bold) {
        if (style.color) {
          formattedSections.push(chalk.bold.hex(style.color)(sections[i]));
        } else {
          formattedSections.push(chalk.bold(sections[i]));
        }
      } else {
        if (style.color) {
          formattedSections.push(chalk.hex(style.color)(sections[i]));
        } else if (sections[i]) {
          formattedSections.push(sections[i]!);
        }
      }
    });
    console.log(formattedSections.join(" "));
  }

  fatal(message: LogMessage, meta?: string | string[]) {
    this.log("fatal", message, meta);
  }

  trace(message: LogMessage, meta?: string | string[]) {
    this.log("trace", message, meta);
  }

  info(message: LogMessage, meta?: string | string[]) {
    this.log("info", message, meta);
  }

  warn(message: LogMessage, meta?: string | string[]) {
    this.log("warn", message, meta);
  }

  error(message: LogMessage, meta?: string | string[]) {
    this.log("error", message, meta);
  }

  debug(message: LogMessage, meta?: string | string[]) {
    this.log("debug", message, meta);
  }
}
