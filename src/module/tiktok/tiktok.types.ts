export type TiktokPostListItem = {
  id: string;
  publishId: string;
  tiktokItemId: string | null;
  status: string;
  failReason: string | null;
  title: string | null;
  description: string | null;
  photoImageUrls: string[];
  privacyLevel: string;
  createdAt: string;
  latestMetric: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    capturedAt: string;
  } | null;
};
