import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// ============================================
// 11. نظام المطور - Developer System
// ============================================

// التكاملات الخارجية - External Integrations
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }),
  description: text("description"),
  integrationType: mysqlEnum("integration_type", [
    "payment_gateway", "sms", "whatsapp", "email", "iot", 
    "erp", "crm", "scada", "gis", "weather", "maps", "other"
  ]).notNull(),
  category: mysqlEnum("category", ["local", "international", "internal"]).default("local"),
  provider: varchar("provider", { length: 100 }),
  baseUrl: varchar("base_url", { length: 500 }),
  apiVersion: varchar("api_version", { length: 20 }),
  authType: mysqlEnum("auth_type", ["api_key", "oauth2", "basic", "hmac", "jwt", "none"]).default("api_key"),
  isActive: boolean("is_active").default(true),
  isPrimary: boolean("is_primary").default(false),
  priority: int("priority").default(1),
  lastHealthCheck: timestamp("last_health_check"),
  healthStatus: mysqlEnum("health_status", ["healthy", "degraded", "down", "unknown"]).default("unknown"),
  webhookUrl: varchar("webhook_url", { length: 500 }),
  webhookSecret: varchar("webhook_secret", { length: 255 }),
  rateLimitPerMinute: int("rate_limit_per_minute").default(60),
  timeoutSeconds: int("timeout_seconds").default(30),
  retryAttempts: int("retry_attempts").default(3),
  metadata: json("metadata"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// إعدادات التكاملات - Integration Configs
export const integrationConfigs = mysqlTable("integration_configs", {
  id: int("id").autoincrement().primaryKey(),
  integrationId: int("integration_id").notNull(),
  configKey: varchar("config_key", { length: 100 }).notNull(),
  configValue: text("config_value"),
  isEncrypted: boolean("is_encrypted").default(false),
  valueType: mysqlEnum("value_type", ["string", "number", "boolean", "json"]).default("string"),
  environment: mysqlEnum("environment", ["production", "staging", "development"]).default("production"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// سجلات التكاملات - Integration Logs
export const integrationLogs = mysqlTable("integration_logs", {
  id: int("id").autoincrement().primaryKey(),
  integrationId: int("integration_id").notNull(),
  businessId: int("business_id").notNull(),
  requestId: varchar("request_id", { length: 100 }),
  direction: mysqlEnum("direction", ["outgoing", "incoming"]).notNull(),
  method: varchar("method", { length: 10 }),
  endpoint: varchar("endpoint", { length: 500 }),
  requestHeaders: json("request_headers"),
  requestBody: json("request_body"),
  responseStatus: int("response_status"),
  responseHeaders: json("response_headers"),
  responseBody: json("response_body"),
  durationMs: int("duration_ms"),
  status: mysqlEnum("status", ["success", "failed", "timeout", "error"]).notNull(),
  errorMessage: text("error_message"),
  retryCount: int("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// نظام الأحداث - Events System
export const systemEvents = mysqlTable("system_events", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventSource: varchar("event_source", { length: 50 }).notNull(),
  aggregateType: varchar("aggregate_type", { length: 50 }),
  aggregateId: int("aggregate_id"),
  payload: json("payload").notNull(),
  metadata: json("metadata"),
  correlationId: varchar("correlation_id", { length: 100 }),
  causationId: varchar("causation_id", { length: 100 }),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  retryCount: int("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الاشتراكات في الأحداث - Event Subscriptions
export const eventSubscriptions = mysqlTable("event_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  subscriberName: varchar("subscriber_name", { length: 100 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  handlerType: mysqlEnum("handler_type", ["webhook", "queue", "function", "email", "sms"]).notNull(),
  handlerConfig: json("handler_config").notNull(),
  filterExpression: json("filter_expression"),
  isActive: boolean("is_active").default(true),
  priority: int("priority").default(0),
  maxRetries: int("max_retries").default(3),
  retryDelaySeconds: int("retry_delay_seconds").default(60),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// مفاتيح API - API Keys
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  keyHash: varchar("key_hash", { length: 255 }).notNull(),
  keyPrefix: varchar("key_prefix", { length: 20 }).notNull(),
  permissions: json("permissions"),
  allowedIps: json("allowed_ips"),
  allowedOrigins: json("allowed_origins"),
  rateLimitPerMinute: int("rate_limit_per_minute").default(60),
  rateLimitPerDay: int("rate_limit_per_day").default(10000),
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  usageCount: int("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// سجلات استخدام API - API Usage Logs
export const apiLogs = mysqlTable("api_logs", {
  id: int("id").autoincrement().primaryKey(),
  apiKeyId: int("api_key_id"),
  businessId: int("business_id").notNull(),
  endpoint: varchar("endpoint", { length: 500 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  requestHeaders: json("request_headers"),
  requestBody: json("request_body"),
  responseStatus: int("response_status"),
  responseTime: int("response_time"),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: varchar("user_agent", { length: 500 }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// نماذج الذكاء الاصطناعي - AI Models
export const aiModels = mysqlTable("ai_models", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }),
  description: text("description"),
  modelType: mysqlEnum("model_type", [
    "consumption_forecast", "fault_detection", "load_optimization",
    "anomaly_detection", "demand_prediction", "maintenance_prediction",
    "customer_churn", "fraud_detection", "price_optimization", "other"
  ]).notNull(),
  provider: mysqlEnum("provider", ["internal", "openai", "azure", "google", "aws", "custom"]).default("internal"),
  modelVersion: varchar("model_version", { length: 50 }),
  endpoint: varchar("endpoint", { length: 500 }),
  inputSchema: json("input_schema"),
  outputSchema: json("output_schema"),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  lastTrainedAt: timestamp("last_trained_at"),
  trainingDataCount: int("training_data_count"),
  isActive: boolean("is_active").default(true),
  config: json("config"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// تنبؤات الذكاء الاصطناعي - AI Predictions
export const aiPredictions = mysqlTable("ai_predictions", {
  id: int("id").autoincrement().primaryKey(),
  modelId: int("model_id").notNull(),
  businessId: int("business_id").notNull(),
  predictionType: varchar("prediction_type", { length: 50 }).notNull(),
  targetEntity: varchar("target_entity", { length: 50 }),
  targetEntityId: int("target_entity_id"),
  inputData: json("input_data").notNull(),
  prediction: json("prediction").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  predictionDate: date("prediction_date").notNull(),
  validFrom: timestamp("valid_from"),
  validTo: timestamp("valid_to"),
  actualValue: json("actual_value"),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: int("verified_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// قواعد التنبيهات التقنية - Technical Alert Rules
export const technicalAlertRules = mysqlTable("technical_alert_rules", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }),
  description: text("description"),
  category: mysqlEnum("category", [
    "performance", "security", "availability", "integration", "database", "api", "system"
  ]).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "error", "critical"]).default("warning"),
  condition: json("condition").notNull(),
  threshold: decimal("threshold", { precision: 15, scale: 4 }),
  comparisonOperator: mysqlEnum("comparison_operator", ["gt", "gte", "lt", "lte", "eq", "neq"]),
  evaluationPeriodMinutes: int("evaluation_period_minutes").default(5),
  cooldownMinutes: int("cooldown_minutes").default(15),
  notificationChannels: json("notification_channels"),
  escalationRules: json("escalation_rules"),
  autoResolve: boolean("auto_resolve").default(true),
  isActive: boolean("is_active").default(true),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// التنبيهات التقنية - Technical Alerts
export const technicalAlerts = mysqlTable("technical_alerts", {
  id: int("id").autoincrement().primaryKey(),
  ruleId: int("rule_id").notNull(),
  businessId: int("business_id").notNull(),
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "error", "critical"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  source: varchar("source", { length: 100 }),
  sourceId: varchar("source_id", { length: 100 }),
  currentValue: decimal("current_value", { precision: 15, scale: 4 }),
  thresholdValue: decimal("threshold_value", { precision: 15, scale: 4 }),
  metadata: json("metadata"),
  status: mysqlEnum("status", ["active", "acknowledged", "resolved", "suppressed"]).default("active"),
  acknowledgedBy: int("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedBy: int("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  notificationsSent: json("notifications_sent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// مقاييس الأداء - Performance Metrics
export const performanceMetrics = mysqlTable("performance_metrics", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  metricType: mysqlEnum("metric_type", [
    "response_time", "throughput", "error_rate", "cpu_usage", 
    "memory_usage", "disk_usage", "network_io", "db_connections",
    "active_users", "api_calls", "queue_size", "cache_hit_rate"
  ]).notNull(),
  source: varchar("source", { length: 100 }),
  value: decimal("value", { precision: 15, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 20 }),
  tags: json("tags"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// Webhooks المستلمة - Incoming Webhooks
export const incomingWebhooks = mysqlTable("incoming_webhooks", {
  id: int("id").autoincrement().primaryKey(),
  integrationId: int("integration_id").notNull(),
  businessId: int("business_id").notNull(),
  webhookType: varchar("webhook_type", { length: 100 }).notNull(),
  payload: json("payload").notNull(),
  headers: json("headers"),
  signature: varchar("signature", { length: 255 }),
  isValid: boolean("is_valid").default(true),
  status: mysqlEnum("status", ["received", "processing", "processed", "failed"]).default("received"),
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  retryCount: int("retry_count").default(0),
  sourceIp: varchar("source_ip", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
