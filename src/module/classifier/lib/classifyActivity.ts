import {
  type ActivityType,
  type ClassifiedActivity,
  type Commit,
  type PR,
} from "../types/activity-class";

export function classifyActivity(
  commits: Commit[],
  prs: PR[],
): ClassifiedActivity {
  const messages = commits.map((c) => c.message.toLowerCase());
  const totalDiff = commits.reduce(
    (sum, c) => sum + c.additions + c.deletions,
    0,
  );

  // Score แต่ละ type
  const scores = {
    bug_fixing: messages.filter((m) =>
      /fix|bug|patch|hotfix|issue|error|crash/.test(m),
    ).length,

    feature_shipped:
      prs.filter((p) => p.merged).length * 3 +
      messages.filter((m) => /feat|add|new|implement|ship/.test(m)).length,

    refactor_session: messages.filter((m) =>
      /refactor|clean|rename|reorganize|restructure|move/.test(m),
    ).length,

    productive_day: commits.length >= 8 ? commits.length : 0,

    deep_work: totalDiff > 500 && commits.length <= 3 ? totalDiff / 100 : 0,

    light_day: commits.length <= 2 ? 10 : 0,
  };

  // เลือก type ที่ score สูงสุด
  const winner = (Object.entries(scores) as [ActivityType, number][]).sort(
    ([, a], [, b]) => b - a,
  )[0];

  const config: Record<
    ActivityType,
    Omit<ClassifiedActivity, "type" | "confidence" | "topCommits">
  > = {
    productive_day: {
      label: `Productive day (${commits.length} commits)`,
      emoji: "🟢",
      suggestedStyle: "grid",
      suggestedTone: ["motivational", "technical"],
    },
    bug_fixing: {
      label: "Bug fixing session",
      emoji: "🟡",
      suggestedStyle: "bold",
      suggestedTone: ["casual", "inspiring"],
    },
    feature_shipped: {
      label: "New feature shipped",
      emoji: "🔵",
      suggestedStyle: "photo",
      suggestedTone: ["motivational", "creative"],
    },
    refactor_session: {
      label: "Refactor session",
      emoji: "🟣",
      suggestedStyle: "minimal",
      suggestedTone: ["technical", "educational"],
    },
    deep_work: {
      label: "Deep work session",
      emoji: "🔴",
      suggestedStyle: "photo",
      suggestedTone: ["inspiring", "creative"],
    },
    light_day: {
      label: "Light day",
      emoji: "⚪",
      suggestedStyle: "minimal",
      suggestedTone: ["casual"],
    },
  };

  // Pre-select top 3 commits ที่ดีที่สุดสำหรับ generate
  const topCommits = pickTopCommits(commits, winner[0]);

  return {
    type: winner[0],
    confidence: Math.min(winner[1] / 10, 1),
    topCommits,
    ...config[winner[0]],
  };
}

// เลือก commits ที่น่าสนใจสุดตาม activity type
function pickTopCommits(commits: Commit[], type: ActivityType): Commit[] {
  const sorted = [...commits].sort((a, b) => {
    const diffA = a.additions + a.deletions;
    const diffB = b.additions + b.deletions;

    if (type === "bug_fixing") {
      // เลือก commit ที่ message มี fix keyword และ diff ใหญ่
      const scoreA =
        (/fix|bug/.test(a.message.toLowerCase()) ? 100 : 0) + diffA;
      const scoreB =
        (/fix|bug/.test(b.message.toLowerCase()) ? 100 : 0) + diffB;
      return scoreB - scoreA;
    }

    if (type === "deep_work") {
      // เลือก commit ที่ diff ใหญ่ที่สุด
      return diffB - diffA;
    }

    // default: commit ล่าสุด
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return sorted.slice(0, 3);
}
