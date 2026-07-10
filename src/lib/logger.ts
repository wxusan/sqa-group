type LogValue = boolean | number | string | null | undefined;
type LogContext = Record<string, LogValue>;

function serialize(level: "error" | "info" | "warn", event: string, context: LogContext = {}) {
  return JSON.stringify({
    level,
    event,
    timestamp: new Date().toISOString(),
    ...context,
  });
}

/** Structured, PII-free events for Vercel runtime logs. */
export function logInfo(event: string, context: LogContext = {}) {
  console.info(serialize("info", event, context));
}

export function logWarn(event: string, context: LogContext = {}) {
  console.warn(serialize("warn", event, context));
}

export function logError(event: string, error: unknown, context: LogContext = {}) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(serialize("error", event, { ...context, error: message }));
}
