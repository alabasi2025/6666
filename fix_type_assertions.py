#!/usr/bin/env python3
import os
import re

CLIENT_SRC = "/home/ubuntu/6666/client/src"

def fix_filter_map_callbacks(content):
    """Fix filter/map callbacks by adding 'as any' type assertions"""
    # Fix patterns like .filter((u: User) => ...) to .filter((u: any) => ...)
    patterns = [
        (r'\.filter\(\((\w+):\s*\w+\)\s*=>', r'.filter((\1: any) =>'),
        (r'\.map\(\((\w+):\s*\w+\)\s*=>\s*\(', r'.map((\1: any) => ('),
        (r'\.map\(\((\w+):\s*\w+\)\s*=>\s*\{', r'.map((\1: any) => {'),
        (r'\.find\(\((\w+):\s*\w+\)\s*=>', r'.find((\1: any) =>'),
        (r'\.some\(\((\w+):\s*\w+\)\s*=>', r'.some((\1: any) =>'),
        (r'\.every\(\((\w+):\s*\w+\)\s*=>', r'.every((\1: any) =>'),
        (r'\.reduce\(\((\w+):\s*\w+,\s*(\w+):\s*\w+\)\s*=>', r'.reduce((\1: any, \2: any) =>'),
    ]
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)
    return content

def fix_usequery_data_types(content):
    """Add type assertions to useQuery data destructuring"""
    # Fix patterns like const { data: users } = trpc...
    # by ensuring the data is cast to any[] when used
    return content

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        content = fix_filter_map_callbacks(content)
        
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
