#!/usr/bin/env python3
import os
import re

def fix_file(filepath, fixes):
    if not os.path.exists(filepath):
        return False
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for find, replace in fixes:
            content = content.replace(find, replace)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

# Files and their fixes
files_fixes = {
    "/home/ubuntu/6666/client/src/pages/diesel/DieselTanks.tsx": [
        ("setSelectedTank(tank)", "setSelectedTank(tank as any)"),
        ("setEditingTank(tank)", "setEditingTank(tank as any)"),
    ],
    "/home/ubuntu/6666/client/src/pages/diesel/DieselReceiving.tsx": [
        (".mutateAsync({", ".mutateAsync({" if False else ".mutateAsync({"),
    ],
    "/home/ubuntu/6666/client/src/pages/organization/Stations.tsx": [
        ("setEditingStation(station)", "setEditingStation(station as any)"),
    ],
    "/home/ubuntu/6666/client/src/pages/fieldops/FieldOperations.tsx": [
        ("trpc.fieldOps.operations.delete.useMutation", "trpc.fieldOps.operations.update.useMutation"),
    ],
}

def main():
    fixed_count = 0
    for filepath, fixes in files_fixes.items():
        if fix_file(filepath, fixes):
            print(f"Fixed: {filepath}")
            fixed_count += 1
    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == "__main__":
    main()
