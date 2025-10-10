#!/usr/bin/env python3
"""
Process Arweave Export CSV to Create Transaction ID Mapping
"""

import csv
import re
from pathlib import Path

def extract_token_id_from_filename(filename):
    """Extract token ID from filename like '123.png' -> 123"""
    match = re.match(r'^(\d+)\.png$', filename)
    if match:
        return int(match.group(1))
    return None

def validate_arweave_txid(txid):
    """Validate Arweave transaction ID format"""
    # Arweave transaction IDs are 43 characters long, base64url encoded
    if len(txid) != 43:
        return False
    
    # Check if it contains only valid base64url characters
    pattern = r'^[A-Za-z0-9_-]+$'
    return bool(re.match(pattern, txid))

def process_arweave_export():
    """Process the Arweave export CSV and create txid_mapping.csv"""
    
    print("🦨 Skunk Squad NFT - Processing Arweave Export")
    print("=" * 50)
    
    # Input and output files
    input_file = "arweave_export.csv"
    output_file = "txid_mapping.csv"
    
    if not Path(input_file).exists():
        print(f"❌ Error: {input_file} not found!")
        return False
    
    print(f"📂 Processing: {input_file}")
    
    # Store the mapping
    txid_mapping = {}
    invalid_entries = []
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            # Read CSV with proper handling of the export format
            reader = csv.DictReader(f)
            
            for row_num, row in enumerate(reader, start=2):  # Start at 2 for line numbers (header is line 1)
                filename = row.get('File Name', '').strip()
                data_txid = row.get('Data Transaction ID', '').strip()
                
                # Extract token ID from filename
                token_id = extract_token_id_from_filename(filename)
                
                if token_id is None:
                    invalid_entries.append(f"Line {row_num}: Invalid filename format '{filename}'")
                    continue
                
                if not data_txid:
                    invalid_entries.append(f"Line {row_num}: Missing transaction ID for {filename}")
                    continue
                
                if not validate_arweave_txid(data_txid):
                    invalid_entries.append(f"Line {row_num}: Invalid transaction ID format '{data_txid}' for {filename}")
                    continue
                
                # Check for duplicates
                if token_id in txid_mapping:
                    invalid_entries.append(f"Line {row_num}: Duplicate token ID {token_id} (filename: {filename})")
                    continue
                
                txid_mapping[token_id] = data_txid
                
                # Show progress for first few entries
                if len(txid_mapping) <= 5:
                    print(f"   ✅ NFT #{token_id:3d} -> {data_txid}")
    
    except Exception as e:
        print(f"❌ Error reading {input_file}: {e}")
        return False
    
    # Report results
    print(f"\n📊 Processing Results:")
    print(f"   ✅ Valid entries: {len(txid_mapping)}")
    print(f"   ❌ Invalid entries: {len(invalid_entries)}")
    
    if invalid_entries:
        print(f"\n⚠️  Invalid Entries:")
        for entry in invalid_entries[:10]:  # Show first 10 invalid entries
            print(f"   {entry}")
        if len(invalid_entries) > 10:
            print(f"   ... and {len(invalid_entries) - 10} more")
    
    if not txid_mapping:
        print("❌ No valid transaction IDs found!")
        return False
    
    # Check for gaps in token IDs
    min_token = min(txid_mapping.keys())
    max_token = max(txid_mapping.keys())
    expected_tokens = set(range(min_token, max_token + 1))
    missing_tokens = expected_tokens - set(txid_mapping.keys())
    
    if missing_tokens:
        print(f"\n⚠️  Missing token IDs in range {min_token}-{max_token}:")
        missing_list = sorted(list(missing_tokens))
        if len(missing_list) <= 20:
            print(f"   {missing_list}")
        else:
            print(f"   {missing_list[:10]} ... and {len(missing_list) - 10} more")
    
    # Write the mapping file
    try:
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['token_id', 'image_txid'])
            
            # Sort by token ID for better organization
            for token_id in sorted(txid_mapping.keys()):
                writer.writerow([token_id, txid_mapping[token_id]])
        
        print(f"\n✅ Created: {output_file}")
        print(f"📝 Contains {len(txid_mapping)} transaction ID mappings")
        print(f"🎯 Token ID range: {min_token} to {max_token}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error writing {output_file}: {e}")
        return False

def main():
    success = process_arweave_export()
    
    if success:
        print(f"\n🎉 Processing complete!")
        print(f"📋 Next steps:")
        print(f"   1. Review txid_mapping.csv")
        print(f"   2. Run generate_arweave_metadata.py")
        print(f"   3. Deploy to blockchain!")
    else:
        print(f"\n❌ Processing failed. Please check the errors above.")

if __name__ == "__main__":
    main()