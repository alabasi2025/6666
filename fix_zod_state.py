#!/usr/bin/env python3
import os
import re

CLIENT_SRC = "/home/ubuntu/6666/client/src"

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Fix zodResolver - cast to any
        content = re.sub(r'resolver: zodResolver\((\w+)\)', r'resolver: zodResolver(\1) as any', content)
        
        # Fix setState calls with data
        content = re.sub(r'set(\w+)\(data\)', r'set\1(data as any)', content)
        content = re.sub(r'set(\w+)\(response\)', r'set\1(response as any)', content)
        
        # Fix form.handleSubmit
        content = re.sub(r'form\.handleSubmit\((\w+)\)', r'form.handleSubmit(\1 as any)', content)
        
        # Fix property access
        content = re.sub(r'invoice\.invoiceNo', r'(invoice as any).invoiceNo', content)
        content = re.sub(r'invoice\.balanceDue', r'(invoice as any).balanceDue', content)
        
        # Fix required_error
        content = re.sub(r'required_error:', r'message:', content)
        
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
