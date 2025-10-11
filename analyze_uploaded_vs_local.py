#!/usr/bin/env python3
"""
Compare uploaded NFTs from Arweave with local metadata collection
to identify what's missing from the upload.
"""

import os
import csv
import json
from pathlib import Path

def read_uploaded_nfts():
    """Read the uploaded NFTs CSV and extract NFT numbers"""
    csv_path = Path("uploaded_nfts.csv")
    if not csv_path.exists():
        print("Error: uploaded_nfts.csv not found")
        return set(), []
    
    uploaded_nfts = set()
    upload_details = []
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            filename = row.get('File Name', '')
            if filename.endswith('.png'):
                # Extract number from filename like "123.png"
                nft_number = filename.replace('.png', '')
                try:
                    nft_num = int(nft_number)
                    uploaded_nfts.add(nft_num)
                    upload_details.append({
                        'number': nft_num,
                        'filename': filename,
                        'arweave_url': row.get('Direct Download Link', ''),
                        'status': row.get('Status', ''),
                        'upload_date': row.get('Date Created', '')
                    })
                except ValueError:
                    print(f"Warning: Could not parse NFT number from '{filename}'")
    
    return uploaded_nfts, upload_details

def read_local_metadata():
    """Read local metadata files and extract NFT numbers"""
    metadata_dir = Path("metadata_arweave")
    if not metadata_dir.exists():
        print("Error: metadata_arweave directory not found")
        return set()
    
    local_nfts = set()
    
    for json_file in metadata_dir.glob("*.json"):
        filename = json_file.stem  # Gets filename without .json extension
        try:
            nft_number = int(filename)
            local_nfts.add(nft_number)
        except ValueError:
            print(f"Warning: Could not parse NFT number from '{json_file.name}'")
    
    return local_nfts

def analyze_ranges(nft_set):
    """Analyze number ranges to find gaps"""
    if not nft_set:
        return []
    
    sorted_nums = sorted(nft_set)
    ranges = []
    gaps = []
    
    start = sorted_nums[0]
    end = start
    
    for i in range(1, len(sorted_nums)):
        if sorted_nums[i] == end + 1:
            end = sorted_nums[i]
        else:
            ranges.append((start, end))
            # Record gap
            if end + 1 < sorted_nums[i]:
                gaps.append((end + 1, sorted_nums[i] - 1))
            start = sorted_nums[i]
            end = start
    
    ranges.append((start, end))
    return ranges, gaps

def main():
    print("🔍 Analyzing Uploaded vs Local NFT Collections...")
    print("=" * 60)
    
    # Read both collections
    uploaded_nfts, upload_details = read_uploaded_nfts()
    local_nfts = read_local_metadata()
    
    print(f"☁️  Uploaded to Arweave: {len(uploaded_nfts)} NFTs")
    print(f"📁 Local metadata files: {len(local_nfts)} NFTs")
    print()
    
    # Find what's missing from upload
    not_uploaded = local_nfts - uploaded_nfts
    uploaded_but_not_local = uploaded_nfts - local_nfts
    
    # Calculate percentages
    upload_percentage = (len(uploaded_nfts) / len(local_nfts)) * 100 if local_nfts else 0
    
    print(f"📊 Upload Progress: {upload_percentage:.1f}% complete")
    print(f"   • {len(uploaded_nfts):,} uploaded")
    print(f"   • {len(not_uploaded):,} remaining to upload")
    print()
    
    # Analyze upload ranges
    if uploaded_nfts:
        upload_ranges, upload_gaps = analyze_ranges(uploaded_nfts)
        upload_min, upload_max = min(uploaded_nfts), max(uploaded_nfts)
        
        print(f"📈 Upload Range Analysis:")
        print(f"   • Range: #{upload_min:,} to #{upload_max:,}")
        print(f"   • Continuous ranges: {len(upload_ranges)}")
        
        if len(upload_ranges) <= 5:
            for start, end in upload_ranges:
                if start == end:
                    print(f"     - #{start}")
                else:
                    print(f"     - #{start:,} to #{end:,} ({end-start+1:,} NFTs)")
        print()
    
    # Show what's not uploaded yet
    if not_uploaded:
        print(f"❌ Not Yet Uploaded ({len(not_uploaded):,} remaining):")
        
        # Analyze gaps in upload
        if uploaded_nfts:
            _, upload_gaps = analyze_ranges(uploaded_nfts)
            if upload_gaps:
                print(f"   📍 Main gaps in uploaded sequence:")
                for gap_start, gap_end in upload_gaps[:10]:  # Show first 10 gaps
                    gap_size = gap_end - gap_start + 1
                    if gap_size == 1:
                        print(f"     • #{gap_start}")
                    else:
                        print(f"     • #{gap_start:,} to #{gap_end:,} ({gap_size:,} NFTs)")
                if len(upload_gaps) > 10:
                    print(f"     ... and {len(upload_gaps) - 10} more gaps")
        
        # Show overall missing ranges
        missing_ranges, _ = analyze_ranges(not_uploaded)
        print(f"   📋 Missing ranges summary:")
        for i, (start, end) in enumerate(missing_ranges[:10]):
            gap_size = end - start + 1
            if start == end:
                print(f"     • #{start}")
            else:
                print(f"     • #{start:,} to #{end:,} ({gap_size:,} NFTs)")
        if len(missing_ranges) > 10:
            print(f"     ... and {len(missing_ranges) - 10} more ranges")
        print()
    else:
        print("✅ All local NFTs have been uploaded!")
        print()
    
    # Check for unexpected uploads
    if uploaded_but_not_local:
        print(f"⚠️  Uploaded but not in local metadata ({len(uploaded_but_not_local)} items):")
        for nft_num in sorted(uploaded_but_not_local)[:20]:
            print(f"   • NFT #{nft_num}")
        if len(uploaded_but_not_local) > 20:
            print(f"   ... and {len(uploaded_but_not_local) - 20} more")
        print()
    
    # Summary statistics
    total_unique = len(uploaded_nfts | local_nfts)
    print(f"📈 Summary Statistics:")
    print(f"   • Total unique NFTs: {total_unique:,}")
    print(f"   • Upload completion: {upload_percentage:.1f}%")
    print(f"   • Remaining to upload: {len(not_uploaded):,} NFTs")
    
    if local_nfts:
        local_min, local_max = min(local_nfts), max(local_nfts)
        print(f"   • Local collection range: #{local_min:,} to #{local_max:,}")
    
    if uploaded_nfts:
        upload_min, upload_max = min(uploaded_nfts), max(uploaded_nfts)
        print(f"   • Uploaded range: #{upload_min:,} to #{upload_max:,}")

if __name__ == "__main__":
    main()