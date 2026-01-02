/**
 * Integration Tests for All New Routers
 * اختبارات التكامل لجميع الـ Routers الجديدة
 * 
 * Routers tested:
 * 1. assetsRouter - نظام إدارة الأصول
 * 2. accountingRouter - النظام المحاسبي
 * 3. inventoryRouter - نظام المخزون
 * 4. maintenanceRouter - نظام الصيانة
 * 5. projectsRouter - نظام المشاريع
 * 6. scadaRouter - نظام المراقبة والتحكم
 */

const BASE_URL = 'http://localhost:3001/api/trpc';

interface TestResult {
  router: string;
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  responseTime: number;
  details?: any;
}

const results: TestResult[] = [];

// Helper function to make tRPC calls
async function trpcCall(procedure: string, input?: any): Promise<{ success: boolean; data?: any; error?: string; time: number }> {
  const startTime = Date.now();
  try {
    const url = input 
      ? `${BASE_URL}/${procedure}?input=${encodeURIComponent(JSON.stringify(input))}`
      : `${BASE_URL}/${procedure}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    const time = Date.now() - startTime;
    
    if (data.error) {
      return { success: false, error: data.error.message || JSON.stringify(data.error), time };
    }
    
    return { success: true, data: data.result?.data, time };
  } catch (error: any) {
    return { success: false, error: error.message, time: Date.now() - startTime };
  }
}

// Helper function to make tRPC mutation calls
async function trpcMutation(procedure: string, input: any): Promise<{ success: boolean; data?: any; error?: string; time: number }> {
  const startTime = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/${procedure}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    
    const data = await response.json();
    const time = Date.now() - startTime;
    
    if (data.error) {
      return { success: false, error: data.error.message || JSON.stringify(data.error), time };
    }
    
    return { success: true, data: data.result?.data, time };
  } catch (error: any) {
    return { success: false, error: error.message, time: Date.now() - startTime };
  }
}

function addResult(router: string, endpoint: string, method: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, responseTime: number, details?: any) {
  results.push({ router, endpoint, method, status, message, responseTime, details });
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${statusIcon} [${router}] ${endpoint} (${method}) - ${message} (${responseTime}ms)`);
}

// ============================================
// Assets Router Tests
// ============================================
async function testAssetsRouter() {
  console.log('\n📦 Testing Assets Router...\n');
  
  // Test 1: List assets
  const listResult = await trpcCall('assets.list', { businessId: 1 });
  if (listResult.success) {
    addResult('assets', 'list', 'GET', 'PASS', `Retrieved ${Array.isArray(listResult.data) ? listResult.data.length : 0} assets`, listResult.time);
  } else {
    addResult('assets', 'list', 'GET', 'FAIL', listResult.error || 'Unknown error', listResult.time);
  }
  
  // Test 2: Get categories
  const categoriesResult = await trpcCall('assets.categories', { businessId: 1 });
  if (categoriesResult.success) {
    addResult('assets', 'categories', 'GET', 'PASS', `Retrieved ${Array.isArray(categoriesResult.data) ? categoriesResult.data.length : 0} categories`, categoriesResult.time);
  } else {
    addResult('assets', 'categories', 'GET', 'FAIL', categoriesResult.error || 'Unknown error', categoriesResult.time);
  }
  
  // Test 3: Get stats
  const statsResult = await trpcCall('assets.stats', { businessId: 1 });
  if (statsResult.success) {
    addResult('assets', 'stats', 'GET', 'PASS', 'Stats retrieved successfully', statsResult.time, statsResult.data);
  } else {
    addResult('assets', 'stats', 'GET', 'FAIL', statsResult.error || 'Unknown error', statsResult.time);
  }
  
  // Test 4: Create asset
  const createResult = await trpcMutation('assets.create', {
    businessId: 1,
    code: `AST-TEST-${Date.now()}`,
    nameAr: 'أصل اختبار',
    nameEn: 'Test Asset',
    status: 'active',
  });
  if (createResult.success) {
    addResult('assets', 'create', 'POST', 'PASS', 'Asset created successfully', createResult.time, { id: createResult.data });
  } else {
    addResult('assets', 'create', 'POST', 'FAIL', createResult.error || 'Unknown error', createResult.time);
  }
}

