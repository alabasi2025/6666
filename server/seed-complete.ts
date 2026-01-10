/**
 * ملف Seed شامل للنظام
 * يحتوي على جميع البيانات الافتراضية المطلوبة:
 * - الأصناف (Items) - قطع الغيار والمواد الاستهلاكية
 * - فئات الأصناف (Item Categories)
 * - التعرفات (Tariffs)
 * - أنواع الرسوم (Fee Types)
 * - طرق الدفع (Payment Methods)
 * - أنواع العدادات (Meter Types)
 * - القطع التابعة (Components)
 * - بيانات ACREL و STS
 */

import { getDb } from "./db";
import { seedMobileApps } from "./seed-mobile-apps";
import { logger } from "./utils/logger";
import { sql } from "drizzle-orm";
import {
  itemCategories,
  items,
  tariffs,
  feeTypes,
  paymentMethods,
  areas,
  squares,
  cabinets,
} from "../drizzle/schema";
import { defectiveComponents } from "../drizzle/schemas/defective-components";
import { businesses } from "../drizzle/schema";

// ============================================
// البيانات الافتراضية
// ============================================

const DEFAULT_SEED_DATA = {
  // فئات الأصناف
  itemCategories: [
    {
      code: "METER_PARTS",
      nameAr: "قطع عدادات",
      nameEn: "Meter Parts",
      parentId: null,
    },
    {
      code: "ACREL_PARTS",
      nameAr: "قطع ACREL",
      nameEn: "ACREL Parts",
      parentId: null,
    },
    {
      code: "STS_PARTS",
      nameAr: "قطع STS",
      nameEn: "STS Parts",
      parentId: null,
    },
    {
      code: "CT_TRANSFORMERS",
      nameAr: "محولات التيار",
      nameEn: "Current Transformers",
      parentId: null,
    },
    {
      code: "CONSUMABLES",
      nameAr: "مواد استهلاكية",
      nameEn: "Consumables",
      parentId: null,
    },
    {
      code: "CABLES",
      nameAr: "كابلات",
      nameEn: "Cables",
      parentId: null,
    },
    {
      code: "CONNECTORS",
      nameAr: "موصلات",
      nameEn: "Connectors",
      parentId: null,
    },
    {
      code: "SAFETY_EQUIPMENT",
      nameAr: "معدات السلامة",
      nameEn: "Safety Equipment",
      parentId: null,
    },
  ],

  // الأصناف (Items)
  items: [
    // قطع عدادات ACREL
    {
      code: "ACREL-ADL200",
      nameAr: "عداد ACREL ADL200",
      nameEn: "ACREL ADL200 Meter",
      type: "spare_part",
      unit: "قطعة",
      categoryCode: "ACREL_PARTS",
      standardCost: "850.00",
      minStock: "5",
      reorderPoint: "10",
      specifications: {
        meterType: "ADL200",
        phaseType: "single",
        customerType: "customer",
        connectionTypes: ["wifi", "rs485", "mqtt"],
        paymentModes: ["postpaid", "prepaid", "credit"],
        supportsMultiTariff: true,
        maxTariffSlots: 8,
        maxCapacity: "100A",
        description: "عداد ACREL ADL200 - Single Phase للمشتركين - يدعم WiFi, RS485, MQTT - يدعم الدفع الآجل والمسبق والائتمان - يدعم التعرفات المتعددة (حتى 8 تعرفات)",
      },
    },
    {
      code: "ACREL-ADW300",
      nameAr: "عداد ACREL ADW300",
      nameEn: "ACREL ADW300 Meter",
      type: "spare_part",
      unit: "قطعة",
      categoryCode: "ACREL_PARTS",
      standardCost: "1200.00",
      minStock: "3",
      reorderPoint: "5",
      specifications: {
        meterType: "ADW300",
        phaseType: "three",
        customerType: "monitoring",
        useCases: ["generators", "cables", "solar", "infrastructure"],
        connectionTypes: ["wifi", "rs485", "mqtt"],
        energyTypes: ["exported", "imported", "total"],
        exportedEnergy: true,
        importedEnergy: true,
        totalEnergy: true,
        ctType: "built_in",
        builtInCTSize: "100A",
        supportsExternalCT: true,
        externalCTOptions: {
          sizes: [100, 150, 200, 250, 300, 400, 600, 800, 1000],
          coreTypes: ["split", "solid"],
          minSize: 100,
          maxSize: 1000,
        },
        temperatureSensors: 4,
        temperatureSensorCount: 4,
        leakageDetection: true,
        breakerStatus: true,
        breakerStatusReadOnly: true,
        description: "عداد ACREL ADW300 - Three Phase للمراقبة - يستخدم للمولدات والكيابل والطاقة الشمسية - يحسب الطاقة المصدرة والمستوردة والإجمالي - 4 حساسات حرارة - كشف التسرب - حالة القاطع (قراءة فقط) - محول تيار مدمج 100A - يدعم محولات خارجية 100-1000A (Split/Solid Core)",
      },
    },
    {
      code: "ACREL-CT-100",
      nameAr: "محول تيار ACREL 100A (مدمج)",
      nameEn: "ACREL Built-in CT 100A",
      type: "spare_part",
      unit: "قطعة",
      categoryCode: "CT_TRANSFORMERS",
      standardCost: "150.00",
      minStock: "10",
      reorderPoint: "20",
      specifications: {
        ctType: "built_in",
        size: "100A",
        coreType: "solid",
      },
    },
    {
      code: "ACREL-CT-EXT-100",
      nameAr: "محول تيار خارجي 100A (Split Core)",
      nameEn: "External CT 100A Split Core",
      type: "spare_part",
      unit: "قطعة",
      categoryCode: "CT_TRANSFORMERS",
      standardCost: "200.00",
      minStock: "10",
      reorderPoint: "20",
      specifications: {
        ctType: "external",
        size: "100A",
        coreType: "split",
      },
    },
    {
      code: "ACREL-CT-EXT-150",
      nameAr: "محول تيار خارجي 150A (Split Core)",
      nameEn: "External CT 150A Split Core",
      type: "spare_part",
      unit: "قطعة",
      categoryCode: "CT_TRANSFORMERS",
      standardCost: "220.00",
      minStock: "5",
      reorderPoint: "10",
      specifications: {
        ctType: "external",
        size: "150A",
        coreType: "split",
        compatibleWith: "ADW300",
        installationType: "split_core",
      },
    },
    {
      code: "ACREL-CT-EXT-200",
      nameAr: "محول تيار خارجي 200A (Split Core)",
      nameEn: "External CT 200A Split Core",
      type: "spare_part",
      unit: "قطعة",
      categoryCode: "CT_TRANSFORMERS",
      standardCost: "250.00",
      minStock: "5",
      reorderPoint: "10",
      specifications: {
        ctType: "external",
        size: "200A",
        coreType: "split",
        compatibleWith: "ADW300",
        installationType: "split_core",
      },
    },
    {
      code: "ACREL-CT-EXT-300",
      nameAr: "محول تيار خارجي 300A (Split Core)",
      nameEn: "External CT 300A Split Core",
      type: "spare_part",
      unit: "قطعة",
      categoryCode: "CT_TRANSFORMERS",
      standardCost: "280.00",
      minStock: "3",
      reorderPoint: "5",
      specifications: {
        ctType: "external",
        size: "300A",
        coreType: "split",
        compatibleWith: "ADW300",
        installationType: "split_core",
      },
    },
    {
      code: "ACREL-CT-EXT-400",
      nameAr: "محول تيار خارجي 400A (Split Core)",
      nameEn: "External CT 400A Split Core",
      type: "spare_part",
      unit: "قطعة",
      categoryCode: "CT_TRANSFORMERS",
      standardCost: "320.00",
      minStock: "3",
      reorderPoint: "5",
      specifications: {
        ctType: "external",
        size: "400A",
        coreType: "split",
        compatibleWith: "ADW300",
        installationType: "split_core",
      },
    },
    {
      code: "ACREL-CT-EXT-600",
      nameAr: "محول تيار خارجي 600A (Split Core)",
      nameEn: "External CT 600A Split Core",
      type: "spare_part",
      unit: "قطعة",
      categoryCode: "CT_TRANSFORMERS",
      standardCost: "380.00",
      minStock: "2",
      reorderPoint: "3",
      specifications: {
        ctType: "external",
        size: "600A",
        coreType: "split",
        compatibleWith: "ADW300",
        installationType: "split_core",
      },
    },
    {
      code: "ACREL-CT-EXT-800",
      nameAr: "محول تيار خارجي 800A (Split Core)",
      nameEn: "External CT 800A Split Core",
      type: "spare_part",
      unit: "قطعة",
      categoryCode: "CT_TRANSFORMERS",
      standardCost: "450.00",
      minStock: "2",
      reorderPoint: "3",
      specifications: {
        ctType: "external",
        size: "800A",
        coreType: "split",
        compatibleWith: "ADW300",
        installationType: "split_core",
      },
    },
    {
      code: "ACREL-CT-EXT-1000",
      nameAr: "محول تيار خارجي 1000A (Split Core)",
      nameEn: "External CT 1000A Split Core",
      type: "spare_part",
      unit: "قطعة",
      categoryCode: "CT_TRANSFORMERS",
      standardCost: "550.00",
      minStock: "1",
      reorderPoint: "2",
      specifications: {
        ctType: "external",
        size: "1000A",
        coreType: "split",
        compatibleWith: "ADW300",
        installationType: "split_core",
      },
    },
    {
      code: "ACREL-CT-EXT-100-SOLID",
      nameAr: "محول تيار خارجي 100A (Solid Core)",
      nameEn: "External CT 100A Solid Core",
      type: "spare_part",
      unit: "قطعة",
      categoryCode: "CT_TRANSFORMERS",
      standardCost: "180.00",
      minStock: "5",
      reorderPoint: "10",
      specifications: {
        ctType: "external",
        size: "100A",
        coreType: "solid",
        compatibleWith: "ADW300",
        installationType: "solid_core",
        description: "محول تيار خارجي 100A - Solid Core - حلقة مغلقة - متوافق مع ADW300",
      },
    },
    {
      code: "ACREL-CT-EXT-200-SOLID",
      nameAr: "محول تيار خارجي 200A (Solid Core)",
      nameEn: "External CT 200A Solid Core",
      type: "spare_part",
      unit: "قطعة",
      categoryCode: "CT_TRANSFORMERS",
      standardCost: "230.00",
      minStock: "3",
      reorderPoint: "5",
      specifications: {
        ctType: "external",
        size: "200A",
        coreType: "solid",
        compatibleWith: "ADW300",
        installationType: "solid_core",
      },
    },
    {
      code: "ACREL-CT-EXT-300-SOLID",
      nameAr: "محول تيار خارجي 300A (Solid Core)",
      nameEn: "External CT 300A Solid Core",
      type: "spare_part",
      unit: "قطعة",
      categoryCode: "CT_TRANSFORMERS",
      standardCost: "260.00",
      minStock: "2",
      reorderPoint: "3",
      specifications: {
        ctType: "external",
        size: "300A",
        coreType: "solid",
        compatibleWith: "ADW300",
        installationType: "solid_core",
      },
    },
    // قطع عدادات STS
    {
      code: "STS-METER-BASIC",
      nameAr: "عداد STS أساسي",
      nameEn: "STS Basic Meter",
      type: "spare_part",
      unit: "قطعة",
      categoryCode: "STS_PARTS",
      standardCost: "650.00",
      minStock: "5",
      reorderPoint: "10",
      specifications: {
        meterType: "STS",
        supportsPrepaid: true,
        supportsPostpaid: true,
        supportsCredit: true,
        supportsMultiTariff: true,
        maxTariffSlots: 8,
      },
    },
    {
      code: "STS-DCSU",
      nameAr: "وحدة DCU لعداد STS",
      nameEn: "STS DCU Unit",
      type: "spare_part",
      unit: "قطعة",
      categoryCode: "STS_PARTS",
      standardCost: "350.00",
      minStock: "10",
      reorderPoint: "20",
      specifications: {
        componentType: "DCU",
        frequency: "RF",
        range: "500m",
        connectionType: "rf",
        supportsMeters: "STS",
        description: "وحدة DCU لعدادات STS - اتصال عبر تردد RF - مدى 500 متر - يربط عدادات STS بالنظام",
      },
    },
    // مواد استهلاكية
    {
      code: "CABLE-2.5",
      nameAr: "كابل 2.5 مم²",
      nameEn: "Cable 2.5mm²",
      type: "consumable",
      unit: "متر",
      categoryCode: "CABLES",
      standardCost: "8.50",
      minStock: "100",
      reorderPoint: "200",
    },
    {
      code: "CABLE-4",
      nameAr: "كابل 4 مم²",
      nameEn: "Cable 4mm²",
      type: "consumable",
      unit: "متر",
      categoryCode: "CABLES",
      standardCost: "12.00",
      minStock: "100",
      reorderPoint: "200",
    },
    {
      code: "CABLE-6",
      nameAr: "كابل 6 مم²",
      nameEn: "Cable 6mm²",
      type: "consumable",
      unit: "متر",
      categoryCode: "CABLES",
      standardCost: "18.00",
      minStock: "50",
      reorderPoint: "100",
    },
    {
      code: "CONNECTOR-SINGLE",
      nameAr: "موصل سنجل فاز",
      nameEn: "Single Phase Connector",
      type: "consumable",
      unit: "قطعة",
      categoryCode: "CONNECTORS",
      standardCost: "15.00",
      minStock: "50",
      reorderPoint: "100",
    },
    {
      code: "CONNECTOR-THREE",
      nameAr: "موصل ثري فاز",
      nameEn: "Three Phase Connector",
      type: "consumable",
      unit: "قطعة",
      categoryCode: "CONNECTORS",
      standardCost: "25.00",
      minStock: "30",
      reorderPoint: "50",
    },
    {
      code: "FUSE-10A",
      nameAr: "فيوز 10 أمبير",
      nameEn: "Fuse 10A",
      type: "consumable",
      unit: "قطعة",
      categoryCode: "CONSUMABLES",
      standardCost: "5.00",
      minStock: "100",
      reorderPoint: "200",
    },
    {
      code: "FUSE-16A",
      nameAr: "فيوز 16 أمبير",
      nameEn: "Fuse 16A",
      type: "consumable",
      unit: "قطعة",
      categoryCode: "CONSUMABLES",
      standardCost: "6.00",
      minStock: "100",
      reorderPoint: "200",
    },
    {
      code: "FUSE-20A",
      nameAr: "فيوز 20 أمبير",
      nameEn: "Fuse 20A",
      type: "consumable",
      unit: "قطعة",
      categoryCode: "CONSUMABLES",
      standardCost: "7.00",
      minStock: "50",
      reorderPoint: "100",
    },
    {
      code: "FUSE-32A",
      nameAr: "فيوز 32 أمبير",
      nameEn: "Fuse 32A",
      type: "consumable",
      unit: "قطعة",
      categoryCode: "CONSUMABLES",
      standardCost: "10.00",
      minStock: "30",
      reorderPoint: "50",
    },
    {
      code: "SAFETY-GLOVES",
      nameAr: "قفازات أمان كهربائية",
      nameEn: "Electrical Safety Gloves",
      type: "consumable",
      unit: "زوج",
      categoryCode: "SAFETY_EQUIPMENT",
      standardCost: "120.00",
      minStock: "10",
      reorderPoint: "20",
    },
    {
      code: "SAFETY-BOOTS",
      nameAr: "أحذية أمان",
      nameEn: "Safety Boots",
      type: "consumable",
      unit: "زوج",
      categoryCode: "SAFETY_EQUIPMENT",
      standardCost: "150.00",
      minStock: "10",
      reorderPoint: "20",
    },
  ],

  // التعرفات (Tariffs)
  tariffs: [
    {
      code: "TAR-RES-BASIC",
      name: "تعرفة سكني أساسي",
      nameEn: "Residential Basic Tariff",
      tariffType: "standard",
      serviceType: "electricity",
      slabs: [
        { from: 0, to: 100, price: 0.15 },
        { from: 101, to: 300, price: 0.18 },
        { from: 301, to: 999999, price: 0.25 },
      ],
      fixedCharge: "5.00",
      isActive: true,
      description: "تعرفة سكني بشرائح متعددة",
    },
    {
      code: "TAR-COM-BASIC",
      name: "تعرفة تجاري أساسي",
      nameEn: "Commercial Basic Tariff",
      tariffType: "standard",
      serviceType: "electricity",
      slabs: [
        { from: 0, to: 500, price: 0.20 },
        { from: 501, to: 999999, price: 0.30 },
      ],
      fixedCharge: "10.00",
      isActive: true,
      description: "تعرفة تجاري بشرائح متعددة",
    },
    {
      code: "TAR-SOLAR-DAY",
      name: "تعرفة الطاقة الشمسية (نهار)",
      nameEn: "Solar Energy Tariff (Day)",
      tariffType: "promotional",
      serviceType: "electricity",
      slabs: [
        { from: 0, to: 999999, price: 0.12 },
      ],
      fixedCharge: "0.00",
      isActive: true,
      description: "تعرفة خاصة للطاقة الشمسية خلال النهار (06:00 - 18:00)",
    },
  ],

  // أنواع الرسوم (Fee Types)
  feeTypes: [
    {
      code: "FEE-CONNECTION",
      name: "رسوم الاتصال",
      nameEn: "Connection Fee",
      feeType: "fixed",
      amount: "100.00",
      isRecurring: false,
      isActive: true,
      description: "رسوم لمرة واحدة عند الاتصال بالخدمة",
    },
    {
      code: "FEE-METER-RENT",
      name: "إيجار العداد",
      nameEn: "Meter Rent",
      feeType: "fixed",
      amount: "10.00",
      isRecurring: true,
      isActive: true,
      description: "إيجار شهري للعداد",
    },
    {
      code: "FEE-LATE",
      name: "رسوم التأخير",
      nameEn: "Late Payment Fee",
      feeType: "fixed",
      amount: "25.00",
      isRecurring: false,
      isActive: true,
      description: "رسوم التأخير في السداد",
    },
    {
      code: "FEE-VAT",
      name: "ضريبة القيمة المضافة",
      nameEn: "VAT",
      feeType: "percentage",
      amount: "15.00",
      isRecurring: false,
      isActive: true,
      description: "ضريبة القيمة المضافة 15%",
    },
    {
      code: "FEE-SERVICE",
      name: "رسوم الخدمة",
      nameEn: "Service Fee",
      feeType: "per_unit",
      amount: "0.05",
      isRecurring: false,
      isActive: true,
      description: "رسوم الخدمة لكل كيلووات ساعة",
    },
  ],

  // طرق الدفع (Payment Methods)
  paymentMethods: [
    {
      code: "CASH",
      name: "نقد",
      nameEn: "Cash",
      isActive: true,
      requiresReference: false,
    },
    {
      code: "BANK-TRANSFER",
      name: "تحويل بنكي",
      nameEn: "Bank Transfer",
      isActive: true,
      requiresReference: true,
    },
    {
      code: "CREDIT-CARD",
      name: "بطاقة ائتمان",
      nameEn: "Credit Card",
      isActive: true,
      requiresReference: true,
    },
    {
      code: "MOBILE-WALLET",
      name: "محفظة إلكترونية",
      nameEn: "Mobile Wallet",
      isActive: true,
      requiresReference: true,
    },
    {
      code: "ONLINE-GATEWAY",
      name: "بوابة دفع إلكترونية",
      nameEn: "Online Payment Gateway",
      isActive: true,
      requiresReference: true,
    },
  ],

  // القطع المعيبة (Defective Components)
  defectiveComponents: [
    {
      componentType: "meter",
      serialNumber: "ACREL-ADL200-001",
      defectReason: "عطل في الشاشة - لا يعرض القراءات",
      defectCategory: "electrical",
      severity: "moderate",
      assessmentStatus: "pending",
      disposition: "pending",
      reportedBy: 1, // ✅ استخدام user ID - يمكن تحديثه عند وجود مستخدم فعلي
    },
    {
      componentType: "meter",
      serialNumber: "ACREL-ADW300-001",
      defectReason: "فشل في الاتصال - لا يستجيب للأوامر",
      defectCategory: "electrical",
      severity: "major",
      assessmentStatus: "pending",
      disposition: "pending",
      reportedBy: 1,
    },
    {
      componentType: "transformer",
      serialNumber: "CT-100-001",
      defectReason: "خطأ في المعايرة - قراءات غير دقيقة",
      defectCategory: "manufacturing",
      severity: "moderate",
      assessmentStatus: "pending",
      disposition: "pending",
      reportedBy: 1,
    },
    {
      componentType: "meter",
      serialNumber: "STS-001",
      defectReason: "فشل في توليد التوكنات",
      defectCategory: "electrical",
      severity: "critical",
      assessmentStatus: "pending",
      disposition: "pending",
      reportedBy: 1,
    },
  ],
};

