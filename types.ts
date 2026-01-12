/**
 * @module
 *
 * Type definitions for the @mecra/logger package.
 *
 * This module exports all TypeScript types and interfaces used by the logger,
 * including log levels, message types, metadata types, and configuration options.
 *
 * @example
 * ```ts
 * import type { LogLevel, LoggerOptions } from "@mecra/logger/types";
 *
 * const level: LogLevel = "info";
 * const options: LoggerOptions = {
 *   color: "#FF6B6B",
 *   level: "debug"
 * };
 * ```
 */

// deno-lint-ignore-file no-explicit-any

/**
 * Represents a log message that can be of various types
 */
export type LogMessage =
  | string
  | Record<string, any>
  | any[]
  | number
  | boolean;

/**
 * Additional metadata that can be attached to log messages
 */
export type LogMetadata =
  | string
  | string[]
  | Record<string, any>
  | any;

/**
 * Available log levels in order of severity
 */
export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

/**
 * Runtime environment detection
 */
export type RuntimeEnvironment = "deno" | "node" | "browser" | "unknown";

/**
 * Configuration for external log transports
 */
export interface TransportConfig {
  /**
   * HTTP/HTTPS URL to send logs to
   */
  url?: string;

  /**
   * File path to write logs to (Deno and Node.js only)
   */
  filePath?: string;

  /**
   * Log levels to send to this transport
   */
  levels: LogLevel | LogLevel[];
}

/**
 * Logger configuration options
 */
export interface LoggerOptions {
  /**
   * Custom color for the logger name in hex format (e.g., "#FF6B6B")
   * @default "#3399EE"
   */
  color?: string;

  /**
   * Minimum log level to output
   * @default "info"
   */
  level?: LogLevel;

  /**
   * External transports for sending logs to files or HTTP endpoints
   */
  transports?: TransportConfig | TransportConfig[];
}

/**
 * @deprecated Use TransportConfig instead
 */
export type TransportArgs = TransportConfig;