import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock database functions
vi.mock("./db", () => ({
  getBusinesses: vi.fn().mockResolvedValue([
    { id: 1, code: "BUS001", nameAr: "شركة الطاقة", type: "holding", isActive: true },
  ]),
  getBusinessById: vi.fn().mockResolvedValue({
    id: 1, code: "BUS001", nameAr: "شركة الطاقة", type: "holding", isActive: true
  }),
  createBusiness: vi.fn().mockResolvedValue(1),
  getBranches: vi.fn().mockResolvedValue([
    { id: 1, businessId: 1, code: "BR001", nameAr: "الفرع الرئيسي", type: "main", isActive: true },
  ]),
  createBranch: vi.fn().mockResolvedValue(1),
  getStations: vi.fn().mockResolvedValue([
    { id: 1, businessId: 1, branchId: 1, code: "ST001", nameAr: "محطة التوليد", type: "generation", status: "operational", isActive: true },
  ]),
  getStationById: vi.fn().mockResolvedValue({
    id: 1, businessId: 1, branchId: 1, code: "ST001", nameAr: "محطة التوليد", type: "generation", status: "operational", isActive: true
  }),
  createStation: vi.fn().mockResolvedValue(1),
  getAllUsers: vi.fn().mockResolvedValue([
    { id: 1, openId: "user1", name: "مستخدم", role: "user" },
  ]),
  getAccounts: vi.fn().mockResolvedValue([
    { id: 1, businessId: 1, code: "1001", nameAr: "النقدية", type: "asset", nature: "debit", isActive: true },
  ]),
  getAccountById: vi.fn().mockResolvedValue({
    id: 1, businessId: 1, code: "1001", nameAr: "النقدية", type: "asset", nature: "debit", isActive: true
  }),
  createAccount: vi.fn().mockResolvedValue(1),
  getAssets: vi.fn().mockResolvedValue([
    { id: 1, businessId: 1, code: "AST001", nameAr: "محول كهربائي", status: "active" },
  ]),
  getAssetById: vi.fn().mockResolvedValue({
    id: 1, businessId: 1, code: "AST001", nameAr: "محول كهربائي", status: "active"
  }),
  createAsset: vi.fn().mockResolvedValue(1),
  createAuditLog: vi.fn().mockResolvedValue(undefined),
  getWorkOrders: vi.fn().mockResolvedValue([
    { id: 1, businessId: 1, orderNumber: "WO-000001", title: "صيانة دورية", status: "pending" },
  ]),
  getWorkOrderById: vi.fn().mockResolvedValue({
    id: 1, businessId: 1, orderNumber: "WO-000001", title: "صيانة دورية", status: "pending"
  }),
  createWorkOrder: vi.fn().mockResolvedValue(1),
  updateWorkOrderStatus: vi.fn().mockResolvedValue(undefined),
  getNextSequence: vi.fn().mockResolvedValue("WO-000001"),
  getCustomers: vi.fn().mockResolvedValue([
    { id: 1, businessId: 1, accountNumber: "CUST-000001", nameAr: "عميل تجريبي", type: "residential" },
  ]),
  getCustomerById: vi.fn().mockResolvedValue({
    id: 1, businessId: 1, accountNumber: "CUST-000001", nameAr: "عميل تجريبي", type: "residential"
  }),
  createCustomer: vi.fn().mockResolvedValue(1),
  getInvoices: vi.fn().mockResolvedValue([
    { id: 1, businessId: 1, invoiceNumber: "INV-000001", customerId: 1, totalAmount: "1000.00" },
  ]),
  createInvoice: vi.fn().mockResolvedValue(1),
  getEquipment: vi.fn().mockResolvedValue([
    { id: 1, businessId: 1, stationId: 1, code: "EQ001", nameAr: "محول", type: "transformer", status: "online" },
  ]),
  createEquipment: vi.fn().mockResolvedValue(1),
  getActiveAlerts: vi.fn().mockResolvedValue([
    { id: 1, businessId: 1, severity: "high", message: "تنبيه اختباري", status: "active" },
  ]),
  acknowledgeAlert: vi.fn().mockResolvedValue(undefined),
  getProjects: vi.fn().mockResolvedValue([
    { id: 1, businessId: 1, code: "PRJ-000001", nameAr: "مشروع توسعة", status: "active" },
  ]),
  getProjectById: vi.fn().mockResolvedValue({
    id: 1, businessId: 1, code: "PRJ-000001", nameAr: "مشروع توسعة", status: "active"
  }),
  createProject: vi.fn().mockResolvedValue(1),
  getDashboardStats: vi.fn().mockResolvedValue({
    totalAssets: 100,
    activeWorkOrders: 10,
    totalCustomers: 500,
    activeAlerts: 2,
    onlineEquipment: 45,
    totalEquipment: 50,
  }),
  getItems: vi.fn().mockResolvedValue([
    { id: 1, businessId: 1, code: "ITM001", nameAr: "قطعة غيار", type: "spare_part", isActive: true },
  ]),
  createItem: vi.fn().mockResolvedValue(1),
  getSuppliers: vi.fn().mockResolvedValue([
    { id: 1, businessId: 1, code: "SUP001", nameAr: "مورد تجريبي", isActive: true },
  ]),
  createSupplier: vi.fn().mockResolvedValue(1),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Auth Router", () => {
  it("returns null for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.openId).toBe("test-user");
  });

  it("logout clears session cookie", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});

describe("Business Router", () => {
  it("lists businesses for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.business.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].nameAr).toBe("شركة الطاقة");
  });

  it("gets business by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.business.getById({ id: 1 });
    expect(result).not.toBeNull();
    expect(result?.code).toBe("BUS001");
  });

  it("creates business for admin user", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.business.create({
      code: "BUS002",
      nameAr: "شركة جديدة",
      type: "subsidiary",
    });
    expect(result.success).toBe(true);
    expect(result.id).toBe(1);
  });

  it("rejects business creation for non-admin", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.business.create({
      code: "BUS002",
      nameAr: "شركة جديدة",
      type: "subsidiary",
    })).rejects.toThrow();
  });
});

