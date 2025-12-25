      list: protectedProcedure
        .input(z.object({ businessId: z.number(), eventType: z.string().optional() }))
        .query(async ({ input }) => {
          return await db.getEventSubscriptions(input.businessId, input.eventType);
        }),

      create: adminProcedure
        .input(z.object({
          businessId: z.number(),
          subscriberName: z.string().min(1),
          eventType: z.string().min(1),
          handlerType: z.enum(["webhook", "queue", "function", "email", "sms"]),
          handlerConfig: z.any(),
          filterExpression: z.any().optional(),
          priority: z.number().default(0),
          maxRetries: z.number().default(3),
          retryDelaySeconds: z.number().default(60),
        }))
        .mutation(async ({ input, ctx }) => {
          const id = await db.createEventSubscription({
            ...input,
            handlerConfig: JSON.stringify(input.handlerConfig),
            filterExpression: input.filterExpression ? JSON.stringify(input.filterExpression) : null,
            createdBy: ctx.user.id,
          });
          return { id, success: true };
        }),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          isActive: z.boolean().optional(),
          priority: z.number().optional(),
          maxRetries: z.number().optional(),
          retryDelaySeconds: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          await db.updateEventSubscription(id, data);
          return { success: true };
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteEventSubscription(input.id);
          return { success: true };
        }),
    }),

    // API Keys
    apiKeys: router({
      list: protectedProcedure
        .input(z.object({ businessId: z.number() }))
        .query(async ({ input }) => {
          return await db.getApiKeys(input.businessId);
        }),

      create: adminProcedure
        .input(z.object({
          businessId: z.number(),
          name: z.string().min(1),
          description: z.string().optional(),
          permissions: z.any().optional(),
          allowedIps: z.array(z.string()).optional(),
          allowedOrigins: z.array(z.string()).optional(),
          rateLimitPerMinute: z.number().default(60),
          rateLimitPerDay: z.number().default(10000),
          expiresAt: z.date().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          // Generate API key
          const keyPrefix = 'ems_' + Math.random().toString(36).substring(2, 8);
          const keySecret = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
          const fullKey = `${keyPrefix}_${keySecret}`;
          
          // Hash the key for storage
          const crypto = await import('crypto');
          const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');

          const id = await db.createApiKey({
            ...input,
            keyHash,
            keyPrefix,
            permissions: input.permissions ? JSON.stringify(input.permissions) : null,
            allowedIps: input.allowedIps ? JSON.stringify(input.allowedIps) : null,
            allowedOrigins: input.allowedOrigins ? JSON.stringify(input.allowedOrigins) : null,
            createdBy: ctx.user.id,
          });

          // Return the full key only once (it won't be retrievable later)
          return { id, apiKey: fullKey, success: true };
        }),

      revoke: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.revokeApiKey(input.id);
          return { success: true };
        }),

      getLogs: protectedProcedure
        .input(z.object({ businessId: z.number(), apiKeyId: z.number().optional(), limit: z.number().default(100) }))
        .query(async ({ input }) => {
          return await db.getApiLogs(input.businessId, { apiKeyId: input.apiKeyId, limit: input.limit });
        }),
    }),

    // AI Models
    ai: router({
      models: router({
        list: protectedProcedure
          .input(z.object({ businessId: z.number(), modelType: z.string().optional() }))
          .query(async ({ input }) => {
            return await db.getAiModels(input.businessId, input.modelType);
          }),

        getById: protectedProcedure
          .input(z.object({ id: z.number() }))
          .query(async ({ input }) => {
            return await db.getAiModelById(input.id);
          }),

        create: adminProcedure
          .input(z.object({
            businessId: z.number(),
            code: z.string().min(1),
            nameAr: z.string().min(1),
            nameEn: z.string().optional(),
            description: z.string().optional(),
            modelType: z.enum(["consumption_forecast", "fault_detection", "load_optimization", "anomaly_detection", "demand_prediction", "maintenance_prediction", "customer_churn", "fraud_detection", "price_optimization", "other"]),
            provider: z.enum(["internal", "openai", "azure", "google", "aws", "custom"]).default("internal"),
            modelVersion: z.string().optional(),
            endpoint: z.string().optional(),
            inputSchema: z.any().optional(),
            outputSchema: z.any().optional(),
          }))
          .mutation(async ({ input, ctx }) => {
            const id = await db.createAiModel({
              ...input,
              inputSchema: input.inputSchema ? JSON.stringify(input.inputSchema) : null,
              outputSchema: input.outputSchema ? JSON.stringify(input.outputSchema) : null,
              createdBy: ctx.user.id,
            });
            return { id, success: true };
          }),

        update: adminProcedure
          .input(z.object({
            id: z.number(),
            nameAr: z.string().optional(),
            nameEn: z.string().optional(),
            description: z.string().optional(),
            modelVersion: z.string().optional(),
            endpoint: z.string().optional(),
            isActive: z.boolean().optional(),
            accuracy: z.number().optional(),
          }))
          .mutation(async ({ input }) => {
            const { id, accuracy, ...data } = input;
            await db.updateAiModel(id, {
              ...data,
              accuracy: accuracy?.toString(),
            });
            return { success: true };
          }),
      }),

      predictions: router({
        list: protectedProcedure
          .input(z.object({
            businessId: z.number(),
            modelId: z.number().optional(),
            predictionType: z.string().optional(),
            limit: z.number().default(100),
          }))
          .query(async ({ input }) => {
            return await db.getAiPredictions(input.businessId, input);
          }),

        create: protectedProcedure
          .input(z.object({
            modelId: z.number(),
            businessId: z.number(),
            predictionType: z.string().min(1),
            targetEntity: z.string().optional(),
            targetEntityId: z.number().optional(),
            inputData: z.any(),
            prediction: z.any(),
            confidence: z.number().optional(),
            predictionDate: z.string(),
            validFrom: z.date().optional(),
            validTo: z.date().optional(),
          }))
          .mutation(async ({ input }) => {
            const id = await db.createAiPrediction({
              ...input,
              inputData: JSON.stringify(input.inputData),
              prediction: JSON.stringify(input.prediction),
              confidence: input.confidence?.toString(),
              predictionDate: new Date(input.predictionDate),
            });
            return { id, success: true };
          }),

        verify: protectedProcedure
          .input(z.object({
            id: z.number(),
            actualValue: z.any(),
          }))
          .mutation(async ({ input, ctx }) => {
            await db.verifyPrediction(input.id, input.actualValue, ctx.user.id);
            return { success: true };
          }),
      }),
    }),

    // Technical Alerts
    alerts: router({
      rules: router({
        list: protectedProcedure
          .input(z.object({ businessId: z.number(), category: z.string().optional() }))
          .query(async ({ input }) => {
            return await db.getTechnicalAlertRules(input.businessId, input.category);
          }),

        create: adminProcedure
          .input(z.object({
            businessId: z.number(),
            code: z.string().min(1),
            nameAr: z.string().min(1),
            nameEn: z.string().optional(),
            description: z.string().optional(),
            category: z.enum(["performance", "security", "availability", "integration", "database", "api", "system"]),
            severity: z.enum(["info", "warning", "error", "critical"]).default("warning"),
            condition: z.any(),
            threshold: z.number().optional(),
            comparisonOperator: z.enum(["gt", "gte", "lt", "lte", "eq", "neq"]).optional(),
            evaluationPeriodMinutes: z.number().default(5),
            cooldownMinutes: z.number().default(15),
            notificationChannels: z.any().optional(),
            escalationRules: z.any().optional(),
          }))
          .mutation(async ({ input, ctx }) => {
            const id = await db.createTechnicalAlertRule({
              ...input,
              condition: JSON.stringify(input.condition),
              threshold: input.threshold?.toString(),
              notificationChannels: input.notificationChannels ? JSON.stringify(input.notificationChannels) : null,
              escalationRules: input.escalationRules ? JSON.stringify(input.escalationRules) : null,
              createdBy: ctx.user.id,
            });
            return { id, success: true };
          }),

        update: adminProcedure
          .input(z.object({
            id: z.number(),
            nameAr: z.string().optional(),
            nameEn: z.string().optional(),
            description: z.string().optional(),
            severity: z.enum(["info", "warning", "error", "critical"]).optional(),
            threshold: z.number().optional(),
            isActive: z.boolean().optional(),
          }))
          .mutation(async ({ input }) => {
            const { id, threshold, ...data } = input;
            await db.updateTechnicalAlertRule(id, {
              ...data,
              threshold: threshold?.toString(),
            });
            return { success: true };
          }),
      }),

      list: protectedProcedure
        .input(z.object({
          businessId: z.number(),
          status: z.string().optional(),
          severity: z.string().optional(),
          limit: z.number().default(100),
        }))
        .query(async ({ input }) => {
          return await db.getTechnicalAlerts(input.businessId, input);
        }),

      acknowledge: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          await db.acknowledgeTechnicalAlert(input.id, ctx.user.id);
          return { success: true };
        }),

      resolve: protectedProcedure
        .input(z.object({ id: z.number(), notes: z.string().optional() }))
        .mutation(async ({ input, ctx }) => {
          await db.resolveTechnicalAlert(input.id, ctx.user.id, input.notes);
          return { success: true };
        }),
    }),

    // Performance Metrics
    metrics: router({
      record: protectedProcedure
        .input(z.object({
          businessId: z.number(),
          metricType: z.enum(["response_time", "throughput", "error_rate", "cpu_usage", "memory_usage", "disk_usage", "network_io", "db_connections", "active_users", "api_calls", "queue_size", "cache_hit_rate"]),
          source: z.string().optional(),
          value: z.number(),
          unit: z.string().optional(),
          tags: z.any().optional(),
        }))
        .mutation(async ({ input }) => {
          await db.recordPerformanceMetric({
            ...input,
            value: input.value.toString(),
            tags: input.tags ? JSON.stringify(input.tags) : null,
          });
          return { success: true };
        }),

      get: protectedProcedure
        .input(z.object({
          businessId: z.number(),
          metricType: z.string(),
          hours: z.number().default(24),
        }))
        .query(async ({ input }) => {
          return await db.getPerformanceMetrics(input.businessId, input.metricType, input.hours);
        }),
    }),

    // Webhooks
    webhooks: router({
      list: protectedProcedure
        .input(z.object({ integrationId: z.number(), limit: z.number().default(100) }))
        .query(async ({ input }) => {
          return await db.getIncomingWebhooks(input.integrationId, input.limit);
        }),
    }),
  }),

  // Field Operations System
  fieldOps: fieldOpsRouter,

  // HR System - نظام الموارد البشرية
  hr: hrRouter,

  // Custom System - النظام المخصص
  customSystem: customSystemRouter,
  customerSystem: customerSystemRouter,
  billing: billingRouter,
  // Asset Management System - نظام إدارة الأصول
  assets: assetsRouter,
  // Accounting System - النظام المحاسبي
  accounting: accountingRouter,
  // Inventory System - نظام المخزون
  inventory: inventoryRouter,
  // Maintenance System - نظام الصيانة
  maintenance: maintenanceRouter,
  // Projects System - نظام المشاريع
  projects: projectsRouter,
  // SCADA System - نظام المراقبة والتحكم
  scada: scadaRouter,
  // Diesel System - نظام استهلاك الديزل
  diesel: dieselRouter,
});

export type AppRouter = typeof appRouter;
