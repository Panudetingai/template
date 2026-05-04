"use client";

import type { TiktokPostListItem } from "@/module/tiktok/tiktok.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const API = "/api/tiktok";

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) throw new Error("เซิร์ฟเวอร์ตอบกลับว่าง");
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(text.slice(0, 200) || "ไม่ใช่ JSON ที่ถูกต้อง");
  }
}

function getErrorBody(data: unknown): string | undefined {
  if (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string") {
    return (data as { error: string }).error;
  }
}

type PostsResponse = { posts: TiktokPostListItem[] };
type ConnectionResponse = { connected: boolean; tiktokOpenId: string | null };

export function TiktokDashboardClient({
  initialPosts,
  initialConnected,
}: {
  initialPosts: TiktokPostListItem[];
  initialConnected: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toastedRef = useRef(false);
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(initialConnected);

  const postsQuery = useQuery<PostsResponse>({
    queryKey: ["tiktok-posts"],
    queryFn: async () => {
      const res = await fetch(`${API}/posts`, { credentials: "include" });
      const data = await parseJson(res);
      const err = getErrorBody(data);
      if (err) throw new Error(err);
      return data as PostsResponse;
    },
    initialData: { posts: initialPosts },
    refetchInterval: 15_000,
  });

  const connectionQuery = useQuery<ConnectionResponse>({
    queryKey: ["tiktok-connection"],
    queryFn: async () => {
      const res = await fetch(`${API}/connection`, { credentials: "include" });
      const data = await parseJson(res);
      const err = getErrorBody(data);
      if (err) throw new Error(err);
      return data as ConnectionResponse;
    },
    initialData: { connected: initialConnected, tiktokOpenId: null },
  });

  useEffect(() => {
    if (connectionQuery.data?.connected !== undefined) {
      setConnected(connectionQuery.data.connected);
    }
  }, [connectionQuery.data?.connected]);

  useEffect(() => {
    if (toastedRef.current) return;
    const ok = searchParams.get("tiktok_connected");
    const err = searchParams.get("tiktok_error");
    const detail = searchParams.get("tiktok_error_detail");
    if (ok) {
      toastedRef.current = true;
      toast.success("เชื่อมบัญชี TikTok แล้ว");
      router.replace("/dashboard/tiktok");
      void queryClient.invalidateQueries({ queryKey: ["tiktok-connection"] });
      void queryClient.invalidateQueries({ queryKey: ["tiktok-posts"] });
      setConnected(true);
    } else if (err) {
      toastedRef.current = true;
      toast.error(detail || err);
      router.replace("/dashboard/tiktok");
    }
  }, [searchParams, router, queryClient]);

  const disconnectM = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API}/connection`, { method: "DELETE", credentials: "include" });
      const data = await parseJson(res);
      const err = getErrorBody(data);
      if (err) throw new Error(err);
    },
    onSuccess: () => {
      toast.success("ตัดการเชื่อม TikTok แล้ว");
      setConnected(false);
      void queryClient.invalidateQueries({ queryKey: ["tiktok-connection"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const syncM = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`${API}/posts/${postId}/sync`, { method: "POST", credentials: "include" });
      const data = await parseJson(res);
      const err = getErrorBody(data);
      if (err) throw new Error(err);
      return data as PostsResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["tiktok-posts"], data);
      toast.success("อัปเดตยอดล่าสุดแล้ว");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const publishM = useMutation({
    mutationFn: async (fd: FormData) => {
      const res = await fetch(`${API}/posts/publish`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await parseJson(res);
      const err = getErrorBody(data);
      if (err) throw new Error(err);
      return data as { posts?: TiktokPostListItem[] };
    },
    onSuccess: (data) => {
      if (data.posts) {
        queryClient.setQueryData(["tiktok-posts"], { posts: data.posts });
      }
      toast.success("ส่งโพสต์ไป TikTok แล้ว — รอประมวลผลสักครู่แล้วกดซิงก์");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const posts = postsQuery.data?.posts ?? [];

  return (
    <div className="flex flex-col gap-8">
      {/* ── เชื่อมบัญชี ── */}
      <section className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
        <h2 className="text-lg font-medium">เชื่อมบัญชี TikTok</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          ต้องลงทะเบียนแอปที่{" "}
          <Link
            className="text-primary underline"
            href="https://developers.tiktok.com/"
            target="_blank"
            rel="noreferrer"
          >
            TikTok for Developers
          </Link>
          {" "}— เปิด Login Kit + Content Posting (Direct post) และ verify URL โดเมน Cloudinary ตามเอกสาร PULL_FROM_URL
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {!connected ? (
            <Button
              type="button"
              onClick={() => {
                window.location.href = `${API}/oauth/start`;
              }}
            >
              เชื่อมบัญชี TikTok
            </Button>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                เชื่อมแล้ว
                {connectionQuery.data?.tiktokOpenId
                  ? ` (…${connectionQuery.data.tiktokOpenId.slice(-6)})`
                  : ""}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={disconnectM.isPending}
                onClick={() => disconnectM.mutate()}
              >
                {disconnectM.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                ตัดการเชื่อม
              </Button>
            </>
          )}
        </div>
      </section>

      {/* ── โพสต์รูป ── */}
      <section className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
        <h2 className="text-lg font-medium">โพสต์รูป (Photo post)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          อัปโหลดรูป → Cloudinary → TikTok ดึงรูปจาก URL ที่โดเมนถูก verify แล้ว
        </p>
        <form
          className="mt-4 flex max-w-xl flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!connected) {
              toast.error("เชื่อมบัญชี TikTok ก่อน");
              return;
            }
            const form = e.currentTarget;
            const fd = new FormData(form);
            const caption = String(fd.get("caption") ?? "").trim();
            if (!caption) {
              toast.error("ใส่คำบรรยายโพสต์");
              return;
            }
            const fileInput = form.elements.namedItem("images") as HTMLInputElement;
            if (!fileInput?.files?.length) {
              toast.error("เลือกอย่างน้อย 1 รูป");
              return;
            }
            publishM.mutate(fd, {
              onSuccess: () => form.reset(),
            });
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tiktok-caption">คำบรรยาย (caption)</Label>
            <textarea
              id="tiktok-caption"
              name="caption"
              rows={3}
              maxLength={2200}
              required
              className="border-input bg-transparent focus-visible:ring-ring/50 w-full rounded-lg border px-2.5 py-2 text-sm outline-none focus-visible:ring-3"
              placeholder="#เสื้อยืด #ลายใหม่ อธิบายสินค้า / ราคา / ช่องทางสั่งซื้อ"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tiktok-privacy">ระดับความเป็นส่วนตัว</Label>
              <select
                id="tiktok-privacy"
                name="privacyLevel"
                className="border-input h-8 w-full rounded-lg border px-2 text-sm"
                defaultValue="PUBLIC_TO_EVERYONE"
              >
                <option value="PUBLIC_TO_EVERYONE">สาธารณะ</option>
                <option value="MUTUAL_FOLLOW_FRIENDS">เพื่อนที่ติดตามซึ่งกันและกัน</option>
                <option value="SELF_ONLY">ส่วนตัว</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tiktok-cover">รูปปก (0 = รูปแรก)</Label>
              <Input
                id="tiktok-cover"
                name="coverIndex"
                type="number"
                min={0}
                defaultValue={0}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tiktok-comments">ความคิดเห็น</Label>
            <select
              id="tiktok-comments"
              name="allowComments"
              className="border-input h-8 w-full max-w-xs rounded-lg border px-2 text-sm"
              defaultValue="true"
            >
              <option value="true">เปิด</option>
              <option value="false">ปิด</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tiktok-images">รูป 1–9 ไฟล์ (สูงสุดไฟล์ละ 25 MB)</Label>
            <Input
              id="tiktok-images"
              name="images"
              type="file"
              accept="image/*"
              multiple
              required
            />
          </div>
          <Button type="submit" disabled={publishM.isPending || !connected}>
            {publishM.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {publishM.isPending ? "กำลังอัปโหลด…" : "อัปโหลดและโพสต์"}
          </Button>
        </form>
      </section>

      {/* ── ตารางโพสต์ ── */}
      <section className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-medium">โพสต์และยอด</h2>
            <p className="text-sm text-muted-foreground">
              ยอดวิว / ไลก์ / คอมเมนต์ จาก TikTok Display API — รีเฟรชอัตโนมัติทุก 15 วินาที
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={postsQuery.isFetching}
            onClick={() => void postsQuery.refetch()}
          >
            {postsQuery.isFetching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            <span className="ml-2">รีเฟรช</span>
          </Button>
        </div>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>คำบรรยาย</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">วิว</TableHead>
                <TableHead className="text-right">ไลก์</TableHead>
                <TableHead className="text-right">คอมเมนต์</TableHead>
                <TableHead className="w-[100px]">ซิงก์</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground text-sm">
                    ยังไม่มีโพสต์
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="max-w-[200px] truncate font-medium">
                      {p.title ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{p.status}</span>
                      {p.failReason && (
                        <span className="text-destructive block text-xs">{p.failReason}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.latestMetric?.viewCount ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.latestMetric?.likeCount ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.latestMetric?.commentCount ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={syncM.isPending || !connected}
                        onClick={() => syncM.mutate(p.id)}
                      >
                        {syncM.isPending ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          "ดึงยอด"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
