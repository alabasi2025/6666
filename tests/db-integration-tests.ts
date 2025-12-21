/**
 * Database Integration Tests for All New Routers
 * اختبارات التكامل المباشرة على قاعدة البيانات
 * 
 * هذا الملف يختبر دوال قاعدة البيانات مباشرة
 */

import * as db from '../server/db';

interface TestResult {
  module: string;
  function: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  executionTime: number;
  data?: any;
}

const results: TestResult[] = [];

function addResult(module: string, func: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, time: number, data?: any) {
  results.push({ module, function: func, status, message, executionTime: time, data });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${icon} [${module}] ${func} - ${message} (${time}ms)`);
}

async function testFunction(module: string, funcName: string, fn: () => Promise<any>) {
  const start = Date.now();
  try {
    const result = await fn();
    const time = Date.now() - start;
    addResult(module, funcName, 'PASS', 'Success', time, result);
    return result;
  } catch (error: any) {
    const time = Date.now() - start;
    addResult(module, funcName, 'FAIL', error.message || 'Unknown error', time);
    return null;
  }
}

// ============================================
// Assets Module Tests
// ============================================
async function testAssetsModule() {
  console.log('\n📦 Testing Assets Module...\n');
  
  // Test getAssets
  await testFunction('assets', 'getAssets', () => db.getAssets(1, {}));
  
  // Test getAssetCategories
  await testFunction('assets', 'getAssetCategories', () => db.getAssetCategories(1));
  
  // Test createAsset
  const assetId = await testFunction('assets', 'createAsset', () => 
    db.createAsset({
      businessId: 1,
      code: `AST-TEST-${Date.now()}`,
      nameAr: 'أصل اختبار',
      categoryId: 1,
      status: 'active',
    })
  );
  
  // Test getAssetById
  if (assetId) {
    await testFunction('assets', 'getAssetById', () => db.getAssetById(assetId));
    
    // Test updateAsset
    await testFunction('assets', 'updateAsset', () => 
      db.updateAsset(assetId, { nameAr: 'أصل اختبار محدث' })
    );
    
    // Test deleteAsset
    await testFunction('assets', 'deleteAsset', () => db.deleteAsset(assetId));
  }
  
  // Test getAssetMovements
  await testFunction('assets', 'getAssetMovements', () => db.getAssetMovements({ businessId: 1 }));
  
  // Test getAssetDashboardStats
  await testFunction('assets', 'getAssetDashboardStats', () => db.getAssetDashboardStats(1));
}

// ============================================
// Accounting Module Tests
// ============================================
async function testAccountingModule() {
  console.log('\n📊 Testing Accounting Module...\n');
  
  // Test getAccounts
  await testFunction('accounting', 'getAccounts', () => db.getAccounts(1));
  
  // Test createAccount
  const accountId = await testFunction('accounting', 'createAccount', () => 
    db.createAccount({
      businessId: 1,
      code: `ACC-TEST-${Date.now()}`,
      nameAr: 'حساب اختبار',
      type: 'asset',
      isActive: true,
    })
  );
  
  // Test getAccountById
  if (accountId) {
    await testFunction('accounting', 'getAccountById', () => db.getAccountById(accountId));
    
    // Test updateAccount
    await testFunction('accounting', 'updateAccount', () => 
      db.updateAccount(accountId, { nameAr: 'حساب اختبار محدث' })
    );
    
    // Test deleteAccount
    await testFunction('accounting', 'deleteAccount', () => db.deleteAccount(accountId));
  }
  
  // Test getJournalEntries
  await testFunction('accounting', 'getJournalEntries', () => db.getJournalEntries(1));
  
  // Test getTrialBalance
  await testFunction('accounting', 'getTrialBalance', () => db.getTrialBalance(1));
  
  // Test getIncomeStatement
  await testFunction('accounting', 'getIncomeStatement', () => db.getIncomeStatement(1));
  
  // Test getBalanceSheet
  await testFunction('accounting', 'getBalanceSheet', () => db.getBalanceSheet(1));
  
  // Test getFiscalPeriods
  await testFunction('accounting', 'getFiscalPeriods', () => db.getFiscalPeriods(1));
  
  // Test getCostCenters
  await testFunction('accounting', 'getCostCenters', () => db.getCostCenters(1));
}

// ============================================
// Inventory Module Tests
// ============================================
async function testInventoryModule() {
  console.log('\n📦 Testing Inventory Module...\n');
  
  // Test getInventoryItems
  await testFunction('inventory', 'getInventoryItems', () => db.getInventoryItems(1));
  
  // Test createInventoryItem
  const itemId = await testFunction('inventory', 'createInventoryItem', () => 
    db.createInventoryItem({
      businessId: 1,
      code: `ITM-TEST-${Date.now()}`,
      nameAr: 'صنف اختبار',
      unit: 'قطعة',
    })
  );
  
  // Test getInventoryItemById
  if (itemId) {
    await testFunction('inventory', 'getInventoryItemById', () => db.getInventoryItemById(itemId));
    
    // Test updateInventoryItem
    await testFunction('inventory', 'updateInventoryItem', () => 
      db.updateInventoryItem(itemId, { nameAr: 'صنف اختبار محدث' })
    );
    
    // Test deleteInventoryItem
    await testFunction('inventory', 'deleteInventoryItem', () => db.deleteInventoryItem(itemId));
  }
  
  // Test getWarehouses
  await testFunction('inventory', 'getWarehouses', () => db.getWarehouses(1));
  
  // Test createWarehouse
  const warehouseId = await testFunction('inventory', 'createWarehouse', () => 
    db.createWarehouse({
      businessId: 1,
      code: `WH-TEST-${Date.now()}`,
      nameAr: 'مستودع اختبار',
    })
  );
  
  if (warehouseId) {
    await testFunction('inventory', 'getWarehouseById', () => db.getWarehouseById(warehouseId));
    await testFunction('inventory', 'deleteWarehouse', () => db.deleteWarehouse(warehouseId));
  }
  
  // Test getInventoryCategories
  await testFunction('inventory', 'getInventoryCategories', () => db.getInventoryCategories(1));
  
  // Test getInventoryMovements
  await testFunction('inventory', 'getInventoryMovements', () => db.getInventoryMovements(1));
  
  // Test getInventoryDashboardStats
  await testFunction('inventory', 'getInventoryDashboardStats', () => db.getInventoryDashboardStats(1));
}

// ============================================
// Maintenance Module Tests
// ============================================
async function testMaintenanceModule() {
  console.log('\n🔧 Testing Maintenance Module...\n');
  
  // Test getWorkOrders
  await testFunction('maintenance', 'getWorkOrders', () => db.getWorkOrders(1));
  
  // Test createWorkOrder
  const workOrderId = await testFunction('maintenance', 'createWorkOrder', () => 
    db.createWorkOrder({
      businessId: 1,
      code: `WO-TEST-${Date.now()}`,
      title: 'أمر عمل اختبار',
      priority: 'medium',
      type: 'corrective',
    })
  );
  
  if (workOrderId) {
    await testFunction('maintenance', 'getWorkOrderById', () => db.getWorkOrderById(workOrderId));
    await testFunction('maintenance', 'updateWorkOrder', () => 
      db.updateWorkOrder(workOrderId, { title: 'أمر عمل اختبار محدث' })
    );
    await testFunction('maintenance', 'deleteWorkOrder', () => db.deleteWorkOrder(workOrderId));
  }
  
  // Test getMaintenancePlans
  await testFunction('maintenance', 'getMaintenancePlans', () => db.getMaintenancePlans(1));
  
  // Test getTechnicians
  await testFunction('maintenance', 'getTechnicians', () => db.getTechnicians(1));
  
  // Test getMaintenanceDashboardStats
  await testFunction('maintenance', 'getMaintenanceDashboardStats', () => db.getMaintenanceDashboardStats(1));
}

// ============================================
// Projects Module Tests
// ============================================
async function testProjectsModule() {
  console.log('\n🏗️ Testing Projects Module...\n');
  
  // Test getProjects
  await testFunction('projects', 'getProjects', () => db.getProjects(1));
  
  // Test createProject
  const projectId = await testFunction('projects', 'createProject', () => 
    db.createProject({
      businessId: 1,
      code: `PRJ-TEST-${Date.now()}`,
      nameAr: 'مشروع اختبار',
      status: 'planning',
      priority: 'medium',
    })
  );
  
  if (projectId) {
    await testFunction('projects', 'getProjectById', () => db.getProjectById(projectId));
    await testFunction('projects', 'updateProject', () => 
      db.updateProject(projectId, { nameAr: 'مشروع اختبار محدث' })
    );
    
    // Test project phases
    const phaseId = await testFunction('projects', 'createProjectPhase', () => 
      db.createProjectPhase({
        projectId: projectId,
        nameAr: 'مرحلة اختبار',
        status: 'pending',
      })
    );
    
    if (phaseId) {
      await testFunction('projects', 'getProjectPhases', () => db.getProjectPhases(projectId));
      await testFunction('projects', 'updateProjectPhase', () => 
        db.updateProjectPhase(phaseId, { nameAr: 'مرحلة اختبار محدثة' })
      );
      await testFunction('projects', 'deleteProjectPhase', () => db.deleteProjectPhase(phaseId));
    }
    
    // Test project tasks
    const taskId = await testFunction('projects', 'createProjectTask', () => 
      db.createProjectTask({
        projectId: projectId,
        nameAr: 'مهمة اختبار',
        status: 'pending',
        priority: 'medium',
      })
    );
    
    if (taskId) {
      await testFunction('projects', 'getProjectTasks', () => db.getProjectTasks(projectId));
      await testFunction('projects', 'updateProjectTask', () => 
        db.updateProjectTask(taskId, { nameAr: 'مهمة اختبار محدثة' })
      );
      await testFunction('projects', 'deleteProjectTask', () => db.deleteProjectTask(taskId));
    }
    
    await testFunction('projects', 'deleteProject', () => db.deleteProject(projectId));
  }
  
  // Test getProjectsStats
  await testFunction('projects', 'getProjectsStats', () => db.getProjectsStats(1));
  
  // Test getProjectGanttData
  await testFunction('projects', 'getProjectGanttData', () => db.getProjectGanttData(1));
}

// ============================================
// SCADA Module Tests
// ============================================
async function testScadaModule() {
  console.log('\n📡 Testing SCADA Module...\n');
  
  // Test getScadaEquipment
  await testFunction('scada', 'getScadaEquipment', () => db.getScadaEquipment(1));
  
  // Test createScadaEquipment
  const equipmentId = await testFunction('scada', 'createScadaEquipment', () => 
    db.createScadaEquipment({
      businessId: 1,
      code: `EQP-TEST-${Date.now()}`,
      nameAr: 'معدة اختبار',
      status: 'active',
    })
  );
  
  if (equipmentId) {
    await testFunction('scada', 'getScadaEquipmentById', () => db.getScadaEquipmentById(equipmentId));
    await testFunction('scada', 'updateScadaEquipment', () => 
      db.updateScadaEquipment(equipmentId, { nameAr: 'معدة اختبار محدثة' })
    );
    await testFunction('scada', 'deleteScadaEquipment', () => db.deleteScadaEquipment(equipmentId));
  }
  
  // Test getScadaSensors
  await testFunction('scada', 'getScadaSensors', () => db.getScadaSensors(1));
  
  // Test createScadaSensor
  const sensorId = await testFunction('scada', 'createScadaSensor', () => 
    db.createScadaSensor({
      businessId: 1,
      code: `SEN-TEST-${Date.now()}`,
      nameAr: 'مستشعر اختبار',
      type: 'temperature',
      status: 'active',
    })
  );
  
  if (sensorId) {
    await testFunction('scada', 'getScadaSensorById', () => db.getScadaSensorById(sensorId));
    await testFunction('scada', 'updateScadaSensor', () => 
      db.updateScadaSensor(sensorId, { nameAr: 'مستشعر اختبار محدث' })
    );
    await testFunction('scada', 'deleteScadaSensor', () => db.deleteScadaSensor(sensorId));
  }
  
  // Test getScadaAlerts
  await testFunction('scada', 'getScadaAlerts', () => db.getScadaAlerts(1));
  
  // Test createScadaAlert
  const alertId = await testFunction('scada', 'createScadaAlert', () => 
    db.createScadaAlert({
      businessId: 1,
      alertType: 'warning',
      title: 'تنبيه اختبار',
      message: 'رسالة تنبيه للاختبار',
      priority: 'medium',
    })
  );
  
  if (alertId) {
    await testFunction('scada', 'getScadaAlertById', () => db.getScadaAlertById(alertId));
    await testFunction('scada', 'updateScadaAlertStatus', () => 
      db.updateScadaAlertStatus(alertId, 'acknowledged')
    );
    await testFunction('scada', 'deleteScadaAlert', () => db.deleteScadaAlert(alertId));
  }
  
  // Test getScadaDashboard
  await testFunction('scada', 'getScadaDashboard', () => db.getScadaDashboard(1));
  
  // Test getScadaStats
  await testFunction('scada', 'getScadaStats', () => db.getScadaStats(1));
  
  // Test getScadaAlertsStats
  await testFunction('scada', 'getScadaAlertsStats', () => db.getScadaAlertsStats(1));
}

// ============================================
// Generate Report
// ============================================
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 DATABASE INTEGRATION TESTS REPORT');
  console.log('تقرير اختبارات التكامل لقاعدة البيانات');
  console.log('='.repeat(80) + '\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const total = results.length;
  const avgTime = results.reduce((sum, r) => sum + r.executionTime, 0) / total;
  
  console.log('📊 Summary / الملخص:');
  console.log('-'.repeat(40));
  console.log(`Total Tests / إجمالي الاختبارات: ${total}`);
  console.log(`✅ Passed / ناجح: ${passed}`);
  console.log(`❌ Failed / فاشل: ${failed}`);
  console.log(`⏭️ Skipped / متخطى: ${skipped}`);
  console.log(`📈 Success Rate / نسبة النجاح: ${((passed / total) * 100).toFixed(1)}%`);
  console.log(`⏱️ Average Execution Time: ${avgTime.toFixed(0)}ms`);
  
  // Group by module
  const modules = ['assets', 'accounting', 'inventory', 'maintenance', 'projects', 'scada'];
  
  console.log('\n📦 Results by Module / النتائج حسب الوحدة:');
  console.log('-'.repeat(40));
  
  for (const module of modules) {
    const moduleResults = results.filter(r => r.module === module);
    const modulePassed = moduleResults.filter(r => r.status === 'PASS').length;
    const moduleFailed = moduleResults.filter(r => r.status === 'FAIL').length;
    const moduleTotal = moduleResults.length;
    const moduleAvgTime = moduleResults.reduce((sum, r) => sum + r.executionTime, 0) / moduleTotal;
    
    console.log(`\n${module.toUpperCase()}:`);
    console.log(`  Total: ${moduleTotal} | ✅ Pass: ${modulePassed} | ❌ Fail: ${moduleFailed}`);
    console.log(`  Success Rate: ${((modulePassed / moduleTotal) * 100).toFixed(1)}% | Avg Time: ${moduleAvgTime.toFixed(0)}ms`);
    
    // Show failed tests
    const failedTests = moduleResults.filter(r => r.status === 'FAIL');
    if (failedTests.length > 0) {
      console.log('  ❌ Failed Functions:');
      failedTests.forEach(t => {
        console.log(`     - ${t.function}: ${t.message.substring(0, 60)}...`);
      });
    }
  }
  
  console.log('\n' + '='.repeat(80));
  
  if (failed === 0) {
    console.log('\n✅ All database functions are working correctly!');
    console.log('   جميع دوال قاعدة البيانات تعمل بشكل صحيح!');
  } else {
    console.log(`\n⚠️ ${failed} function(s) need attention.`);
    console.log(`   ${failed} دالة تحتاج إلى مراجعة.`);
  }
  
  return { passed, failed, skipped, total, avgTime, results };
}

// ============================================
// Main
// ============================================
async function main() {
  console.log('🚀 Starting Database Integration Tests...\n');
  console.log('='.repeat(80));
  console.log('Testing database functions for: assets, accounting, inventory, maintenance, projects, scada');
  console.log('='.repeat(80));
  
  try {
    await testAssetsModule();
    await testAccountingModule();
    await testInventoryModule();
    await testMaintenanceModule();
    await testProjectsModule();
    await testScadaModule();
    
    const report = generateReport();
    
    // Write report to file
    const reportJson = JSON.stringify(report, null, 2);
    const fs = await import('fs');
    fs.writeFileSync('/home/ubuntu/6666/tests/db-test-results.json', reportJson);
    
    console.log('\n✅ Test results saved to /home/ubuntu/6666/tests/db-test-results.json');
    
    process.exit(report.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

main();
