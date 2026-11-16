/** Throw from services; the global error handler maps it to a JSON response. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const unauthorized = (message = "Unauthorized") =>
  new HttpError(401, message, "unauthorized");
export const notFound = (message = "Not found") =>
  new HttpError(404, message, "not_found");
export const badRequest = (message: string) =>
  new HttpError(400, message, "bad_request");
export const tooManyRequests = (message = "Too many requests") =>
  new HttpError(429, message, "rate_limited");
export const notConfigured = (feature: string) =>
  new HttpError(503, `${feature} is not configured on this server`, "not_configured");
