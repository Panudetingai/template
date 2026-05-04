// ngrok script to forward the port 3000 to the public url
import { spawn } from "node:child_process";

const port = Number(process.env.NGROK_PORT) || Number(process.env.PORT) || 3000;

type NgrokTunnelsResponse = {
  tunnels?: Array<{ public_url: string; proto: string }>;
};

const ngrok = spawn("ngrok", ["http", String(port)], {
  stdio: "inherit",
});

ngrok.on("error", (err) => {
  console.error(`[ngrok] ไม่สามารถรัน ngrok ได้: ${err.message}`);
  process.exit(1);
});

const INSPECT = "http://127.0.0.1:4040";
let poll: ReturnType<typeof setInterval> | undefined;
let giveUp: ReturnType<typeof setTimeout> | undefined;

function logPublicUrls() {
  fetch(`${INSPECT}/api/tunnels`)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
    .then((data: NgrokTunnelsResponse) => {
      const tunnels = data.tunnels ?? [];
      const https = tunnels.find((t) => t.proto === "https");
      const http = tunnels.find((t) => t.proto === "http");
      const primary =
        https?.public_url ?? http?.public_url ?? tunnels[0]?.public_url;
      if (!primary) return;

      if (poll) clearInterval(poll);
      if (giveUp) clearTimeout(giveUp);
      console.log("\n[ngrok] Public URL (ใช้ตั้งค่า webhook หรือแชร์ได้):");
      for (const t of tunnels) {
        console.log(`  • ${t.proto.toUpperCase()}: ${t.public_url}`);
      }
      console.log(`[ngrok] ดู request / แก้ header: ${INSPECT}\n`);
    })
    .catch(() => {
      // ngrok ยังไม่ bind API (4040) — รอรอบถัดไป
    });
}

// รอ local API ขึ้นแล้วค่อย log URL
poll = setInterval(logPublicUrls, 400);
giveUp = setTimeout(() => {
  if (poll) clearInterval(poll);
  console.warn(
    "[ngrok] ยังไม่เห็น tunnel ภายใน 60 วินาที — ลองดูสถานะที่ " + INSPECT
  );
}, 60_000);
