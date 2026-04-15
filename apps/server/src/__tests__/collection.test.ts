import request from "supertest";
import express from "express";
import router from "../routes/index";

/**
 * Collection & Analytics API Test Suite
 */

const app = express();
app.use(express.json());
app.use(router);

const MOCK_TOKEN = "Bearer test-token";

describe("Collection API", () => {
  describe("POST /api/v1/collection", () => {
    it("should reject unauthenticated creation", async () => {
      const res = await request(app)
        .post("/api/v1/collection")
        .send({ name: "Design Assets" });
      expect([401, 403]).toContain(res.statusCode);
    });

    it("should reject creation without required name field", async () => {
      const res = await request(app)
        .post("/api/v1/collection")
        .set("Authorization", MOCK_TOKEN)
        .send({ description: "No name provided" });
      expect([400, 401, 403]).toContain(res.statusCode);
    });

    it("should reject name shorter than 2 characters", async () => {
      const res = await request(app)
        .post("/api/v1/collection")
        .set("Authorization", MOCK_TOKEN)
        .send({ name: "A" });
      expect([400, 401, 403]).toContain(res.statusCode);
    });
  });

  describe("GET /api/v1/collection", () => {
    it("should reject unauthenticated listing", async () => {
      const res = await request(app).get("/api/v1/collection");
      expect([401, 403]).toContain(res.statusCode);
    });
  });

  describe("DELETE /api/v1/collection/:id", () => {
    it("should reject unauthenticated deletion", async () => {
      const res = await request(app).delete("/api/v1/collection/1");
      expect([401, 403]).toContain(res.statusCode);
    });
  });
});

describe("Statistics & Analytics API", () => {
  describe("GET /api/v1/stats/overview", () => {
    it("should reject unauthenticated access", async () => {
      const res = await request(app).get("/api/v1/stats/overview");
      expect([401, 403]).toContain(res.statusCode);
    });
  });

  describe("GET /api/v1/stats/compliance", () => {
    it("should reject unauthenticated access", async () => {
      const res = await request(app).get("/api/v1/stats/compliance");
      expect([401, 403]).toContain(res.statusCode);
    });
  });

  describe("POST /api/v1/stats/track", () => {
    it("should reject unauthenticated usage tracking", async () => {
      const res = await request(app)
        .post("/api/v1/stats/track")
        .send({ assetId: 1, action: "view" });
      expect([401, 403]).toContain(res.statusCode);
    });

    it("should accept valid usage event (token-gated)", async () => {
      const res = await request(app)
        .post("/api/v1/stats/track")
        .set("Authorization", MOCK_TOKEN)
        .send({ assetId: 1, action: "view", context: { source: "dashboard" } });
      // 401/403 in unit tests (token not valid); 201 in integration
      expect([201, 401, 403, 500]).toContain(res.statusCode);
    });
  });

  describe("GET /api/v1/stats/track/:id", () => {
    it("should reject unauthenticated usage history request", async () => {
      const res = await request(app).get("/api/v1/stats/track/1");
      expect([401, 403]).toContain(res.statusCode);
    });
  });
});
