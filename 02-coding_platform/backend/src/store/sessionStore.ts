import { v4 as uuid } from "uuid";
import { Language, Session, User } from "../types";

type SessionRecord = Session & {
  users: Record<string, User>;
};

interface AddUserResult {
  session: Session;
  user: User;
}

const colors = ["#e74c3c", "#2ecc71", "#3498db", "#f1c40f", "#9b59b6", "#1abc9c", "#e67e22"];

const pickColor = (index: number) => colors[index % colors.length];

export class SessionStore {
  private sessions: Record<string, SessionRecord> = {};

  private toPublic(session: SessionRecord): Session {
    const { users, ...rest } = session;
    return rest;
  }

  private ensureSession(sessionId: string): SessionRecord {
    const session = this.sessions[sessionId];
    if (!session) throw new Error("Session not found");
    return session;
  }

  createSession(language: Language = "javascript"): Session {
    const id = uuid();
    const session: SessionRecord = {
      id,
      createdAt: new Date().toISOString(),
      code: "",
      language,
      users: {}
    };
    this.sessions[id] = session;
    return this.toPublic(session);
  }

  getSession(sessionId: string): Session | undefined {
    const session = this.sessions[sessionId];
    if (!session) return undefined;
    return this.toPublic(session);
  }

  hasSession(sessionId: string): boolean {
    return Boolean(this.sessions[sessionId]);
  }

  addUserToSession(sessionId: string, userName: string): AddUserResult {
    const session = this.ensureSession(sessionId);
    const user: User = {
      id: uuid(),
      name: userName,
      color: pickColor(Object.keys(session.users).length)
    };
    session.users[user.id] = user;
    return {
      session: this.toPublic(session),
      user
    };
  }

  getSessionUsers(sessionId: string): User[] {
    const session = this.ensureSession(sessionId);
    return Object.values(session.users);
  }

  updateCode(sessionId: string, code: string): Session {
    const session = this.ensureSession(sessionId);
    session.code = code;
    return this.toPublic(session);
  }

  changeLanguage(sessionId: string, language: Language): Session {
    const session = this.ensureSession(sessionId);
    session.language = language;
    return this.toPublic(session);
  }

  removeUserFromSession(sessionId: string, userId: string): User {
    const session = this.ensureSession(sessionId);
    const user = session.users[userId];
    if (!user) throw new Error("User not found");
    delete session.users[userId];
    return user;
  }
}

export const sessionStore = new SessionStore();
