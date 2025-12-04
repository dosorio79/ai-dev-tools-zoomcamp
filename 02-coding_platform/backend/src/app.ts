import express from "express";
import cors from "cors";
import path from "path";
import sessionRouter from "./routes/session";
import executeRouter from "./routes/execute";

const app = express();
const isProduction = process.env.NODE_ENV === "production";

app.use(cors());
app.use(express.json());

app.use("/sessions", sessionRouter);
app.use("/sessions/:sessionId/execute", executeRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/sessions/:sessionId/execute", executeRouter);

if (isProduction) {
  const staticDir = path.join(__dirname, "../static");
  app.use(express.static(staticDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res.json({ status: "ok", message: "Backend running" });
  });
}

export default app;