// ============================================
// Accounting Router Tests
// ============================================
async function testAccountingRouter() {
  console.log('\n📊 Testing Accounting Router...\n');
  
  // Test 1: List accounts
  const accountsResult = await trpcCall('accounting.accounts.list', { businessId: 1 });
  if (accountsResult.success) {
    addResult('accounting', 'accounts.list', 'GET', 'PASS', `Retrieved ${Array.isArray(accountsResult.data) ? accountsResult.data.length : 0} accounts`, accountsResult.time);
  } else {
    addResult('accounting', 'accounts.list', 'GET', 'FAIL', accountsResult.error || 'Unknown error', accountsResult.time);
  }
  
  // Test 2: Get chart of accounts
  const chartResult = await trpcCall('accounting.chartOfAccounts', { businessId: 1 });
  if (chartResult.success) {
    addResult('accounting', 'chartOfAccounts', 'GET', 'PASS', 'Chart of accounts retrieved', chartResult.time);
  } else {
    addResult('accounting', 'chartOfAccounts', 'GET', 'FAIL', chartResult.error || 'Unknown error', chartResult.time);
  }
  
  // Test 3: List journal entries
  const journalResult = await trpcCall('accounting.journalEntries.list', { businessId: 1 });
  if (journalResult.success) {
    addResult('accounting', 'journalEntries.list', 'GET', 'PASS', `Retrieved ${Array.isArray(journalResult.data) ? journalResult.data.length : 0} entries`, journalResult.time);
  } else {
    addResult('accounting', 'journalEntries.list', 'GET', 'FAIL', journalResult.error || 'Unknown error', journalResult.time);
  }
  
  // Test 4: Get trial balance
  const trialResult = await trpcCall('accounting.trialBalance', { businessId: 1 });
  if (trialResult.success) {
    addResult('accounting', 'trialBalance', 'GET', 'PASS', 'Trial balance retrieved', trialResult.time);
  } else {
    addResult('accounting', 'trialBalance', 'GET', 'FAIL', trialResult.error || 'Unknown error', trialResult.time);
  }
  
  // Test 5: Get stats
  const statsResult = await trpcCall('accounting.stats', { businessId: 1 });
  if (statsResult.success) {
    addResult('accounting', 'stats', 'GET', 'PASS', 'Stats retrieved', statsResult.time, statsResult.data);
  } else {
    addResult('accounting', 'stats', 'GET', 'FAIL', statsResult.error || 'Unknown error', statsResult.time);
  }
  
  // Test 6: Create account
  const createResult = await trpcMutation('accounting.accounts.create', {
    businessId: 1,
    code: `ACC-TEST-${Date.now()}`,
    nameAr: 'حساب اختبار',
    nameEn: 'Test Account',
    type: 'asset',
    isActive: true,
  });
  if (createResult.success) {
    addResult('accounting', 'accounts.create', 'POST', 'PASS', 'Account created', createResult.time);
  } else {
    addResult('accounting', 'accounts.create', 'POST', 'FAIL', createResult.error || 'Unknown error', createResult.time);
  }
}

