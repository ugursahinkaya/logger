import { LogLevel, LogMessage } from "@ugursahinkaya/shared-types";
export const levels = ["fatal", "error", "warn", "info", "debug", "trace"];

export const colors: Record<LogLevel, string> = {
  info: "#1d57b1",
  warn: "#dbab87",
  error: "#bf360d",
  debug: "#4e342e",
  fatal: "#e64a19",
  trace: "#02796b",
};
function logTime() {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}
export function parseSections(
  logger: { color: string; name: string },
  logLevel: LogLevel,
  message: LogMessage,
  meta?: string | string[],
  client = true
) {
  const messagePart =
    typeof message === "string" ? message : JSON.stringify(message);
  let firstMeta;
  let extraMeta;
  if (meta && meta[0]) {
    if (typeof meta === "string") {
      firstMeta = meta;
    } else {
      firstMeta = meta[0];
      extraMeta = `${meta.slice(1).join(" ")}`;
    }
  }
  const styles: string[] = [];

  const pushNodeStyle = (style: { color?: string; bold?: boolean }) => {
    styles.push(JSON.stringify(style));
  };
  if (client) {
    styles.push(`color:${colors[logLevel]};`);
    styles.push(`color: inherit;font-weight: 400;`);
    styles.push(`color: ${logger.color};font-weight: 500;`);
    if (firstMeta) {
      styles.push("color: #4db7a1;");
    }
    if (extraMeta) {
      styles.push("color: inherit;font-weight: 400;");
    }
    if (logLevel === "fatal" || logLevel === "error") {
      styles.push(`color: ${colors[logLevel]};font-weight: 600;`);
    } else {
      styles.push("color: inherit;font-weight: 600;");
    }
  } else {
    pushNodeStyle({ color: colors[logLevel] });
    pushNodeStyle({});
    pushNodeStyle({ color: logger.color });
    if (firstMeta) {
      pushNodeStyle({ color: "#4dc7b1" });
    }
    if (extraMeta) {
      pushNodeStyle({ color: "#5555A5" });
    }
    if (logLevel === "info") {
      pushNodeStyle({ bold: true });
    } else {
      pushNodeStyle({ color: colors[logLevel], bold: true });
    }
  }

  let icon: string;
  switch (logLevel) {
    case "fatal":
      icon = "FTL";
      break;
    case "error":
      icon = "ERR";
      break;
    case "warn":
      icon = "WRN";
      break;
    case "debug":
      icon = "DBG";
      break;
    case "trace":
      icon = "TRC";
      break;
    case "info":
      icon = "INF";
      break;
  }

  const sections = [icon, logTime(), `[${logger.name}]`];
  if (firstMeta) {
    sections.push(`[${firstMeta}]`);
  }
  if (extraMeta) {
    sections.push(extraMeta);
  }
  sections.push(messagePart);
  if (client) {
    return {
      sections: sections.map((s) => `%c${s}`),
      styles,
    };
  }
  return { sections, styles };
}
