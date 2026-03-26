/** ช่วง 7 วันล่าสุด (รวมวันนี้) — 1 activity ต่อการรัน */
export function getLast7DaysIso(): { since: string; until: string } {
  const until = new Date();
  const since = new Date(until);
  since.setDate(since.getDate() - 7);
  since.setHours(0, 0, 0, 0);
  return { since: since.toISOString(), until: until.toISOString() };
}

/** แปลงช่วงวันที่ที่เลือก → since/until สำหรับ GitHub API */
export function dateRangeToIsoBounds(from: Date, to: Date): {
  since: string;
  until: string;
} {
  const s = new Date(from);
  s.setHours(0, 0, 0, 0);
  const u = new Date(to);
  u.setHours(23, 59, 59, 999);
  return { since: s.toISOString(), until: u.toISOString() };
}

export function formatActivityWindowTh(since: string, until: string): string {
  try {
    const s = new Date(since);
    const u = new Date(until);
    return `${s.toLocaleDateString("th-TH")} – ${u.toLocaleDateString("th-TH")}`;
  } catch {
    return "";
  }
}

/** คีย์ YYYY-MM-DD ตาม local ของเบราว์เซอร์ (ให้ตรงกับเซลล์ใน react-day-picker) */
export function localDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** แมปคีย์ UTC จาก GitHub → คีย์ local สำหรับแสดงบนปฏิทิน */
export function utcDayCountsToLocalDayCounts(
  utcDays: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [utc, n] of Object.entries(utcDays)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(utc)) continue;
    const d = new Date(`${utc}T12:00:00.000Z`);
    const k = localDayKey(d);
    out[k] = (out[k] ?? 0) + n;
  }
  return out;
}
