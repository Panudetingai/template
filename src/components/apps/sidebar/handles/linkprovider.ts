import { publicEnv } from "@/env/public";

export const handleLinkProvider = async (
  provider: "github",
  next?: string,
) => {
  const path =
    next ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const res = await fetch(
    `/api/auth/link-provider`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, next: path }),
    },
  );
  const text = await res.text();
  let data: { url?: string; message?: string } = {};
  if (text) {
    try {
      data = JSON.parse(text) as { url?: string; message?: string };
    } catch {
      return { error: "เซิร์ฟเวอร์ตอบกลับไม่ใช่ JSON ที่ถูกต้อง" };
    }
  }
  if (!res.ok) {
    return { error: data.message ?? `ลิงก์บัญชีล้มเหลว (${res.status})` };
  }
  if (!data.url) {
    return { error: data.message ?? "ไม่ได้รับ URL สำหรับ OAuth" };
  }
  window.location.href = data.url;
  return { success: true };
};

export const handleUnlinkProvider = async (
  provider: "github",
): Promise<{ error?: string }> => {
  const res = await fetch(
    `/api/auth/unlink-provider`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    },
  );
  const text = await res.text();
  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      return { error: "เซิร์ฟเวอร์ตอบกลับไม่ใช่ JSON ที่ถูกต้อง" };
    }
  }
  const body = data as {
    error?: string;
    status?: number;
    success?: boolean;
  };
  if (body.error) {
    return { error: body.error };
  }
  if (!res.ok) {
    return { error: `ยกเลิกการเชื่อมล้มเหลว (${res.status})` };
  }
  window.location.reload();
  return {};
};
