const request = require("supertest");
const app = require("../src/app");

jest.mock("../src/models/Task");
const Task = require("../src/models/Task");

const mockTask = { _id: "abc123", title: "Tâche test", done: false };

describe("GET /api/tasks", () => {
  it("retourne un tableau vide si aucune tâche", async () => {
    Task.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("retourne les tâches existantes", async () => {
    Task.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([mockTask]) });
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Tâche test");
  });
});

describe("POST /api/tasks", () => {
  it("crée une tâche avec un titre valide", async () => {
    Task.create.mockResolvedValue({ ...mockTask, title: "Nouvelle tâche" });
    const res = await request(app).post("/api/tasks").send({ title: "Nouvelle tâche" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Nouvelle tâche");
    expect(res.body.done).toBe(false);
  });

  it("refuse un titre vide", async () => {
    const res = await request(app).post("/api/tasks").send({ title: "" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("title required");
  });

  it("refuse une requête sans title", async () => {
    const res = await request(app).post("/api/tasks").send({});
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/tasks/:id/done", () => {
  it("marque une tâche comme done", async () => {
    Task.findByIdAndUpdate.mockResolvedValue({ ...mockTask, done: true });
    const res = await request(app).patch("/api/tasks/abc123/done");
    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);
  });

  it("retourne 404 pour un id inconnu", async () => {
    Task.findByIdAndUpdate.mockResolvedValue(null);
    const res = await request(app).patch("/api/tasks/unknown/done");
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("supprime une tâche existante", async () => {
    Task.findByIdAndDelete.mockResolvedValue(mockTask);
    const res = await request(app).delete("/api/tasks/abc123");
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });

  it("retourne 404 pour un id inconnu", async () => {
    Task.findByIdAndDelete.mockResolvedValue(null);
    const res = await request(app).delete("/api/tasks/unknown");
    expect(res.status).toBe(404);
  });
});
