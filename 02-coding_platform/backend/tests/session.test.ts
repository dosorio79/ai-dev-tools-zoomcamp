import request from "supertest";
import app from "../src/app";

describe("Session API", () => {
  it("creates and retrieves a session", async () => {
    const createRes = await request(app).post("/sessions").send({ language: "python" });
    expect(createRes.status).toBe(201);
    expect(createRes.body.language).toBe("python");
    expect(createRes.body.code).toBe("");

    const getRes = await request(app).get(`/sessions/${createRes.body.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(createRes.body.id);
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

  it("executes code for a session", async () => {
    const session = await request(app).post("/sessions").send({});
    const { id } = session.body;

    const execRes = await request(app)
      .post(`/sessions/${id}/execute`)
      .send({ code: "print('hi')", language: "python" });
    expect(execRes.status).toBe(200);
    expect(execRes.body.output).toContain("Mock");
    expect(execRes.body.timestamp).toBeDefined();
  });
});
