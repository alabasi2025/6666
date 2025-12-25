// Field Operations Dashboard Stats
export async function getFieldOperationsDashboardStats(businessId: number) {
  const db = await getDb();
  if (!db) return {
    totalOperations: 0,
    scheduledOperations: 0,
    inProgressOperations: 0,
    completedOperations: 0,
    totalTeams: 0,
    activeTeams: 0,
    totalWorkers: 0,
    availableWorkers: 0,
    totalEquipment: 0,
    availableEquipment: 0,
  };

  const [
    totalOps,
    scheduledOps,
    inProgressOps,
    completedOps,
    totalTeams,
    activeTeams,
    totalWorkers,
    availableWorkers,
    totalEquip,
    availableEquip,
  ] = await Promise.all([
    db.select({ count: count() }).from(fieldOperations).where(eq(fieldOperations.businessId, businessId)),
    db.select({ count: count() }).from(fieldOperations).where(and(eq(fieldOperations.businessId, businessId), eq(fieldOperations.status, 'scheduled'))),
    db.select({ count: count() }).from(fieldOperations).where(and(eq(fieldOperations.businessId, businessId), eq(fieldOperations.status, 'in_progress'))),
    db.select({ count: count() }).from(fieldOperations).where(and(eq(fieldOperations.businessId, businessId), eq(fieldOperations.status, 'completed'))),
    db.select({ count: count() }).from(fieldTeams).where(eq(fieldTeams.businessId, businessId)),
    db.select({ count: count() }).from(fieldTeams).where(and(eq(fieldTeams.businessId, businessId), eq(fieldTeams.status, 'active'))),
    db.select({ count: count() }).from(fieldWorkers).where(eq(fieldWorkers.businessId, businessId)),
    db.select({ count: count() }).from(fieldWorkers).where(and(eq(fieldWorkers.businessId, businessId), eq(fieldWorkers.status, 'available'))),
    db.select({ count: count() }).from(fieldEquipment).where(eq(fieldEquipment.businessId, businessId)),
    db.select({ count: count() }).from(fieldEquipment).where(and(eq(fieldEquipment.businessId, businessId), eq(fieldEquipment.status, 'available'))),
  ]);

  return {
    totalOperations: totalOps[0]?.count || 0,
    scheduledOperations: scheduledOps[0]?.count || 0,
    inProgressOperations: inProgressOps[0]?.count || 0,
    completedOperations: completedOps[0]?.count || 0,
    totalTeams: totalTeams[0]?.count || 0,
    activeTeams: activeTeams[0]?.count || 0,
    totalWorkers: totalWorkers[0]?.count || 0,
    availableWorkers: availableWorkers[0]?.count || 0,
    totalEquipment: totalEquip[0]?.count || 0,
    availableEquipment: availableEquip[0]?.count || 0,
  };
}

