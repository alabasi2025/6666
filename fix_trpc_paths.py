#!/usr/bin/env python3
import os
import re

CLIENT_SRC = "/home/ubuntu/6666/client/src"

# Mapping of old tRPC paths to new ones
TRPC_FIXES = [
    # Diesel router fixes
    (r'trpc\.diesel\.getDieselSuppliers\.useQuery\(\)', r'trpc.diesel.suppliers.list.useQuery({ businessId: 1 })'),
    (r'trpc\.diesel\.getDieselTankers\.useQuery\(\)', r'trpc.diesel.tankers.list.useQuery({ businessId: 1 })'),
    (r'trpc\.diesel\.getDieselTanks\.useQuery\(\)', r'trpc.diesel.tanks.list.useQuery({ businessId: 1 })'),
    (r'trpc\.diesel\.getDieselReceivingTasks\.useQuery\(\)', r'trpc.diesel.receivingTasks.list.useQuery({ businessId: 1 })'),
    (r'trpc\.diesel\.createDieselReceivingTask\.useMutation', r'trpc.diesel.receivingTasks.create.useMutation'),
    (r'trpc\.diesel\.completeDieselReceivingTask\.useMutation', r'trpc.diesel.receivingTasks.updateStatus.useMutation'),
    (r'trpc\.diesel\.getStationDieselConfig\.useQuery', r'trpc.diesel.tanks.list.useQuery'),
    (r'utils\.diesel\.getDieselReceivingTasks\.invalidate', r'utils.diesel.receivingTasks.list.invalidate'),
    
    # Organization router fixes
    (r'trpc\.getStations\.useQuery\(\)', r'trpc.organization.stations.list.useQuery({ businessId: 1 })'),
    (r'trpc\.organization\.getStations\.useQuery\(\)', r'trpc.organization.stations.list.useQuery({ businessId: 1 })'),
    
    # Diesel meters fixes
    (r'trpc\.diesel\.meters\.createMeter\.useMutation', r'trpc.diesel.pumpMeters.create.useMutation'),
    (r'trpc\.diesel\.meters\.updateMeter\.useMutation', r'trpc.diesel.pumpMeters.update.useMutation'),
    (r'trpc\.diesel\.meters\.deleteMeter\.useMutation', r'trpc.diesel.pumpMeters.delete.useMutation'),
    
    # Assets diesel fixes
    (r'trpc\.diesel\.getDieselTanks\.useQuery', r'trpc.diesel.tanks.list.useQuery'),
    
    # Billing fixes
    (r'trpc\.billing\.customers\.list\.useQuery', r'trpc.billing.getCustomers.useQuery'),
]

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for pattern, replacement in TRPC_FIXES:
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
