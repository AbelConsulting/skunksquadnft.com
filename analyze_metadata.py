#!/usr/bin/env python3
"""
Analyze NFT metadata files for completeness and issues.
"""

import json
import os
from pathlib import Path
from collections import defaultdict

def analyze_metadata_files():
    """Analyze all metadata files in the collection"""
    metadata_dir = Path("metadata_arweave")
    
    if not metadata_dir.exists():
        print("❌ metadata_arweave directory not found!")
        return
    
    print("🔍 Analyzing NFT Metadata Files...")
    print("=" * 50)
    
    # Counters and collectors
    total_files = 0
    valid_files = 0
    invalid_files = []
    missing_numbers = []
    issues = []
    
    # Attribute analysis
    all_attributes = defaultdict(set)
    rarity_counts = defaultdict(int)
    
    # Check for expected range (1-10000)
    expected_numbers = set(range(1, 10001))
    found_numbers = set()
    
    # Process all JSON files
    for json_file in sorted(metadata_dir.glob("*.json")):
        total_files += 1
        filename = json_file.stem
        
        try:
            # Parse number from filename
            nft_number = int(filename)
            found_numbers.add(nft_number)
            
            # Read and validate JSON
            with open(json_file, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            # Validate required fields
            required_fields = ['name', 'description', 'image', 'attributes']
            missing_fields = [field for field in required_fields if field not in metadata]
            
            if missing_fields:
                issues.append(f"#{nft_number}: Missing fields: {missing_fields}")
                continue
            
            # Validate name format
            expected_name = f"Skunk Squad #{nft_number}"
            if metadata.get('name') != expected_name:
                issues.append(f"#{nft_number}: Name mismatch. Expected '{expected_name}', got '{metadata.get('name')}'")
            
            # Validate image URL
            image_url = metadata.get('image', '')
            if not image_url.startswith('ar://'):
                issues.append(f"#{nft_number}: Invalid image URL format: {image_url}")
            
            # Analyze attributes
            attributes = metadata.get('attributes', [])
            if not isinstance(attributes, list):
                issues.append(f"#{nft_number}: Attributes should be a list")
                continue
            
            # Collect attribute data
            for attr in attributes:
                if isinstance(attr, dict) and 'trait_type' in attr and 'value' in attr:
                    trait_type = attr['trait_type']
                    value = attr['value']
                    rarity = attr.get('rarity_tier', 'unknown')
                    
                    all_attributes[trait_type].add(value)
                    rarity_counts[rarity] += 1
                else:
                    issues.append(f"#{nft_number}: Invalid attribute format")
            
            valid_files += 1
            
        except ValueError:
            invalid_files.append(f"{json_file.name} (not a valid number)")
        except json.JSONDecodeError:
            invalid_files.append(f"{json_file.name} (invalid JSON)")
        except Exception as e:
            invalid_files.append(f"{json_file.name} (error: {str(e)})")
    
    # Find missing numbers
    missing_numbers = sorted(expected_numbers - found_numbers)
    
    # Report results
    print(f"📊 File Analysis Results:")
    print(f"   • Total metadata files: {total_files:,}")
    print(f"   • Valid files: {valid_files:,}")
    print(f"   • Invalid files: {len(invalid_files)}")
    print(f"   • Missing numbers: {len(missing_numbers)}")
    print()
    
    if invalid_files:
        print(f"❌ Invalid Files ({len(invalid_files)}):")
        for file_issue in invalid_files[:10]:
            print(f"   • {file_issue}")
        if len(invalid_files) > 10:
            print(f"   ... and {len(invalid_files) - 10} more")
        print()
    
    if missing_numbers:
        print(f"❌ Missing Metadata Files ({len(missing_numbers)}):")
        if len(missing_numbers) <= 20:
            for num in missing_numbers:
                print(f"   • #{num}.json")
        else:
            # Show ranges for large gaps
            ranges = []
            start = missing_numbers[0]
            end = start
            
            for i in range(1, len(missing_numbers)):
                if missing_numbers[i] == end + 1:
                    end = missing_numbers[i]
                else:
                    ranges.append((start, end))
                    start = missing_numbers[i]
                    end = start
            ranges.append((start, end))
            
            for start, end in ranges[:10]:
                if start == end:
                    print(f"   • #{start}.json")
                else:
                    print(f"   • #{start}.json to #{end}.json ({end-start+1} files)")
        print()
    
    if issues:
        print(f"⚠️  Metadata Issues ({len(issues)}):")
        for issue in issues[:10]:
            print(f"   • {issue}")
        if len(issues) > 10:
            print(f"   ... and {len(issues) - 10} more issues")
        print()
    
    # Attribute summary
    print(f"🎨 Attribute Analysis:")
    print(f"   • Trait types found: {len(all_attributes)}")
    for trait_type, values in all_attributes.items():
        print(f"     - {trait_type}: {len(values)} unique values")
    print()
    
    print(f"💎 Rarity Distribution:")
    total_traits = sum(rarity_counts.values())
    for rarity, count in sorted(rarity_counts.items()):
        percentage = (count / total_traits) * 100 if total_traits > 0 else 0
        print(f"   • {rarity}: {count:,} traits ({percentage:.1f}%)")
    print()
    
    # Overall status
    completion_rate = (valid_files / 10000) * 100 if 10000 > 0 else 0
    
    print(f"📈 Overall Status:")
    print(f"   • Collection completion: {completion_rate:.1f}%")
    print(f"   • Ready for minting: {'✅ Yes' if completion_rate == 100 and len(issues) == 0 else '❌ No'}")
    
    if completion_rate == 100 and len(issues) == 0:
        print("   🎉 Perfect! All metadata files are present and valid!")
    elif len(missing_numbers) > 0:
        print(f"   ⚠️  {len(missing_numbers)} metadata files are missing")
    elif len(issues) > 0:
        print(f"   ⚠️  {len(issues)} metadata issues need to be fixed")

if __name__ == "__main__":
    analyze_metadata_files()