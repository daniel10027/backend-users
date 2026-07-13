import request from "supertest";
import { createApp } from "../src/app";
import { createTestUser } from "./helpers";

const app = createApp();

describe("GET /api/users/me", () => {
  it("retourne le profil de l'utilisateur authentifie", async () => {
    const { user, token } = await createTestUser({ username: "moi", email: "moi@example.com" });

    const response = await request(app).get("/api/users/me").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe(user.username);
    expect(response.body.password).toBeUndefined();
  });

  it("refuse l'acces sans token", async () => {
    const response = await request(app).get("/api/users/me");
    expect(response.status).toBe(401);
  });
});

describe("GET /api/users/:username", () => {
  it("permet a un admin de consulter n'importe quel profil", async () => {
    const { token: adminToken } = await createTestUser({ username: "admin1", email: "admin1@example.com", role: "admin" });
    const { user: otherUser } = await createTestUser({ username: "user2", email: "user2@example.com" });

    const response = await request(app)
      .get(`/api/users/${otherUser.username}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe(otherUser.username);
  });

  it("permet a un utilisateur de consulter son propre profil", async () => {
    const { user, token } = await createTestUser({ username: "user3", email: "user3@example.com" });

    const response = await request(app).get(`/api/users/${user.username}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe(user.username);
  });

  it("interdit a un utilisateur standard de consulter le profil d'un autre", async () => {
    const { token } = await createTestUser({ username: "user4", email: "user4@example.com" });
    const { user: otherUser } = await createTestUser({ username: "user5", email: "user5@example.com" });

    const response = await request(app).get(`/api/users/${otherUser.username}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it("retourne 404 pour un utilisateur inexistant consulte par un admin", async () => {
    const { token: adminToken } = await createTestUser({ username: "admin2", email: "admin2@example.com", role: "admin" });

    const response = await request(app).get("/api/users/inconnu").set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });
});
