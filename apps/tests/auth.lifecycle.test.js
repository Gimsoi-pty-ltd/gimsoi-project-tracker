import request from "supertest";
import prisma from "../lib/prisma.js";
import app from "../server.js";

describe("Auth Lifecycle Test", () => {

  const email = "lifecycle@test.com";

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
  });

  it("Create user", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        email,
        password: "Password123!",
        fullName: "Lifecycle User"
      });

    expect(res.statusCode).toBe(201);
  });

  it("Login user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "Password123!"
      });

    expect(res.statusCode).toBe(200);
  });

  it("Confirm user exists in DB", async () => {
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).not.toBeNull();
  });

  it("Delete user", async () => {
    await prisma.user.delete({ where: { email } });
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).toBeNull();
  });

});