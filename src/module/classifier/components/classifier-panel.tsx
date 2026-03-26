"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { api } from "@/lib/elysia/eden-client";
import {
  dateRangeToIsoBounds,
  formatActivityWindowTh,
  utcDayCountsToLocalDayCounts,
} from "@/module/classifier/lib/activity-window";
import { useMutation, useQuery } from "@tanstack/react-query";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useStateSelectStore } from "../stores/use-state-select";
import SelectRepo from "./select-repo";

function defaultRange(): { from: Date; to: Date } {
  const until = new Date();
  const from = new Date(until);
  from.setDate(from.getDate() - 7);
  from.setHours(0, 0, 0, 0);
  return { from, to: until };
}

export default function ClassifierPanel() {
  const selectedRepo = useStateSelectStore((s) => s.selectedRepo);
  const [range, setRange] = useState(defaultRange);

  const { sinceIso, untilIso, windowLabel } = useMemo(() => {
    const { since, until } = dateRangeToIsoBounds(range.from, range.to);
    return {
      sinceIso: since,
      untilIso: until,
      windowLabel: formatActivityWindowTh(since, until),
    };
  }, [range.from, range.to]);
  
  const {
    data: calendarData,
    isFetching: calendarLoading,
    isError: calendarError,
    error: calendarErr,
  } = useQuery({
    queryKey: [
      "classifier",
      "calendar",
      selectedRepo.owner,
      selectedRepo.name,
      sinceIso,
      untilIso,
    ],
    queryFn: async () => {
      const today = new Date();
      
      const firstDay = startOfMonth(today);
      const lastDay = endOfMonth(today);
      const { owner, name } = selectedRepo;
      if (!owner || !name) return null;
      const response = await api.classifier.calendar.post({
        owner,
        repoName: name,
        since: format(firstDay, "yyyy-MM-dd"),
        until: format(lastDay, "yyyy-MM-dd"),
      });
      if (response.error) {
        throw new Error(response.error.message as string);
      }
      return response.data;
    },
    enabled: Boolean(selectedRepo.owner && selectedRepo.name),
  });

  const localCommitDays = useMemo(() => {
    if (!calendarData?.days) return undefined;
    return utcDayCountsToLocalDayCounts(calendarData.days);
  }, [calendarData]);

  const analyze = useMutation({
    mutationFn: async () => {
      const { owner, name } = selectedRepo;
      if (!owner || !name) {
        throw new Error("กรุณาเลือก repository");
      }
      const response = await api.classifier.analyze.post({
        owner,
        repoName: name,
        since: sinceIso,
        until: untilIso,
      });
      if (response.error) {
        throw new Error(response.error.message as string);
      }
      const data = response.data;
      if (!data?.classified) {
        throw new Error("ไม่มีข้อมูลจากเซิร์ฟเวอร์");
      }
      return data;
    },
  });

  const c = analyze.data?.classified;
  const meta = analyze.data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <SelectRepo />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ช่วงวันที่วิเคราะห์</CardTitle>
          <p className="text-muted-foreground text-sm font-normal">
            เลือกช่วงแล้วกด Update ในปฏิทิน — จุดใต้ตัวเลขวันคือวันที่มี commit
            (GitHub) · ไม่สร้างโพสต์
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <DateRangePicker
            initialDateFrom={range.from}
            initialDateTo={range.to}
            onUpdate={({ range: r }) => {
              if (r.from) {
                setRange({ from: r.from, to: r.to ?? r.from });
              }
            }}
            align="center"
            locale="en-US"
            showCompare={false}
            commitDayCounts={localCommitDays}
          />
          <p className="text-muted-foreground text-xs">{windowLabel}</p>
          {selectedRepo.owner && selectedRepo.name && calendarLoading && (
            <p className="text-muted-foreground text-xs">กำลังโหลดข้อมูล commit…</p>
          )}
          {calendarError && (
            <p className="text-destructive text-sm">
              {(calendarErr as Error).message}
            </p>
          )}
          {calendarData && !calendarLoading && (
            <p className="text-muted-foreground text-xs">
              รวม {calendarData.totalCommits} commits ในช่วงที่เลือก (ความเข้มของจุด =
              สัดส่วนต่อวันที่ commit มากสุดในช่วง)
            </p>
          )}
          <Button
            type="button"
            disabled={
              !selectedRepo.owner ||
              !selectedRepo.name ||
              analyze.isPending
            }
            onClick={() => analyze.mutate()}
          >
            {analyze.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Search className="mr-2 size-4" />
            )}
            {analyze.isPending ? "กำลังวิเคราะห์…" : "วิเคราะห์ Activity"}
          </Button>
          {analyze.isError && (
            <p className="text-destructive text-sm">
              {(analyze.error as Error).message}
            </p>
          )}
        </CardContent>
      </Card>

      {c && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ผลการวิเคราะห์</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-2xl">
              {c.emoji} <span className="font-semibold">{c.label}</span>
            </p>
            <p className="text-muted-foreground">
              type: <code className="rounded bg-muted px-1">{c.type}</code> ·
              confidence: {(c.confidence * 100).toFixed(0)}%
            </p>
            <p className="text-muted-foreground">
              style: {c.suggestedStyle} · tone (แนะนำ):{" "}
              {c.suggestedTone.join(", ")}
            </p>
            <div>
              <p className="text-muted-foreground mb-1">Top commits:</p>
              <ul className="list-inside list-disc space-y-1">
                {c.topCommits.map((cm) => (
                  <li key={cm.sha}>
                    <span className="font-mono text-xs">
                      {cm.sha.slice(0, 7)}
                    </span>{" "}
                    {cm.message.split("\n")[0]}
                  </li>
                ))}
              </ul>
            </div>
            {meta && (
              <p className="text-muted-foreground text-xs">
                commits ในช่วง: {meta.commitCount} · merged PRs ในช่วง:{" "}
                {meta.pullRequestCountInWindow}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
