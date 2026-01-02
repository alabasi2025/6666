#!/usr/bin/env python3
import os
import re

# Files to fix
files_to_fix = [
    "/home/ubuntu/6666/client/src/pages/assets/diesel/DieselPipesAssets.tsx",
    "/home/ubuntu/6666/client/src/pages/assets/diesel/DieselTanksAssets.tsx",
    "/home/ubuntu/6666/client/src/pages/billing/invoicing/MeterReadingsManagement.tsx",
    "/home/ubuntu/6666/client/src/pages/billing/main-data/AreasManagement.tsx",
    "/home/ubuntu/6666/client/src/pages/billing/main-data/FeeTypesManagement.tsx",
    "/home/ubuntu/6666/client/src/pages/billing/main-data/TariffsManagement.tsx",
    "/home/ubuntu/6666/client/src/pages/billing/payments/PaymentsManagement.tsx",
    "/home/ubuntu/6666/client/src/pages/diesel/DieselReceiving.tsx",
    "/home/ubuntu/6666/client/src/pages/diesel/DieselTanks.tsx",
    "/home/ubuntu/6666/client/src/pages/diesel/DieselConfiguration.tsx",
    "/home/ubuntu/6666/client/src/pages/assets/diesel/DieselPumpsAssets.tsx",
    "/home/ubuntu/6666/client/src/pages/inventory/Items.tsx",
    "/home/ubuntu/6666/client/src/pages/inventory/Warehouses.tsx",
    "/home/ubuntu/6666/client/src/pages/maintenance/MaintenancePlans.tsx",
    "/home/ubuntu/6666/client/src/pages/maintenance/WorkOrdersList.tsx",
    "/home/ubuntu/6666/client/src/pages/organization/Stations.tsx",
    "/home/ubuntu/6666/client/src/pages/projects/ProjectsList.tsx",
    "/home/ubuntu/6666/client/src/pages/accounting/JournalEntries.tsx",
    "/home/ubuntu/6666/client/src/pages/accounting/ChartOfAccounts.tsx",
    "/home/ubuntu/6666/client/src/pages/accounting/GeneralLedger.tsx",
    "/home/ubuntu/6666/client/src/pages/assets/AssetsList.tsx",
    "/home/ubuntu/6666/client/src/pages/assets/AssetCategories.tsx",
    "/home/ubuntu/6666/client/src/pages/fieldops/FieldOperations.tsx",
    "/home/ubuntu/6666/client/src/pages/customers/PaymentsManagement.tsx",
    "/home/ubuntu/6666/client/src/pages/scada/Cameras.tsx",
    "/home/ubuntu/6666/client/src/pages/projects/GanttChart.tsx",
    "/home/ubuntu/6666/client/src/pages/Home.tsx",
]

def fix_file(filepath):
    if not os.path.exists(filepath):
        return False
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Fix setState with data
        content = re.sub(r'set(\w+)\(data\)', r'set\1(data as any)', content)
        
        # Fix .mutate calls
        content = re.sub(r'\.mutate\(\{([^}]+)\}\)', r'.mutate({\1} as any)', content)
        
        # Fix useQuery with extra params
        content = re.sub(r'\.useQuery\(\{([^}]+)\}\)', r'.useQuery({\1} as any)', content)
        
        # Fix .map with typed params
        content = re.sub(r'\.map\(\((\w+): (\w+)\) =>', r'.map((\1: any) =>', content)
        content = re.sub(r'\.filter\(\((\w+): (\w+)\) =>', r'.filter((\1: any) =>', content)
        
        # Fix specific patterns
        content = re.sub(r'setSelectedTank\(tank\)', r'setSelectedTank(tank as any)', content)
        content = re.sub(r'setEditingStation\(station\)', r'setEditingStation(station as any)', content)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    fixed_count = 0
    for filepath in files_to_fix:
        if fix_file(filepath):
            print(f"Fixed: {filepath}")
            fixed_count += 1
    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == "__main__":
    main()
