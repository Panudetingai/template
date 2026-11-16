/** Turn an Eden Treaty error into a plain `Error` with the API's message. */
export function edenErrorToError(error: {
  status?: unknown;
  value?: unknown;
}): Error {
  const value = error.value;
  if (typeof value === "object" && value !== null && "message" in value) {
    return new Error(String((value as { message: unknown }).message));
  }
  if (typeof value === "string" && value) return new Error(value);
  return new Error("Request failed");
}

/** Unwrap an Eden response: return `data`, or throw the API's error message. */
export function unwrap<T>(response: {
  error: { status?: unknown; value?: unknown } | null;
  data: T | null;
}): T {
  if (response.error) throw edenErrorToError(response.error);
  return response.data as T;
}
