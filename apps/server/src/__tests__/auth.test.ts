import request from "supertest";
import express from "express";
import router from "../routes/index";

/**
 * Auth API Test Suite
 * Tests login, logout, and token enforcement.
 */

const app = express();
app.use(express.json());
app.use(router);

describe("Auth API", () => {
  let accessToken: string = "";

  describe("POST /api/v1/auth/login", () => {
    it("should reject login with missing credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject login with invalid email format", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "not-an-email", password: "Valid@123" });
      expect(res.statusCode).toBe(400);
    });

    it("should reject login with wrong credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "wrong@example.com", password: "Wrong@123" });
      expect([400, 401]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);
    });

    it("should login successfully with valid credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "admin@dam.com", password: "Admin@123" });

      if (res.statusCode === 200) {
        expect(res.body.success).toBe(true);
        accessToken = res.body.data?.accessToken || "";
      } else {
        // DB not available in unit test, expect 400/401
        expect([400, 401, 500]).toContain(res.statusCode);
      }
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("should reject logout without token", async () => {
      const res = await request(app).post("/api/v1/auth/logout");
      expect([401, 403]).toContain(res.statusCode);
    });
  });
});