// ============================================
// Inventory Router Tests
// ============================================
async function testInventoryRouter() {
  console.log('\n📦 Testing Inventory Router...\n');
  
  // Test 1: List items
  const itemsResult = await trpcCall('inventory.items.list', { businessId: 1 });
  if (itemsResult.success) {
    addResult('inventory', 'items.list', 'GET', 'PASS', `Retrieved ${Array.isArray(itemsResult.data) ? itemsResult.data.length : 0} items`, itemsResult.time);
  } else {
    addResult('inventory', 'items.list', 'GET', 'FAIL', itemsResult.error || 'Unknown error', itemsResult.time);
  }
  
  // Test 2: List warehouses
  const warehousesResult = await trpcCall('inventory.warehouses.list', { businessId: 1 });
  if (warehousesResult.success) {
    addResult('inventory', 'warehouses.list', 'GET', 'PASS', `Retrieved ${Array.isArray(warehousesResult.data) ? warehousesResult.data.length : 0} warehouses`, warehousesResult.time);
  } else {
    addResult('inventory', 'warehouses.list', 'GET', 'FAIL', warehousesResult.error || 'Unknown error', warehousesResult.time);
  }
  
  // Test 3: Get stats
  const statsResult = await trpcCall('inventory.stats', { businessId: 1 });
  if (statsResult.success) {
    addResult('inventory', 'stats', 'GET', 'PASS', 'Stats retrieved', statsResult.time, statsResult.data);
  } else {
    addResult('inventory', 'stats', 'GET', 'FAIL', statsResult.error || 'Unknown error', statsResult.time);
  }
  
  // Test 4: Create item
  const createItemResult = await trpcMutation('inventory.items.create', {
    businessId: 1,
    code: `ITM-TEST-${Date.now()}`,
    nameAr: 'صنف اختبار',
    nameEn: 'Test Item',
    unit: 'قطعة',
    minQuantity: 10,
    maxQuantity: 100,
  });
  if (createItemResult.success) {
    addResult('inventory', 'items.create', 'POST', 'PASS', 'Item created', createItemResult.time);
  } else {
    addResult('inventory', 'items.create', 'POST', 'FAIL', createItemResult.error || 'Unknown error', createItemResult.time);
  }
  
  // Test 5: Create warehouse
  const createWarehouseResult = await trpcMutation('inventory.warehouses.create', {
    businessId: 1,
    code: `WH-TEST-${Date.now()}`,
    nameAr: 'مستودع اختبار',
    nameEn: 'Test Warehouse',
    location: 'موقع اختبار',
  });
  if (createWarehouseResult.success) {
    addResult('inventory', 'warehouses.create', 'POST', 'PASS', 'Warehouse created', createWarehouseResult.time);
  } else {
    addResult('inventory', 'warehouses.create', 'POST', 'FAIL', createWarehouseResult.error || 'Unknown error', createWarehouseResult.time);
  }
}

// ============================================
// Maintenance Router Tests
// ============================================
async function testMaintenanceRouter() {
  console.log('\n🔧 Testing Maintenance Router...\n');
  
  // Test 1: List work orders
  const workOrdersResult = await trpcCall('maintenance.workOrders.list', { businessId: 1 });
  if (workOrdersResult.success) {
    addResult('maintenance', 'workOrders.list', 'GET', 'PASS', `Retrieved ${Array.isArray(workOrdersResult.data) ? workOrdersResult.data.length : 0} work orders`, workOrdersResult.time);
  } else {
    addResult('maintenance', 'workOrders.list', 'GET', 'FAIL', workOrdersResult.error || 'Unknown error', workOrdersResult.time);
  }
  
  // Test 2: List maintenance plans
  const plansResult = await trpcCall('maintenance.plans.list', { businessId: 1 });
  if (plansResult.success) {
    addResult('maintenance', 'plans.list', 'GET', 'PASS', `Retrieved ${Array.isArray(plansResult.data) ? plansResult.data.length : 0} plans`, plansResult.time);
  } else {
    addResult('maintenance', 'plans.list', 'GET', 'FAIL', plansResult.error || 'Unknown error', plansResult.time);
  }
  
  // Test 3: List technicians
  const techniciansResult = await trpcCall('maintenance.technicians.list', { businessId: 1 });
  if (techniciansResult.success) {
    addResult('maintenance', 'technicians.list', 'GET', 'PASS', `Retrieved ${Array.isArray(techniciansResult.data) ? techniciansResult.data.length : 0} technicians`, techniciansResult.time);
  } else {
    addResult('maintenance', 'technicians.list', 'GET', 'FAIL', techniciansResult.error || 'Unknown error', techniciansResult.time);
  }
  
  // Test 4: Get stats
  const statsResult = await trpcCall('maintenance.stats', { businessId: 1 });
  if (statsResult.success) {
    addResult('maintenance', 'stats', 'GET', 'PASS', 'Stats retrieved', statsResult.time, statsResult.data);
  } else {
    addResult('maintenance', 'stats', 'GET', 'FAIL', statsResult.error || 'Unknown error', statsResult.time);
  }
  
  // Test 5: Create work order
  const createResult = await trpcMutation('maintenance.workOrders.create', {
    businessId: 1,
    code: `WO-TEST-${Date.now()}`,
    title: 'أمر عمل اختبار',
    description: 'وصف أمر العمل للاختبار',
    priority: 'medium',
    type: 'corrective',
  });
  if (createResult.success) {
    addResult('maintenance', 'workOrders.create', 'POST', 'PASS', 'Work order created', createResult.time);
  } else {
    addResult('maintenance', 'workOrders.create', 'POST', 'FAIL', createResult.error || 'Unknown error', createResult.time);
  }
}

