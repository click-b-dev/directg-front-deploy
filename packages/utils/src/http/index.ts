// ─── HTTP Status Codes ───

export const HTTP_STATUS = {
  // 1xx Informational
  _100_CONTINUE: 100,
  _101_SWITCHING_PROTOCOLS: 101,
  _102_PROCESSING: 102,
  _103_EARLY_HINTS: 103,

  // 2xx Success
  _200_OK: 200,
  _201_CREATED: 201,
  _202_ACCEPTED: 202,
  _203_NON_AUTHORITATIVE_INFORMATION: 203,
  _204_NO_CONTENT: 204,
  _205_RESET_CONTENT: 205,
  _206_PARTIAL_CONTENT: 206,
  _207_MULTI_STATUS: 207,
  _208_ALREADY_REPORTED: 208,
  _226_IM_USED: 226,

  // 3xx Redirection
  _300_MULTIPLE_CHOICES: 300,
  _301_MOVED_PERMANENTLY: 301,
  _302_FOUND: 302,
  _303_SEE_OTHER: 303,
  _304_NOT_MODIFIED: 304,
  _305_USE_PROXY: 305,
  _307_TEMPORARY_REDIRECT: 307,
  _308_PERMANENT_REDIRECT: 308,

  // 4xx Client Error
  _400_BAD_REQUEST: 400,
  _401_UNAUTHORIZED: 401,
  _402_PAYMENT_REQUIRED: 402,
  _403_FORBIDDEN: 403,
  _404_NOT_FOUND: 404,
  _405_METHOD_NOT_ALLOWED: 405,
  _406_NOT_ACCEPTABLE: 406,
  _407_PROXY_AUTHENTICATION_REQUIRED: 407,
  _408_REQUEST_TIMEOUT: 408,
  _409_CONFLICT: 409,
  _410_GONE: 410,
  _411_LENGTH_REQUIRED: 411,
  _412_PRECONDITION_FAILED: 412,
  _413_PAYLOAD_TOO_LARGE: 413,
  _414_URI_TOO_LONG: 414,
  _415_UNSUPPORTED_MEDIA_TYPE: 415,
  _416_RANGE_NOT_SATISFIABLE: 416,
  _417_EXPECTATION_FAILED: 417,
  _418_IM_A_TEAPOT: 418,
  _421_MISDIRECTED_REQUEST: 421,
  _422_UNPROCESSABLE_ENTITY: 422,
  _423_LOCKED: 423,
  _424_FAILED_DEPENDENCY: 424,
  _425_TOO_EARLY: 425,
  _426_UPGRADE_REQUIRED: 426,
  _428_PRECONDITION_REQUIRED: 428,
  _429_TOO_MANY_REQUESTS: 429,
  _431_REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  _451_UNAVAILABLE_FOR_LEGAL_REASONS: 451,

  // 5xx Server Error
  _500_INTERNAL_SERVER_ERROR: 500,
  _501_NOT_IMPLEMENTED: 501,
  _502_BAD_GATEWAY: 502,
  _503_SERVICE_UNAVAILABLE: 503,
  _504_GATEWAY_TIMEOUT: 504,
  _505_HTTP_VERSION_NOT_SUPPORTED: 505,
  _506_VARIANT_ALSO_NEGOTIATES: 506,
  _507_INSUFFICIENT_STORAGE: 507,
  _508_LOOP_DETECTED: 508,
  _510_NOT_EXTENDED: 510,
  _511_NETWORK_AUTHENTICATION_REQUIRED: 511,
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

// ─── HTTP Methods ───

export const HTTP_METHOD = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
} as const;

export type HttpMethod = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD];

// ─── Status Category Guards ───

export function isInformational(status: number): boolean {
  return status >= 100 && status < 200;
}

export function isSuccess(status: number): boolean {
  return status >= 200 && status < 300;
}

export function isRedirect(status: number): boolean {
  return status >= 300 && status < 400;
}

export function isClientError(status: number): boolean {
  return status >= 400 && status < 500;
}

export function isServerError(status: number): boolean {
  return status >= 500 && status < 600;
}

export function isError(status: number): boolean {
  return status >= 400;
}

// ─── Common HTTP Headers ───

export const HTTP_HEADER = {
  CONTENT_TYPE: "Content-Type",
  AUTHORIZATION: "Authorization",
  ACCEPT: "Accept",
  CACHE_CONTROL: "Cache-Control",
  IF_NONE_MATCH: "If-None-Match",
  ETAG: "ETag",
  X_REQUEST_ID: "X-Request-Id",
  RETRY_AFTER: "Retry-After",
} as const;

export type HttpHeader = (typeof HTTP_HEADER)[keyof typeof HTTP_HEADER];

// ─── Common Content Types ───

export const CONTENT_TYPE = {
  JSON: "application/json",
  FORM_URLENCODED: "application/x-www-form-urlencoded",
  FORM_DATA: "multipart/form-data",
  TEXT: "text/plain",
  HTML: "text/html",
  OCTET_STREAM: "application/octet-stream",
} as const;

export type ContentType = (typeof CONTENT_TYPE)[keyof typeof CONTENT_TYPE];
