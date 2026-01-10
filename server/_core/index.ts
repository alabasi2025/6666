import "dotenv/config";
import express from "express";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getHealthStatus, getLivenessStatus, getReadinessStatus, getMetrics } from "../utils/health";
import { logger } from '../utils/logger';
// DISABLED: Custom System V2 needs migration to PostgreSQL
// import customSystemV2Router from "../routes/customSystem/v2";
import { authenticateRequest } from "../middleware/auth";
import { ensureDefaultAdmin } from "../auth";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 8000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // تفعيل ضغط Gzip لتسريع التحميل
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));
  
  // إضافة رؤوس الأمان باستخدام helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https:", "wss:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));
  
  // Rate limiting للحماية من هجمات القوة الغاشمة
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 10, // 10 محاولات كحد أقصى
    message: { error: "تم تجاوز عدد المحاولات المسموح بها، يرجى المحاولة لاحقاً" },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Rate limiting عام للـ API
  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // دقيقة واحدة
    max: 100, // 100 طلب كحد أقصى
    message: { error: "تم تجاوز عدد الطلبات المسموح بها" },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // تطبيق rate limiting على نقاط النهاية الحساسة
  app.use("/api/trpc/auth.login", authLimiter);
  app.use("/api/trpc/auth.register", authLimiter);
  app.use("/api/trpc", apiLimiter);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Health Check Endpoints
  app.get("/health", async (_req, res) => {
    const health = await getHealthStatus();
    const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503;
    res.status(statusCode).json(health);
  });
  
  app.get("/health/live", (_req, res) => {
    res.json(getLivenessStatus());
  });
  
  app.get("/health/ready", async (_req, res) => {
    const ready = await getReadinessStatus();
    res.status(ready.ready ? 200 : 503).json(ready);
  });
  
  app.get("/metrics", (_req, res) => {
    res.json(getMetrics());
  });
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Custom System v2.2.0 API Routes - DISABLED until migration to PostgreSQL
  // app.use("/api/custom-system/v2", authenticateRequest, apiLimiter, customSystemV2Router);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    logger.info("Setting up Vite development server...");
    await setupVite(app, server);
    logger.info("Vite server setup complete");
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "8000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    logger.warn(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  // إنشاء مستخدم افتراضي إذا لم يكن موجوداً
  try {
    await ensureDefaultAdmin();
  } catch (error) {
    logger.warn("Failed to ensure default admin", { error: error instanceof Error ? error.message : error });
  }

  // Initialize Cron Jobs - يمكن تفعيلها في Development Mode عبر ENABLE_CRON_JOBS=true
  const shouldEnableCronJobs = process.env.NODE_ENV === "production" || process.env.ENABLE_CRON_JOBS === "true";
  
  if (shouldEnableCronJobs) {
    try {
      const { CronJobsManager } = await import("../core/cron-jobs");
      CronJobsManager.initialize();
      logger.info("Cron Jobs initialized successfully", {
        mode: process.env.NODE_ENV,
        enabledByFlag: process.env.ENABLE_CRON_JOBS === "true"
      });
    } catch (error) {
      logger.warn("Failed to initialize Cron Jobs", { error: error instanceof Error ? error.message : error });
    }
  } else {
    logger.info("Cron Jobs disabled in development mode (set ENABLE_CRON_JOBS=true to enable)", {
      mode: process.env.NODE_ENV,
      enableFlag: process.env.ENABLE_CRON_JOBS
    });
  }

  const host = process.env.HOST || "0.0.0.0";
  server.listen(port, host, () => {
    logger.info(`Server running on http://${host}:${port}/`);
    logger.info("Security: helmet enabled, rate limiting active");
  });
}

startServer().catch((error) => logger.error("Server startup failed", { error: error instanceof Error ? error.message : error }));