// ============================================
// Projects Router Tests
// ============================================
async function testProjectsRouter() {
  console.log('\n🏗️ Testing Projects Router...\n');
  
  // Test 1: List projects
  const projectsResult = await trpcCall('projects.list', { businessId: 1 });
  if (projectsResult.success) {
    addResult('projects', 'list', 'GET', 'PASS', `Retrieved ${Array.isArray(projectsResult.data) ? projectsResult.data.length : 0} projects`, projectsResult.time);
  } else {
    addResult('projects', 'list', 'GET', 'FAIL', projectsResult.error || 'Unknown error', projectsResult.time);
  }
  
  // Test 2: Get stats
  const statsResult = await trpcCall('projects.stats', { businessId: 1 });
  if (statsResult.success) {
    addResult('projects', 'stats', 'GET', 'PASS', 'Stats retrieved', statsResult.time, statsResult.data);
  } else {
    addResult('projects', 'stats', 'GET', 'FAIL', statsResult.error || 'Unknown error', statsResult.time);
  }
  
  // Test 3: Create project
  const createResult = await trpcMutation('projects.create', {
    businessId: 1,
    code: `PRJ-TEST-${Date.now()}`,
    nameAr: 'مشروع اختبار',
    nameEn: 'Test Project',
    status: 'planning',
    priority: 'medium',
  });
  if (createResult.success) {
    addResult('projects', 'create', 'POST', 'PASS', 'Project created', createResult.time);
    
    // Test 4: Get project by ID
    if (createResult.data) {
      const getResult = await trpcCall('projects.getById', { id: createResult.data });
      if (getResult.success) {
        addResult('projects', 'getById', 'GET', 'PASS', 'Project retrieved by ID', getResult.time);
      } else {
        addResult('projects', 'getById', 'GET', 'FAIL', getResult.error || 'Unknown error', getResult.time);
      }
    }
  } else {
    addResult('projects', 'create', 'POST', 'FAIL', createResult.error || 'Unknown error', createResult.time);
  }
}

