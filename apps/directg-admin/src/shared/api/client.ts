import { createApiClient } from "@click-b/api-client";
import { env } from "@shared/config/env";

const normalizePrefix = (value: string) => value.replace(/\/$/, "");

export const apiClient = createApiClient({
  prefix: normalizePrefix(env.apiBaseUrl),
});
