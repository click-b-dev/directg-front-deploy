import ky, { type Options, type Hooks } from "ky";

export interface ApiClientConfig {
  prefix: string;
  timeout?: number | false;
  retry?: Options["retry"];
  hooks?: Hooks;
}

export interface ApiClient {
  get: <T>(url: string, options?: Options) => Promise<T>;
  post: <T>(url: string, json?: unknown, options?: Options) => Promise<T>;
  put: <T>(url: string, json?: unknown, options?: Options) => Promise<T>;
  patch: <T>(url: string, json?: unknown, options?: Options) => Promise<T>;
  del: <T>(url: string, options?: Options) => Promise<T>;
  void: (
    method: "post" | "put" | "patch" | "delete",
    url: string,
    json?: unknown,
    options?: Options,
  ) => Promise<void>;
  blob: (url: string, options?: Options) => Promise<Blob>;
  text: (url: string, options?: Options) => Promise<string>;
}

export const createApiClient = (config: ApiClientConfig): ApiClient => {
  const instance = ky.create({
    prefix: config.prefix,
    timeout: config.timeout ?? 30_000,
    retry: config.retry ?? {
      limit: 2,
      statusCodes: [408, 413, 429, 500, 502, 503, 504],
    },
    hooks: config.hooks,
  });

  return {
    get: <T>(url: string, options?: Options) => instance.get(url, options).json<T>(),

    post: <T>(url: string, json?: unknown, options?: Options) =>
      instance.post(url, { ...options, json }).json<T>(),

    put: <T>(url: string, json?: unknown, options?: Options) =>
      instance.put(url, { ...options, json }).json<T>(),

    patch: <T>(url: string, json?: unknown, options?: Options) =>
      instance.patch(url, { ...options, json }).json<T>(),

    del: async <T>(url: string, options?: Options) => {
      const response = await instance.delete(url, options);
      if (response.status === 204) return undefined as T;
      return response.json<T>();
    },

    void: async (method, url, json?, options?) => {
      await instance[method](url, { ...options, json });
    },

    blob: (url: string, options?: Options) => instance.get(url, options).blob(),

    text: (url: string, options?: Options) => instance.get(url, options).text(),
  };
};
