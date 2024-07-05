# Logger

Colored logging in both Node.js and client-side consoles. It also allows Node.js to write logs to a file or transport them via http

## Client-Side usage

```typescript
import { ClientLogger } from "@ugursahinkaya/logger";

const clientLogger = new ClientLogger("ClientApp", "#FF5733", "debug");

clientLogger.debug("Client app initialized");
clientLogger.warn("Low memory warning", { availableMemory: "200MB" });
```

## Server-Side usage

### Basic usage for development

```typescript
import { Logger } from "@ugursahinkaya/logger";

const logger = new Logger("ServerModule", "#FF5733", "trace");

logger.info("Server started successfully");
logger.error("Failed to connect to database", { db: "main" });
```

### Logging with File and HTTP Transport (both optional)

```typescript
import { Logger } from "@ugursahinkaya/logger";

const logger = new Logger("ServerModule", "#FF5733", "info", [
  { filePath: "./logs/server_log.txt", levels: ["info", "error"] },
  { url: "http://example.com/logs", levels: ["error"] },
]);

logger.info("Server started successfully");
logger.error("Failed to connect to database", { db: "main" });
```

## License

### Commercial License

If you intend to use this software for a commercial project or commercial purposes, you need to obtain a commercial license.

The commercial license covers the commercial use, integration, and distribution of the software. It grants the user the right to use the software in commercial projects and includes additional support and services.

For more information on commercial license fees and conditions, please contact us at: [ugur@sahinkaya.xyz](mailto:ugur@sahinkaya.xyz)

### Open Source License

This software is available for free under the GNU General Public License version 3 (GPLv3).

This license allows the software to be used, modified, and distributed under open source terms. However, when using the software under the GPLv3 license, any project that uses the software must also be distributed under the same license terms.

You can access the full text of the GPLv3 license [here](LICENSE-GPL.txt).
