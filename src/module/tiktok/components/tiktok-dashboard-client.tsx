"use client";

import type {
  TiktokPostListItem,
  TiktokProductTableRow,
} from "@/module/tiktok/tiktok.types";
import { Button } from "@/components/ui/button";
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
import TiktokLogin from "./tiktok-login";
import { publicEnv } from "@/env/public";

const API = `${publicEnv.NEXT_PUBLIC_CLOUDFLARE_URL ?? publicEnv.NEXT_PUBLIC_APP_URL}/api/tiktok`;

// ── helpers ──────────────────────────────────────────────────────────────────

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
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }
}

// ── types ─────────────────────────────────────────────────────────────────────

type PostsResponse = { posts: TiktokPostListItem[] };
type ProductsResponse = { products: TiktokProductTableRow[] };
type ConnectionResponse = { connected: boolean; tiktokOpenId: string | null };

// ── custom hook — single source of truth for TikTok state ────────────────────

function useTiktokState({
  initialConnected,
  initialProducts,
}: {
  initialConnected: boolean;
  initialProducts: TiktokProductTableRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toastedRef = useRef(false);
  const queryClient = useQueryClient();

  // Connection status — preloaded from server, refreshed on demand
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
    staleTime: 30_000,
  });

  const connected = connectionQuery.data.connected;
  const tiktokOpenId = connectionQuery.data.tiktokOpenId;

  const productsQuery = useQuery<ProductsResponse>({
    queryKey: ["tiktok-products"],
    queryFn: async () => {
      const res = await fetch(`${API}/products`, { credentials: "include" });
      const data = await parseJson(res);
      const err = getErrorBody(data);
      if (err) throw new Error(err);
      return data as ProductsResponse;
    },
    initialData: { products: initialProducts },
    refetchInterval: 15_000,
    enabled: connected,
  });

  const products = productsQuery.data.products;

  // Handle OAuth callback query params — run once per mount
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
      void queryClient.invalidateQueries({ queryKey: ["tiktok-products"] });
    } else if (err) {
      toastedRef.current = true;
      toast.error(detail || err);
      router.replace("/dashboard/tiktok");
    }
  }, [searchParams, router, queryClient]);

  // Disconnect
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API}/connection`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await parseJson(res);
      const err = getErrorBody(data);
      if (err) throw new Error(err);
    },
    onSuccess: () => {
      toast.success("ตัดการเชื่อม TikTok แล้ว");
      void queryClient.invalidateQueries({ queryKey: ["tiktok-connection"] });
      void queryClient.invalidateQueries({ queryKey: ["tiktok-posts"] });
      void queryClient.invalidateQueries({ queryKey: ["tiktok-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Sync a single post's metrics
  const syncMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`${API}/posts/${postId}/sync`, {
        method: "POST",
        credentials: "include",
      });
      const data = await parseJson(res);
      const err = getErrorBody(data);
      if (err) throw new Error(err);
      return data as PostsResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["tiktok-posts"], data);
      void queryClient.invalidateQueries({ queryKey: ["tiktok-products"] });
      toast.success("อัปเดตยอดล่าสุดแล้ว");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const publishProductsMutation = useMutation({
    mutationFn: async (rows: TiktokProductTableRow[]) => {
      const res = await fetch(`${API}/products/publish`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: rows.map((row) => ({
            source: row.source,
            id: row.sourceId,
          })),
          caption: rows.map((row) => row.productName).join("\n"),
          privacyLevel: "SELF_ONLY",
          allowComments: "true",
        }),
      });
      const data = await parseJson(res);
      const err = getErrorBody(data);
      if (err) throw new Error(err);
      return data as { posts?: TiktokPostListItem[]; products?: TiktokProductTableRow[] };
    },
    onSuccess: (data) => {
      if (data.posts) {
        queryClient.setQueryData(["tiktok-posts"], { posts: data.posts });
      }
      if (data.products) {
        queryClient.setQueryData(["tiktok-products"], { products: data.products });
      }
      toast.success("โพสต์สินค้าที่เลือกไป TikTok แล้ว");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    connected,
    tiktokOpenId,
    products,
    isRefreshingProducts: productsQuery.isFetching,
    refetchProducts: productsQuery.refetch,
    disconnect: () => disconnectMutation.mutate(),
    isDisconnecting: disconnectMutation.isPending,
    syncPost: (id: string) => syncMutation.mutate(id),
    isSyncing: syncMutation.isPending,
    publishProducts: (rows: TiktokProductTableRow[]) =>
      publishProductsMutation.mutate(rows),
    isPublishingProducts: publishProductsMutation.isPending,
  };
}

// ── sub-components ────────────────────────────────────────────────────────────

function ConnectionCard({
  tiktokOpenId,
  onDisconnect,
  isDisconnecting,
}: {
  tiktokOpenId: string | null;
  onDisconnect: () => void;
  isDisconnecting: boolean;
}) {
  return (
    <section className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
      <h2 className="text-lg font-medium">บัญชี TikTok</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        ต้องลงทะเบียนแอปที่{" "}
        <Link
          className="text-primary underline"
          href="https://developers.tiktok.com/"
          target="_blank"
          rel="noreferrer"
        >
          TikTok for Developers
        </Link>{" "}
        และ URL prefix โดเมนแอปเพื่อโพสต์รูป:{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          {`${(publicEnv.NEXT_PUBLIC_CLOUDFLARE_URL ?? publicEnv.NEXT_PUBLIC_APP_URL).replace(/\/$/, "")}/api/tiktok/media-pull/`}
        </code>{" "}
        (ไม่ต้อง verify Cloudinary โดยตรง)
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">
          เชื่อมแล้ว
          {tiktokOpenId ? ` (…${tiktokOpenId.slice(-6)})` : ""}
        </span>
        <Button
          type="button"
          variant="outline"
          disabled={isDisconnecting}
          onClick={onDisconnect}
        >
          {isDisconnecting && (
            <Loader2 className="mr-2 size-4 animate-spin" />
          )}
          ตัดการเชื่อม
        </Button>
      </div>
    </section>
  );
}

function ProductsTable({
  products,
  isRefreshing,
  onRefresh,
  onSync,
  isSyncing,
  onPublishSelected,
  isPublishingSelected,
}: {
  products: TiktokProductTableRow[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onSync: (id: string) => void;
  isSyncing: boolean;
  onPublishSelected: (rows: TiktokProductTableRow[]) => void;
  isPublishingSelected: boolean;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const postableProducts = products.filter(
    (row) => row.source !== "tiktok" && !row.tiktokPost,
  );
  const selectedRows = products.filter((row) => selectedIds.includes(row.id));
  const postableRows = selectedRows.filter((row) => postableProducts.includes(row));
  const selectedFileTypes = new Set(postableRows.map((row) => row.fileType));
  const canPublish =
    postableRows.length > 0 &&
    selectedFileTypes.size === 1 &&
    (postableRows[0]?.fileType === "PHOTO" || postableRows.length === 1);

  function toggleRow(rowId: string, checked: boolean) {
    setSelectedIds((current) =>
      checked ? [...current, rowId] : current.filter((id) => id !== rowId),
    );
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? postableProducts.map((row) => row.id) : []);
  }

  return (
    <section className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-medium">สินค้าและโพสต์ TikTok</h2>
          <p className="text-sm text-muted-foreground">
            เลือกสินค้าที่อัปโหลดไว้แล้วกดโพสต์ รูปหลายรายการจะรวมเป็น 1 TikTok photo post
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedRows.length > 0 && (
            <Button
              type="button"
              size="sm"
              disabled={!canPublish || isPublishingSelected}
              onClick={() => {
                onPublishSelected(postableRows);
                setSelectedIds([]);
              }}
            >
              {isPublishingSelected && <Loader2 className="size-4 animate-spin" />}
              <span className="ml-2">โพสต์ที่เลือก ({postableRows.length})</span>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            onClick={onRefresh}
          >
            {isRefreshing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            <span className="ml-2">รีเฟรช</span>
          </Button>
        </div>
      </div>
      {selectedRows.length > 0 && !canPublish && (
        <p className="text-muted-foreground mt-3 text-xs">
          โพสต์ได้เฉพาะสินค้าที่ยังไม่เคยโพสต์ และต้องไม่เลือก PHOTO/VIDEO ปนกัน
          (วิดีโอเลือกได้ครั้งละ 1 รายการ)
        </p>
      )}

      <div className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[48px]">
                <input
                  type="checkbox"
                  aria-label="เลือกทั้งหมด"
                  checked={
                    postableProducts.length > 0 &&
                    postableProducts.every((row) => selectedIds.includes(row.id))
                  }
                  onChange={(event) => toggleAll(event.currentTarget.checked)}
                />
              </TableHead>
              <TableHead>Product name</TableHead>
              <TableHead>Status product</TableHead>
              <TableHead>TikTok post</TableHead>
              <TableHead>File type</TableHead>
              <TableHead className="text-right">Like</TableHead>
              <TableHead className="text-right">คอมเมนต์</TableHead>
              <TableHead className="text-right">View</TableHead>
              <TableHead className="w-[120px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-muted-foreground text-sm"
                >
                  ยังไม่มีสินค้า/โพสต์ TikTok
                </TableCell>
              </TableRow>
            ) : (
              products.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`เลือก ${row.productName}`}
                      disabled={row.source === "tiktok" || row.tiktokPost != null}
                      checked={selectedIds.includes(row.id)}
                      onChange={(event) => toggleRow(row.id, event.currentTarget.checked)}
                    />
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {row.productName}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs">{row.productStatus}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs">
                      {row.tiktokPost?.status ?? "not posted"}
                    </span>
                    {row.tiktokPost?.failReason && (
                      <span className="text-destructive block text-xs">
                        {row.tiktokPost.failReason}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs">{row.fileType}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {row.latestMetric?.likeCount ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.latestMetric?.commentCount ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.latestMetric?.viewCount ?? "—"}
                  </TableCell>
                  <TableCell>
                    {row.tiktokPost ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isSyncing}
                        onClick={() => onSync(row.tiktokPost!.id)}
                      >
                        {isSyncing ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          "ดึงยอด"
                        )}
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">เลือกเพื่อโพสต์</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function TiktokDashboardClient({
  initialProducts,
  initialConnected,
}: {
  initialProducts: TiktokProductTableRow[];
  initialConnected: boolean;
}) {
  const {
    connected,
    tiktokOpenId,
    products,
    isRefreshingProducts,
    refetchProducts,
    disconnect,
    isDisconnecting,
    syncPost,
    isSyncing,
    publishProducts,
    isPublishingProducts,
  } = useTiktokState({ initialConnected, initialProducts });

  if (!connected) {
    return <TiktokLogin />;
  }

  return (
    <div className="flex flex-col gap-6">
      <ConnectionCard
        tiktokOpenId={tiktokOpenId}
        onDisconnect={disconnect}
        isDisconnecting={isDisconnecting}
      />
      <ProductsTable
        products={products}
        isRefreshing={isRefreshingProducts}
        onRefresh={() => void refetchProducts()}
        onSync={syncPost}
        isSyncing={isSyncing}
        onPublishSelected={publishProducts}
        isPublishingSelected={isPublishingProducts}
      />
    </div>
  );
}
