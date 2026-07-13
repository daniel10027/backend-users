import request from "supertest";
import { createApp } from "../src/app";

const app = createApp();

describe("GET /api/users/generate", () => {
  it("genere le nombre d'utilisateurs demande avec un en-tete de telechargement", async () => {
    const response = await request(app).get("/api/users/generate?count=5");

    expect(response.status).toBe(200);
    expect(response.headers["content-disposition"]).toContain("attachment");

    const users = JSON.parse(response.text);
    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(5);

    for (const user of users) {
      expect(["admin", "user"]).toContain(user.role);
      expect(user.password.length).toBeGreaterThanOrEqual(6);
      expect(user.password.length).toBeLessThanOrEqual(10);
      expect(user.email).toMatch(/@/);
    }
  });

  it("rejette un parametre count invalide", async () => {
    const response = await request(app).get("/api/users/generate?count=0");
    expect(response.status).toBe(400);
  });

  it("rejette un parametre count non numerique", async () => {
    const response = await request(app).get("/api/users/generate?count=abc");
    expect(response.status).toBe(400);
  });

  it("rejette un count superieur a la limite autorisee", async () => {
    const response = await request(app).get("/api/users/generate?count=5000");
    expect(response.status).toBe(400);
  });
});