// ============================================
// وظائف Seed
// ============================================

/**
 * إنشاء فئات الأصناف
 */
async function seedItemCategories(businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  logger.info("[Seed] Creating item categories...");

  const categoryMap = new Map<number, number>();

  for (const category of DEFAULT_SEED_DATA.itemCategories) {
    try {
      try {
        await db.execute(
          sql`INSERT INTO item_categories (business_id, code, name_ar, name_en, parent_id, is_active)
              VALUES (${businessId}, ${category.code}, ${category.nameAr}, ${category.nameEn}, ${category.parentId || null}, true)
              ON CONFLICT (business_id, code) DO UPDATE SET name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en`
        );
      } catch (error: any) {
        // إذا لم يكن هناك constraint، استخدم INSERT فقط
        await db.execute(
          sql`INSERT INTO item_categories (business_id, code, name_ar, name_en, parent_id, is_active)
              VALUES (${businessId}, ${category.code}, ${category.nameAr}, ${category.nameEn}, ${category.parentId || null}, true)
              ON CONFLICT DO NOTHING`
        );
      }

      const categoryResult = await db.execute(
        sql`SELECT id FROM item_categories WHERE business_id = ${businessId} AND code = ${category.code}`
      );
      const categoryId = (categoryResult.rows as any[])[0]?.id;

      if (categoryId) {
        categoryMap.set(category.code as any, categoryId);
        logger.info(`[Seed] ✅ Created category: ${category.nameAr}`);
      }
    } catch (error: any) {
      logger.error(`[Seed] Failed to create category ${category.code}`, { error: error.message });
    }
  }

  return categoryMap;
}

