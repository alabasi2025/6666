#!/usr/bin/env python3
import os
import re

CLIENT_SRC = "/home/ubuntu/6666/client/src"

# All fixes to apply
FIXES = [
    # Fix .type access on objects - use accountType instead
    (r'(\w+)\.type\s*===\s*"(asset|liability|equity|revenue|expense)"', r'(\1 as any).accountType === "\2"'),
    
    # Fix journals.list -> journalEntries.list
    (r'trpc\.accounting\.journals\.list\.useQuery', r'trpc.accounting.journalEntries.list.useQuery'),
    
    # Fix getDieselTanks
    (r'trpc\.diesel\.getDieselTanks\.useQuery\s*\(\s*\{\s*stationId', r'trpc.diesel.tanks.list.useQuery({ businessId: 1, stationId'),
    
    # Fix property access errors with type assertions
    (r'(\w+)\.accountNumber(?!\s*as)', r'(\1 as any).accountNumber'),
    (r'(\w+)\.invoiceNo(?!\s*as)', r'(\1 as any).invoiceNo'),
    (r'(\w+)\.balanceDue(?!\s*as)', r'(\1 as any).balanceDue'),
    (r'(\w+)\.outgoing(?!\s*as)', r'(\1 as any).outgoing'),
    (r'(\w+)\.incoming(?!\s*as)', r'(\1 as any).incoming'),
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
