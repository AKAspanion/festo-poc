type LogLevel = "debug" | "info" | "warn" | "error";

type LogMeta = Record<string, unknown> | undefined;

const formatMessage = (level: LogLevel, message: string) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
};

export const logInfo = (message: string, meta?: LogMeta): void => {
  // eslint-disable-next-line no-console
  console.log(formatMessage("info", message), meta ?? "");
};

export const logWarn = (message: string, meta?: LogMeta): void => {
  // eslint-disable-next-line no-console
  console.warn(formatMessage("warn", message), meta ?? "");
};

export const logError = (message: string, meta?: LogMeta): void => {
  // eslint-disable-next-line no-console
  console.error(formatMessage("error", message), meta ?? "");
};

export const logDebug = (message: string, meta?: LogMeta): void => {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  // eslint-disable-next-line no-console
  console.debug(formatMessage("debug", message), meta ?? "");
};

export const requestSummary = (options: {
  method: string;
  path: string;
  status: number;
  durationMs: number;
}): void => {
  const { method, path, status, durationMs } = options;
  const msg = `${method} ${path} -> ${status} (${durationMs.toFixed(0)}ms)`;
  if (status >= 500) {
    logError(msg);
  } else if (status >= 400) {
    logWarn(msg);
  } else {
    logInfo(msg);
  }
};