/**
 * إنشاء الأصناف
 */
async function seedItems(businessId: number, categoryMap: Map<string, number>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  logger.info("[Seed] Creating items...");

  for (const item of DEFAULT_SEED_DATA.items) {
    try {
      const categoryId = categoryMap.get(item.categoryCode);
      if (!categoryId) {
        logger.warn(`[Seed] Category not found for item ${item.code}: ${item.categoryCode}`);
        continue;
      }

      try {
        await db.execute(
          sql`INSERT INTO items (
              business_id, category_id, code, name_ar, name_en, type, unit,
              standard_cost, min_stock, reorder_point, specifications, is_active
            )
            VALUES (${businessId}, ${categoryId}, ${item.code}, ${item.nameAr}, ${item.nameEn}, ${item.type}, ${item.unit},
                    ${item.standardCost}, ${item.minStock}, ${item.reorderPoint}, ${JSON.stringify(item.specifications || {})}, true)
            ON CONFLICT (business_id, code) DO UPDATE SET
              name_ar = EXCLUDED.name_ar,
              name_en = EXCLUDED.name_en,
              standard_cost = EXCLUDED.standard_cost,
              min_stock = EXCLUDED.min_stock,
              reorder_point = EXCLUDED.reorder_point,
              specifications = EXCLUDED.specifications`
        );
      } catch (error: any) {
        await db.execute(
          sql`INSERT INTO items (
              business_id, category_id, code, name_ar, name_en, type, unit,
              standard_cost, min_stock, reorder_point, specifications, is_active
            )
            VALUES (${businessId}, ${categoryId}, ${item.code}, ${item.nameAr}, ${item.nameEn}, ${item.type}, ${item.unit},
                    ${item.standardCost}, ${item.minStock}, ${item.reorderPoint}, ${JSON.stringify(item.specifications || {})}, true)
            ON CONFLICT DO NOTHING`
        );
      }

      logger.info(`[Seed] ✅ Created item: ${item.nameAr}`);
    } catch (error: any) {
      logger.error(`[Seed] Failed to create item ${item.code}`, { error: error.message });
    }
  }
}

