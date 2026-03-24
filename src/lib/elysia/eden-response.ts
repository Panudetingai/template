/**
 * ช่วย unwrap ผลจาก Eden Treaty — ใช้ซ้ำแทน cast error ซ้ำๆ
 */
export function edenErrorToString(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Request failed";
}

export function assertEdenOk<T>(response: {
  error?: unknown;
  data?: T | null;
}): T {
  if (response.error) {
    throw new Error(edenErrorToString(response.error));
  }
  if (response.data === undefined || response.data === null) {
    throw new Error("ไม่มีข้อมูลจากเซิร์ฟเวอร์");
  }
  return response.data;
}
