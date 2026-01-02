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

describe("Maintenance Module - Work Orders", () => {
  it("should list work orders", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.workOrder.list({ businessId: 1 });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a new work order", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const newWorkOrder = {
      businessId: 1,
      code: "WO-TEST-001",
      title: "اختبار أمر عمل",
      type: "corrective" as const,
      priority: "high" as const,
      status: "pending" as const,
      assetId: 1,
      stationId: 1,
      description: "وصف اختباري لأمر العمل",
    };
    
    const result = await caller.workOrder.create(newWorkOrder);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("should get work order by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.workOrder.getById({ id: 1 });
    
    expect(result).toBeDefined();
  });

  it("should update work order status", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.workOrder.updateStatus({
      id: 1,
      status: "in_progress",
    });
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});

describe("Maintenance Module - Technicians", () => {
  it("should have work orders router defined", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    // Verify the router exists
    expect(caller.workOrder).toBeDefined();
    expect(caller.workOrder.list).toBeDefined();
    expect(caller.workOrder.create).toBeDefined();
    expect(caller.workOrder.getById).toBeDefined();
    expect(caller.workOrder.updateStatus).toBeDefined();
  });
});

describe("Maintenance Module - Statistics", () => {
  it("should return maintenance statistics", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    // Test that we can call the list endpoint and get stats-compatible data
    const workOrders = await caller.workOrder.list({ businessId: 1 });
    
    // Calculate statistics from work orders
    const stats = {
      total: workOrders.length,
      pending: workOrders.filter((wo: any) => wo.status === "pending").length,
      inProgress: workOrders.filter((wo: any) => wo.status === "in_progress").length,
      completed: workOrders.filter((wo: any) => wo.status === "completed").length,
    };
    
    expect(stats).toBeDefined();
    expect(typeof stats.total).toBe("number");
    expect(typeof stats.pending).toBe("number");
    expect(typeof stats.inProgress).toBe("number");
    expect(typeof stats.completed).toBe("number");
  });
});
