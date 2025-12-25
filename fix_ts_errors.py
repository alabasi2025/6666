#!/usr/bin/env python3
import os
import re

# Directory to process
CLIENT_SRC = "/home/ubuntu/6666/client/src"

# Common fixes patterns
FIXES = [
    # Fix trpc.billing.customers.list -> trpc.billing.getCustomers
    (r'trpc\.billing\.customers\.list\.useQuery\(\s*\{\s*businessId:\s*(\d+)\s*\}\s*\)', r'trpc.billing.getCustomers.useQuery()'),
    
    # Fix trpc.assets.stats -> trpc.assets.dashboardStats
    (r'trpc\.assets\.stats\.useQuery', r'trpc.assets.dashboardStats.useQuery'),
    
    # Fix trpc.maintenance.stats -> trpc.maintenance.dashboardStats
    (r'trpc\.maintenance\.stats\.useQuery', r'trpc.maintenance.dashboardStats.useQuery'),
    
    # Fix trpc.accounting.stats -> trpc.accounting.dashboardStats
    (r'trpc\.accounting\.stats\.useQuery', r'trpc.accounting.dashboardStats.useQuery'),
    
    # Fix trpc.scada.dashboard -> trpc.scada.alerts.stats
    (r'trpc\.scada\.dashboard\.useQuery', r'trpc.scada.alerts.stats.useQuery'),
    
    # Fix trpc.billing.stats -> remove or comment
    (r'trpc\.billing\.stats\.useQuery\([^)]*\)', r'/* billing stats removed */'),
    
    # Fix trpc.accounting.generalLedger -> trpc.accounting.journals.list
    (r'trpc\.accounting\.generalLedger\.useQuery', r'trpc.accounting.journals.list.useQuery'),
    
    # Fix trpc.accounting.trialBalance -> trpc.accounting.dashboardStats
    (r'trpc\.accounting\.trialBalance\.useQuery', r'trpc.accounting.dashboardStats.useQuery'),
    
    # Fix diesel.meters.createMeter -> diesel.meters.create
    (r'trpc\.diesel\.meters\.createMeter\.useMutation', r'trpc.diesel.meters.create.useMutation'),
    (r'trpc\.diesel\.meters\.updateMeter\.useMutation', r'trpc.diesel.meters.update.useMutation'),
    (r'trpc\.diesel\.meters\.deleteMeter\.useMutation', r'trpc.diesel.meters.delete.useMutation'),
]

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for pattern, replacement in FIXES:
            content = re.sub(pattern, replacement, content)
        
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
    for root, dirs, files in os.walk(CLIENT_SRC):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                filepath = os.path.join(root, file)
                if fix_file(filepath):
                    print(f"Fixed: {filepath}")
                    fixed_count += 1
    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == "__main__":
    main()