/**
 * إنشاء التعرفات
 */
async function seedTariffs(businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  logger.info("[Seed] Creating tariffs...");

  for (const tariff of DEFAULT_SEED_DATA.tariffs) {
    try {
      try {
        await db.execute(
          sql`INSERT INTO tariffs (
              business_id, code, name, name_en, tariff_type, service_type,
              slabs, fixed_charge, description, is_active
            )
            VALUES (${businessId}, ${tariff.code}, ${tariff.name}, ${tariff.nameEn}, ${tariff.tariffType}, ${tariff.serviceType},
                    ${JSON.stringify(tariff.slabs)}, ${tariff.fixedCharge}, ${tariff.description || null}, true)
            ON CONFLICT (business_id, code) DO UPDATE SET
              name = EXCLUDED.name,
              name_en = EXCLUDED.name_en,
              slabs = EXCLUDED.slabs,
              fixed_charge = EXCLUDED.fixed_charge`
        );
      } catch (error: any) {
        await db.execute(
          sql`INSERT INTO tariffs (
              business_id, code, name, name_en, tariff_type, service_type,
              slabs, fixed_charge, description, is_active
            )
            VALUES (${businessId}, ${tariff.code}, ${tariff.name}, ${tariff.nameEn}, ${tariff.tariffType}, ${tariff.serviceType},
                    ${JSON.stringify(tariff.slabs)}, ${tariff.fixedCharge}, ${tariff.description || null}, true)
            ON CONFLICT DO NOTHING`
        );
      }

      logger.info(`[Seed] ✅ Created tariff: ${tariff.name}`);
    } catch (error: any) {
      logger.error(`[Seed] Failed to create tariff ${tariff.code}`, { error: error.message });
    }
  }
}

