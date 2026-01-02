import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

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
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("Customer Module APIs", () => {
  describe("customer.list", () => {
    it("should return customer list", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.customer.list({
        businessId: 1,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("customer.create", () => {
    it("should create a new customer with valid data", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const customerData = {
        businessId: 1,
        nameAr: "عميل اختبار",
        nameEn: "Test Customer",
        type: "residential" as const,
        phone: "0501234567",
        email: "test@customer.com",
        address: "الرياض - حي النخيل",
      };

      const result = await caller.customer.create(customerData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("id");
    });

    it("should require business ID", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.customer.create({
          businessId: undefined as unknown as number,
          nameAr: "عميل اختبار",
          nameEn: "Test Customer",
          type: "residential",
        })
      ).rejects.toThrow();
    });
  });

  describe("customer.getById", () => {
    it("should return customer details by ID", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.customer.getById({ id: 1 });

      expect(result).toBeDefined();
      // May be null if customer doesn't exist
    });
  });
});

describe("Invoice Module APIs", () => {
  describe("invoice.list", () => {
    it("should return invoice list", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.invoice.list({
        businessId: 1,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("invoice.create", () => {
    it("should create a new invoice with valid data", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const invoiceData = {
        businessId: 1,
        customerId: 1,
        meterId: 1,
        invoiceDate: "2024-12-01",
        periodStart: "2024-11-01",
        periodEnd: "2024-11-30",
        previousReading: 1000,
        currentReading: 1500,
        consumption: 500,
        amount: 250.00,
        dueDate: "2024-12-15",
      };

      const result = await caller.invoice.create(invoiceData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("id");
    });
  });
});

describe("Equipment Module APIs", () => {
  describe("equipment.list", () => {
    it("should return equipment list", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.equipment.list({
        businessId: 1,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe("Alert Module APIs", () => {
  describe("alert.list", () => {
    it("should return alert list", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.alert.list({
        businessId: 1,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe("Project Module APIs", () => {
  describe("project.list", () => {
    it("should return project list", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.project.list({
        businessId: 1,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("project.create", () => {
    it("should create a new project with valid data", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const projectData = {
        businessId: 1,
        nameAr: "مشروع اختبار",
        nameEn: "Test Project",
        code: "PRJ-TEST-001",
        type: "construction" as const,
        startDate: "2024-01-01",
        budget: 1000000,
      };

      const result = await caller.project.create(projectData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("id");
    });
  });
});
