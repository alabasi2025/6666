        
        const id = await db.createCustomer({
          ...input,
          accountNumber,
        });
        
        await db.createAuditLog({
          businessId: input.businessId,
          userId: ctx.user.id,
          action: 'create',
          module: 'customers',
          entityType: 'customer',
          entityId: id,
          newValues: { ...input, accountNumber },
        });
        
        return { id, accountNumber, success: true };
      }),
  }),

  // Invoice Management
  invoice: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        status: z.string().optional(),
        customerId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getInvoices(input.businessId, {
          status: input.status,
          customerId: input.customerId,
        });
      }),
    
    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        branchId: z.number().optional(),
        customerId: z.number(),
        meterId: z.number().optional(),
        invoiceDate: z.string(),
        dueDate: z.string(),
        periodStart: z.string().optional(),
        periodEnd: z.string().optional(),
        consumption: z.number().optional(),
        consumptionAmount: z.number().optional(),
        fixedCharges: z.number().optional(),
        taxAmount: z.number().optional(),
        otherCharges: z.number().optional(),
        discountAmount: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const invoiceNumber = await db.getNextSequence(input.businessId, 'INV');
        
        const totalAmount = (input.consumptionAmount || 0) + 
                           (input.fixedCharges || 0) + 
                           (input.taxAmount || 0) + 
                           (input.otherCharges || 0) - 
                           (input.discountAmount || 0);
        
        const id = await db.createInvoice({
          ...input,
          invoiceNumber,
          invoiceDate: new Date(input.invoiceDate),
          dueDate: new Date(input.dueDate),
          periodStart: input.periodStart ? new Date(input.periodStart) : null,
          periodEnd: input.periodEnd ? new Date(input.periodEnd) : null,
          consumption: input.consumption?.toString(),
          consumptionAmount: input.consumptionAmount?.toString(),
          fixedCharges: input.fixedCharges?.toString(),
          taxAmount: input.taxAmount?.toString(),
          otherCharges: input.otherCharges?.toString(),
          discountAmount: input.discountAmount?.toString(),
          totalAmount: totalAmount.toString(),
          balanceDue: totalAmount.toString(),
          createdBy: ctx.user.id,
        });
        
        return { id, invoiceNumber, success: true };
      }),
  }),

  // Equipment Management (SCADA)
  equipment: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getEquipment(input.businessId, input.stationId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number(),
        assetId: z.number().optional(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        type: z.enum([
          "transformer", "generator", "switchgear", "breaker", "relay",
          "meter", "sensor", "inverter", "battery", "panel", "cable", "motor"
        ]),
        manufacturer: z.string().optional(),
        model: z.string().optional(),
        serialNumber: z.string().optional(),
        ratedCapacity: z.number().optional(),
        capacityUnit: z.string().optional(),
        voltageRating: z.string().optional(),
        currentRating: z.string().optional(),
        isControllable: z.boolean().default(false),
        isMonitored: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createEquipment({
          ...input,
          ratedCapacity: input.ratedCapacity?.toString(),
        });
        return { id, success: true };
      }),
  }),

  // Alert Management
  alert: router({
    list: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getActiveAlerts(input.businessId);
      }),
    
    acknowledge: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.acknowledgeAlert(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Project Management
  project: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getProjects(input.businessId, {
          status: input.status,
        });
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProjectById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        branchId: z.number().optional(),
        stationId: z.number().optional(),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        type: z.enum([
          "construction", "expansion", "maintenance", "upgrade",
          "installation", "decommission", "study"
        ]),
        priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
        managerId: z.number().optional(),
        startDate: z.string().optional(),
        plannedEndDate: z.string().optional(),
        budget: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const code = await db.getNextSequence(input.businessId, 'PRJ');
        
        const id = await db.createProject({
          ...input,
          code,
          budget: input.budget?.toString(),
          startDate: input.startDate ? new Date(input.startDate) : null,
          plannedEndDate: input.plannedEndDate ? new Date(input.plannedEndDate) : null,
          createdBy: ctx.user.id,
        });
        
        return { id, code, success: true };
      }),
  }),

  // Dashboard
  dashboard: router({
    stats: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDashboardStats(input.businessId);
      }),
  }),
  // ============================================
  // Developer System - نظام المطور
  // ============================================
  developer: router({
    // Dashboard Stats
    dashboardStats: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDeveloperDashboardStats(input.businessId);
      }),

    // Integrations
    integrations: router({
      list: protectedProcedure
        .input(z.object({
          businessId: z.number(),
          type: z.string().optional(),
          isActive: z.boolean().optional(),
        }))
        .query(async ({ input }) => {
          return await db.getIntegrations(input.businessId, {
            type: input.type,
            isActive: input.isActive,
          });
        }),

      getById: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return await db.getIntegrationById(input.id);
        }),

      create: adminProcedure
        .input(z.object({
          businessId: z.number(),
          code: z.string().min(1),
          nameAr: z.string().min(1),
          nameEn: z.string().optional(),
          description: z.string().optional(),
          integrationType: z.enum(["payment_gateway", "sms", "whatsapp", "email", "iot", "erp", "crm", "scada", "gis", "weather", "maps", "other"]),
          category: z.enum(["local", "international", "internal"]).default("local"),
          provider: z.string().optional(),
          baseUrl: z.string().optional(),
          apiVersion: z.string().optional(),
          authType: z.enum(["api_key", "oauth2", "basic", "hmac", "jwt", "none"]).default("api_key"),
          webhookUrl: z.string().optional(),
          rateLimitPerMinute: z.number().default(60),
          timeoutSeconds: z.number().default(30),
          retryAttempts: z.number().default(3),
        }))
        .mutation(async ({ input, ctx }) => {
          const id = await db.createIntegration({
            ...input,
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
          baseUrl: z.string().optional(),
          apiVersion: z.string().optional(),
          isActive: z.boolean().optional(),
          isPrimary: z.boolean().optional(),
          priority: z.number().optional(),
          webhookUrl: z.string().optional(),
          rateLimitPerMinute: z.number().optional(),
          timeoutSeconds: z.number().optional(),
          retryAttempts: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          await db.updateIntegration(id, data);
          return { success: true };
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteIntegration(input.id);
          return { success: true };
        }),

      // Integration Configs
      getConfigs: protectedProcedure
        .input(z.object({ integrationId: z.number() }))
        .query(async ({ input }) => {
          return await db.getIntegrationConfigs(input.integrationId);
        }),

      setConfig: adminProcedure
        .input(z.object({
          integrationId: z.number(),
          key: z.string().min(1),
          value: z.string(),
          isEncrypted: z.boolean().default(false),
          valueType: z.enum(["string", "number", "boolean", "json"]).default("string"),
        }))
        .mutation(async ({ input }) => {
          await db.setIntegrationConfig(input.integrationId, input.key, input.value, {
            isEncrypted: input.isEncrypted,
            valueType: input.valueType,
          });
          return { success: true };
        }),

      // Integration Logs
      getLogs: protectedProcedure
        .input(z.object({ integrationId: z.number(), limit: z.number().default(100) }))
        .query(async ({ input }) => {
          return await db.getIntegrationLogs(input.integrationId, input.limit);
        }),
    }),

    // Events System
    events: router({
      list: protectedProcedure
        .input(z.object({
          businessId: z.number(),
          eventType: z.string().optional(),
          status: z.string().optional(),
          limit: z.number().default(100),
        }))
        .query(async ({ input }) => {
          return await db.getSystemEvents(input.businessId, input);
        }),

      create: protectedProcedure
        .input(z.object({
          businessId: z.number(),
          eventType: z.string().min(1),
          eventSource: z.string().min(1),
          aggregateType: z.string().optional(),
          aggregateId: z.number().optional(),
          payload: z.any(),
          metadata: z.any().optional(),
          correlationId: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const id = await db.createSystemEvent({
            ...input,
            payload: JSON.stringify(input.payload),
            metadata: input.metadata ? JSON.stringify(input.metadata) : null,
          });
          return { id, success: true };
        }),

      updateStatus: adminProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(["pending", "processing", "completed", "failed"]),
          errorMessage: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          await db.updateEventStatus(input.id, input.status, input.errorMessage);
          return { success: true };
        }),
    }),

    // Event Subscriptions
    subscriptions: router({
