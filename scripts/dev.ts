/**
 * รัน Next dev + ngrok คู่กัน: `bun run dev` จะ log Public URL จาก ngrok
 */
import { join } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const isWin = process.platform === "win32";

const next = spawn("bunx", ["next", "dev"], {
  stdio: "inherit",
  cwd: root,
  env: process.env,
  shell: isWin,
});

const ng = spawn("bun", [join("scripts", "ngrok.ts")], {
  stdio: "inherit",
  cwd: root,
  env: process.env,
  shell: isWin,
});

const children = [next, ng] as const;

for (const child of children) {
  child.on("error", (err) => {
    console.error(`[dev] spawn error: ${err.message}`);
  });
}

let bySignal = false;
function onSignal() {
  if (bySignal) return;
  bySignal = true;
  for (const c of children) {
    if (c.exitCode === null) c.kill("SIGINT");
  }
  setTimeout(() => process.exit(0), 200);
}
process.on("SIGINT", onSignal);
process.on("SIGTERM", onSignal);

let fin = false;
function finishFromChild(exitCode: number | null) {
  if (fin) return;
  fin = true;
  const n = exitCode === 0 || exitCode === null ? 0 : exitCode;
  for (const c of children) {
    if (c.exitCode === null) c.kill("SIGINT");
  }
  setTimeout(() => process.exit(n), 200);
}
next.on("exit", (code) => {
  if (bySignal) return;
  finishFromChild(code);
});
ng.on("exit", (code) => {
  if (bySignal) return;
  finishFromChild(code);
});
