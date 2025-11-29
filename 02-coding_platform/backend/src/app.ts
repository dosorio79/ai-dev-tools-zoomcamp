import express from "express";
import cors from "cors";
import sessionRouter from "./routes/session";
import executeRouter from "./routes/execute";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/sessions", sessionRouter);
app.use("/sessions/:sessionId/execute", executeRouter);

app.get("/", (_, res) => {
  res.json({ status: "ok", message: "Backend running" });
});

export default app;
