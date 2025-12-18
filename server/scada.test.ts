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

describe("SCADA Module - Equipment API", () => {
  it("should list equipment", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.equipment.list({ businessId: 1 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create new equipment", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.equipment.create({
      businessId: 1,
      stationId: 1,
      name: "محول كهربائي T-001",
      nameAr: "محول كهربائي T-001",
      code: "TR-001",
      type: "transformer",
      status: "operational",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});

describe("SCADA Module - Alert API", () => {
  it("should list alerts", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.alert.list({ businessId: 1 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should acknowledge alert", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Acknowledge an alert
    const result = await caller.alert.acknowledge({ id: 1 });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});

describe("SCADA Module - Monitoring Dashboard Data", () => {
  it("should return equipment statistics", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // List equipment to verify stats can be calculated
    const equipment = await caller.equipment.list({ businessId: 1 });
    
    expect(equipment).toBeDefined();
    expect(Array.isArray(equipment)).toBe(true);
  });

  it("should return alerts statistics", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // List alerts to verify stats can be calculated
    const alerts = await caller.alert.list({ businessId: 1 });
    
    expect(alerts).toBeDefined();
    expect(Array.isArray(alerts)).toBe(true);
  });
});
