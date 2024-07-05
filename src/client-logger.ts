import { LogLevel, LogMessage } from "@ugursahinkaya/shared-types";
import { levels, parseSections } from "./utils.js";

export class Logger {
  levelIndex: number;
  constructor(
    readonly name: string,
    readonly color: string = "#3399EE",
    level: LogLevel = "info"
  ) {
    this.levelIndex = levels.indexOf(level);
  }

  private log(level: LogLevel, message: LogMessage, meta?: string | string[]) {
    if (this.levelIndex < levels.indexOf(level)) {
      return;
    }
    const { sections, styles } = parseSections(
      this,
      level,
      message,
      meta,
      true
    );
    const formattedMessage = sections.join(" ");
    console.log(formattedMessage, ...styles);
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
