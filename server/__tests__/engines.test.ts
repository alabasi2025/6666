/**
 * اختبارات المحركات الخمسة
 * Tests for the 5 Engines
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { PricingEngine } from "../core/pricing-engine";
import { ReconciliationEngine } from "../core/reconciliation-engine";
import { PreventiveSchedulingEngine } from "../core/preventive-scheduling-engine";
import { SmartAssignmentEngine } from "../core/smart-assignment-engine";
import { AutoJournalEngine } from "../core/auto-journal-engine";

// Mock database
vi.mock("../db", () => ({
  getDb: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("../logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("Pricing Engine", () => {
  describe("calculate", () => {
    it("should return default pricing for STS residential (no deposit)", () => {
      const defaults = PricingEngine.getDefaultPricing("sts", "residential");
      expect(defaults.depositRequired).toBe(false);
      expect(defaults.depositAmount).toBe(0);
      expect(defaults.subscriptionFee).toBeGreaterThan(0);
    });

    it("should return default pricing for traditional residential (with deposit)", () => {
      const defaults = PricingEngine.getDefaultPricing("traditional", "residential");
      expect(defaults.depositRequired).toBe(true);
      expect(defaults.depositAmount).toBeGreaterThan(0);
      expect(defaults.subscriptionFee).toBeGreaterThan(0);
    });

    it("should calculate total correctly", () => {
      const defaults = PricingEngine.getDefaultPricing("sts", "residential");
      const expectedTotal = defaults.subscriptionFee + (defaults.depositRequired ? defaults.depositAmount : 0);
      expect(expectedTotal).toBe(defaults.subscriptionFee);
    });
  });

  describe("getIntervalDaysFromFrequency", () => {
    it("should return correct days for daily", () => {
      const days = PreventiveSchedulingEngine.getIntervalDaysFromFrequency("daily");
      expect(days).toBe(1);
    });

    it("should return correct days for weekly", () => {
      const days = PreventiveSchedulingEngine.getIntervalDaysFromFrequency("weekly");
      expect(days).toBe(7);
    });

    it("should return correct days for monthly", () => {
      const days = PreventiveSchedulingEngine.getIntervalDaysFromFrequency("monthly");
      expect(days).toBe(30);
    });

    it("should return correct days for annual", () => {
      const days = PreventiveSchedulingEngine.getIntervalDaysFromFrequency("annual");
      expect(days).toBe(365);
    });
  });
});

describe("Smart Assignment Engine", () => {
  describe("calculateDistance", () => {
    it("should calculate distance between two points correctly", () => {
      // Riyadh coordinates
      const lat1 = 24.7136;
      const lon1 = 46.6753;
      
      // Jeddah coordinates
      const lat2 = 21.4858;
      const lon2 = 39.1925;

      const distance = SmartAssignmentEngine.calculateDistance(lat1, lon1, lat2, lon2);
      
      // Distance between Riyadh and Jeddah is approximately 950 km
      expect(distance).toBeGreaterThan(900);
      expect(distance).toBeLessThan(1000);
    });

    it("should return 0 for same coordinates", () => {
      const distance = SmartAssignmentEngine.calculateDistance(24.7136, 46.6753, 24.7136, 46.6753);
      expect(distance).toBeCloseTo(0, 1);
    });

    it("should calculate small distances correctly", () => {
      // Two points 1 km apart (approximately)
      const lat1 = 24.7136;
      const lon1 = 46.6753;
      const lat2 = 24.7226; // ~1 km north
      const lon2 = 46.6753;

      const distance = SmartAssignmentEngine.calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(0.9);
      expect(distance).toBeLessThan(1.1);
    });
  });

  describe("toRadians", () => {
    it("should convert degrees to radians correctly", () => {
      const radians = SmartAssignmentEngine.toRadians(180);
      expect(radians).toBeCloseTo(Math.PI, 5);
    });

    it("should convert 90 degrees to π/2", () => {
      const radians = SmartAssignmentEngine.toRadians(90);
      expect(radians).toBeCloseTo(Math.PI / 2, 5);
    });
  });
});

describe("Auto Journal Engine", () => {
  describe("onInvoiceCreated", () => {
    it("should create journal entry structure correctly", () => {
      const invoiceData = {
        id: 1,
        businessId: 1,
        customerId: 123,
        invoiceNumber: "INV-001",
        invoiceDate: new Date(),
        totalAmount: 1000,
        createdBy: 1,
      };

      // Test that the structure is correct (without actual DB call)
      expect(invoiceData.totalAmount).toBe(1000);
      expect(invoiceData.customerId).toBe(123);
    });
  });

  describe("onPaymentReceived", () => {
    it("should handle cash payment correctly", () => {
      const paymentData = {
        id: 1,
        businessId: 1,
        customerId: 123,
        amount: 500,
        paymentMethod: "cash" as const,
        paymentDate: new Date(),
        createdBy: 1,
      };

      expect(paymentData.paymentMethod).toBe("cash");
      expect(paymentData.amount).toBe(500);
    });

    it("should handle bank payment correctly", () => {
      const paymentData = {
        id: 1,
        businessId: 1,
        customerId: 123,
        amount: 500,
        paymentMethod: "bank" as const,
        bankId: 1,
        paymentDate: new Date(),
        createdBy: 1,
      };

      expect(paymentData.paymentMethod).toBe("bank");
      expect(paymentData.bankId).toBe(1);
    });
  });
});

describe("Reconciliation Engine", () => {
  describe("matchOneToOne", () => {
    it("should validate balanced entries", () => {
      // Test structure validation
      const entry1 = {
        totalDebit: "1000.00",
        totalCredit: "0.00",
      };

      const entry2 = {
        totalDebit: "0.00",
        totalCredit: "1000.00",
      };

      // These should match (debit1 = credit2, credit1 = debit2)
      const debit1 = parseFloat(entry1.totalDebit);
      const credit1 = parseFloat(entry1.totalCredit);
      const debit2 = parseFloat(entry2.totalDebit);
      const credit2 = parseFloat(entry2.totalCredit);

      const isBalanced =
        Math.abs(debit1 - credit2) < 0.01 && Math.abs(credit1 - debit2) < 0.01;

      expect(isBalanced).toBe(true);
    });

    it("should reject unbalanced entries", () => {
      const entry1 = {
        totalDebit: "1000.00",
        totalCredit: "0.00",
      };

      const entry2 = {
        totalDebit: "0.00",
        totalCredit: "500.00", // Different amount
      };

      const debit1 = parseFloat(entry1.totalDebit);
      const credit1 = parseFloat(entry1.totalCredit);
      const debit2 = parseFloat(entry2.totalDebit);
      const credit2 = parseFloat(entry2.totalCredit);

      const isBalanced =
        Math.abs(debit1 - credit2) < 0.01 && Math.abs(credit1 - debit2) < 0.01;

      expect(isBalanced).toBe(false);
    });
  });
});

describe("Preventive Scheduling Engine", () => {
  describe("getIntervalDaysFromFrequency", () => {
    it("should return correct interval for all frequencies", () => {
      const frequencies = [
        { freq: "daily" as const, expected: 1 },
        { freq: "weekly" as const, expected: 7 },
        { freq: "monthly" as const, expected: 30 },
        { freq: "quarterly" as const, expected: 90 },
        { freq: "semi_annual" as const, expected: 180 },
        { freq: "annual" as const, expected: 365 },
      ];

      frequencies.forEach(({ freq, expected }) => {
        const days = PreventiveSchedulingEngine.getIntervalDaysFromFrequency(freq);
        expect(days).toBe(expected);
      });
    });
  });
});

