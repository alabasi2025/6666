// ============================================
// Inventory Extended Functions
// ============================================

export async function getWarehouses(businessId: number, filters?: any) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(warehouses.businessId, businessId), eq(warehouses.isActive, true)];
  if (filters?.branchId) conditions.push(eq(warehouses.branchId, filters.branchId));
  if (filters?.type) conditions.push(eq(warehouses.type, filters.type as any));
  
  return await db.select({
    id: warehouses.id,
    businessId: warehouses.businessId,
    branchId: warehouses.branchId,
    code: warehouses.code,
    nameAr: warehouses.nameAr,
    nameEn: warehouses.nameEn,
    type: warehouses.type,
    isActive: warehouses.isActive,
  }).from(warehouses)
    .where(and(...conditions))
    .orderBy(asc(warehouses.nameAr));
}

export async function getWarehouseById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select({
    id: warehouses.id,
    businessId: warehouses.businessId,
    branchId: warehouses.branchId,
    code: warehouses.code,
    nameAr: warehouses.nameAr,
    nameEn: warehouses.nameEn,
    type: warehouses.type,
    address: warehouses.address,
    managerId: warehouses.managerId,
    isActive: warehouses.isActive,
    createdAt: warehouses.createdAt,
  }).from(warehouses).where(eq(warehouses.id, id));
  return result || null;
}

export async function createWarehouse(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(warehouses).values(data);
  return result[0].insertId;
}

export async function updateWarehouse(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(warehouses).set(data).where(eq(warehouses.id, id));
}

export async function deleteWarehouse(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(warehouses).set({ isActive: false }).where(eq(warehouses.id, id));
}

export async function getItemCategories(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: itemCategories.id,
    businessId: itemCategories.businessId,
    code: itemCategories.code,
    nameAr: itemCategories.nameAr,
    nameEn: itemCategories.nameEn,
    parentId: itemCategories.parentId,
    isActive: itemCategories.isActive,
  }).from(itemCategories)
    .where(and(eq(itemCategories.businessId, businessId), eq(itemCategories.isActive, true)))
    .orderBy(asc(itemCategories.code));
}

export async function createItemCategory(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(itemCategories).values(data);
  return result[0].insertId;
}

export async function updateItemCategory(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(itemCategories).set(data).where(eq(itemCategories.id, id));
}

export async function deleteItemCategory(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(itemCategories).set({ isActive: false }).where(eq(itemCategories.id, id));
}

export async function getItemById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select({
    id: items.id,
    businessId: items.businessId,
    code: items.code,
    nameAr: items.nameAr,
    nameEn: items.nameEn,
    categoryId: items.categoryId,
    itemType: items.itemType,
    unit: items.unit,
    purchasePrice: items.purchasePrice,
    sellingPrice: items.sellingPrice,
    minStock: items.minStock,
    maxStock: items.maxStock,
    reorderPoint: items.reorderPoint,
    isActive: items.isActive,
    createdAt: items.createdAt,
  }).from(items).where(eq(items.id, id));
  return result || null;
}

export async function updateItem(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(items).set(data).where(eq(items.id, id));
}

export async function deleteItem(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(items).set({ isActive: false }).where(eq(items.id, id));
}

export async function getStockBalances(filters: any) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions: any[] = [];
  if (filters.warehouseId) conditions.push(eq(stockBalances.warehouseId, filters.warehouseId));
  if (filters.itemId) conditions.push(eq(stockBalances.itemId, filters.itemId));
  
  const query = db.select({
    id: stockBalances.id,
    itemId: stockBalances.itemId,
    warehouseId: stockBalances.warehouseId,
    quantity: stockBalances.quantity,
    reservedQty: stockBalances.reservedQty,
    availableQty: stockBalances.availableQty,
    averageCost: stockBalances.averageCost,
    totalValue: stockBalances.totalValue,
    itemCode: items.code,
    itemName: items.nameAr,
    warehouseName: warehouses.nameAr,
  })
    .from(stockBalances)
    .leftJoin(items, eq(stockBalances.itemId, items.id))
    .leftJoin(warehouses, eq(stockBalances.warehouseId, warehouses.id));
  
  if (conditions.length > 0) {
    return await query.where(and(...conditions));
  }
  
  return await query;
}

export async function getStockBalancesByItem(itemId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: stockBalances.id,
    itemId: stockBalances.itemId,
    warehouseId: stockBalances.warehouseId,
    quantity: stockBalances.quantity,
    reservedQty: stockBalances.reservedQty,
    availableQty: stockBalances.availableQty,
    averageCost: stockBalances.averageCost,
    totalValue: stockBalances.totalValue,
  }).from(stockBalances).where(eq(stockBalances.itemId, itemId));
}

