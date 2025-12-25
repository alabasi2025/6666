
import { eq, and, desc, asc, sql, like, or, isNull, count, inArray, ne, gte, lte } from "drizzle-orm";
import { logger } from "./utils/logger";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  businesses, InsertBusiness,
  branches, InsertBranch,
  stations, InsertStation,
  roles, InsertRole,
  permissions,
  rolePermissions,
  userRoles,
  accounts, InsertAccount,
  journalEntries, InsertJournalEntry,
  journalEntryLines,
  costCenters,
  fiscalPeriods,
  assets, InsertAsset,
  assetCategories,
  assetMovements,
  workOrders, InsertWorkOrder,
  workOrderTasks,
  maintenancePlans,
  warehouses,
  items, InsertItem,
  itemCategories,
  stockBalances,
  stockMovements,
  suppliers, InsertSupplier,
  purchaseRequests,
  purchaseOrders,
  // HR System
  departments, InsertDepartment,
  jobTitles, InsertJobTitle,
  salaryGrades, InsertSalaryGrade,
  employees, InsertEmployee,
  salaryDetails, InsertSalaryDetail,
  payrollRuns, InsertPayrollRun,
  payrollItems, InsertPayrollItem,
  attendance, InsertAttendance,
  leaveTypes, InsertLeaveType,
  leaveRequests, InsertLeaveRequest,
  leaveBalances, InsertLeaveBalance,
  performanceEvaluations, InsertPerformanceEvaluation,
  employeeContracts, InsertEmployeeContract,
  customers, InsertCustomer,
  meters,
  meterReadings,
  invoices, InsertInvoice,
  payments,
  equipment, InsertEquipment,
  sensors,
  alerts, InsertAlert,
  auditLogs,
  projects, InsertProject,
  projectPhases,
  projectTasks,
  settings,
  sequences,
  // Developer System
  integrations, InsertIntegration,
  // Field Operations System
  fieldOperations, InsertFieldOperation,
  operationStatusLog, InsertOperationStatusLog,
  installationDetails, InsertInstallationDetail,
  installationPhotos, InsertInstallationPhoto,
  fieldTeams, InsertFieldTeam,
  fieldWorkers, InsertFieldWorker,
  workerLocations, InsertWorkerLocation,
  workerPerformance, InsertWorkerPerformance,
  workerIncentives, InsertWorkerIncentive,
  materialRequests, InsertMaterialRequest,
  materialRequestItems, InsertMaterialRequestItem,
  fieldEquipment, InsertFieldEquipment,
  equipmentMovements, InsertEquipmentMovement,
  inspections, InsertInspection,
  inspectionItems, InsertInspectionItem,
  inspectionChecklists, InsertInspectionChecklist,
  operationApprovals, InsertOperationApproval,
  operationPayments, InsertOperationPayment,
  periodSettlements, InsertPeriodSettlement,
  settlementItems, InsertSettlementItem,
  integrationConfigs, InsertIntegrationConfig,
  integrationLogs, InsertIntegrationLog,
  systemEvents, InsertSystemEvent,
  eventSubscriptions, InsertEventSubscription,
  apiKeys, InsertApiKey,
  apiLogs, InsertApiLog,
  aiModels, InsertAiModel,
  aiPredictions, InsertAiPrediction,
  technicalAlertRules, InsertTechnicalAlertRule,
  technicalAlerts, InsertTechnicalAlert,
  performanceMetrics, InsertPerformanceMetric,
  incomingWebhooks, InsertIncomingWebhook,
  // Diesel System
  dieselSuppliers, InsertDieselSupplier,
  dieselTankers, InsertDieselTanker,
  dieselTanks, InsertDieselTank,
  dieselPumpMeters, InsertDieselPumpMeter,
  dieselReceivingTasks, InsertDieselReceivingTask,
  dieselPumpReadings, InsertDieselPumpReading,
  dieselTankMovements, InsertDieselTankMovement,
  generatorDieselConsumption, InsertGeneratorDieselConsumption,
  dieselPipes, InsertDieselPipe,
  dieselTankOpenings, InsertDieselTankOpening,
  stationDieselConfig, InsertStationDieselConfig,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _connectionTested = false;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
      // Test connection
      if (!_connectionTested) {
        await _db.execute(sql`SELECT 1`);
        logger.info("[Database] Connected successfully");
        _connectionTested = true;
      }
    } catch (error) {
      logger.warn("[Database] Failed to connect", { error });
      _db = null;
      _connectionTested = false;
    }
  }
  return _db;
}

export async function testDatabaseConnection(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    logger.warn("[Database] DATABASE_URL not set, running in DEMO_MODE");
    return false;
  }
  
  try {
    const db = await getDb();
    if (!db) {
      logger.error("[Database] Connection failed");
      return false;
    }
    await db.execute(sql`SELECT 1`);
    logger.info("[Database] Connection test successful");
    return true;
  } catch (error) {
    logger.error("[Database] Connection test failed", { error });
    return false;
  }
}
