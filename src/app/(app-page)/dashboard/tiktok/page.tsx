import { TiktokDashboardClient } from "@/module/tiktok/components/tiktok-dashboard-client";
import { getUser } from "@/lib/supabase/server";
import {
  getTiktokConnection,
  listTiktokPostsForUser,
} from "@/services/tiktok/tiktok-posts.service";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function TiktokPage() {
  const user = await getUser();
  if (!user?.id) {
    redirect("/auth/sign-in?next=/dashboard/tiktok");
  }

  const [posts, conn] = await Promise.all([
    listTiktokPostsForUser(user.id),
    getTiktokConnection(user.id),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">TikTok</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          อัปโหลดรูป โพสต์อัตโนมัติ และดึงยอดวิว/คอมเมนต์เป็นระยะเพื่อดูแนวโน้มความต้องการ
        </p>
      </div>
      <Suspense fallback={<div className="text-muted-foreground text-sm">กำลังโหลด…</div>}>
        <TiktokDashboardClient
          initialPosts={posts}
          initialConnected={conn != null}
        />
      </Suspense>
    </div>
  );
}
