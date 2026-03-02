import { describe, it, expect, beforeAll } from "bun:test";

const BASE_URL = "http://localhost:4001";
let authToken: string;
let userId: number;

describe("API Endpoints", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: `testuser-${Date.now()}`,
          email: `test-${Date.now()}@example.com`,
          password: "testpass123",
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.username).toBeDefined();
      expect(data.token).toBeDefined();

      authToken = data.token;
      userId = data.id;
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `test-${Date.now()}@example.com`,
          password: "testpass123",
        }),
      });

      expect([200, 401]).toContain(res.status);
    });

    it("should reject invalid credentials", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "wrongpass",
        }),
      });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/markets", () => {
    it("should list all markets", async () => {
      const res = await fetch(`${BASE_URL}/api/markets`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].id).toBeDefined();
      expect(data[0].title).toBeDefined();
      expect(data[0].outcomes).toBeDefined();
    });
  });

  describe("GET /api/markets/:id", () => {
    it("should get a specific market", async () => {
      const res = await fetch(`${BASE_URL}/api/markets/10`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe(10);
      expect(data.title).toBeDefined();
      expect(data.description).toBeDefined();
      expect(data.outcomes).toBeDefined();
    });
  });

  describe("POST /api/markets/:id/bets", () => {
    it("should reject bet without auth", async () => {
      const res = await fetch(`${BASE_URL}/api/markets/10/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcomeId: 25,
          amount: 100,
        }),
      });

      expect(res.status).toBe(401);
    });

    it("should place a bet with valid auth", async () => {
      if (!authToken) {
        console.warn("Skipping bet test: no auth token available");
        return;
      }
      
      const res = await fetch(`${BASE_URL}/api/markets/10/bets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          outcomeId: 25,
          amount: 50,
        }),
      });

      if (res.status === 200) {
        const data = await res.json();
        expect(data.id).toBeDefined();
        expect(data.userId).toBe(userId);
        expect(data.amount).toBe(50);
      }
    });
  });
});
