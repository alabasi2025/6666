import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("assets module", () => {
  describe("assets.list", () => {
    it("returns a list of assets", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.asset.list({ businessId: 1 });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("assets.getById", () => {
    it("returns an asset by ID", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.asset.getById({ id: 1 });

      expect(result).toBeDefined();
      if (result) {
        expect(result.id).toBe(1);
      }
    });

    it("returns undefined for non-existent asset", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.asset.getById({ id: 99999 });

      expect(result).toBeNull();
    });
  });

  describe("assets.create", () => {
    it("creates a new asset", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const newAsset = {
        businessId: 1,
        branchId: 1,
        stationId: 1,
        code: `AST-TEST-${Date.now()}`,
        nameAr: "أصل اختباري",
        nameEn: "Test Asset",
        categoryId: 1,
        status: "active" as const,
        acquisitionDate: new Date().toISOString(),
        acquisitionCost: "100000",
      };

      const result = await caller.asset.create(newAsset);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});

describe("accounts", () => {
  describe("account.list", () => {
    it("returns a list of accounts", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.account.list({ businessId: 1 });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe("work orders", () => {
  describe("workOrder.list", () => {
    it("returns a list of work orders", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.workOrder.list({ businessId: 1 });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("workOrder.create", () => {
    it("creates a new work order", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.workOrder.create({
        businessId: 1,
        branchId: 1,
        stationId: 1,
        title: "اختبار أمر عمل",
        type: "corrective",
        priority: "medium",
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});