/**
 * إنشاء أنواع الرسوم
 */
async function seedFeeTypes(businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  logger.info("[Seed] Creating fee types...");

  for (const feeType of DEFAULT_SEED_DATA.feeTypes) {
    try {
      try {
        await db.execute(
          sql`INSERT INTO fee_types (
              business_id, code, name, name_en, fee_type, amount,
              is_recurring, description, is_active
            )
            VALUES (${businessId}, ${feeType.code}, ${feeType.name}, ${feeType.nameEn}, ${feeType.feeType}, ${feeType.amount},
                    ${feeType.isRecurring}, ${feeType.description || null}, true)
            ON CONFLICT (business_id, code) DO UPDATE SET
              name = EXCLUDED.name,
              name_en = EXCLUDED.name_en,
              amount = EXCLUDED.amount,
              is_recurring = EXCLUDED.is_recurring`
        );
      } catch (error: any) {
        await db.execute(
          sql`INSERT INTO fee_types (
              business_id, code, name, name_en, fee_type, amount,
              is_recurring, description, is_active
            )
            VALUES (${businessId}, ${feeType.code}, ${feeType.name}, ${feeType.nameEn}, ${feeType.feeType}, ${feeType.amount},
                    ${feeType.isRecurring}, ${feeType.description || null}, true)
            ON CONFLICT DO NOTHING`
        );
      }

      logger.info(`[Seed] ✅ Created fee type: ${feeType.name}`);
    } catch (error: any) {
      logger.error(`[Seed] Failed to create fee type ${feeType.code}`, { error: error.message });
    }
  }
}

