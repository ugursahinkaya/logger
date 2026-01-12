# @mecra/logger

A lightweight, cross-platform logger with beautiful colored output for **Deno**, **Node.js**, and **browsers**.

[![JSR](https://jsr.io/badges/@mecra/logger)](https://jsr.io/@mecra/logger)
[![JSR Score](https://jsr.io/badges/@mecra/logger/score)](https://jsr.io/@mecra/logger)

## Features

- 🎨 **Colored console output** with ANSI colors for terminals and CSS styling for browsers
- 🔧 **Cross-platform** - Works seamlessly in Deno, Node.js, and browsers
- 📊 **Multiple log levels** - fatal, error, warn, info, debug, trace
- 🚀 **Zero dependencies** - Lightweight and fast
- 📁 **File transports** - Log to files in Deno and Node.js
- 🌐 **HTTP transports** - Send logs to remote endpoints
- 💪 **TypeScript first** - Full type safety and JSDoc documentation
- 🎯 **Flexible metadata** - Attach additional context to any log

## Installation

### Deno

```ts
import { Logger } from "jsr:@mecra/logger";
```

### Node.js

```bash
npx jsr add @mecra/logger
```

```ts
import { Logger } from "@mecra/logger";
```

### Browser

```html
<script type="module">
  import { Logger } from "https://esm.sh/jsr/@mecra/logger";
</script>
```

## Usage

### Basic Usage

```ts
import { Logger } from "@mecra/logger";

const logger = new Logger("app");

logger.info("Application started");
logger.warn("This is a warning");
logger.error("An error occurred");
logger.debug("Debug information");
```

### Custom Configuration

```ts
const logger = new Logger("api", {
  color: "#FF6B6B",     // Custom color for logger name
  level: "debug",       // Minimum log level to display
});

logger.debug("This will be shown");
logger.trace("This will be hidden (below debug level)");
```

### Log Levels

The logger supports 6 levels (in order of severity):

```ts
logger.fatal("Critical system failure");  // Highest severity
logger.error("Error occurred");
logger.warn("Warning message");
logger.info("Informational message");     // Default level
logger.debug("Debug information");
logger.trace("Detailed trace data");      // Lowest severity
```

### Adding Metadata

You can attach additional context to any log message:

```ts
// String metadata
logger.info("User logged in", "userId: 123");

// Array metadata
logger.error("Request failed", ["GET /api/users", "status: 500"]);

// Object metadata
logger.warn("High memory usage", { memory: "85%", threshold: "80%" });
```

### Different Message Types

```ts
// String messages
logger.info("Simple text message");

// Object messages
logger.info({ status: "success", code: 200, data: { id: 1 } });

// Number messages
logger.debug(42);

// Boolean messages
logger.info(true);
```

### File Transport (Deno & Node.js)

Write logs to files:

```ts
const logger = new Logger("app", {
  transports: {
    filePath: "./app.log",
    levels: ["error", "warn", "info"],
  },
});

logger.error("This will be written to app.log");
```

### HTTP Transport

Send logs to a remote endpoint:

```ts
const logger = new Logger("app", {
  transports: {
    url: "https://logs.example.com/collect",
    levels: ["error", "fatal"],
  },
});

logger.error("This will be sent to the remote endpoint");
```

### Multiple Transports

Combine multiple transports:

```ts
const logger = new Logger("app", {
  level: "debug",
  transports: [
    {
      filePath: "./app.log",
      levels: ["info", "warn", "error", "fatal"],
    },
    {
      url: "https://logs.example.com/errors",
      levels: ["error", "fatal"],
    },
  ],
});
```

## Transport Format

When using transports, logs are sent in JSON format:

```json
{
  "level": "error",
  "message": "Something went wrong",
  "metadata": "userId: 123",
  "timestamp": "2024-01-12T10:30:00.000Z",
  "logger": "app"
}
```

## API Reference

### `Logger`

#### Constructor

```ts
new Logger(name: string, options?: LoggerOptions)
```

**Parameters:**
- `name` - Logger name/namespace (displayed in output)
- `options` - Optional configuration object

**Options:**
- `color` - Hex color for logger name (default: `"#3399EE"`)
- `level` - Minimum log level (default: `"info"`)
- `transports` - Transport configuration (single or array)

#### Methods

- `fatal(message, metadata?)` - Log fatal error
- `error(message, metadata?)` - Log error
- `warn(message, metadata?)` - Log warning
- `info(message, metadata?)` - Log info
- `debug(message, metadata?)` - Log debug info
- `trace(message, metadata?)` - Log trace

### Types

```ts
type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

type LogMessage = string | Record<string, any> | any[] | number | boolean;

type LogMetadata = string | string[] | Record<string, any> | any;

interface TransportConfig {
  url?: string;
  filePath?: string;
  levels: LogLevel | LogLevel[];
}

interface LoggerOptions {
  color?: string;
  level?: LogLevel;
  transports?: TransportConfig | TransportConfig[];
}
```

## Runtime Detection

The logger automatically detects the runtime environment and adjusts its output:

- **Browsers**: Uses CSS styling with `console.log`
- **Terminals** (Deno/Node.js): Uses ANSI color codes
- **Transports**: Disabled in browsers, enabled in Deno/Node.js

## Examples

### Multi-Service Application

```ts
const apiLogger = new Logger("api", { color: "#00D9FF" });
const dbLogger = new Logger("database", { color: "#FF6B6B" });
const authLogger = new Logger("auth", { color: "#4ECB71" });

apiLogger.info("Server started on port 3000");
dbLogger.info("Connected to database");
authLogger.warn("Rate limit exceeded", { ip: "192.168.1.1" });
```

### Production Logging

```ts
const logger = new Logger("production", {
  level: "info",  // Hide debug and trace in production
  transports: [
    {
      filePath: "./logs/app.log",
      levels: ["info", "warn", "error", "fatal"],
    },
    {
      url: "https://monitoring.example.com/logs",
      levels: ["error", "fatal"],
    },
  ],
});
```

### Development vs Production

```ts
const isDev = Deno.env.get("ENV") === "development";

const logger = new Logger("app", {
  level: isDev ? "debug" : "info",
  transports: isDev ? undefined : {
    filePath: "./logs/app.log",
    levels: ["error", "warn", "info"],
  },
});
```

## License

This package is dual-licensed under:

- **GPL-3.0-only** for open-source projects
- **Commercial License** for proprietary use

See [LICENSE](./LICENSE) and [LICENSE-GPL.txt](./LICENSE-GPL.txt) for details.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Links

- [JSR Package](https://jsr.io/@mecra/logger)
- [Documentation](https://jsr.io/@mecra/logger/doc)
- [Source Code](https://github.com/ugursahinkaya/logger)
