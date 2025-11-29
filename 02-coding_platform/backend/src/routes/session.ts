import { Router } from "express";
import { sessionStore } from "../store/sessionStore";
import { broadcastSessionMessage } from "../websocket/ws";
import { Language, supportedLanguages } from "../types";

const router = Router();

const isLanguage = (value: unknown): value is Language =>
  typeof value === "string" && supportedLanguages.includes(value as Language);

router.post("/", (req, res) => {
  const language = isLanguage(req.body?.language) ? req.body.language : "javascript";
  const session = sessionStore.createSession(language);
  res.status(201).json(session);
});

router.get("/:sessionId", (req, res) => {
  const session = sessionStore.getSession(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json(session);
});

router.post("/:sessionId/join", (req, res) => {
  const { userName } = req.body;
  if (!userName || typeof userName !== "string") {
    return res.status(400).json({ error: "userName is required" });
  }

  try {
    const { session, user } = sessionStore.addUserToSession(req.params.sessionId, userName);
    broadcastSessionMessage(req.params.sessionId, { type: "user_joined", payload: { user } });
    res.json({ session, user });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

router.get("/:sessionId/users", (req, res) => {
  try {
    const users = sessionStore.getSessionUsers(req.params.sessionId);
    res.json(users);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

router.put("/:sessionId/code", (req, res) => {
  const { code } = req.body;
  if (typeof code !== "string") {
    return res.status(400).json({ error: "code is required" });
  }
  try {
    sessionStore.updateCode(req.params.sessionId, code);
    broadcastSessionMessage(req.params.sessionId, { type: "code_change", payload: { code } });
    res.status(204).send();
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

router.put("/:sessionId/language", (req, res) => {
  const { language } = req.body;
  if (!isLanguage(language)) {
    return res.status(400).json({ error: "language must be javascript or python" });
  }
  try {
    sessionStore.changeLanguage(req.params.sessionId, language);
    broadcastSessionMessage(req.params.sessionId, { type: "language_change", payload: { language } });
    res.status(204).send();
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

router.post("/:sessionId/leave", (req, res) => {
  const { userId } = req.body;
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId is required" });
  }
  try {
    const user = sessionStore.removeUserFromSession(req.params.sessionId, userId);
    broadcastSessionMessage(req.params.sessionId, { type: "user_left", payload: { user } });
    res.status(204).send();
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

export default router;
