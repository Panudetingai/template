import ClassifierPanel from "@/module/classifier/components/classifier-panel";

export default function ClassifierPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold">Activity classifier</h1>
        <p className="text-muted-foreground text-sm">
          เลือกช่วงวันที่และ repository แล้วกดวิเคราะห์ — ใช้ข้อมูลจาก GitHub เท่านั้น
          (ไม่สร้างโพสต์) ต้องล็อกอินและมี GitHub token
        </p>
      </div>
      <ClassifierPanel />
    </div>
  );
}
