import { createServer } from "http";
import app from "./app";
import { initWebSocket } from "./websocket/ws";

const PORT = process.env.PORT || 3001;

const httpServer = createServer(app);

initWebSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
