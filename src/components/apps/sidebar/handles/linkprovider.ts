import { api } from "@/lib/elysia/eden-client";

export const handleLinkProvider = async (
  provider: "github",
  next?: string,
) => {
  const path =
    next ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const response = await api.auth["link-provider"].post({
    provider,
    next: path,
  });
  if (response.error) {
    const msg =
      typeof response.error === "object" &&
      response.error &&
      "message" in response.error
        ? (response.error as { message: string }).message
        : String(response.error);
    return { error: msg };
  }
  window.location.href = response.data.url;
  return { success: true };
};

export const handleUnlinkProvider = async (
  provider: "github",
): Promise<{ error?: string }> => {
  const response = await api.auth["unlink-provider"].post({ provider });
  if (response.error) {
    const msg =
      typeof response.error === "object" &&
      response.error &&
      "message" in response.error
        ? (response.error as { message: string }).message
        : "Failed to unlink";
    return { error: msg };
  }
  if (response.data && "error" in response.data) {
    return { error: (response.data as { error: string }).error };
  }
  window.location.reload();
  return {};
};
