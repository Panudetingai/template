/** ข้อมูล commit ที่ใช้ใน classifier (แมปจาก GitHub API) */
export type Commit = {
  sha: string;
  message: string;
  author: string;
  additions: number;
  deletions: number;
  date: string;
};

/** PR ย่อสำหรับคะแนน feature_shipped */
export type PR = {
  merged: boolean;
  number: number;
};

export type ActivityType =
  | "productive_day"
  | "bug_fixing"
  | "feature_shipped"
  | "refactor_session"
  | "light_day"
  | "deep_work";

export type ClassifiedActivity = {
  type: ActivityType;
  label: string;
  emoji: string;
  confidence: number;
  topCommits: Commit[];
  suggestedStyle: "bold" | "minimal" | "grid" | "photo";
  suggestedTone: string[];
};
