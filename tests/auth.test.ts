import request from "supertest";
import { createApp } from "../src/app";
import { createTestUser } from "./helpers";

const app = createApp();

describe("POST /api/auth", () => {
  it("authentifie avec le username", async () => {
    const { user, plainPassword } = await createTestUser();
    const response = await request(app).post("/api/auth").send({ username: user.username, password: plainPassword });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toEqual(expect.any(String));
  });

  it("authentifie avec l'email", async () => {
    const { user, plainPassword } = await createTestUser();
    const response = await request(app).post("/api/auth").send({ username: user.email, password: plainPassword });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toEqual(expect.any(String));
  });

  it("refuse un mot de passe incorrect", async () => {
    const { user } = await createTestUser();
    const response = await request(app).post("/api/auth").send({ username: user.username, password: "wrong-password" });

    expect(response.status).toBe(401);
  });

  it("refuse un utilisateur inconnu", async () => {
    const response = await request(app).post("/api/auth").send({ username: "inconnu", password: "whatever1" });
    expect(response.status).toBe(401);
  });

  it("valide le corps de la requete", async () => {
    const response = await request(app).post("/api/auth").send({ username: "" });
    expect(response.status).toBe(400);
  });
});
