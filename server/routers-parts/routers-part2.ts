        voltageLevel: z.string().optional(),
        address: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateStation(id, {
          ...data,
          capacity: data.capacity?.toString(),
          latitude: data.latitude?.toString(),
          longitude: data.longitude?.toString(),
        });
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteStation(input.id);
        return { success: true };
      }),
  }),

  // User Management
  user: router({
    list: adminProcedure
      .input(z.object({ businessId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAllUsers(input?.businessId);
      }),
    
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        phone: z.string().min(10, 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل'),
        password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
        name: z.string().min(2, 'الاسم مطلوب'),
        email: z.string().email().optional().nullable(),
        role: z.enum(['user', 'admin', 'super_admin']).default('user'),
        businessId: z.number().optional().nullable(),
        branchId: z.number().optional().nullable(),
        stationId: z.number().optional().nullable(),
        departmentId: z.number().optional().nullable(),
        jobTitle: z.string().optional().nullable(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const result = await auth.registerUser({
          phone: input.phone,
          password: input.password,
          name: input.name,
          email: input.email || undefined,
          role: input.role,
        });
        
        if (!result.success) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: result.error || 'فشل إنشاء المستخدم' });
        }
        
        // Update additional fields if provided
        if (result.userId && (input.businessId || input.branchId || input.stationId || input.departmentId || input.jobTitle)) {
          await db.updateUser(result.userId, {
            businessId: input.businessId,
            branchId: input.branchId,
            stationId: input.stationId,
            departmentId: input.departmentId,
            jobTitle: input.jobTitle,
          });
        }
        
        return { success: true, userId: result.userId };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(2).optional(),
        email: z.string().email().optional().nullable(),
        phone: z.string().min(10).optional(),
        role: z.enum(['user', 'admin', 'super_admin']).optional(),
        businessId: z.number().optional().nullable(),
        branchId: z.number().optional().nullable(),
        stationId: z.number().optional().nullable(),
        departmentId: z.number().optional().nullable(),
        jobTitle: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateUser(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Prevent self-deletion
        if (input.id === ctx.user.id) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'لا يمكنك حذف حسابك الخاص' });
        }
        await db.deleteUser(input.id);
        return { success: true };
      }),
    
    toggleActive: adminProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        // Prevent self-deactivation
        if (input.id === ctx.user.id && !input.isActive) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'لا يمكنك تعطيل حسابك الخاص' });
        }
        await db.updateUser(input.id, { isActive: input.isActive });
        return { success: true };
      }),
    
    resetPassword: adminProcedure
      .input(z.object({
        id: z.number(),
        newPassword: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
      }))
      .mutation(async ({ input }) => {
        const result = await auth.resetPassword(input.id, input.newPassword);
        if (!result.success) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: result.error || 'فشل إعادة تعيين كلمة المرور' });
        }
        return { success: true };
      }),
  }),

  // Account Management (Chart of Accounts)
  account: router({
    list: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAccounts(input.businessId);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAccountById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        businessId: z.number(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        systemModule: z.enum(["assets", "maintenance", "inventory", "procurement", "customers", "billing", "scada", "projects", "hr", "operations", "finance", "general"]),
        accountType: z.enum(["main", "sub", "detail"]).default("detail"),
        nature: z.enum(["debit", "credit"]),
        isParent: z.boolean().default(false),
        isCashAccount: z.boolean().default(false),
        isBankAccount: z.boolean().default(false),
        description: z.string().optional(),
        linkedEntityType: z.string().optional(),
        linkedEntityId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createAccount(input);
        return { id, success: true };
      }),
  }),

  // Asset Management
  asset: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number().optional(),
        categoryId: z.number().optional(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAssets(input.businessId, {
          stationId: input.stationId,
          categoryId: input.categoryId,
          status: input.status,
        });
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAssetById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        branchId: z.number().optional(),
        stationId: z.number().optional(),
        categoryId: z.number(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        serialNumber: z.string().optional(),
        model: z.string().optional(),
        manufacturer: z.string().optional(),
        purchaseDate: z.string().optional(),
        purchaseCost: z.number().optional(),
        usefulLife: z.number().optional(),
        location: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createAsset({
          ...input,
          purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
          purchaseCost: input.purchaseCost?.toString(),
          createdBy: ctx.user.id,
        });
        
        await db.createAuditLog({
          businessId: input.businessId,
          userId: ctx.user.id,
          action: 'create',
          module: 'assets',
          entityType: 'asset',
          entityId: id,
          newValues: input,
        });
        
        return { id, success: true };
      }),
  }),

  // Work Order Management
  workOrder: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        status: z.string().optional(),
        type: z.string().optional(),
        stationId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getWorkOrders(input.businessId, {
          status: input.status,
          type: input.type,
          stationId: input.stationId,
        });
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getWorkOrderById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        branchId: z.number().optional(),
        stationId: z.number().optional(),
        type: z.enum(["preventive", "corrective", "emergency", "inspection", "calibration"]),
        priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
        assetId: z.number().optional(),
        equipmentId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        scheduledStart: z.string().optional(),
        scheduledEnd: z.string().optional(),
        assignedTo: z.number().optional(),
        estimatedHours: z.number().optional(),
        estimatedCost: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const orderNumber = await db.getNextSequence(input.businessId, 'WO');
        
        const id = await db.createWorkOrder({
          ...input,
          orderNumber,
          requestedBy: ctx.user.id,
          requestedDate: new Date(),
          scheduledStart: input.scheduledStart ? new Date(input.scheduledStart) : null,
          scheduledEnd: input.scheduledEnd ? new Date(input.scheduledEnd) : null,
          estimatedHours: input.estimatedHours?.toString(),
          estimatedCost: input.estimatedCost?.toString(),
          createdBy: ctx.user.id,
        });
        
        await db.createAuditLog({
          businessId: input.businessId,
          userId: ctx.user.id,
          action: 'create',
          module: 'maintenance',
          entityType: 'work_order',
          entityId: id,
          newValues: { ...input, orderNumber },
        });
        
        return { id, orderNumber, success: true };
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum([
          "draft", "pending", "approved", "assigned", "in_progress",
          "on_hold", "completed", "cancelled", "closed"
        ]),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateWorkOrderStatus(input.id, input.status, ctx.user.id);
        
        await db.createAuditLog({
          userId: ctx.user.id,
          action: 'update_status',
          module: 'maintenance',
          entityType: 'work_order',
          entityId: input.id,
          newValues: { status: input.status },
        });
        
        return { success: true };
      }),
  }),

  // Customer Management
  customer: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        status: z.string().optional(),
        type: z.string().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getCustomers(input.businessId, {
          status: input.status,
          type: input.type,
          search: input.search,
        });
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomerById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        branchId: z.number().optional(),
        stationId: z.number().optional(),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        type: z.enum(["residential", "commercial", "industrial", "government", "agricultural"]).default("residential"),
        idType: z.enum(["national_id", "iqama", "passport", "cr"]).optional(),
        idNumber: z.string().optional(),
        phone: z.string().optional(),
        mobile: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const accountNumber = await db.getNextSequence(input.businessId, 'CUST');
