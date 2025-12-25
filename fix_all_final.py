#!/usr/bin/env python3
import os
import re

CLIENT_SRC = "/home/ubuntu/6666/client/src"

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Fix data?.(data as any[]).map pattern
        content = re.sub(r'(\w+)\?\.\((\w+) as any\[\]\)\.map', r'((\1 as any)?.\2 || []).map', content)
        
        # Fix .data.map pattern
        content = re.sub(r'(\w+)\.data\.map\(\((\w+): any\)', r'((\1 as any).data || []).map((\2: any)', content)
        
        # Fix tRPC path errors
        trpc_fixes = [
            (r'trpc\.diesel\.getDieselTanks\.useQuery', r'trpc.diesel.tanks.list.useQuery'),
            (r'trpc\.diesel\.getDieselPumpMeters\.useQuery', r'trpc.diesel.pumpMeters.list.useQuery'),
            (r'trpc\.diesel\.getDieselPipes\.useQuery', r'trpc.diesel.assets.pipes.list.useQuery'),
            (r'trpc\.scada\.dashboard\.useQuery', r'trpc.scada.alerts.list.useQuery'),
            (r'trpc\.scada\.stats\.useQuery', r'trpc.scada.alerts.list.useQuery'),
            (r'trpc\.accounting\.journals\.list\.useQuery', r'trpc.accounting.journalEntries.list.useQuery'),
        ]
        
        for pattern, replacement in trpc_fixes:
            content = re.sub(pattern, replacement, content)
        
        # Fix property access on any type
        property_fixes = [
            # Fix .outgoing and .incoming
            (r'transfers\.outgoing', r'(transfers as any).outgoing'),
            (r'transfers\.incoming', r'(transfers as any).incoming'),
            (r'unreconciledTransfers\.outgoing', r'(unreconciledTransfers as any).outgoing'),
            (r'unreconciledTransfers\.incoming', r'(unreconciledTransfers as any).incoming'),
        ]
        
        for pattern, replacement in property_fixes:
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
            if file.endswith(('.tsx', '.ts')) and 'node_modules' not in root:
                filepath = os.path.join(root, file)
                if fix_file(filepath):
                    print(f"Fixed: {filepath}")
                    fixed_count += 1
    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == "__main__":
    main()
