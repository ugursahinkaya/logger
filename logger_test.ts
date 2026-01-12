import { Logger, LOG_LEVELS } from "./mod.ts";
import type { LogLevel } from "./types.ts";

function assertEquals<T>(actual: T, expected: T, msg?: string): void {
  if (actual !== expected) {
    throw new Error(msg || `Expected ${expected} but got ${actual}`);
  }
}

Deno.test("Logger - basic instantiation", () => {
  const logger = new Logger("test");
  assertEquals(logger.name, "test");
  assertEquals(logger.level, "info");
  assertEquals(logger.color, "#3399EE");
});

Deno.test("Logger - custom options", () => {
  const logger = new Logger("custom", {
    color: "#FF6B6B",
    level: "debug",
  });
  assertEquals(logger.name, "custom");
  assertEquals(logger.level, "debug");
  assertEquals(logger.color, "#FF6B6B");
});

Deno.test("Logger - all log levels", () => {
  const logger = new Logger("test", { level: "trace" });

  // These should not throw
  logger.fatal("fatal message");
  logger.error("error message");
  logger.warn("warn message");
  logger.info("info message");
  logger.debug("debug message");
  logger.trace("trace message");
});

Deno.test("Logger - log level filtering", () => {
  const logger = new Logger("test", { level: "warn" });

  // Only warn, error, and fatal should be visible
  // info, debug, and trace should be filtered out
  logger.fatal("should show");
  logger.error("should show");
  logger.warn("should show");
  logger.info("should not show");
  logger.debug("should not show");
  logger.trace("should not show");
});

Deno.test("Logger - with metadata string", () => {
  const logger = new Logger("test", { level: "trace" });
  logger.info("message", "metadata");
  logger.warn("message", "another metadata");
});

Deno.test("Logger - with metadata array", () => {
  const logger = new Logger("test", { level: "trace" });
  logger.info("message", ["meta1", "meta2"]);
});

Deno.test("Logger - with metadata object", () => {
  const logger = new Logger("test", { level: "trace" });
  logger.info("message", { user: "john", action: "login" });
});

Deno.test("Logger - with object message", () => {
  const logger = new Logger("test", { level: "trace" });
  logger.info({ status: "success", code: 200 });
});

Deno.test("Logger - with number message", () => {
  const logger = new Logger("test", { level: "trace" });
  logger.info(42);
});

Deno.test("Logger - with boolean message", () => {
  const logger = new Logger("test", { level: "trace" });
  logger.info(true);
  logger.warn(false);
});

Deno.test("Logger - LOG_LEVELS constant", () => {
  assertEquals(LOG_LEVELS.length, 6);
  assertEquals(LOG_LEVELS[0], "fatal");
  assertEquals(LOG_LEVELS[5], "trace");
});

Deno.test("Logger - level index calculation", () => {
  const levels: LogLevel[] = ["fatal", "error", "warn", "info", "debug", "trace"];

  for (let i = 0; i < levels.length; i++) {
    const logger = new Logger("test", { level: levels[i] });
    assertEquals(logger.levelIndex, i);
  }
});
