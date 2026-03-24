import ListWapper from "@/module/stories/components/list-wapper";
import { ModalSelectCard } from "@/module/stories/components/preview/modal-select";
import ModalSocial from "@/module/stories/components/preview/modal-social";
import { StoryAiBasicDemo } from "@/module/stories/components/story-ai-basic-demo";

export default function page() {
  return (  
    <div className="space-y-8">
      <StoryAiBasicDemo />
      <ListWapper />

      {/* Modal Stories */}
      <ModalSocial />
      <ModalSelectCard />
    </div>
  );
}