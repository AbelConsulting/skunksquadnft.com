#!/usr/bin/env python3
"""
Transaction ID Collection Helper for Arweave Upload
"""

import csv
import json
from pathlib import Path

def create_txid_template():
    """Create a CSV template for transaction ID mapping"""
    
    print("🔄 Creating transaction ID mapping template...")
    
    # Create template with all 10,000 NFT entries
    template_file = "txid_mapping_template.csv"
    
    with open(template_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['token_id', 'image_txid', 'image_filename'])
        
        for i in range(1, 10001):
            writer.writerow([i, f'TXID_FOR_NFT_{i}', f'{i}.png'])
    
    print(f"✅ Created template: {template_file}")
    print(f"📝 Contains {10000} entries ready for transaction IDs")
    print("\n📋 Next steps:")
    print("   1. Replace TXID_FOR_NFT_X with actual transaction IDs")
    print("   2. Save the file as 'txid_mapping.csv'")
    print("   3. Run generate_arweave_metadata.py")
    
    return template_file

def parse_ardrive_cli_output(log_file):
    """Parse ArDrive CLI output to extract transaction IDs"""
    
    if not Path(log_file).exists():
        print(f"❌ Log file not found: {log_file}")
        return False
    
    print(f"🔄 Parsing ArDrive CLI output: {log_file}")
    
    txid_map = {}
    
    with open(log_file, 'r') as f:
        lines = f.readlines()
    
    # Look for patterns like:
    # "Successfully uploaded 1.png with transaction ID: ABC123..."
    # or similar patterns
    
    for line in lines:
        line = line.strip()
        
        # Common patterns to look for
        if 'transaction' in line.lower() and '.png' in line:
            # Try to extract filename and transaction ID
            # This is a generic parser - adjust based on your actual log format
            
            parts = line.split()
            filename = None
            txid = None
            
            for part in parts:
                if part.endswith('.png'):
                    filename = part
                elif len(part) == 43 and part.isalnum():  # Typical Arweave TXID length
                    txid = part
            
            if filename and txid:
                # Extract token ID from filename (1.png -> 1)
                token_id = int(filename.replace('.png', ''))
                txid_map[token_id] = txid
                
                if len(txid_map) <= 5:  # Show first 5 as examples
                    print(f"   📝 Found: NFT #{token_id} -> {txid}")
    
    if txid_map:
        # Save the mapping
        output_file = "txid_mapping.csv"
        with open(output_file, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['token_id', 'image_txid'])
            
            for token_id in sorted(txid_map.keys()):
                writer.writerow([token_id, txid_map[token_id]])
        
        print(f"\n✅ Extracted {len(txid_map)} transaction IDs")
        print(f"💾 Saved to: {output_file}")
        return True
    else:
        print("❌ No transaction IDs found in log file")
        print("📋 Log format might be different than expected")
        return False

def create_batch_query_script():
    """Create a script to query ArDrive for transaction IDs"""
    
    script_content = '''#!/usr/bin/env python3
"""
Query ArDrive for uploaded file transaction IDs
"""

import subprocess
import csv
import json
from pathlib import Path

def query_ardrive_files():
    """Query ArDrive CLI to get file listings with transaction IDs"""
    
    print("🔄 Querying ArDrive for uploaded files...")
    
    try:
        # Use ArDrive CLI to list files (adjust drive-id as needed)
        # You'll need to replace YOUR_DRIVE_ID with your actual ArDrive folder ID
        result = subprocess.run([
            'ardrive', 'list-files', 
            '--drive-id', 'YOUR_DRIVE_ID',
            '--format', 'json'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            files_data = json.loads(result.stdout)
            
            txid_map = {}
            for file_info in files_data:
                filename = file_info.get('name', '')
                txid = file_info.get('transactionId', '')
                
                if filename.endswith('.png') and txid:
                    try:
                        token_id = int(filename.replace('.png', ''))
                        txid_map[token_id] = txid
                    except ValueError:
                        continue
            
            # Save mapping
            if txid_map:
                with open('txid_mapping.csv', 'w', newline='') as f:
                    writer = csv.writer(f)
                    writer.writerow(['token_id', 'image_txid'])
                    
                    for token_id in sorted(txid_map.keys()):
                        writer.writerow([token_id, txid_map[token_id]])
                
                print(f"✅ Found {len(txid_map)} transaction IDs")
                return True
            else:
                print("❌ No matching files found")
                return False
        else:
            print(f"❌ ArDrive CLI error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error querying ArDrive: {e}")
        return False

if __name__ == "__main__":
    query_ardrive_files()
'''
    
    with open("query_ardrive_txids.py", 'w') as f:
        f.write(script_content)
    
    print("📝 Created ArDrive query script: query_ardrive_txids.py")
    print("📋 Edit the script to add your ArDrive folder ID")

def main():
    print("🦨 Skunk Squad NFT - Transaction ID Collection Helper")
    print("=" * 60)
    print()
    print("How did you upload your images to Arweave?")
    print()
    print("1. 📄 I have ArDrive CLI output/log file")
    print("2. 🌐 I used ArDrive web interface (manual collection)")
    print("3. 🔍 I want to query ArDrive to get transaction IDs")
    print("4. 📝 I want to create a template to fill manually")
    print()
    
    choice = input("Enter your choice (1-4): ").strip()
    
    if choice == "1":
        log_file = input("Enter path to ArDrive CLI log file: ").strip()
        parse_ardrive_cli_output(log_file)
        
    elif choice == "2":
        print("\n📋 For manual collection from ArDrive web interface:")
        print("   1. Go to your ArDrive folder")
        print("   2. Click on each uploaded image")
        print("   3. Copy the transaction ID from the file details")
        print("   4. Use the template to organize them")
        print()
        create_txid_template()
        
    elif choice == "3":
        create_batch_query_script()
        print("\n📋 Next steps:")
        print("   1. Edit query_ardrive_txids.py with your drive ID")
        print("   2. Run: python query_ardrive_txids.py")
        
    elif choice == "4":
        create_txid_template()
        
    else:
        print("❌ Invalid choice. Please run again.")

if __name__ == "__main__":
    main()