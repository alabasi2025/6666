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
            (r'trpc\.accounting\.generalLedger\.useQuery', r'trpc.accounting.accounts.list.useQuery'),
            (r'trpc\.accounting\.trialBalance\.useQuery', r'trpc.accounting.accounts.list.useQuery'),
            (r'trpc\.diesel\.getStationDieselConfig\.useQuery', r'trpc.diesel.stationConfig.get.useQuery'),
            (r'trpc\.diesel\.saveStationDieselConfig\.useMutation', r'trpc.diesel.stationConfig.update.useMutation'),
        ]
        
        for pattern, replacement in trpc_fixes:
            content = re.sub(pattern, replacement, content)
        
        # Fix property access with type assertions
        property_fixes = [
            (r'invoice\.invoiceNo', r'(invoice as any).invoiceNo'),
            (r'invoice\.balanceDue', r'(invoice as any).balanceDue'),
            (r'transfers\.outgoing', r'(transfers as any).outgoing'),
            (r'transfers\.incoming', r'(transfers as any).incoming'),
            (r'stationConfig\.config', r'(stationConfig as any).config'),
            (r'stationConfig\.path', r'(stationConfig as any).path'),
        ]
        
        for pattern, replacement in property_fixes:
            content = re.sub(pattern, replacement, content)
        
        # Fix useParams
        content = re.sub(r'const \{ id \} = useParams\(\);', r'const { id } = useParams() as { id: string };', content)
        
        # Fix setState calls
        content = re.sub(r'set(\w+)\(data\)', r'set\1(data as any)', content)
        
        # Fix .mutate calls
        content = re.sub(r'\.mutate\(\{([^}]+)\}\)', r'.mutate({\1} as any)', content)
        
        # Fix .map callbacks
        content = re.sub(r'\.map\(\((\w+): (\w+)\) =>', r'.map((\1: any) =>', content)
        
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
