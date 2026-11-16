import { app } from "./app";
import { env } from "./env";

app.listen(env.PORT);
console.log(`API running at http://localhost:${env.PORT} (docs: /docs)`);
