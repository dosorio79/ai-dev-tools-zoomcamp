import request from "supertest";
import app from "../src/app";

describe("Session API", () => {
  it("creates and retrieves a session", async () => {
    const createRes = await request(app).post("/sessions").send({ language: "python" });
    expect(createRes.status).toBe(201);
    expect(createRes.body.language).toBe("python");
    expect(createRes.body.code).toBe("");
    expect(createRes.body.createdAt).toBeDefined();
    expect(Date.parse(createRes.body.createdAt)).not.toBeNaN();

    const getRes = await request(app).get(`/sessions/${createRes.body.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(createRes.body.id);
  });

  it("defaults language to javascript when not provided", async () => {
    const res = await request(app).post("/sessions").send({});
    expect(res.status).toBe(201);
    expect(res.body.language).toBe("javascript");
  });

  it("rejects unsupported language on create", async () => {
    const res = await request(app).post("/sessions").send({ language: "ruby" });
    expect(res.status).toBe(400);
  });

  it("rejects missing userName on join", async () => {
    const session = await request(app).post("/sessions").send({});
    const res = await request(app).post(`/sessions/${session.body.id}/join`).send({});
    expect(res.status).toBe(400);
  });

  it("joins a session and lists users", async () => {
    const session = await request(app).post("/sessions").send({});
    const { id } = session.body;

    const joinRes = await request(app)
      .post(`/sessions/${id}/join`)
      .send({ userName: "tester" });
    expect(joinRes.status).toBe(200);
    expect(joinRes.body.user?.name).toBe("tester");

    const usersRes = await request(app).get(`/sessions/${id}/users`);
    expect(usersRes.status).toBe(200);
    expect(usersRes.body).toHaveLength(1);
  });

  it("handles missing sessions with 404s", async () => {
    await request(app).get("/sessions/does-not-exist").expect(404);
    await request(app).post("/sessions/does-not-exist/join").send({ userName: "x" }).expect(404);
    await request(app).get("/sessions/does-not-exist/users").expect(404);
    await request(app).put("/sessions/does-not-exist/code").send({ code: "x" }).expect(404);
    await request(app).put("/sessions/does-not-exist/language").send({ language: "python" }).expect(404);
    await request(app).post("/sessions/does-not-exist/execute").send({ output: "x" }).expect(404);
    await request(app).post("/sessions/does-not-exist/leave").send({ userId: "abc" }).expect(404);
  });

  it("updates code, switches language, and leaves", async () => {
    const session = await request(app).post("/sessions").send({});
    const { id } = session.body;

    const joinRes = await request(app)
      .post(`/sessions/${id}/join`)
      .send({ userName: "tester" });
    const userId = joinRes.body.user?.id;

    await request(app).put(`/sessions/${id}/code`).send({ code: "console.log('hi');" }).expect(204);
    await request(app).put(`/sessions/${id}/language`).send({ language: "python" }).expect(204);

    await request(app).post(`/sessions/${id}/leave`).send({ userId }).expect(204);

    const usersRes = await request(app).get(`/sessions/${id}/users`);
    expect(usersRes.status).toBe(200);
    expect(usersRes.body).toHaveLength(0);
  });

  it("validates language on change", async () => {
    const session = await request(app).post("/sessions").send({});
    const res = await request(app).put(`/sessions/${session.body.id}/language`).send({ language: "ruby" });
    expect(res.status).toBe(400);
  });

  it("requires userId on leave", async () => {
    const session = await request(app).post("/sessions").send({});
    const res = await request(app).post(`/sessions/${session.body.id}/leave`).send({});
    expect(res.status).toBe(400);
  });

  it("requires output on execute broadcast", async () => {
    const session = await request(app).post("/sessions").send({});
    await request(app).post(`/sessions/${session.body.id}/execute`).send({}).expect(400);
    await request(app)
      .post(`/sessions/${session.body.id}/execute`)
      .send({ output: "ok", error: 123 })
      .expect(400);
  });

  it("relays browser execution result for a session", async () => {
    const session = await request(app).post("/sessions").send({});
    const { id } = session.body;

    const execRes = await request(app)
      .post(`/sessions/${id}/execute`)
      .send({ output: "hi\n", error: null, timestamp: "2024-01-01T00:00:00.000Z" });
    expect(execRes.status).toBe(200);
    expect(execRes.body.output).toBe("hi\n");
    expect(execRes.body.timestamp).toBe("2024-01-01T00:00:00.000Z");
  });
});
