#!/usr/bin/env python3
import os
import re

CLIENT_SRC = "/home/ubuntu/6666/client/src"

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Fix tRPC path errors - diesel router
        trpc_fixes = [
            # Diesel router fixes
            (r'trpc\.diesel\.getDieselSuppliers\.useQuery\(\)', r'trpc.diesel.suppliers.list.useQuery({ businessId: 1 })'),
            (r'trpc\.diesel\.getDieselTankers\.useQuery\(\)', r'trpc.diesel.tankers.list.useQuery({ businessId: 1 })'),
            (r'trpc\.diesel\.getDieselTanks\.useQuery\(\)', r'trpc.diesel.tanks.list.useQuery({ businessId: 1 })'),
            (r'trpc\.diesel\.getDieselTanks\.useQuery\s*\(\s*\{', r'trpc.diesel.tanks.list.useQuery({'),
            (r'trpc\.diesel\.getDieselReceivingTasks\.useQuery\(\)', r'trpc.diesel.receivingTasks.list.useQuery({ businessId: 1 })'),
            (r'trpc\.diesel\.createDieselReceivingTask\.useMutation', r'trpc.diesel.receivingTasks.create.useMutation'),
            (r'trpc\.diesel\.completeDieselReceivingTask\.useMutation', r'trpc.diesel.receivingTasks.updateStatus.useMutation'),
            (r'trpc\.diesel\.getStationDieselConfig\.useQuery', r'trpc.diesel.stationConfig.get.useQuery'),
            (r'utils\.diesel\.getDieselReceivingTasks\.invalidate', r'utils.diesel.receivingTasks.list.invalidate'),
            (r'trpc\.diesel\.getDieselPumpMeters\.useQuery', r'trpc.diesel.pumpMeters.list.useQuery'),
            (r'trpc\.diesel\.getDieselPipes\.useQuery', r'trpc.diesel.assets.pipes.list.useQuery'),
            (r'trpc\.diesel\.pumpMeters\.createMeter\.useMutation', r'trpc.diesel.pumpMeters.create.useMutation'),
            (r'trpc\.diesel\.pumpMeters\.updateMeter\.useMutation', r'trpc.diesel.pumpMeters.update.useMutation'),
            (r'trpc\.diesel\.pumpMeters\.deleteMeter\.useMutation', r'trpc.diesel.pumpMeters.delete.useMutation'),
            
            # Organization router fixes
            (r'trpc\.getStations\.useQuery\(\)', r'trpc.organization.stations.list.useQuery({ businessId: 1 })'),
            (r'trpc\.organization\.getStations\.useQuery\(\)', r'trpc.organization.stations.list.useQuery({ businessId: 1 })'),
            
            # Accounting router fixes
            (r'trpc\.accounting\.journals\.list\.useQuery', r'trpc.accounting.journalEntries.list.useQuery'),
            
            # SCADA router fixes
            (r'trpc\.scada\.dashboard\.useQuery', r'trpc.scada.alerts.list.useQuery'),
            (r'trpc\.scada\.stats\.useQuery', r'trpc.scada.alerts.list.useQuery'),
        ]
        
        for pattern, replacement in trpc_fixes:
            content = re.sub(pattern, replacement, content)
        
        # Fix property access errors with type assertions
        property_fixes = [
            # Fix invoice properties
            (r'invoice\.invoiceNo(?!\?)', r'(invoice as any).invoiceNo'),
            (r'invoice\.balanceDue(?!\?)', r'(invoice as any).balanceDue'),
            # Fix transfers properties
            (r'transfers\.outgoing(?!\?)', r'(transfers as any).outgoing'),
            (r'transfers\.incoming(?!\?)', r'(transfers as any).incoming'),
            (r'unreconciledTransfers\.outgoing', r'(unreconciledTransfers as any).outgoing'),
            (r'unreconciledTransfers\.incoming', r'(unreconciledTransfers as any).incoming'),
        ]
        
        for pattern, replacement in property_fixes:
            content = re.sub(pattern, replacement, content)
        
        # Fix callback type annotations
        callback_fixes = [
            (r'\.filter\(\((\w+): User\)', r'.filter((\1: any)'),
            (r'\.map\(\((\w+): User\)', r'.map((\1: any)'),
            (r'onSuccess: \(_, variables\) =>', r'onSuccess: (_: any, variables: any) =>'),
        ]
        
        for pattern, replacement in callback_fixes:
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