// ============================================
// SCADA Router Tests
// ============================================
async function testScadaRouter() {
  console.log('\n📡 Testing SCADA Router...\n');
  
  // Test 1: Get dashboard
  const dashboardResult = await trpcCall('scada.dashboard', { businessId: 1 });
  if (dashboardResult.success) {
    addResult('scada', 'dashboard', 'GET', 'PASS', 'Dashboard data retrieved', dashboardResult.time);
  } else {
    addResult('scada', 'dashboard', 'GET', 'FAIL', dashboardResult.error || 'Unknown error', dashboardResult.time);
  }
  
  // Test 2: Get stats
  const statsResult = await trpcCall('scada.stats', { businessId: 1 });
  if (statsResult.success) {
    addResult('scada', 'stats', 'GET', 'PASS', 'Stats retrieved', statsResult.time, statsResult.data);
  } else {
    addResult('scada', 'stats', 'GET', 'FAIL', statsResult.error || 'Unknown error', statsResult.time);
  }
  
  // Test 3: List equipment
  const equipmentResult = await trpcCall('scada.equipment.list', { businessId: 1 });
  if (equipmentResult.success) {
    addResult('scada', 'equipment.list', 'GET', 'PASS', `Retrieved ${Array.isArray(equipmentResult.data) ? equipmentResult.data.length : 0} equipment`, equipmentResult.time);
  } else {
    addResult('scada', 'equipment.list', 'GET', 'FAIL', equipmentResult.error || 'Unknown error', equipmentResult.time);
  }
  
  // Test 4: List sensors
  const sensorsResult = await trpcCall('scada.sensors.list', { businessId: 1 });
  if (sensorsResult.success) {
    addResult('scada', 'sensors.list', 'GET', 'PASS', `Retrieved ${Array.isArray(sensorsResult.data) ? sensorsResult.data.length : 0} sensors`, sensorsResult.time);
  } else {
    addResult('scada', 'sensors.list', 'GET', 'FAIL', sensorsResult.error || 'Unknown error', sensorsResult.time);
  }
  
  // Test 5: List alerts
  const alertsResult = await trpcCall('scada.alerts.list', { businessId: 1 });
  if (alertsResult.success) {
    addResult('scada', 'alerts.list', 'GET', 'PASS', `Retrieved ${Array.isArray(alertsResult.data) ? alertsResult.data.length : 0} alerts`, alertsResult.time);
  } else {
    addResult('scada', 'alerts.list', 'GET', 'FAIL', alertsResult.error || 'Unknown error', alertsResult.time);
  }
  
  // Test 6: Get alerts stats
  const alertsStatsResult = await trpcCall('scada.alerts.stats', { businessId: 1 });
  if (alertsStatsResult.success) {
    addResult('scada', 'alerts.stats', 'GET', 'PASS', 'Alerts stats retrieved', alertsStatsResult.time);
  } else {
    addResult('scada', 'alerts.stats', 'GET', 'FAIL', alertsStatsResult.error || 'Unknown error', alertsStatsResult.time);
  }
  
  // Test 7: Create equipment
  const createEquipmentResult = await trpcMutation('scada.equipment.create', {
    businessId: 1,
    code: `EQP-TEST-${Date.now()}`,
    nameAr: 'معدة اختبار',
    nameEn: 'Test Equipment',
    status: 'active',
  });
  if (createEquipmentResult.success) {
    addResult('scada', 'equipment.create', 'POST', 'PASS', 'Equipment created', createEquipmentResult.time);
  } else {
    addResult('scada', 'equipment.create', 'POST', 'FAIL', createEquipmentResult.error || 'Unknown error', createEquipmentResult.time);
  }
  
  // Test 8: Create sensor
  const createSensorResult = await trpcMutation('scada.sensors.create', {
    businessId: 1,
    code: `SEN-TEST-${Date.now()}`,
    nameAr: 'مستشعر اختبار',
    nameEn: 'Test Sensor',
    type: 'temperature',
    status: 'active',
  });
  if (createSensorResult.success) {
    addResult('scada', 'sensors.create', 'POST', 'PASS', 'Sensor created', createSensorResult.time);
  } else {
    addResult('scada', 'sensors.create', 'POST', 'FAIL', createSensorResult.error || 'Unknown error', createSensorResult.time);
  }
  
  // Test 9: Create alert
  const createAlertResult = await trpcMutation('scada.alerts.create', {
    businessId: 1,
    alertType: 'warning',
    title: 'تنبيه اختبار',
    message: 'رسالة تنبيه للاختبار',
    priority: 'medium',
  });
  if (createAlertResult.success) {
    addResult('scada', 'alerts.create', 'POST', 'PASS', 'Alert created', createAlertResult.time);
  } else {
    addResult('scada', 'alerts.create', 'POST', 'FAIL', createAlertResult.error || 'Unknown error', createAlertResult.time);
  }
}

