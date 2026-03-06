type LogLevel = "debug" | "info" | "warn" | "error";

type LogPayload = Record<string, unknown> | undefined;

const formatMessage = (level: LogLevel, tag: string, message: string) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] [${tag}] ${message}`;
};

const log =
  (level: LogLevel) =>
  (tag: string, message: string, payload?: LogPayload): void => {
    const formatted = formatMessage(level, tag, message);

    if (level === "error") {
      // Always log errors
      // eslint-disable-next-line no-console
      console.error(formatted, payload ?? "");
      return;
    }

    if (typeof __DEV__ !== "undefined" && !__DEV__) {
      // In production, only log warnings and above
      if (level === "debug" || level === "info") {
        return;
      }
    }

    // eslint-disable-next-line no-console
    const fn =
      level === "debug"
        ? console.debug
        : level === "info"
          ? console.log
          : console.warn;

    fn(formatted, payload ?? "");
  };

export const logger = {
  debug: log("debug"),
  info: log("info"),
  warn: log("warn"),
  error: log("error"),
};

