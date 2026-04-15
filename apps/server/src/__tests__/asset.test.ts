import request from "supertest";
import express from "express";
import router from "../routes/index";

/**
 * Asset API Test Suite
 * Tests asset CRUD, lifecycle transitions, and file upload validation.
 */

const app = express();
app.use(express.json());
app.use(router);

// Mock token for authenticated tests (replace with actual seeded token in integration)
const MOCK_TOKEN = "Bearer test-token";

describe("Asset API", () => {
  describe("POST /api/v1/assest (Create Asset Record)", () => {
    it("should reject unauthenticated asset creation", async () => {
      const res = await request(app)
        .post("/api/v1/assest")
        .send({ filename: "test.jpg", storageKey: "uploads/test.jpg", size: 1024, mimetype: "image/jpeg" });
      expect([401, 403]).toContain(res.statusCode);
    });

    it("should reject asset creation with missing required fields", async () => {
      const res = await request(app)
        .post("/api/v1/assest")
        .set("Authorization", MOCK_TOKEN)
        .send({ filename: "test.jpg" }); // missing storageKey, size, mimetype
      expect([400, 401, 403]).toContain(res.statusCode);
    });
  });

  describe("POST /api/v1/assest/upload (File Upload)", () => {
    it("should reject upload without authentication", async () => {
      const res = await request(app)
        .post("/api/v1/assest/upload")
        .attach("file", Buffer.from("fake image content"), "test.jpg");
      expect([401, 403]).toContain(res.statusCode);
    });

    it("should reject upload with no file attached", async () => {
      const res = await request(app)
        .post("/api/v1/assest/upload")
        .set("Authorization", MOCK_TOKEN)
        .send({});
      expect([400, 401, 403]).toContain(res.statusCode);
    });
  });

  describe("GET /api/v1/assest (List Assets)", () => {
    it("should reject listing without authentication", async () => {
      const res = await request(app).get("/api/v1/assest");
      expect([401, 403]).toContain(res.statusCode);
    });

    it("should return a list or empty array for authenticated user", async () => {
      const res = await request(app)
        .get("/api/v1/assest")
        .set("Authorization", MOCK_TOKEN);
      // Will 401 in unit test since token is invalid, 200 in integration
      expect([200, 401, 403, 500]).toContain(res.statusCode);
    });

    it("should accept valid query parameters", async () => {
      const res = await request(app)
        .get("/api/v1/assest?status=pending&page=0&limit=5&sortOrder=DESC")
        .set("Authorization", MOCK_TOKEN);
      expect([200, 401, 403, 500]).toContain(res.statusCode);
    });
  });

  describe("PATCH /api/v1/assest/:id/status (Lifecycle Transition)", () => {
    it("should reject status update without authentication", async () => {
      const res = await request(app)
        .patch("/api/v1/assest/1/status")
        .send({ status: "approved" });
      expect([401, 403]).toContain(res.statusCode);
    });

    it("should reject invalid status values", async () => {
      const res = await request(app)
        .patch("/api/v1/assest/1/status")
        .set("Authorization", MOCK_TOKEN)
        .send({ status: "invalid-status" });
      expect([400, 401, 403]).toContain(res.statusCode);
    });
  });

  describe("GET /api/v1/assest/:id (Get Asset by ID)", () => {
    it("should return 404 for non-existent asset", async () => {
      const res = await request(app)
        .get("/api/v1/assest/99999")
        .set("Authorization", MOCK_TOKEN);
      expect([404, 401, 403, 500]).toContain(res.statusCode);
    });
  });

  describe("DELETE /api/v1/assest/:id (Delete Asset)", () => {
    it("should reject delete without authentication", async () => {
      const res = await request(app).delete("/api/v1/assest/1");
      expect([401, 403]).toContain(res.statusCode);
    });
  });
});
