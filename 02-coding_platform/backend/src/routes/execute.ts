import { Router } from "express";
import { ExecutionResult, Language, supportedLanguages } from "../types";
import { sessionStore } from "../store/sessionStore";
import { broadcastSessionMessage } from "../websocket/ws";

const router = Router({ mergeParams: true });
const isLanguage = (value: unknown): value is Language =>
  typeof value === "string" && supportedLanguages.includes(value as Language);

router.post("/", (req, res) => {
  const sessionId = (req.params as { sessionId: string }).sessionId;
  const { code, language } = req.body;
  if (typeof code !== "string" || !isLanguage(language)) {
    return res.status(400).json({ error: "code and language are required" });
  }

  if (!sessionStore.hasSession(sessionId)) {
    return res.status(404).json({ error: "Session not found" });
  }

  sessionStore.updateCode(sessionId, code);
  sessionStore.changeLanguage(sessionId, language);

  const result: ExecutionResult = {
    output: `[Mock ${language} output]`,
    error: null,
    timestamp: new Date().toISOString()
  };

  broadcastSessionMessage(sessionId, { type: "execution_result", payload: result });
  res.json(result);
});

export default router;
