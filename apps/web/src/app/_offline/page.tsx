export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-xl font-semibold">คุณออฟไลน์</h1>
      <p className="text-muted-foreground text-center text-sm">
        ไม่มีการเชื่อมต่ออินเทอร์เน็ต กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่
      </p>
    </div>
  );
}
