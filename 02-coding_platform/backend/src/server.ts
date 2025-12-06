// Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import app from "./app";
import { initWebSocket } from "./websocket/ws";

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || "0.0.0.0";

const httpServer = createServer(app);

initWebSocket(httpServer);

httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
