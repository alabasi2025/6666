import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Helper to create authenticated context
function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Accounting Module - Accounts API with System Modules", () => {
  it("should list accounts with businessId", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.account.list({ businessId: 1 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a new account with system module", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const newAccount = {
      businessId: 1,
      code: "0101",
      nameAr: "الأصول الثابتة",
      systemModule: "assets" as const,
      accountType: "sub" as const,
      nature: "debit" as const,
    };

    const result = await caller.account.create(newAccount);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("should create account linked to maintenance system", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const maintenanceAccount = {
      businessId: 1,
      code: "0201",
      nameAr: "أوامر العمل",
      systemModule: "maintenance" as const,
      accountType: "sub" as const,
      nature: "debit" as const,
    };

    const result = await caller.account.create(maintenanceAccount);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.success).toBe(true);
  });
});

describe("Accounting Module - Chart of Accounts Structure by System", () => {
  it("should support hierarchical account structure under system modules", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create main account for Assets system
    const mainAccount = await caller.account.create({
      businessId: 1,
      code: "01",
      nameAr: "إدارة الأصول",
      systemModule: "assets" as const,
      accountType: "main" as const,
      nature: "debit" as const,
      isParent: true,
    });

    expect(mainAccount).toBeDefined();
    expect(mainAccount.id).toBeDefined();
    expect(mainAccount.success).toBe(true);

    // Create sub account under main
    const subAccount = await caller.account.create({
      businessId: 1,
      code: "0101",
      nameAr: "الأصول الثابتة",
      systemModule: "assets" as const,
      accountType: "sub" as const,
      nature: "debit" as const,
      parentId: mainAccount.id,
      isParent: true,
    });

    expect(subAccount).toBeDefined();
    expect(subAccount.id).toBeDefined();
    expect(subAccount.success).toBe(true);

    // Create detail account under sub
    const detailAccount = await caller.account.create({
      businessId: 1,
      code: "010101",
      nameAr: "المحولات الكهربائية",
      systemModule: "assets" as const,
      accountType: "detail" as const,
      nature: "debit" as const,
      parentId: subAccount.id,
    });

    expect(detailAccount).toBeDefined();
    expect(detailAccount.id).toBeDefined();
    expect(detailAccount.success).toBe(true);
  });
});

describe("Accounting Module - All System Modules", () => {
  it("should support all system modules", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const systemModules = [
      "assets",
      "maintenance",
      "inventory",
      "procurement",
      "customers",
      "billing",
      "scada",
      "projects",
      "hr",
      "operations",
      "finance",
      "general",
    ] as const;

    for (const systemModule of systemModules) {
      const account = await caller.account.create({
        businessId: 1,
        code: `SYS-${systemModule}`,
        nameAr: `حساب ${systemModule} اختباري`,
        systemModule: systemModule,
        accountType: "main" as const,
        nature: "debit" as const,
      });

      expect(account).toBeDefined();
      expect(account.id).toBeDefined();
      expect(account.success).toBe(true);
    }
  });
});

describe("Accounting Module - Account Types", () => {
  it("should support main, sub, and detail account types", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const accountTypes = ["main", "sub", "detail"] as const;

    for (const accountType of accountTypes) {
      const account = await caller.account.create({
        businessId: 1,
        code: `TYPE-${accountType}`,
        nameAr: `حساب ${accountType} اختباري`,
        systemModule: "finance" as const,
        accountType: accountType,
        nature: "debit" as const,
      });

      expect(account).toBeDefined();
      expect(account.id).toBeDefined();
      expect(account.success).toBe(true);
    }
  });
});

describe("Accounting Module - Linked Entities", () => {
  it("should create account with linked entity", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const linkedAccount = {
      businessId: 1,
      code: "CUST-001",
      nameAr: "حساب عميل #C-001",
      systemModule: "customers" as const,
      accountType: "detail" as const,
      nature: "debit" as const,
      linkedEntityType: "customer",
      linkedEntityId: 1,
    };

    const result = await caller.account.create(linkedAccount);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("should create account linked to supplier", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const supplierAccount = {
      businessId: 1,
      code: "SUPP-001",
      nameAr: "حساب مورد #S-001",
      systemModule: "procurement" as const,
      accountType: "detail" as const,
      nature: "credit" as const,
      linkedEntityType: "supplier",
      linkedEntityId: 1,
    };

    const result = await caller.account.create(supplierAccount);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("should create account linked to project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const projectAccount = {
      businessId: 1,
      code: "PRJ-001",
      nameAr: "حساب مشروع توسعة المحطة",
      systemModule: "projects" as const,
      accountType: "detail" as const,
      nature: "debit" as const,
      linkedEntityType: "project",
      linkedEntityId: 1,
    };

    const result = await caller.account.create(projectAccount);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.success).toBe(true);
  });
});

describe("Accounting Module - Nature Types", () => {
  it("should support debit and credit nature", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Debit nature account
    const debitAccount = await caller.account.create({
      businessId: 1,
      code: "NAT-DEBIT",
      nameAr: "حساب مدين",
      systemModule: "finance" as const,
      accountType: "detail" as const,
      nature: "debit" as const,
    });

    expect(debitAccount).toBeDefined();
    expect(debitAccount.success).toBe(true);

    // Credit nature account
    const creditAccount = await caller.account.create({
      businessId: 1,
      code: "NAT-CREDIT",
      nameAr: "حساب دائن",
      systemModule: "finance" as const,
      accountType: "detail" as const,
      nature: "credit" as const,
    });

    expect(creditAccount).toBeDefined();
    expect(creditAccount.success).toBe(true);
  });
});