// ============================================
// Generate Report
// ============================================
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 INTEGRATION TESTS REPORT - تقرير اختبارات التكامل');
  console.log('='.repeat(80) + '\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const total = results.length;
  const avgTime = results.reduce((sum, r) => sum + r.responseTime, 0) / total;
  
  console.log('📊 Summary / الملخص:');
  console.log('-'.repeat(40));
  console.log(`Total Tests / إجمالي الاختبارات: ${total}`);
  console.log(`✅ Passed / ناجح: ${passed}`);
  console.log(`❌ Failed / فاشل: ${failed}`);
  console.log(`⏭️ Skipped / متخطى: ${skipped}`);
  console.log(`📈 Success Rate / نسبة النجاح: ${((passed / total) * 100).toFixed(1)}%`);
  console.log(`⏱️ Average Response Time / متوسط وقت الاستجابة: ${avgTime.toFixed(0)}ms`);
  
  // Group by router
  const routers = ['assets', 'accounting', 'inventory', 'maintenance', 'projects', 'scada'];
  
  console.log('\n📦 Results by Router / النتائج حسب الـ Router:');
  console.log('-'.repeat(40));
  
  for (const router of routers) {
    const routerResults = results.filter(r => r.router === router);
    const routerPassed = routerResults.filter(r => r.status === 'PASS').length;
    const routerTotal = routerResults.length;
    const routerAvgTime = routerResults.reduce((sum, r) => sum + r.responseTime, 0) / routerTotal;
    
    console.log(`\n${router.toUpperCase()}:`);
    console.log(`  Tests: ${routerTotal} | Passed: ${routerPassed} | Failed: ${routerTotal - routerPassed}`);
    console.log(`  Success Rate: ${((routerPassed / routerTotal) * 100).toFixed(1)}% | Avg Time: ${routerAvgTime.toFixed(0)}ms`);
    
    // Show failed tests
    const failedTests = routerResults.filter(r => r.status === 'FAIL');
    if (failedTests.length > 0) {
      console.log('  Failed Tests:');
      failedTests.forEach(t => {
        console.log(`    ❌ ${t.endpoint}: ${t.message}`);
      });
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📋 DETAILED RESULTS / النتائج التفصيلية');
  console.log('='.repeat(80) + '\n');
  
  results.forEach((r, i) => {
    const statusIcon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⏭️';
    console.log(`${i + 1}. ${statusIcon} [${r.router}] ${r.endpoint} (${r.method})`);
    console.log(`   Status: ${r.status} | Time: ${r.responseTime}ms`);
    console.log(`   Message: ${r.message}`);
    if (r.details) {
      console.log(`   Details: ${JSON.stringify(r.details)}`);
    }
    console.log('');
  });
  
  return { passed, failed, skipped, total, avgTime, results };
}

// ============================================
// Main
// ============================================
async function main() {
  console.log('🚀 Starting Integration Tests...\n');
  console.log('='.repeat(80));
  console.log('Testing all new routers: assets, accounting, inventory, maintenance, projects, scada');
  console.log('='.repeat(80));
  
  try {
    await testAssetsRouter();
    await testAccountingRouter();
    await testInventoryRouter();
    await testMaintenanceRouter();
    await testProjectsRouter();
    await testScadaRouter();
    
    const report = generateReport();
    
    // Write report to file
    const reportJson = JSON.stringify(report, null, 2);
    const fs = await import('fs');
    fs.writeFileSync('/home/ubuntu/6666/tests/test-results.json', reportJson);
    
    console.log('\n✅ Test results saved to /home/ubuntu/6666/tests/test-results.json');
    
    // Exit with appropriate code
    process.exit(report.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

main();
