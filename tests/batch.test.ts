import request from "supertest";
import { createApp } from "../src/app";
import { generateFakeUsers } from "../src/services/faker.service";

const app = createApp();

describe("POST /api/users/batch", () => {
  it("importe une liste d'utilisateurs valides", async () => {
    const users = generateFakeUsers(3);
    const buffer = Buffer.from(JSON.stringify(users), "utf-8");

    const response = await request(app)
      .post("/api/users/batch")
      .attach("file", buffer, "users.json");

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(3);
    expect(response.body.imported).toBe(3);
    expect(response.body.failed).toBe(0);
  });

  it("rejette les doublons sur email/username deja en base", async () => {
    const users = generateFakeUsers(2);
    const buffer1 = Buffer.from(JSON.stringify(users), "utf-8");

    await request(app).post("/api/users/batch").attach("file", buffer1, "users.json");

    const buffer2 = Buffer.from(JSON.stringify(users), "utf-8");
    const response = await request(app).post("/api/users/batch").attach("file", buffer2, "users.json");

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.imported).toBe(0);
    expect(response.body.failed).toBe(2);
  });

  it("retourne une erreur si aucun fichier n'est fourni", async () => {
    const response = await request(app).post("/api/users/batch");
    expect(response.status).toBe(400);
  });

  it("retourne une erreur si le fichier n'est pas un JSON valide", async () => {
    const buffer = Buffer.from("ceci n'est pas du json", "utf-8");
    const response = await request(app).post("/api/users/batch").attach("file", buffer, "users.json");
    expect(response.status).toBe(400);
  });
});
