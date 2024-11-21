import { log } from "@repo/logger";
import { createServer } from "./server";
import router from "./router";

const port = process.env.PORT || 5001;
const server = createServer();

server.use(router)

server.listen(port, () => {
  log(`api running on http://localhost:${port}`);
});