export async function getStockBalancesByWarehouse(warehouseId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: stockBalances.id,
    itemId: stockBalances.itemId,
    warehouseId: stockBalances.warehouseId,
    quantity: stockBalances.quantity,
    reservedQty: stockBalances.reservedQty,
    availableQty: stockBalances.availableQty,
    averageCost: stockBalances.averageCost,
    totalValue: stockBalances.totalValue,
  }).from(stockBalances).where(eq(stockBalances.warehouseId, warehouseId));
}

export async function getStockMovements(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(stockMovements.businessId, businessId)];
  if (filters.warehouseId) conditions.push(eq(stockMovements.warehouseId, filters.warehouseId));
  if (filters.itemId) conditions.push(eq(stockMovements.itemId, filters.itemId));
  if (filters.movementType) conditions.push(eq(stockMovements.movementType, filters.movementType as any));
  
  return await db.select({
    id: stockMovements.id,
    businessId: stockMovements.businessId,
    itemId: stockMovements.itemId,
    warehouseId: stockMovements.warehouseId,
    movementType: stockMovements.movementType,
    quantity: stockMovements.quantity,
    balanceBefore: stockMovements.balanceBefore,
    balanceAfter: stockMovements.balanceAfter,
    movementDate: stockMovements.movementDate,
    createdAt: stockMovements.createdAt,
  }).from(stockMovements)
    .where(and(...conditions))
    .orderBy(desc(stockMovements.movementDate))
    .limit(filters.limit || 100);
}

export async function createStockMovement(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get current balance
  const [currentBalance] = await db.select({
    id: stockBalances.id,
    quantity: stockBalances.quantity,
    averageCost: stockBalances.averageCost,
  }).from(stockBalances)
    .where(and(eq(stockBalances.itemId, data.itemId), eq(stockBalances.warehouseId, data.warehouseId)));
  
  const balanceBefore = currentBalance ? parseFloat(currentBalance.quantity || "0") : 0;
  const quantity = parseFloat(data.quantity);
  
  let balanceAfter: number;
  if (["receipt", "transfer_in", "adjustment_in", "return"].includes(data.movementType)) {
    balanceAfter = balanceBefore + quantity;
  } else {
    balanceAfter = balanceBefore - quantity;
  }
  
  // Insert movement
  const result = await db.insert(stockMovements).values({
    ...data,
    balanceBefore: balanceBefore.toFixed(3),
    balanceAfter: balanceAfter.toFixed(3),
  });
  
  // Update or create stock balance
  if (currentBalance) {
    await db.update(stockBalances).set({
      quantity: balanceAfter.toFixed(3),
      availableQty: balanceAfter.toFixed(3),
      lastMovementDate: new Date(),
    }).where(eq(stockBalances.id, currentBalance.id));
  } else {
    await db.insert(stockBalances).values({
      itemId: data.itemId,
      warehouseId: data.warehouseId,
      quantity: balanceAfter.toFixed(3),
      availableQty: balanceAfter.toFixed(3),
      lastMovementDate: new Date(),
    });
  }
  
  return result[0].insertId;
}

export async function transferStock(data: { businessId: number; itemId: number; fromWarehouseId: number; toWarehouseId: number; quantity: string; notes?: string; userId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = new Date().toISOString();
  
  // Create transfer out movement
  await createStockMovement({
    businessId: data.businessId,
    itemId: data.itemId,
    warehouseId: data.fromWarehouseId,
    movementType: "transfer_out",
    movementDate: now,
    quantity: data.quantity,
    notes: data.notes,
    createdBy: data.userId,
  });
  
  // Create transfer in movement
  await createStockMovement({
    businessId: data.businessId,
    itemId: data.itemId,
    warehouseId: data.toWarehouseId,
    movementType: "transfer_in",
    movementDate: now,
    quantity: data.quantity,
    notes: data.notes,
    createdBy: data.userId,
  });
  
  return { success: true };
}

export async function adjustStock(data: { businessId: number; itemId: number; warehouseId: number; adjustmentType: string; quantity: string; reason?: string; userId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const movementType = data.adjustmentType === "in" ? "adjustment_in" : "adjustment_out";
  
  return await createStockMovement({
    businessId: data.businessId,
    itemId: data.itemId,
    warehouseId: data.warehouseId,
    movementType,
    movementDate: new Date().toISOString(),
    quantity: data.quantity,
    notes: data.reason,
    createdBy: data.userId,
  });
}

export async function getSupplierById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select({
    id: suppliers.id,
    businessId: suppliers.businessId,
    code: suppliers.code,
    nameAr: suppliers.nameAr,
    nameEn: suppliers.nameEn,
    phone: suppliers.phone,
    email: suppliers.email,
    address: suppliers.address,
    taxNumber: suppliers.taxNumber,
    isActive: suppliers.isActive,
    createdAt: suppliers.createdAt,
  }).from(suppliers).where(eq(suppliers.id, id));
  return result || null;
}

export async function updateSupplier(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(suppliers).set(data).where(eq(suppliers.id, id));
}

export async function deleteSupplier(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(suppliers).set({ isActive: false }).where(eq(suppliers.id, id));
}

export async function getPurchaseOrders(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(purchaseOrders.businessId, businessId)];
  if (filters.supplierId) conditions.push(eq(purchaseOrders.supplierId, filters.supplierId));
  if (filters.status) conditions.push(eq(purchaseOrders.status, filters.status as any));
  
  return await db.select({
    id: purchaseOrders.id,
    businessId: purchaseOrders.businessId,
    orderNumber: purchaseOrders.orderNumber,
    supplierId: purchaseOrders.supplierId,
    orderDate: purchaseOrders.orderDate,
    status: purchaseOrders.status,
    totalAmount: purchaseOrders.totalAmount,
    createdAt: purchaseOrders.createdAt,
  }).from(purchaseOrders)
    .where(and(...conditions))
    .orderBy(desc(purchaseOrders.orderDate))
    .limit(filters.limit || 100);
}

