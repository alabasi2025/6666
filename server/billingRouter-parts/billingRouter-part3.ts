  // ==================== العدادات ====================
  /**
   * استرجاع قائمة العدادات
   * 
   * @procedure getMeters
   * @description يسترجع قائمة العدادات مع بيانات العملاء المرتبطين.
   * 
   * @returns {Promise<Meter[]>} قائمة العدادات
   */
  getMeters: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select({
      id: metersEnhanced.id,
      meterNumber: invoicesEnhanced.meterNumber,
      serialNumber: metersEnhanced.serialNumber,
      customerId: metersEnhanced.customerId,
      customerName: customersEnhanced.fullName,
      
      cabinetId: metersEnhanced.cabinetId,
      serviceType: metersEnhanced.serviceType,
      meterType: metersEnhanced.meterType,
      connectionType: metersEnhanced.connectionType,
      status: metersEnhanced.status,
      installationDate: metersEnhanced.installationDate,
      lastReading: metersEnhanced.lastReading,
      lastReadingDate: metersEnhanced.lastReadingDate,
      multiplier: metersEnhanced.multiplier,
      isIot: metersEnhanced.isIot,
      createdAt: metersEnhanced.createdAt,
    }).from(metersEnhanced)
      .leftJoin(customersEnhanced, eq(metersEnhanced.customerId, customersEnhanced.id))
      .orderBy(desc(metersEnhanced.createdAt));
    return result;
  }),

  /**
   * إنشاء عداد جديد
   * 
   * @procedure createMeter
   * @description يسجل عداد جديد في النظام.
   * 
   * @param {object} input - بيانات العداد
   * @param {string} input.meterNumber - رقم العداد
   * @param {string} [input.serialNumber] - الرقم التسلسلي
   * @param {number} [input.customerId] - معرف العميل
   * @param {number} [input.cabinetId] - معرف الكابينة
   * @param {string} input.serviceType - نوع الخدمة (electricity|water|gas)
   * @param {string} [input.meterType] - نوع العداد
   * @param {string} [input.connectionType] - نوع التوصيل
   * @param {string} [input.installationDate] - تاريخ التركيب
   * @param {string} [input.initialReading] - القراءة الأولية
   * @param {number} [input.multiplier] - معامل الضرب
   * @param {boolean} [input.isIot] - هل هو عداد ذكي
   * 
   * @returns {Promise<{id: number}>} معرف العداد الجديد
   */
  createMeter: publicProcedure.input(z.object({
    meterNumber: z.string(),
    serialNumber: z.string().optional(),
    customerId: z.number().optional(),
    cabinetId: z.number().optional(),
    serviceType: z.enum(["electricity", "water", "gas"]),
    meterType: z.enum(["single_phase", "three_phase", "smart", "prepaid"]).optional(),
    connectionType: z.enum(["residential", "commercial", "industrial"]).optional(),
    installationDate: z.string().optional(),
    initialReading: z.string().optional(),
    multiplier: z.number().optional(),
    isIot: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(metersEnhanced).values({
      ...input,
      lastReading: input.initialReading || "0",
    });
    return { id: result.insertId };
  }),

  updateMeter: publicProcedure.input(z.object({
    id: z.number(),
    meterNumber: z.string().optional(),
    serialNumber: z.string().optional(),
    customerId: z.number().optional(),
    cabinetId: z.number().optional(),
    serviceType: z.enum(["electricity", "water", "gas"]).optional(),
    meterType: z.enum(["single_phase", "three_phase", "smart", "prepaid"]).optional(),
    connectionType: z.enum(["residential", "commercial", "industrial"]).optional(),
    status: z.enum(["active", "inactive", "disconnected", "removed"]).optional(),
    multiplier: z.number().optional(),
    isIot: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(metersEnhanced).set(data).where(eq(metersEnhanced.id, id));
    return { success: true };
  }),

  deleteMeter: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(metersEnhanced).where(eq(metersEnhanced.id, input.id));
    return { success: true };
  }),

  /**
   * ربط عداد بعميل
   * 
   * @procedure linkMeterToCustomer
   * @description يربط عداد موجود بعميل محدد.
   * 
   * @param {object} input - بيانات الربط
   * @param {number} input.meterId - معرف العداد
   * @param {number} input.customerId - معرف العميل
   * @param {string} [input.installationDate] - تاريخ التركيب
   * @param {number} [input.initialReading] - القراءة الأولية
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   */
  linkMeterToCustomer: publicProcedure.input(z.object({
    meterId: z.number(),
    customerId: z.number(),
    installationDate: z.string().optional(),
    initialReading: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const updateData: any = { customerId: input.customerId };
    if (input.installationDate) updateData.installationDate = new Date(input.installationDate);
    if (input.initialReading !== undefined) updateData.lastReading = input.initialReading;
    await db.update(metersEnhanced).set(updateData).where(eq(metersEnhanced.id, input.meterId));
    return { success: true };
  }),

  // ==================== فترات الفوترة ====================
  /**
   * استرجاع فترات الفوترة
   * 
   * @procedure getBillingPeriods
   * @description يسترجع قائمة فترات الفوترة المعرفة في النظام.
   * 
   * @returns {Promise<BillingPeriod[]>} قائمة فترات الفوترة
   */
  getBillingPeriods: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select({
      id: billingPeriods.id,
      code: billingPeriods.code,
      name: billingPeriods.name,
      startDate: billingPeriods.startDate,
      endDate: billingPeriods.endDate,
      dueDate: billingPeriods.dueDate,
      status: billingPeriods.status,
      createdAt: billingPeriods.createdAt,
    }).from(billingPeriods).orderBy(desc(billingPeriods.createdAt));
  }),

  /**
   * إنشاء فترة فوترة جديدة
   * 
   * @procedure createBillingPeriod
   * @description ينشئ فترة فوترة جديدة مع تحديد تواريخ البداية والنهاية والاستحقاق.
   * 
   * @param {object} input - بيانات الفترة
   * @param {string} input.code - رمز الفترة
   * @param {string} input.name - اسم الفترة
   * @param {string} input.startDate - تاريخ البداية
   * @param {string} input.endDate - تاريخ النهاية
   * @param {string} input.dueDate - تاريخ الاستحقاق
   * 
   * @returns {Promise<{id: number}>} معرف الفترة الجديدة
   */
  createBillingPeriod: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    dueDate: z.string(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(billingPeriods).values({ ...input, status: "pending" });
    return { id: result.insertId };
  }),

  updateBillingPeriod: publicProcedure.input(z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    dueDate: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(billingPeriods).set(data).where(eq(billingPeriods.id, id));
    return { success: true };
  }),

  updateBillingPeriodStatus: publicProcedure.input(z.object({
    id: z.number(),
    status: z.enum(["pending", "active", "reading_phase", "billing_phase", "closed"]),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(billingPeriods).set({ status: input.status }).where(eq(billingPeriods.id, input.id));
    return { success: true };
  }),

  deleteBillingPeriod: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(billingPeriods).where(eq(billingPeriods.id, input.id));
    return { success: true };
  }),

  // ==================== قراءات العدادات ====================
  /**
   * استرجاع قراءات العدادات
   * 
   * @procedure getMeterReadings
   * @description يسترجع قائمة قراءات العدادات مع بيانات العملاء والفترات.
   * 
   * @returns {Promise<MeterReading[]>} قائمة القراءات
   */
  getMeterReadings: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select({
      id: meterReadingsEnhanced.id,
      meterId: meterReadingsEnhanced.meterId,
      meterNumber: invoicesEnhanced.meterNumber,
      customerName: customersEnhanced.fullName,
      billingPeriodId: meterReadingsEnhanced.billingPeriodId,
      billingPeriodName: billingPeriods.name,
      previousReading: meterReadingsEnhanced.previousReading,
      currentReading: meterReadingsEnhanced.currentReading,
      consumption: meterReadingsEnhanced.consumption,
      readingDate: meterReadingsEnhanced.readingDate,
      readingType: meterReadingsEnhanced.readingType,
      status: meterReadingsEnhanced.status,
      notes: meterReadingsEnhanced.notes,
      isApproved: meterReadingsEnhanced.isApproved,
      approvedBy: meterReadingsEnhanced.approvedBy,
      approvedAt: meterReadingsEnhanced.approvedAt,
    }).from(meterReadingsEnhanced)
      .leftJoin(metersEnhanced, eq(meterReadingsEnhanced.meterId, metersEnhanced.id))
      .leftJoin(customersEnhanced, eq(metersEnhanced.customerId, customersEnhanced.id))
      .leftJoin(billingPeriods, eq(meterReadingsEnhanced.billingPeriodId, billingPeriods.id))
      .orderBy(desc(meterReadingsEnhanced.createdAt));
    return result;
  }),

  /**
   * تسجيل قراءة عداد
   * 
   * @procedure createMeterReading
   * @description يسجل قراءة جديدة لعداد مع حساب الاستهلاك تلقائياً.
   * 
   * @param {object} input - بيانات القراءة
   * @param {number} input.meterId - معرف العداد
   * @param {number} input.billingPeriodId - معرف فترة الفوترة
   * @param {string} input.currentReading - القراءة الحالية
   * @param {string} input.readingDate - تاريخ القراءة
   * @param {string} [input.readingType] - نوع القراءة (manual|automatic|estimated)
   * @param {string} [input.notes] - ملاحظات
   * 
   * @returns {Promise<{id: number}>} معرف القراءة الجديدة
   */
  createMeterReading: publicProcedure.input(z.object({
    meterId: z.number(),
    billingPeriodId: z.number(),
    currentReading: z.string(),
    readingDate: z.string(),
    readingType: z.enum(["manual", "automatic", "estimated"]).optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    // الحصول على القراءة السابقة
    const [meter] = await db.select({
      id: metersEnhanced.id,
      lastReading: metersEnhanced.lastReading,
    }).from(metersEnhanced).where(eq(metersEnhanced.id, input.meterId));
    const previousReading = meter?.lastReading || "0";
