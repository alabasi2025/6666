import { Pool } from "pg";
import * as dotenv from "dotenv";
import http from "http";

dotenv.config();

async function checkServer() {
  console.log("🔍 التحقق من حالة الخادم...\n");

  // 1. التحقق من الاتصال بقاعدة البيانات
  console.log("1️⃣ التحقق من قاعدة البيانات...");
  const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "774424555",
    database: "666666",
  });

  try {
    await pool.query("SELECT 1");
    console.log("   ✅ قاعدة البيانات متصلة\n");
  } catch (error: any) {
    console.error("   ❌ خطأ في قاعدة البيانات:", error.message);
    await pool.end();
    return;
  }

  // 2. التحقق من الخادم
  console.log("2️⃣ التحقق من الخادم...");
  return new Promise<void>((resolve) => {
    const req = http.get("http://localhost:8000/health", (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log("   ✅ الخادم يعمل بشكل صحيح");
          try {
            const health = JSON.parse(data);
            console.log(`   📊 الحالة: ${health.status}`);
            if (health.database) {
              console.log(`   💾 قاعدة البيانات: ${health.database.status}`);
            }
          } catch (e) {
            console.log("   ⚠️  استجابة غير متوقعة");
          }
        } else {
          console.log(`   ⚠️  الخادم يعمل لكن الحالة: ${res.statusCode}`);
        }
        console.log("");
        pool.end();
        resolve();
      });
    });

    req.on("error", (error: any) => {
      if (error.code === "ECONNREFUSED") {
        console.error("   ❌ الخادم غير متاح على المنفذ 8000");
        console.error("   💡 تأكد من أن الخادم يعمل");
      } else {
        console.error("   ❌ خطأ:", error.message);
      }
      pool.end();
      resolve();
    });

    req.setTimeout(5000, () => {
      console.error("   ⏱️  انتهت مهلة الاتصال");
      req.destroy();
      pool.end();
      resolve();
    });
  });
}

checkServer();