export async function getPurchaseOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select({
    id: purchaseOrders.id,
    businessId: purchaseOrders.businessId,
    orderNumber: purchaseOrders.orderNumber,
    supplierId: purchaseOrders.supplierId,
    warehouseId: purchaseOrders.warehouseId,
    orderDate: purchaseOrders.orderDate,
    expectedDate: purchaseOrders.expectedDate,
    status: purchaseOrders.status,
    subtotal: purchaseOrders.subtotal,
    taxAmount: purchaseOrders.taxAmount,
    discountAmount: purchaseOrders.discountAmount,
    totalAmount: purchaseOrders.totalAmount,
    notes: purchaseOrders.notes,
    createdBy: purchaseOrders.createdBy,
    createdAt: purchaseOrders.createdAt,
  }).from(purchaseOrders).where(eq(purchaseOrders.id, id));
  return result || null;
}

export async function createPurchaseOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { items: orderItems, ...orderData } = data;
  
  // Generate order number
  const orderNumber = `PO-${Date.now()}`;
  
  // Calculate totals
  let subtotal = 0;
  let taxAmount = 0;
  
  for (const item of orderItems) {
    const lineTotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);
    const lineTax = lineTotal * (parseFloat(item.taxRate || "0") / 100);
    subtotal += lineTotal;
    taxAmount += lineTax;
  }
  
  const totalAmount = subtotal + taxAmount - parseFloat(orderData.discountAmount || "0");
  
  const result = await db.insert(purchaseOrders).values({
    ...orderData,
    orderNumber,
    subtotal: subtotal.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
    status: "draft",
  });
  
  return result[0].insertId;
}

export async function updatePurchaseOrderStatus(id: number, status: string, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { status };
  
  if (status === "approved") {
    updateData.approvedBy = userId;
    updateData.approvedAt = new Date();
  }
  
  await db.update(purchaseOrders).set(updateData).where(eq(purchaseOrders.id, id));
}

export async function receivePurchaseOrder(data: { id: number; items: any[]; warehouseId: number; notes?: string; userId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [order] = await db.select({
    id: purchaseOrders.id,
    businessId: purchaseOrders.businessId,
    orderNumber: purchaseOrders.orderNumber,
  }).from(purchaseOrders).where(eq(purchaseOrders.id, data.id));
  if (!order) throw new Error("أمر الشراء غير موجود");
  
  // Create stock movements for received items
  for (const item of data.items) {
    await createStockMovement({
      businessId: order.businessId,
      itemId: item.itemId,
      warehouseId: data.warehouseId,
      movementType: "receipt",
      movementDate: new Date().toISOString(),
      documentType: "purchase_order",
      documentId: data.id,
      documentNumber: order.orderNumber,
      quantity: item.receivedQty,
      notes: data.notes,
      createdBy: data.userId,
    });
  }
  
  // Update order status
  await db.update(purchaseOrders).set({ status: "received" }).where(eq(purchaseOrders.id, data.id));
}

export async function getInventoryDashboardStats(businessId: number) {
  const db = await getDb();
  if (!db) return { totalItems: 0, totalWarehouses: 0, lowStockItems: 0, totalValue: 0 };
  
  const [totalItems] = await db.select({ count: count() }).from(items).where(eq(items.businessId, businessId));
  const [totalWarehouses] = await db.select({ count: count() }).from(warehouses).where(eq(warehouses.businessId, businessId));
  const [totalValue] = await db.select({ total: sql<number>`COALESCE(SUM(total_value), 0)` }).from(stockBalances);
  
  return {
    totalItems: totalItems?.count || 0,
    totalWarehouses: totalWarehouses?.count || 0,
    lowStockItems: 0, // See GitHub Issue #5
    totalValue: totalValue?.total || 0,
  };
}
