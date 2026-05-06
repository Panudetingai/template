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

export type TiktokProductSource = "production" | "mock" | "design" | "tiktok";

export type TiktokProductTableRow = {
  id: string;
  source: TiktokProductSource;
  sourceId: string;
  productName: string;
  productStatus: string;
  tiktokPost: {
    id: string;
    status: string;
    failReason: string | null;
  } | null;
  fileType: "PHOTO" | "VIDEO";
  mediaUrls: string[];
  latestMetric: TiktokPostListItem["latestMetric"];
};
