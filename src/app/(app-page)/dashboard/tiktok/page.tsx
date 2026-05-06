import { TiktokDashboardClient } from "@/module/tiktok/components/tiktok-dashboard-client";
import { getUser } from "@/lib/supabase/server";
import {
  getTiktokConnection,
  listTiktokProductRowsForUser,
} from "@/services/tiktok/tiktok-posts.service";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function TiktokPage() {
  const user = await getUser();
  if (!user?.id) {
    redirect("/auth/sign-in?next=/dashboard/tiktok");
  }

  const [products, conn] = await Promise.all([
    listTiktokProductRowsForUser(user.id),
    getTiktokConnection(user.id),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<div className="text-muted-foreground text-sm">กำลังโหลด…</div>}>
        <TiktokDashboardClient
          initialProducts={products}
          initialConnected={conn != null}
        />
      </Suspense>
    </div>
  );
}
