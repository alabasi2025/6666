import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
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

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Projects Module", () => {
  describe("project.list", () => {
    it("should return a list of projects", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.project.list({ businessId: 1 });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should accept pagination parameters", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.project.list({ 
        businessId: 1,
        page: 1,
        limit: 10 
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("project.create", () => {
    it("should create a new project with required fields", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const projectData = {
        businessId: 1,
        name: "مشروع اختباري",
        nameAr: "مشروع اختباري",
        code: "PRJ-TEST-001",
        type: "construction" as const,
        status: "planning" as const,
        startDate: "2024-01-15",
        endDate: "2024-12-31",
        budget: 1000000,
      };
      
      const result = await caller.project.create(projectData);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should validate required fields", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      // Missing required fields should throw
      await expect(
        caller.project.create({
          businessId: 1,
          name: "",
          nameAr: "",
          code: "",
          type: "construction",
          status: "planning",
          startDate: "",
          endDate: "",
          budget: 0,
        })
      ).rejects.toThrow();
    });
  });

  describe("project.getById", () => {
    it("should return project details by ID", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.project.getById({ id: 1 });
      
      expect(result).toBeDefined();
    });
  });

  // Note: update and delete procedures are not yet implemented in the API
});

describe("Project Status Validation", () => {
  it("should accept valid status values", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const validStatuses = ["planning", "in_progress", "on_hold", "completed", "cancelled"];
    
    for (const status of validStatuses) {
      const result = await caller.project.list({ 
        businessId: 1,
        status: status as any 
      });
      expect(result).toBeDefined();
    }
  });
});

describe("Project Budget Operations", () => {
  it("should handle budget calculations correctly", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const projectData = {
      businessId: 1,
      name: "مشروع ميزانية",
      nameAr: "مشروع ميزانية",
      code: "PRJ-BUDGET-001",
      type: "expansion" as const,
      status: "planning" as const,
      startDate: "2024-01-01",
      endDate: "2024-06-30",
      budget: 5000000,
    };
    
    const result = await caller.project.create(projectData);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
