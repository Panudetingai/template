import ListWapper from "@/module/storys/components/list-wapper";
import { StoryAiBasicDemo } from "@/module/storys/components/story-ai-basic-demo";

export default function page() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-lg font-bold">Storys Social Media</h1>
        <p className="text-muted-foreground text-sm">
          รองรับ Story 9:16, OG 1200×630 และ Square 1:1 — ปรับขนาดตามหน้าจอ แล้วส่งออก PNG แชร์ได้
        </p>
      </div>
      <StoryAiBasicDemo />
      <ListWapper />
    </div>
  );
}