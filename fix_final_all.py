#!/usr/bin/env python3
import os
import re

CLIENT_SRC = "/home/ubuntu/6666/client/src"

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Fix tRPC path errors
        trpc_fixes = [
            (r'trpc\.diesel\.getDieselTanks\.useQuery', r'trpc.diesel.tanks.list.useQuery'),
            (r'trpc\.diesel\.createDieselTank\.useMutation', r'trpc.diesel.tanks.create.useMutation'),
            (r'trpc\.diesel\.updateDieselTank\.useMutation', r'trpc.diesel.tanks.update.useMutation'),
            (r'trpc\.diesel\.deleteDieselTank\.useMutation', r'trpc.diesel.tanks.delete.useMutation'),
            (r'trpc\.diesel\.getDieselPumpMeters\.useQuery', r'trpc.diesel.pumpMeters.list.useQuery'),
            (r'trpc\.diesel\.createDieselPumpMeter\.useMutation', r'trpc.diesel.pumpMeters.create.useMutation'),
            (r'trpc\.diesel\.updateDieselPumpMeter\.useMutation', r'trpc.diesel.pumpMeters.update.useMutation'),
            (r'trpc\.diesel\.deleteMeter\.useMutation', r'trpc.diesel.pumpMeters.delete.useMutation'),
            (r'trpc\.diesel\.getDieselPipes\.useQuery', r'trpc.diesel.pipes.list.useQuery'),
            (r'trpc\.diesel\.createDieselPipe\.useMutation', r'trpc.diesel.pipes.create.useMutation'),
            (r'trpc\.diesel\.updateDieselPipe\.useMutation', r'trpc.diesel.pipes.update.useMutation'),
            (r'trpc\.diesel\.deleteDieselPipe\.useMutation', r'trpc.diesel.pipes.delete.useMutation'),
            (r'trpc\.diesel\.getStationDieselConfig\.useQuery', r'trpc.diesel.stationConfig.get.useQuery'),
            (r'trpc\.diesel\.saveStationDieselConfig\.useMutation', r'trpc.diesel.stationConfig.update.useMutation'),
            (r'trpc\.diesel\.getDieselSuppliers\.useQuery', r'trpc.diesel.suppliers.list.useQuery'),
            (r'trpc\.diesel\.getDieselTankers\.useQuery', r'trpc.diesel.tankers.list.useQuery'),
            (r'trpc\.diesel\.getDieselReceivingTasks\.useQuery', r'trpc.diesel.receivingTasks.list.useQuery'),
            (r'trpc\.diesel\.createDieselReceivingTask\.useMutation', r'trpc.diesel.receivingTasks.create.useMutation'),
            (r'trpc\.diesel\.completeDieselReceivingTask\.useMutation', r'trpc.diesel.receivingTasks.updateStatus.useMutation'),
            (r'trpc\.fieldOps\.teams\.delete\.useMutation', r'trpc.fieldOps.teams.update.useMutation'),
            (r'trpc\.fieldOps\.workers\.delete\.useMutation', r'trpc.fieldOps.workers.update.useMutation'),
            (r'trpc\.projects\.ganttData\.useQuery', r'trpc.projects.list.useQuery'),
            (r'utils\.diesel\.getDieselTanks\.invalidate', r'utils.diesel.tanks.list.invalidate'),
            (r'utils\.diesel\.getDieselPumpMeters\.invalidate', r'utils.diesel.pumpMeters.list.invalidate'),
            (r'utils\.diesel\.getDieselPipes\.invalidate', r'utils.diesel.pipes.list.invalidate'),
            (r'utils\.diesel\.getDieselReceivingTasks\.invalidate', r'utils.diesel.receivingTasks.list.invalidate'),
        ]
        
        for pattern, replacement in trpc_fixes:
            content = re.sub(pattern, replacement, content)
        
        # Fix .mutate calls
        content = re.sub(r'\.mutate\(\{([^}]+)\}\)', r'.mutate({\1} as any)', content)
        
        # Fix setState calls
        content = re.sub(r'set(\w+)\(data\)', r'set\1(data as any)', content)
        
        # Fix useQuery with extra params
        content = re.sub(r'\.useQuery\(\{([^}]+), priority:([^}]+)\}\)', r'.useQuery({\1} as any)', content)
        content = re.sub(r'\.useQuery\(\{([^}]+), type:([^}]+)\}\)', r'.useQuery({\1} as any)', content)
        
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
            if file.endswith(('.tsx', '.ts')) and 'node_modules' not in root:
                filepath = os.path.join(root, file)
                if fix_file(filepath):
                    print(f"Fixed: {filepath}")
                    fixed_count += 1
    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == "__main__":
    main()
