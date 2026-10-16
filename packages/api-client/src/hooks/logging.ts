import type { BeforeRequestHook } from "ky";

export interface LoggingHookOptions {
  enabled?: boolean;
  logger?: (message: string) => void;
}

export const createLoggingHook = (options?: LoggingHookOptions): BeforeRequestHook => {
  const { enabled = false, logger = console.log } = options ?? {};

  return ({ request }) => {
    if (enabled) {
      logger(`[API] ${request.method} ${request.url}`);
    }
  };
};
