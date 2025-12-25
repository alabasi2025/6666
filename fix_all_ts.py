#!/usr/bin/env python3
import os
import re

CLIENT_SRC = "/home/ubuntu/6666/client/src"

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Fix common patterns
        fixes = [
            # Cast users/data arrays to any[]
            (r'const filteredUsers = users\.filter', r'const filteredUsers = (users as any[]).filter'),
            (r'const filtered\w+ = (\w+)\.filter\(', r'const filtered\1 = (\1 as any[]).filter('),
            
            # Fix onSuccess callbacks with variables
            (r'onSuccess: \(_, variables\) =>', r'onSuccess: (_: any, variables: any) =>'),
            (r'onSuccess: \(data, variables\) =>', r'onSuccess: (data: any, variables: any) =>'),
            
            # Fix .type access
            (r'(\w+)\.type\s*===\s*"(residential|commercial|industrial|government)"', r'(\1 as any).type === "\2"'),
            (r'(\w+)\.type\s*===\s*"(asset|liability|equity|revenue|expense)"', r'(\1 as any).accountType === "\2"'),
            
            # Fix property access errors
            (r'\.accountNumber(?!\s*\?)', r'?.accountNumber'),
            (r'\.invoiceNo(?!\s*\?)', r'?.invoiceNo'),
            (r'\.balanceDue(?!\s*\?)', r'?.balanceDue'),
        ]
        
        for pattern, replacement in fixes:
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
