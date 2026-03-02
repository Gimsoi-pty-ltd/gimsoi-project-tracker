import request from "supertest";
import app from "../server.js";

describe("Auth Input Safety Tests", () => {

  const base = "/api/auth";

  it("Missing required fields (signup)", async () => {
    const res = await request(app)
      .post(`${base}/signup`)
      .send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("Invalid types (signup)", async () => {
    const res = await request(app)
      .post(`${base}/signup`)
      .send({ email: 123, password: [], fullName: true });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("Very long strings (signup)", async () => {
    const longEmail = "a".repeat(5000) + "@test.com";
    const res = await request(app)
      .post(`${base}/signup`)
      .send({ email: longEmail, password: "Password123!", fullName: "Test" });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("Role escalation attempt (signup)", async () => {
    const res = await request(app)
      .post(`${base}/signup`)
      .send({
        email: "admin@test.com",
        password: "Password123!",
        fullName: "Admin User",
        role: "ADMIN"
      });
    expect([400, 403]).toContain(res.statusCode);
  });

  it("Duplicate email", async () => {
    const payload = {
      email: "dup@test.com",
      password: "Password123!",
      fullName: "Dup User"
    };

    await request(app).post(`${base}/signup`).send(payload);
    const second = await request(app).post(`${base}/signup`).send(payload);

    expect([400, 409]).toContain(second.statusCode);
  });

  it("Invalid login credentials", async () => {
    const res = await request(app)
      .post(`${base}/login`)
      .send({ email: "fake@test.com", password: "WrongPass" });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("Rapid sequential login attempts", async () => {
    const requests = Array.from({ length: 20 }, () =>
      request(app)
        .post(`${base}/login`)
        .send({ email: "fake@test.com", password: "WrongPass" })
    );

    const results = await Promise.all(requests);
    results.forEach(r => {
      expect(r.statusCode).toBeLessThan(500);
    });
  });

});