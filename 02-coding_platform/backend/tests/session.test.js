"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
describe("Session API", () => {
    it("creates and retrieves a session", async () => {
        const createRes = await (0, supertest_1.default)(app_1.default).post("/sessions").send({ language: "python" });
        expect(createRes.status).toBe(201);
        expect(createRes.body.language).toBe("python");
        expect(createRes.body.code).toBe("");
        const getRes = await (0, supertest_1.default)(app_1.default).get(`/sessions/${createRes.body.id}`);
        expect(getRes.status).toBe(200);
        expect(getRes.body.id).toBe(createRes.body.id);
    });
    it("joins a session and lists users", async () => {
        const session = await (0, supertest_1.default)(app_1.default).post("/sessions").send({});
        const { id } = session.body;
        const joinRes = await (0, supertest_1.default)(app_1.default)
            .post(`/sessions/${id}/join`)
            .send({ userName: "tester" });
        expect(joinRes.status).toBe(200);
        expect(joinRes.body.user?.name).toBe("tester");
        const usersRes = await (0, supertest_1.default)(app_1.default).get(`/sessions/${id}/users`);
        expect(usersRes.status).toBe(200);
        expect(usersRes.body).toHaveLength(1);
    });
    it("updates code, switches language, and leaves", async () => {
        const session = await (0, supertest_1.default)(app_1.default).post("/sessions").send({});
        const { id } = session.body;
        const joinRes = await (0, supertest_1.default)(app_1.default)
            .post(`/sessions/${id}/join`)
            .send({ userName: "tester" });
        const userId = joinRes.body.user?.id;
        await (0, supertest_1.default)(app_1.default).put(`/sessions/${id}/code`).send({ code: "console.log('hi');" }).expect(204);
        await (0, supertest_1.default)(app_1.default).put(`/sessions/${id}/language`).send({ language: "python" }).expect(204);
        await (0, supertest_1.default)(app_1.default).post(`/sessions/${id}/leave`).send({ userId }).expect(204);
        const usersRes = await (0, supertest_1.default)(app_1.default).get(`/sessions/${id}/users`);
        expect(usersRes.status).toBe(200);
        expect(usersRes.body).toHaveLength(0);
    });
    it("executes code for a session", async () => {
        const session = await (0, supertest_1.default)(app_1.default).post("/sessions").send({});
        const { id } = session.body;
        const execRes = await (0, supertest_1.default)(app_1.default)
            .post(`/sessions/${id}/execute`)
            .send({ code: "print('hi')", language: "python" });
        expect(execRes.status).toBe(200);
        expect(execRes.body.output).toContain("Mock");
        expect(execRes.body.timestamp).toBeDefined();
    });
});
