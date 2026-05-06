"use client";

import { Button } from "@/components/ui/button";
import TiktokIcon from "@/components/svg/tiktok";

export default function TiktokLogin() {
  function handleConnect() {
    window.location.href = "/api/tiktok/oauth/start";
  }

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-16 items-center justify-center rounded-2xl border bg-card shadow-sm">
          <TiktokIcon />
        </div>
        <h1 className="text-2xl font-semibold">เชื่อมต่อ TikTok</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          เชื่อมต่อบัญชี TikTok เพื่อจัดการโพสต์และดูสถิติจากแอปนี้
        </p>
      </div>

      <Button size="lg" onClick={handleConnect}>
        <TiktokIcon />
        เชื่อมต่อบัญชี TikTok
      </Button>
    </div>
  );
}