/**
 * إنشاء طرق الدفع
 */
async function seedPaymentMethods(businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  logger.info("[Seed] Creating payment methods...");

  for (const paymentMethod of DEFAULT_SEED_DATA.paymentMethods) {
    try {
      await db.execute(
        `INSERT INTO payment_methods_new (
          business_id, code, name, name_en, method_type, is_active
        )
        VALUES (?, ?, ?, ?, ?, true)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          name_en = VALUES(name_en),
          method_type = VALUES(method_type)`,
        [
          businessId,
          paymentMethod.code,
          paymentMethod.name,
          paymentMethod.nameEn,
          paymentMethod.code === "CASH" ? "cash" :
          paymentMethod.code === "CREDIT-CARD" ? "card" :
          paymentMethod.code === "BANK-TRANSFER" ? "bank_transfer" :
          paymentMethod.code === "MOBILE-WALLET" ? "wallet" :
          paymentMethod.code === "ONLINE-GATEWAY" ? "online" : "cash",
        ]
      );

      logger.info(`[Seed] ✅ Created payment method: ${paymentMethod.name}`);
    } catch (error: any) {
      logger.error(`[Seed] Failed to create payment method ${paymentMethod.code}`, { error: error.message });
    }
  }
}

/**
 * إنشاء القطع المعيبة
 */
