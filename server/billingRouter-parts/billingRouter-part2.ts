  // ==================== التعرفة ====================
  /**
   * استرجاع قائمة التعرفة
   * 
   * @procedure getTariffs
   * @description يسترجع قائمة شرائح التعرفة المعرفة في النظام.
   * 
   * @returns {Promise<Tariff[]>} قائمة التعرفة
   */
  getTariffs: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select({
      id: tariffs.id,
      code: tariffs.code,
      name: tariffs.name,
      serviceType: tariffs.serviceType,
      customerCategory: tariffs.customerCategory,
      fromUnit: tariffs.fromUnit,
      toUnit: tariffs.toUnit,
      pricePerUnit: tariffs.pricePerUnit,
      fixedCharge: tariffs.fixedCharge,
      isActive: tariffs.isActive,
      createdAt: tariffs.createdAt,
    }).from(tariffs).orderBy(desc(tariffs.createdAt));
  }),

  /**
   * إنشاء شريحة تعرفة جديدة
   * 
   * @procedure createTariff
   * @description ينشئ شريحة تعرفة جديدة مع تحديد نطاق الاستهلاك والسعر.
   * 
   * @param {object} input - بيانات التعرفة
   * @param {string} input.code - رمز التعرفة
   * @param {string} input.name - اسم التعرفة
   * @param {string} input.serviceType - نوع الخدمة (electricity|water|gas)
   * @param {string} input.customerCategory - فئة العميل
   * @param {number} input.fromUnit - بداية الشريحة
   * @param {number} input.toUnit - نهاية الشريحة
   * @param {string} input.pricePerUnit - سعر الوحدة
   * @param {string} [input.fixedCharge] - الرسوم الثابتة
   * 
   * @returns {Promise<{id: number}>} معرف التعرفة الجديدة
   */
  createTariff: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    serviceType: z.enum(["electricity", "water", "gas"]),
    customerCategory: z.enum(["residential", "commercial", "industrial", "governmental", "agricultural"]),
    fromUnit: z.number(),
    toUnit: z.number(),
    pricePerUnit: z.string(),
    fixedCharge: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(tariffs).values(input);
    return { id: result.insertId };
  }),

  updateTariff: publicProcedure.input(z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string().optional(),
    serviceType: z.enum(["electricity", "water", "gas"]).optional(),
    customerCategory: z.enum(["residential", "commercial", "industrial", "governmental", "agricultural"]).optional(),
    fromUnit: z.number().optional(),
    toUnit: z.number().optional(),
    pricePerUnit: z.string().optional(),
    fixedCharge: z.string().optional(),
    isActive: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(tariffs).set(data).where(eq(tariffs.id, id));
    return { success: true };
  }),

  deleteTariff: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(tariffs).where(eq(tariffs.id, input.id));
    return { success: true };
  }),

  // ==================== أنواع الرسوم ====================
  /**
   * استرجاع أنواع الرسوم
   * 
   * @procedure getFeeTypes
   * @description يسترجع قائمة أنواع الرسوم الإضافية المعرفة في النظام.
   * 
   * @returns {Promise<FeeType[]>} قائمة أنواع الرسوم
   */
  getFeeTypes: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select({
      id: feeTypes.id,
      code: feeTypes.code,
      name: feeTypes.name,
      nameEn: feeTypes.nameEn,
      feeType: feeTypes.feeType,
      amount: feeTypes.amount,
      isRequired: feeTypes.isRequired,
      isActive: feeTypes.isActive,
      createdAt: feeTypes.createdAt,
    }).from(feeTypes).orderBy(desc(feeTypes.createdAt));
  }),

  createFeeType: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    nameEn: z.string().optional(),
    feeType: z.enum(["fixed", "percentage"]),
    amount: z.string(),
    isRequired: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(feeTypes).values(input);
    return { id: result.insertId };
  }),

  updateFeeType: publicProcedure.input(z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string().optional(),
    nameEn: z.string().optional(),
    feeType: z.enum(["fixed", "percentage"]).optional(),
    amount: z.string().optional(),
    isRequired: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(feeTypes).set(data).where(eq(feeTypes.id, id));
    return { success: true };
  }),

  deleteFeeType: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(feeTypes).where(eq(feeTypes.id, input.id));
    return { success: true };
  }),

  // ==================== الصناديق ====================
  /**
   * استرجاع قائمة الصناديق
   * 
   * @procedure getCashboxes
   * @description يسترجع قائمة صناديق النقد مع أرصدتها الحالية.
   * 
   * @returns {Promise<Cashbox[]>} قائمة الصناديق
   */
  getCashboxes: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select({
      id: cashboxes.id,
      code: cashboxes.code,
      name: cashboxes.name,
      nameEn: cashboxes.nameEn,
      cashboxType: cashboxes.cashboxType,
      openingBalance: cashboxes.openingBalance,
      currentBalance: cashboxes.currentBalance,
      isActive: cashboxes.isActive,
      createdAt: cashboxes.createdAt,
    }).from(cashboxes).orderBy(desc(cashboxes.createdAt));
  }),

  /**
   * إنشاء صندوق نقد جديد
   * 
   * @procedure createCashbox
   * @description ينشئ صندوق نقد جديد مع تحديد الرصيد الافتتاحي.
   * 
   * @param {object} input - بيانات الصندوق
   * @param {string} input.code - رمز الصندوق
   * @param {string} input.name - اسم الصندوق
   * @param {string} [input.nameEn] - الاسم بالإنجليزية
   * @param {string} [input.cashboxType] - نوع الصندوق (main|branch)
   * @param {string} [input.openingBalance] - الرصيد الافتتاحي
   * 
   * @returns {Promise<{id: number}>} معرف الصندوق الجديد
   */
  createCashbox: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    nameEn: z.string().optional(),
    cashboxType: z.enum(["main", "branch"]).optional(),
    openingBalance: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(cashboxes).values({ ...input, currentBalance: input.openingBalance || "0" });
    return { id: result.insertId };
  }),

  updateCashbox: publicProcedure.input(z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string().optional(),
    nameEn: z.string().optional(),
    cashboxType: z.enum(["main", "branch"]).optional(),
    isActive: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(cashboxes).set(data).where(eq(cashboxes.id, id));
    return { success: true };
  }),

  deleteCashbox: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(cashboxes).where(eq(cashboxes.id, input.id));
    return { success: true };
  }),

  // ==================== طرق الدفع ====================
  /**
   * استرجاع طرق الدفع
   * 
   * @procedure getPaymentMethods
   * @description يسترجع قائمة طرق الدفع المتاحة في النظام.
   * 
   * @returns {Promise<PaymentMethod[]>} قائمة طرق الدفع
   */
  getPaymentMethods: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select({
      id: paymentMethodsNew.id,
      code: paymentMethodsNew.code,
      name: paymentMethodsNew.name,
      nameEn: paymentMethodsNew.nameEn,
      methodType: paymentMethodsNew.methodType,
      isActive: paymentMethodsNew.isActive,
      createdAt: paymentMethodsNew.createdAt,
    }).from(paymentMethodsNew).orderBy(desc(paymentMethodsNew.createdAt));
  }),

  /**
   * إنشاء طريقة دفع جديدة
   * 
   * @procedure createPaymentMethod
   * @description ينشئ طريقة دفع جديدة في النظام.
   * 
   * @param {object} input - بيانات طريقة الدفع
   * @param {string} input.code - رمز طريقة الدفع
   * @param {string} input.name - اسم طريقة الدفع
   * @param {string} [input.nameEn] - الاسم بالإنجليزية
   * @param {string} input.methodType - نوع الطريقة (cash|card|bank_transfer|check|online)
   * 
   * @returns {Promise<{id: number}>} معرف طريقة الدفع الجديدة
   */
  createPaymentMethod: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    nameEn: z.string().optional(),
    methodType: z.enum(["cash", "card", "bank_transfer", "check", "online"]),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(paymentMethodsNew).values(input);
    return { id: result.insertId };
  }),

  updatePaymentMethod: publicProcedure.input(z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string().optional(),
    nameEn: z.string().optional(),
    methodType: z.enum(["cash", "card", "bank_transfer", "check", "online"]).optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(paymentMethodsNew).set(data).where(eq(paymentMethodsNew.id, id));
    return { success: true };
  }),

  deletePaymentMethod: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(paymentMethodsNew).where(eq(paymentMethodsNew.id, input.id));
    return { success: true };
  }),

  // ==================== العملاء ====================
  /**
   * استرجاع قائمة العملاء
   * 
   * @procedure getCustomers
   * @description يسترجع قائمة العملاء المسجلين في النظام.
   * 
   * @returns {Promise<Customer[]>} قائمة العملاء
   */
  getCustomers: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select({
      id: customersEnhanced.id,
      accountNumber: customersEnhanced.accountNumber,
      fullName: customersEnhanced.fullName,
      fullNameEn: customersEnhanced.fullNameEn,
      customerType: customersEnhanced.customerType,
      category: customersEnhanced.category,
      phone: customersEnhanced.phone,
      phone2: customersEnhanced.phone2,
      email: customersEnhanced.email,
      nationalId: customersEnhanced.nationalId,
      address: customersEnhanced.address,
      isActive: customersEnhanced.isActive,
      createdAt: customersEnhanced.createdAt,
    }).from(customersEnhanced).orderBy(desc(customersEnhanced.createdAt));
    return result;
  }),

  /**
   * إنشاء عميل جديد
   * 
   * @procedure createCustomer
   * @description يسجل عميل جديد في النظام مع إنشاء محفظة له تلقائياً.
   * 
   * @param {object} input - بيانات العميل
   * @param {string} input.accountNumber - رقم الحساب
   * @param {string} input.fullName - الاسم الكامل
   * @param {string} [input.fullNameEn] - الاسم بالإنجليزية
   * @param {string} input.customerType - نوع العميل (individual|company|organization)
   * @param {string} input.category - فئة العميل (residential|commercial|industrial|governmental|agricultural)
   * @param {string} input.phone - رقم الهاتف
   * @param {string} [input.phone2] - رقم هاتف إضافي
   * @param {string} [input.email] - البريد الإلكتروني
   * @param {string} [input.nationalId] - رقم الهوية
   * @param {string} [input.address] - العنوان
   * 
   * @returns {Promise<{id: number}>} معرف العميل الجديد
   */
  createCustomer: publicProcedure.input(z.object({
    accountNumber: z.string(),
    fullName: z.string(),
    fullNameEn: z.string().optional(),
    customerType: z.enum(["individual", "company", "organization"]),
    category: z.enum(["residential", "commercial", "industrial", "governmental", "agricultural"]),
    phone: z.string(),
    phone2: z.string().optional(),
    email: z.string().optional(),
    nationalId: z.string().optional(),
    address: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(customersEnhanced).values(input);
    // إنشاء محفظة للعميل
    await db.insert(customerWallets).values({ customerId: result.insertId, balance: "0" });
    return { id: result.insertId };
  }),

  updateCustomer: publicProcedure.input(z.object({
    id: z.number(),
    accountNumber: z.string().optional(),
    fullName: z.string().optional(),
    fullNameEn: z.string().optional(),
    customerType: z.enum(["individual", "company", "organization"]).optional(),
    category: z.enum(["residential", "commercial", "industrial", "governmental", "agricultural"]).optional(),
    phone: z.string().optional(),
    phone2: z.string().optional(),
    email: z.string().optional(),
    nationalId: z.string().optional(),
    address: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(customersEnhanced).set(data).where(eq(customersEnhanced.id, id));
    return { success: true };
  }),

  deleteCustomer: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(customersEnhanced).where(eq(customersEnhanced.id, input.id));
    return { success: true };
  }),

  toggleCustomerStatus: publicProcedure.input(z.object({
    id: z.number(),
    isActive: z.boolean(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(customersEnhanced).set({ isActive: input.isActive }).where(eq(customersEnhanced.id, input.id));
    return { success: true };
  }),

  resetCustomerPassword: publicProcedure.input(z.object({
    id: z.number(),
    newPassword: z.string(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(customersEnhanced).set({ password: input.newPassword }).where(eq(customersEnhanced.id, input.id));
    return { success: true };
  }),

