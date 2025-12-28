/**
 * النظام المخصص v2.2.0 - Main Router Index
 * تجميع جميع routers النظام المخصص
 */

import { Router } from "express";
import currenciesRouter from "./currencies";
import exchangeRatesRouter from "./exchangeRates";
import accountsRouter from "./accounts";
import subSystemsRouter from "./subSystems";
import journalEntriesRouter from "./journalEntries";
import operationsRouter from "./operations";
import receiptsPaymentsRouter from "./receiptsPayments";

const router = Router();

/**
 * تسجيل جميع routers النظام المخصص v2
 */
router.use("/currencies", currenciesRouter);
router.use("/exchange-rates", exchangeRatesRouter);
router.use("/accounts", accountsRouter);
router.use("/sub-systems", subSystemsRouter);
router.use("/journal-entries", journalEntriesRouter);
router.use("/operations", operationsRouter);
router.use("/", receiptsPaymentsRouter);

export default router;
