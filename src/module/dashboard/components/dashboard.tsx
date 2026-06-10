"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import routerConfig from "@/configs/route.config";
import useUsers from "@/lib/supabase/hooks/use-users";
import { cn } from "@/lib/utils";
import { useUserOnboarding } from "@/module/onboarding/hooks/use-user-onboarding";
import { getPreferenceLabel } from "@/module/onboarding/schema";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Circle,
  CreditCard,
  FolderKanban,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

interface Stat {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
}

const stats: Stat[] = [
  { label: "Active projects", value: "12", delta: "+2", icon: FolderKanban },
  { label: "Team members", value: "8", delta: "+1", icon: Users },
  { label: "Monthly usage", value: "74%", delta: "+12%", icon: TrendingUp },
  { label: "Plan", value: "Free", delta: "Upgrade", icon: CreditCard },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user_metadata } = useUsers();
  const { profile, completed, isLoading } = useUserOnboarding();

  const name =
    profile?.username ??
    user_metadata?.username ??
    user_metadata?.name ??
    user_metadata?.email?.split("@")[0] ??
    "there";

  const workspace = profile?.preferences
    ? [
        {
          icon: Briefcase,
          label: "Role",
          value: getPreferenceLabel("role", profile.preferences.role),
        },
        {
          icon: Target,
          label: "Primary goal",
          value: getPreferenceLabel("goal", profile.preferences.goal),
        },
        {
          icon: Users,
          label: "Team size",
          value: getPreferenceLabel("teamSize", profile.preferences.teamSize),
        },
      ]
    : [];

  const checklist = [
    { label: "Set up your profile", done: Boolean(profile?.username) },
    { label: "Tell us about your use-case", done: completed },
    { label: "Create your first project", done: false },
    { label: "Invite your team", done: false },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const progress = Math.round((doneCount / checklist.length) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Welcome back, {name} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening in your workspace today.
          </p>
        </div>
        <Button size="lg">
          <Plus />
          New project
        </Button>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card className="gap-3">
              <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                <CardDescription>{stat.label}</CardDescription>
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <stat.icon className="size-4" />
                </span>
              </CardHeader>
              <CardContent className="flex items-end justify-between gap-2">
                <span className="font-heading text-2xl font-semibold tracking-tight">
                  {stat.value}
                </span>
                <Badge variant="secondary" className="gap-0.5">
                  <ArrowUpRight />
                  {stat.delta}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Panels */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Your workspace — real onboarding data */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-3"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Your workspace</CardTitle>
              <CardDescription>
                Personalized from your onboarding answers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : workspace.length ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {workspace.map((entry) => (
                    <div
                      key={entry.label}
                      className="rounded-xl border bg-card p-3"
                    >
                      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <entry.icon className="size-4" />
                      </span>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {entry.label}
                      </p>
                      <p className="text-sm font-medium">{entry.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed p-5">
                  <p className="text-sm text-muted-foreground">
                    Finish onboarding to personalize your workspace.
                  </p>
                  <Button asChild size="sm">
                    <Link href={routerConfig.app.onboarding}>
                      <Sparkles />
                      Complete onboarding
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Getting started — real completion state */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Getting started</CardTitle>
              <CardDescription>
                {doneCount} of {checklist.length} steps complete
              </CardDescription>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                    delay: 0.4,
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {checklist.map((step) => (
                <div
                  key={step.label}
                  className="flex items-center gap-2.5 px-1 py-2"
                >
                  {step.done ? (
                    <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted-foreground/50" />
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      step.done && "text-muted-foreground line-through",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
