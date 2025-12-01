import { Router } from "express";
import { ExecutionResult } from "../types";
import { sessionStore } from "../store/sessionStore";
import { broadcastSessionMessage } from "../websocket/ws";

const router = Router({ mergeParams: true });

const isExecutionResult = (payload: any): payload is ExecutionResult =>
  payload &&
  typeof payload.output === "string" &&
  (payload.error === null || typeof payload.error === "string") &&
  (payload.timestamp === undefined || typeof payload.timestamp === "string");

router.post("/", (req, res) => {
  const sessionId = (req.params as { sessionId: string }).sessionId;
  const { output, error = null, timestamp } = req.body ?? {};

  if (!sessionStore.hasSession(sessionId)) {
    return res.status(404).json({ error: "Session not found" });
  }

  const candidate: ExecutionResult = {
    output,
    error,
    timestamp: timestamp ?? new Date().toISOString()
  };

  if (!isExecutionResult(candidate)) {
    return res.status(400).json({ error: "output (string) is required; error must be string or null" });
  }

  broadcastSessionMessage(sessionId, { type: "execution_result", payload: candidate });
  res.json(candidate);
});

export default router;