async function seedDefectiveComponents(businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  logger.info("[Seed] Creating defective components...");

  for (const component of DEFAULT_SEED_DATA.defectiveComponents) {
    try {
      await db.execute(
        sql`INSERT INTO defective_components (
            business_id, component_type, serial_number,
            defect_reason, defect_category, severity,
            assessment_status, disposition, reported_by
          )
          VALUES (${businessId}, ${component.componentType}, ${component.serialNumber}, ${component.defectReason},
                  ${component.defectCategory}, ${component.severity}, ${component.assessmentStatus},
                  ${component.disposition}, ${component.reportedBy})
          ON CONFLICT DO NOTHING`
      );

      logger.info(`[Seed] ✅ Created defective component: ${component.serialNumber}`);
    } catch (error: any) {
      logger.error(`[Seed] Failed to create defective component ${component.code}`, { error: error.message });
    }
  }
}

/**
 * إنشاء بيانات أساسية (مناطق، مربعات، كبائن)
 */
async function seedBasicData(businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  logger.info("[Seed] Creating basic data (areas, squares, cabinets)...");

  // إنشاء منطقة افتراضية
  try {
    await db.execute(
      sql`INSERT INTO areas (business_id, code, name, name_en, is_active)
          VALUES (${businessId}, 'AREA-001', 'المنطقة الرئيسية', 'Main Area', true)
          ON CONFLICT (business_id, code) DO UPDATE SET name = EXCLUDED.name`
    );
  } catch (error: any) {
    await db.execute(
      sql`INSERT INTO areas (business_id, code, name, name_en, is_active)
          VALUES (${businessId}, 'AREA-001', 'المنطقة الرئيسية', 'Main Area', true)
          ON CONFLICT DO NOTHING`
    );
  }
  const areaResult = await db.execute(
    sql`SELECT id FROM areas WHERE business_id = ${businessId} AND code = 'AREA-001'`
  );
  const areaId = (areaResult.rows as any[])[0]?.id;

  if (areaId) {
    // إنشاء مربع افتراضي
    try {
      await db.execute(
        sql`INSERT INTO squares (business_id, area_id, code, name, name_en, is_active)
            VALUES (${businessId}, ${areaId}, 'SQR-001', 'المربع الرئيسي', 'Main Square', true)
            ON CONFLICT (business_id, code) DO UPDATE SET name = EXCLUDED.name`
      );
    } catch (error: any) {
      await db.execute(
        sql`INSERT INTO squares (business_id, area_id, code, name, name_en, is_active)
            VALUES (${businessId}, ${areaId}, 'SQR-001', 'المربع الرئيسي', 'Main Square', true)
            ON CONFLICT DO NOTHING`
      );
    }
    const squareResult = await db.execute(
      sql`SELECT id FROM squares WHERE business_id = ${businessId} AND code = 'SQR-001'`
    );
    const squareId = (squareResult.rows as any[])[0]?.id;

    if (squareId) {
      // إنشاء كابينة افتراضية
      try {
        await db.execute(
          sql`INSERT INTO cabinets (business_id, square_id, code, name, name_en, cabinet_type, is_active)
              VALUES (${businessId}, ${squareId}, 'CAB-001', 'الكابينة الرئيسية', 'Main Cabinet', 'distribution', true)
              ON CONFLICT (business_id, code) DO UPDATE SET name = EXCLUDED.name`
        );
      } catch (error: any) {
        await db.execute(
          sql`INSERT INTO cabinets (business_id, square_id, code, name, name_en, cabinet_type, is_active)
              VALUES (${businessId}, ${squareId}, 'CAB-001', 'الكابينة الرئيسية', 'Main Cabinet', 'distribution', true)
              ON CONFLICT DO NOTHING`
        );
      }

      logger.info("[Seed] ✅ Created basic data (area, square, cabinet)");
    }
  }
}

