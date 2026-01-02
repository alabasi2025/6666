/**
 * Create Gemini AI Model in Database
 * إنشاء نموذج Gemini في قاعدة البيانات
 */

import { getDb } from "../server/db.js";
import { aiModels } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

async function createGeminiModel() {
  console.log("🚀 إنشاء نموذج Gemini في قاعدة البيانات...\n");

  try {
    const db = await getDb();
    if (!db) {
      throw new Error("فشل الاتصال بقاعدة البيانات");
    }

    // Check if model already exists
    const existing = await db
      .select()
      .from(aiModels)
      .where(eq(aiModels.code, "gemini-flash-model"))
      .limit(1);

    if (existing.length > 0) {
      console.log("⚠️  النموذج موجود مسبقاً!");
      console.log("📋 معلومات النموذج:", existing[0]);
      return;
    }

    // Create Gemini model
    await db.insert(aiModels).values({
      businessId: 1,
      code: "gemini-flash-model",
      nameAr: "نموذج Gemini Flash",
      nameEn: "Gemini Flash Model",
      description: "نموذج Gemini 2.0 Flash للاستخدام المباشر",
      modelType: "other",
      provider: "gemini",
      modelVersion: "gemini-2.0-flash-exp",
      isActive: true,
      config: JSON.stringify({
        maxTokens: 32768,
        temperature: 0.7,
        supportsImages: true,
        supportsTools: true,
      }),
    });

    // Get the created model
    const [newModel] = await db
      .select()
      .from(aiModels)
      .where(eq(aiModels.code, "gemini-flash-model"))
      .limit(1);

    console.log("✅ تم إنشاء النموذج بنجاح!");
    console.log("📋 معلومات النموذج:");
    console.log("   - ID:", newModel.id);
    console.log("   - الكود:", newModel.code);
    console.log("   - الاسم:", newModel.nameAr);
    console.log("   - المزود:", newModel.provider);
    console.log("   - الإصدار:", newModel.modelVersion);
    console.log("   - الحالة:", newModel.isActive ? "نشط" : "معطل");
    console.log("\n🎉 يمكنك الآن استخدام هذا النموذج في النظام!");

  } catch (error: any) {
    console.error("❌ خطأ:", error.message);
    if (error.sql) {
      console.error("SQL:", error.sql);
    }
    process.exit(1);
  }
}

createGeminiModel().catch(console.error);

