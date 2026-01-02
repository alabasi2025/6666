    const consumption = (parseFloat(input.currentReading) - parseFloat(previousReading)).toString();
    
    const [result] = await db.insert(meterReadingsEnhanced).values({
      ...input,
      previousReading,
      consumption,
      status: "pending",
      isApproved: false,
    });
    
    return { id: result.insertId };
  }),

  /**
   * اعتماد القراءات
   * 
   * @procedure approveReadings
   * @description يعتمد مجموعة من قراءات العدادات ويحدث آخر قراءة في العداد.
   * 
   * @param {object} input - معاملات الاعتماد
   * @param {number[]} input.ids - قائمة معرفات القراءات
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   */
  approveReadings: publicProcedure.input(z.object({
    ids: z.array(z.number()),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    for (const id of input.ids) {
      await db.update(meterReadingsEnhanced).set({ 
        isApproved: true, 
        status: "approved",
        approvedAt: new Date().toISOString(),
      }).where(eq(meterReadingsEnhanced.id, id));
      
      // تحديث آخر قراءة في العداد
      const [reading] = await db.select({
        id: meterReadingsEnhanced.id,
        meterId: meterReadingsEnhanced.meterId,
        currentReading: meterReadingsEnhanced.currentReading,
        readingDate: meterReadingsEnhanced.readingDate,
      }).from(meterReadingsEnhanced).where(eq(meterReadingsEnhanced.id, id));
      if (reading) {
        await db.update(metersEnhanced).set({
          lastReading: reading.currentReading,
          lastReadingDate: reading.readingDate,
        }).where(eq(metersEnhanced.id, reading.meterId));
      }
    }
    return { success: true };
  }),

  /**
   * رفض القراءات
   * 
   * @procedure rejectReadings
   * @description يرفض مجموعة من قراءات العدادات.
   * 
   * @param {object} input - معاملات الرفض
   * @param {number[]} input.ids - قائمة معرفات القراءات
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   */
  rejectReadings: publicProcedure.input(z.object({
    ids: z.array(z.number()),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    for (const id of input.ids) {
      await db.update(meterReadingsEnhanced).set({ status: "rejected" }).where(eq(meterReadingsEnhanced.id, id));
    }
    return { success: true };
  }),

  // ==================== الفواتير ====================
  /**
   * استرجاع قائمة الفواتير
   * 
   * @procedure getInvoices
   * @description يسترجع قائمة الفواتير مع بيانات العملاء وفترات الفوترة.
   * 
   * @returns {Promise<Invoice[]>} قائمة الفواتير
   */
  getInvoices: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select({
      id: invoicesEnhanced.id,
      invoiceNumber: invoicesEnhanced.invoiceNo,
      customerId: invoicesEnhanced.customerId,
      customerName: customersEnhanced.fullName,
      
      meterId: invoicesEnhanced.meterId,
      meterNumber: invoicesEnhanced.meterNumber,
      billingPeriodId: invoicesEnhanced.billingPeriodId,
      billingPeriodName: billingPeriods.name,
      previousReading: invoicesEnhanced.previousReading,
      currentReading: invoicesEnhanced.currentReading,
      consumption: invoicesEnhanced.totalConsumptionKWH,
      consumptionAmount: invoicesEnhanced.consumptionAmount,
      feesAmount: invoicesEnhanced.totalFees,
      totalAmount: invoicesEnhanced.totalAmount,
      paidAmount: invoicesEnhanced.paidAmount,
      remainingAmount: invoicesEnhanced.balanceDue,
      status: invoicesEnhanced.status,
      dueDate: invoicesEnhanced.dueDate,
      issueDate: invoicesEnhanced.invoiceDate,
      
      
    }).from(invoicesEnhanced)
      .leftJoin(customersEnhanced, eq(invoicesEnhanced.customerId, customersEnhanced.id))
      
      .leftJoin(billingPeriods, eq(invoicesEnhanced.billingPeriodId, billingPeriods.id))
      .orderBy(desc(invoicesEnhanced.createdAt));
    return result;
  }),

  /**
   * توليد الفواتير
   * 
   * @procedure generateInvoices
   * @description يولد فواتير لجميع القراءات المعتمدة في فترة فوترة محددة
   * مع حساب قيمة الاستهلاك حسب التعرفة.
   * 
   * @param {object} input - معاملات التوليد
   * @param {number} input.billingPeriodId - معرف فترة الفوترة
   * 
   * @returns {Promise<{success: boolean, invoicesCreated: number}>} نتيجة العملية مع عدد الفواتير
   */
  generateInvoices: publicProcedure.input(z.object({
    billingPeriodId: z.number(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // الحصول على القراءات المعتمدة لهذه الفترة
    const readings = await db.select({
      id: meterReadingsEnhanced.id,
      meterId: meterReadingsEnhanced.meterId,
      customerId: metersEnhanced.customerId,
      previousReading: meterReadingsEnhanced.previousReading,
      currentReading: meterReadingsEnhanced.currentReading,
      consumption: meterReadingsEnhanced.consumption,
      customerCategory: customersEnhanced.category,
      serviceType: metersEnhanced.serviceType,
    }).from(meterReadingsEnhanced)
      .leftJoin(metersEnhanced, eq(meterReadingsEnhanced.meterId, metersEnhanced.id))
      .leftJoin(customersEnhanced, eq(metersEnhanced.customerId, customersEnhanced.id))
      .where(and(
        eq(meterReadingsEnhanced.billingPeriodId, input.billingPeriodId),
        eq(meterReadingsEnhanced.isApproved, true)
      ));
    
    // الحصول على فترة الفوترة
    const [period] = await db.select({
      id: billingPeriods.id,
      code: billingPeriods.code,
      name: billingPeriods.name,
      dueDate: billingPeriods.dueDate,
    }).from(billingPeriods).where(eq(billingPeriods.id, input.billingPeriodId));
    
    // الحصول على التعرفة
    const allTariffs = await db.select({
      id: tariffs.id,
      serviceType: tariffs.serviceType,
      customerCategory: tariffs.customerCategory,
      fromUnit: tariffs.fromUnit,
      toUnit: tariffs.toUnit,
      pricePerUnit: tariffs.pricePerUnit,
    }).from(tariffs).where(eq(tariffs.isActive, true));
    
    let invoicesCreated = 0;
    
    for (const reading of readings) {
      if (!reading.customerId || !reading.meterId) continue;
      
      // حساب قيمة الاستهلاك حسب التعرفة
      const consumption = parseFloat(reading.consumption || "0");
      let consumptionAmount = 0;
      
      // البحث عن التعرفة المناسبة
      const applicableTariffs = allTariffs.filter(t => 
        t.serviceType === reading.serviceType && 
        t.customerCategory === reading.customerCategory
      ).sort((a, b) => a.fromUnit - b.fromUnit);
      
      let remainingConsumption = consumption;
      for (const tariff of applicableTariffs) {
        if (remainingConsumption <= 0) break;
        const unitsInTier = Math.min(remainingConsumption, tariff.toUnit - tariff.fromUnit + 1);
        consumptionAmount += unitsInTier * parseFloat(tariff.pricePerUnit);
        remainingConsumption -= unitsInTier;
      }
      
      // إذا لم توجد تعرفة، استخدم سعر افتراضي
      if (consumptionAmount === 0 && consumption > 0) {
        consumptionAmount = consumption * 0.18; // سعر افتراضي
      }
      
      const totalAmount = consumptionAmount;
      const invoiceNumber = `INV-${period.code}-${Date.now()}`;
      
      await db.insert(invoicesEnhanced).values({
        invoiceNumber,
        customerId: reading.customerId,
        meterId: reading.meterId,
        billingPeriodId: input.billingPeriodId,
        meterReadingId: reading.id,
        previousReading: reading.previousReading,
        currentReading: reading.currentReading,
        consumption: reading.consumption,
        consumptionAmount: consumptionAmount.toFixed(2),
        feesAmount: "0",
        totalAmount: totalAmount.toFixed(2),
        paidAmount: "0",
        remainingAmount: totalAmount.toFixed(2),
        status: "draft",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: period.dueDate,
        isPaid: false,
        isApproved: false,
      });
      
      invoicesCreated++;
    }
    
    return { success: true, invoicesCreated };
  }),

  /**
   * اعتماد الفواتير
   * 
   * @procedure approveInvoices
   * @description يعتمد مجموعة من الفواتير.
   * 
   * @param {object} input - معاملات الاعتماد
   * @param {number[]} input.ids - قائمة معرفات الفواتير
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   */
  approveInvoices: publicProcedure.input(z.object({
    ids: z.array(z.number()),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    for (const id of input.ids) {
      await db.update(invoicesEnhanced).set({ 
        isApproved: true, 
        status: "approved",
      }).where(eq(invoicesEnhanced.id, id));
    }
    return { success: true };
  }),

  /**
   * إرسال الفواتير
   * 
   * @procedure sendInvoices
   * @description يحدث حالة الفواتير إلى "مرسلة".
   * 
   * @param {object} input - معاملات الإرسال
   * @param {number[]} input.ids - قائمة معرفات الفواتير
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   */
  sendInvoices: publicProcedure.input(z.object({
    ids: z.array(z.number()),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    for (const id of input.ids) {
      await db.update(invoicesEnhanced).set({ status: "sent" }).where(eq(invoicesEnhanced.id, id));
    }
    return { success: true };
  }),

  // ==================== المدفوعات ====================
  /**
   * استرجاع قائمة المدفوعات
   * 
   * @procedure getPayments
   * @description يسترجع قائمة المدفوعات مع بيانات العملاء والفواتير.
   * 
   * @returns {Promise<Payment[]>} قائمة المدفوعات
   */
  getPayments: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select({
      id: paymentsEnhanced.id,
      paymentNumber: paymentsEnhanced.paymentNumber,
      customerId: paymentsEnhanced.customerId,
      customerName: customersEnhanced.fullName,
      
      invoiceId: paymentsEnhanced.invoiceId,
      invoiceNumber: invoicesEnhanced.invoiceNo,
      amount: paymentsEnhanced.amount,
      paymentMethodId: paymentsEnhanced.paymentMethodId,
      paymentDate: paymentsEnhanced.paymentDate,
      referenceNumber: paymentsEnhanced.referenceNumber,
      cashboxId: paymentsEnhanced.cashboxId,
      cashboxName: cashboxes.name,
      notes: paymentsEnhanced.notes,
      createdAt: paymentsEnhanced.createdAt,
    }).from(paymentsEnhanced)
      .leftJoin(customersEnhanced, eq(paymentsEnhanced.customerId, customersEnhanced.id))
      .leftJoin(invoicesEnhanced, eq(paymentsEnhanced.invoiceId, invoicesEnhanced.id))
      .leftJoin(cashboxes, eq(paymentsEnhanced.cashboxId, cashboxes.id))
      .orderBy(desc(paymentsEnhanced.createdAt));
    return result;
  }),

  /**
   * تسجيل دفعة جديدة
   * 
   * @procedure createPayment
   * @description يسجل دفعة جديدة مع تحديث رصيد الفاتورة والصندوق وإنشاء إيصال.
   * 
   * @param {object} input - بيانات الدفعة
   * @param {number} input.customerId - معرف العميل
   * @param {number} [input.invoiceId] - معرف الفاتورة
   * @param {string} input.amount - المبلغ
   * @param {string} input.paymentMethod - طريقة الدفع
   * @param {string} input.paymentDate - تاريخ الدفع
   * @param {string} [input.referenceNumber] - رقم المرجع
   * @param {number} [input.cashboxId] - معرف الصندوق
   * @param {number} [input.bankId] - معرف البنك
   * @param {string} [input.notes] - ملاحظات
   * 
   * @returns {Promise<{id: number, receiptNumber: string}>} معرف الدفعة ورقم الإيصال
   */
  createPayment: publicProcedure.input(z.object({
    customerId: z.number(),
    invoiceId: z.number().optional(),
    amount: z.string(),
    paymentMethod: z.enum(["cash", "card", "bank_transfer", "check", "online"]),
    paymentDate: z.string(),
    referenceNumber: z.string().optional(),
    cashboxId: z.number().optional(),
    bankId: z.number().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const receiptNumber = `RCP-${Date.now()}`;
    
    const [result] = await db.insert(paymentsEnhanced).values({
      ...input,
      receiptNumber,
      status: "completed",
    });
    
    // تحديث الفاتورة إذا تم تحديدها
    if (input.invoiceId) {
      const [invoice] = await db.select({
        id: invoicesEnhanced.id,
        paidAmount: invoicesEnhanced.paidAmount,
        totalAmount: invoicesEnhanced.totalAmount,
      }).from(invoicesEnhanced).where(eq(invoicesEnhanced.id, input.invoiceId));
      if (invoice) {
        const newPaidAmount = parseFloat(invoice.paidAmount || "0") + parseFloat(input.amount);
        const newRemainingAmount = parseFloat(invoice.totalAmount) - newPaidAmount;
        const isPaid = newRemainingAmount <= 0;
        
        await db.update(invoicesEnhanced).set({
          paidAmount: newPaidAmount.toFixed(2),
          remainingAmount: Math.max(0, newRemainingAmount).toFixed(2),
          isPaid,
          status: isPaid ? "paid" : "partial",
        }).where(eq(invoicesEnhanced.id, input.invoiceId));
      }
    }
    
    // تحديث رصيد الصندوق
    if (input.cashboxId && input.paymentMethod === "cash") {
      const [cashbox] = await db.select({
        id: cashboxes.id,
        currentBalance: cashboxes.currentBalance,
      }).from(cashboxes).where(eq(cashboxes.id, input.cashboxId));
      if (cashbox) {
        const newBalance = parseFloat(cashbox.currentBalance || "0") + parseFloat(input.amount);
        await db.update(cashboxes).set({ currentBalance: newBalance.toFixed(2) }).where(eq(cashboxes.id, input.cashboxId));
      }
    }
    
    // إنشاء إيصال
    await db.insert(receipts).values({
      receiptNumber,
      paymentId: result.insertId,
      customerId: input.customerId,
      amount: input.amount,
      receiptDate: input.paymentDate,
    });
    
    return { id: result.insertId, receiptNumber };
  }),
});