/**
 * تشغيل جميع عمليات Seed
 */
export async function runCompleteSeed(businessId: number = 1) {
  try {
    logger.info("[Seed] Starting complete database seeding...");

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // التحقق من وجود الشركة
    const businessRows = await db.execute(
      sql`SELECT id FROM businesses WHERE id = ${businessId}`
    );

    if ((businessRows.rows as any[]).length === 0) {
      throw new Error(`Business with ID ${businessId} not found. Please run basic seed first.`);
    }

    // إنشاء فئات الأصناف
    const categoryMap = await seedItemCategories(businessId);

    // إنشاء الأصناف
    await seedItems(businessId, categoryMap);

    // إنشاء التعرفات
    await seedTariffs(businessId);

    // إنشاء أنواع الرسوم
    await seedFeeTypes(businessId);

    // إنشاء طرق الدفع
    await seedPaymentMethods(businessId);

    // إنشاء القطع المعيبة
    await seedDefectiveComponents(businessId);

    // إنشاء البيانات الأساسية
    await seedBasicData(businessId);

    // إنشاء بيانات تطبيقات الجوال
    logger.info("[Seed] Creating mobile apps data...");
    await seedMobileApps(businessId);
    logger.info("[Seed] ✅ Created mobile apps data");

    logger.info("[Seed] ✅ Complete database seeding completed successfully!");

    console.log("\n===========================================");
    console.log("✅ تم إنشاء جميع البيانات الافتراضية بنجاح!");
    console.log("===========================================");
    console.log("📦 البيانات المنشأة:");
    console.log(`   • ${DEFAULT_SEED_DATA.itemCategories.length} فئة أصناف`);
    console.log(`   • ${DEFAULT_SEED_DATA.items.length} صنف (قطع غيار ومواد)`);
    console.log(`   • ${DEFAULT_SEED_DATA.tariffs.length} تعرفة`);
    console.log(`   • ${DEFAULT_SEED_DATA.feeTypes.length} نوع رسوم`);
    console.log(`   • ${DEFAULT_SEED_DATA.paymentMethods.length} طريقة دفع`);
    console.log(`   • ${DEFAULT_SEED_DATA.defectiveComponents.length} قطعة معيبة`);
    console.log("   • منطقة واحدة، مربع واحد، كابينة واحدة");
    console.log("===========================================\n");

    return { success: true };

  } catch (error: any) {
    logger.error("[Seed] Complete database seeding failed", { error: error.message });
    console.error("\n❌ خطأ في إنشاء البيانات:", error);
    return { success: false, error: error.message };
  }
}

/**
 * تشغيل Seed عند استدعاء الملف مباشرة
 */
// ES Module equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed-complete.ts')) {
  const businessId = parseInt(process.argv[2]) || 1;
  runCompleteSeed(businessId)
    .then((result) => {
      if (result.success) {
        console.log("\n✅ تم إنشاء جميع البيانات بنجاح!\n");
        process.exit(0);
      } else {
        console.error("\n❌ فشل إنشاء البيانات!\n");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("\n❌ خطأ:", error);
      process.exit(1);
    });
}


