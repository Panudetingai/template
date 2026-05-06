import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/proxy";

/**
 * ไฟล์ `.txt` ที่โหลดจาก `public/` โดยตรง (path เดียว เช่น `/tiktoke….txt`)
 * ไม่ควรผ่าน session — ระบบยืนยันโดเมน (เช่น TikTok) ต้องได้ 200 โดยไม่ไปหน้า login
 */
function isPublicRootTxtFile(pathname: string): boolean {
  return /^\/[^/]+\.txt$/i.test(pathname);
}

export async function proxy(request: NextRequest) {
  if (isPublicRootTxtFile(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * ยกเว้นสแตทิก + ภาพ + *.txt (ยืนยันโดเมน)
     * ( token `|` `txt` แบบเก่าไม่ครอบ path ที่ลงท้าย `.txt` )
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|txt)$).*)",
  ],
};