describe("Station Router", () => {
  it("lists stations", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.station.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("gets station by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.station.getById({ id: 1 });
    expect(result).not.toBeNull();
    expect(result?.type).toBe("generation");
  });
});

describe("Asset Router", () => {
  it("lists assets", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.asset.list({ businessId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates asset", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.asset.create({
      businessId: 1,
      categoryId: 1,
      code: "AST002",
      nameAr: "أصل جديد",
    });
    expect(result.success).toBe(true);
  });
});

describe("Work Order Router", () => {
  it("lists work orders", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.workOrder.list({ businessId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates work order", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.workOrder.create({
      businessId: 1,
      type: "preventive",
      title: "صيانة دورية جديدة",
    });
    expect(result.success).toBe(true);
    expect(result.orderNumber).toBe("WO-000001");
  });

  it("updates work order status", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.workOrder.updateStatus({
      id: 1,
      status: "approved",
    });
    expect(result.success).toBe(true);
  });
});

describe("Customer Router", () => {
  it("lists customers", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.customer.list({ businessId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates customer", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.customer.create({
      businessId: 1,
      nameAr: "عميل جديد",
      type: "commercial",
    });
    expect(result.success).toBe(true);
  });
});

describe("Invoice Router", () => {
  it("lists invoices", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.invoice.list({ businessId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates invoice", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.invoice.create({
      businessId: 1,
      customerId: 1,
      invoiceDate: "2024-01-01",
      dueDate: "2024-01-31",
      consumptionAmount: 500,
      fixedCharges: 50,
      taxAmount: 82.5,
    });
    expect(result.success).toBe(true);
  });
});

describe("Equipment Router", () => {
  it("lists equipment", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.equipment.list({ businessId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates equipment", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.equipment.create({
      businessId: 1,
      stationId: 1,
      code: "EQ002",
      nameAr: "مولد كهربائي",
      type: "generator",
    });
    expect(result.success).toBe(true);
  });
});

describe("Alert Router", () => {
  it("lists active alerts", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.alert.list({ businessId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("acknowledges alert", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.alert.acknowledge({ id: 1 });
    expect(result.success).toBe(true);
  });
});

describe("Project Router", () => {
  it("lists projects", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.project.list({ businessId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.project.create({
      businessId: 1,
      nameAr: "مشروع جديد",
      type: "construction",
    });
    expect(result.success).toBe(true);
  });
});

describe("Dashboard Router", () => {
  it("returns dashboard stats", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.stats({ businessId: 1 });
    expect(result).not.toBeNull();
    expect(result?.totalAssets).toBe(100);
    expect(result?.activeWorkOrders).toBe(10);
    expect(result?.totalCustomers).toBe(500);
  });
});

describe("Inventory Router", () => {
  it("lists items", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.inventory.items.list({ businessId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("lists suppliers", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.inventory.suppliers.list({ businessId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});
