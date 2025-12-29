/**
 * Test Gemini Integration
 * اختبار تكامل Gemini
 */

import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

// Import after dotenv loads
import { invokeLLM } from "../server/_core/llm.js";

async function testGemini() {
  console.log("🧪 بدء اختبار Gemini...\n");

  // Check if API key is configured
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("🔑 API Key موجود:", apiKey ? `${apiKey.substring(0, 20)}...` : "غير موجود");
  
  if (!apiKey) {
    console.error("❌ خطأ: GEMINI_API_KEY غير موجود في ملف .env");
    console.log("\n📝 أضف السطر التالي في ملف .env:");
    console.log("GEMINI_API_KEY=your_api_key_here");
    process.exit(1);
  }

  console.log("✅ GEMINI_API_KEY موجود\n");

  try {
    // Test 1: Basic chat
    console.log("📝 الاختبار 1: محادثة أساسية");
    console.log("السؤال: 'مرحبا، ما هو اسمك؟'");
    
    const result1 = await invokeLLM({
      messages: [
        {
          role: "user",
          content: "مرحبا، ما هو اسمك؟"
        }
      ],
      provider: "gemini",
      model: "gemini-2.0-flash-exp"
    });

    const response1 = typeof result1.choices[0].message.content === "string"
      ? result1.choices[0].message.content
      : result1.choices[0].message.content[0]?.text || "لا يوجد رد";

    console.log("✅ الرد:", response1);
    console.log("📊 الاستخدام:", result1.usage);
    console.log("");

    // Test 2: Arabic question
    console.log("📝 الاختبار 2: سؤال بالعربية");
    console.log("السؤال: 'اشرح لي ما هو الذكاء الاصطناعي باختصار'");
    
    const result2 = await invokeLLM({
      messages: [
        {
          role: "user",
          content: "اشرح لي ما هو الذكاء الاصطناعي باختصار"
        }
      ],
      provider: "gemini"
    });

    const response2 = typeof result2.choices[0].message.content === "string"
      ? result2.choices[0].message.content
      : result2.choices[0].message.content[0]?.text || "لا يوجد رد";

    console.log("✅ الرد:", response2.substring(0, 200) + "...");
    console.log("📊 الاستخدام:", result2.usage);
    console.log("");

    // Test 3: JSON Schema response
    console.log("📝 الاختبار 3: استجابة بصيغة JSON Schema");
    console.log("السؤال: 'أعطني معلومات عن مدينة الرياض'");
    
    const result3 = await invokeLLM({
      messages: [
        {
          role: "user",
          content: "أعطني معلومات عن مدينة الرياض"
        }
      ],
      provider: "gemini",
      responseFormat: {
        type: "json_schema",
        json_schema: {
          name: "city_info",
          schema: {
            type: "object",
            properties: {
              name: { type: "string", description: "اسم المدينة" },
              country: { type: "string", description: "البلد" },
              population: { type: "number", description: "عدد السكان" },
              description: { type: "string", description: "وصف المدينة" }
            },
            required: ["name", "country"]
          }
        }
      }
    });

    const response3 = typeof result3.choices[0].message.content === "string"
      ? result3.choices[0].message.content
      : result3.choices[0].message.content[0]?.text || "{}";

    console.log("✅ الرد (JSON):", response3);
    console.log("📊 الاستخدام:", result3.usage);
    console.log("");

    console.log("🎉 جميع الاختبارات نجحت!");
    console.log("\n✅ Gemini يعمل بشكل صحيح في النظام");

  } catch (error: any) {
    console.error("❌ خطأ في الاختبار:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

// Run the test
testGemini().catch(console.error);