// Seed Demo Data - بيانات تجريبية للمستأجرين
export async function seedDemoTenants() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if demo data already exists
  const existingBusinesses = await db.select({ id: businesses.id }).from(businesses).limit(1);
  if (existingBusinesses.length > 0) {
    return { message: "Demo data already exists" };
  }

  // Create two tenant businesses
  const [business1Result] = await db.insert(businesses).values({
    code: "ELEC-001",
    nameAr: "شركة الكهرباء الوطنية",
    nameEn: "National Electricity Company",
    type: "holding",
    currency: "SAR",
    isActive: true,
  });
  const business1Id = business1Result.insertId;

  const [business2Result] = await db.insert(businesses).values({
    code: "SOLAR-001",
    nameAr: "شركة الطاقة الشمسية",
    nameEn: "Solar Energy Company",
    type: "subsidiary",
    currency: "SAR",
    isActive: true,
  });
  const business2Id = business2Result.insertId;

  // Create branches for each business
  await db.insert(branches).values([
    { businessId: business1Id, code: "BR-RYD", nameAr: "فرع الرياض", nameEn: "Riyadh Branch", type: "main", city: "الرياض" },
    { businessId: business1Id, code: "BR-JED", nameAr: "فرع جدة", nameEn: "Jeddah Branch", type: "regional", city: "جدة" },
    { businessId: business2Id, code: "BR-DMM", nameAr: "فرع الدمام", nameEn: "Dammam Branch", type: "main", city: "الدمام" },
  ]);

  // Create field teams
  await db.insert(fieldTeams).values([
    { businessId: business1Id, code: "TEAM-001", nameAr: "فريق التركيبات", nameEn: "Installation Team", teamType: "installation", status: "active" },
    { businessId: business1Id, code: "TEAM-002", nameAr: "فريق الصيانة", nameEn: "Maintenance Team", teamType: "maintenance", status: "active" },
    { businessId: business2Id, code: "TEAM-003", nameAr: "فريق الفحص", nameEn: "Inspection Team", teamType: "inspection", status: "active" },
  ]);

  // Create field workers
  await db.insert(fieldWorkers).values([
    { businessId: business1Id, employeeNumber: "EMP-001", nameAr: "أحمد محمد", nameEn: "Ahmed Mohammed", phone: "0501234567", workerType: "technician", status: "available", teamId: 1 },
    { businessId: business1Id, employeeNumber: "EMP-002", nameAr: "خالد علي", nameEn: "Khaled Ali", phone: "0507654321", workerType: "engineer", status: "available", teamId: 1 },
    { businessId: business1Id, employeeNumber: "EMP-003", nameAr: "محمد سعيد", nameEn: "Mohammed Saeed", phone: "0509876543", workerType: "technician", status: "busy", teamId: 2 },
    { businessId: business2Id, employeeNumber: "EMP-004", nameAr: "عبدالله فهد", nameEn: "Abdullah Fahd", phone: "0502345678", workerType: "supervisor", status: "available", teamId: 3 },
  ]);

  // Create field equipment
  await db.insert(fieldEquipment).values([
    { businessId: business1Id, equipmentCode: "EQ-001", nameAr: "جهاز قياس الجهد", nameEn: "Voltage Meter", equipmentType: "measuring", status: "available" },
    { businessId: business1Id, equipmentCode: "EQ-002", nameAr: "سيارة خدمة", nameEn: "Service Vehicle", equipmentType: "vehicle", status: "in_use" },
    { businessId: business2Id, equipmentCode: "EQ-003", nameAr: "معدات السلامة", nameEn: "Safety Equipment", equipmentType: "safety", status: "available" },
  ]);

  // Create sample field operations
  await db.insert(fieldOperations).values([
    { 
      businessId: business1Id, 
      operationNumber: "OP-2024-001", 
      operationType: "installation", 
      status: "scheduled",
      priority: "high",
      title: "تركيب عداد ذكي - حي النخيل",
      description: "تركيب عداد ذكي جديد للعميل رقم 1234",
      address: "حي النخيل، شارع الملك فهد",
      scheduledDate: new Date(),
      assignedTeamId: 1,
      assignedWorkerId: 1,
      estimatedDuration: 60,
    },
    { 
      businessId: business1Id, 
      operationNumber: "OP-2024-002", 
      operationType: "maintenance", 
      status: "in_progress",
      priority: "urgent",
      title: "صيانة طارئة - محطة التحويل",
      description: "إصلاح عطل في محطة التحويل الرئيسية",
      address: "محطة التحويل الرئيسية",
      scheduledDate: new Date(),
      assignedTeamId: 2,
      assignedWorkerId: 3,
      estimatedDuration: 120,
      startedAt: new Date(),
    },
    { 
      businessId: business2Id, 
      operationNumber: "OP-2024-003", 
      operationType: "inspection", 
      status: "scheduled",
      priority: "medium",
      title: "فحص دوري - الألواح الشمسية",
      description: "فحص دوري للألواح الشمسية في المشروع رقم 5",
      address: "مشروع الطاقة الشمسية - الدمام",
      scheduledDate: new Date(),
      assignedTeamId: 3,
      assignedWorkerId: 4,
      estimatedDuration: 180,
    },
  ]);

  return { 
    message: "Demo data created successfully",
    businesses: [
      { id: business1Id, name: "شركة الكهرباء الوطنية" },
      { id: business2Id, name: "شركة الطاقة الشمسية" },
    ]
  };
}

