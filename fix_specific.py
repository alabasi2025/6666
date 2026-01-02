#!/usr/bin/env python3
import re

files_to_fix = [
    '/home/ubuntu/6666/client/src/pages/Dashboard.tsx',
    '/home/ubuntu/6666/client/src/pages/billing/customers/CustomersManagement.tsx',
    '/home/ubuntu/6666/client/src/pages/custom/SubSystemDetails.tsx'
]

for filepath in files_to_fix:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix .children.map pattern
        content = re.sub(r'(\w+)\.children\.map\(\((\w+): any\)', r'((\1 as any).children || []).map((\2: any)', content)
        
        # Fix .meters.map pattern
        content = re.sub(r'(\w+)\.meters\.map\(\((\w+): any\)', r'((\1 as any).meters || []).map((\2: any)', content)
        
        # Fix transfers.outgoing.map pattern
        content = re.sub(r'transfers\.outgoing\.map\(\((\w+): any\)', r'((transfers as any).outgoing || []).map((\1: any)', content)
        
        # Fix transfers.incoming.map pattern
        content = re.sub(r'transfers\.incoming\.map\(\((\w+): any\)', r'((transfers as any).incoming || []).map((\1: any)', content)
        
        # Fix unreconciledTransfers.outgoing.map pattern
        content = re.sub(r'unreconciledTransfers\.outgoing\.map\(\((\w+): any\)', r'((unreconciledTransfers as any).outgoing || []).map((\1: any)', content)
        
        # Fix unreconciledTransfers.incoming.map pattern
        content = re.sub(r'unreconciledTransfers\.incoming\.map\(\((\w+): any\)', r'((unreconciledTransfers as any).incoming || []).map((\1: any)', content)
        
        # Fix control prop
        content = re.sub(r'control=\{(\w+)\.control\}', r'control={\1.control as any}', content)
        
        # Fix .mutate and .mutateAsync
        content = re.sub(r'\.mutate\(\{([^}]+)\}\)', r'.mutate({\1} as any)', content)
        content = re.sub(r'\.mutateAsync\(\{([^}]+)\}\)', r'.mutateAsync({\1} as any)', content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

