import json

print("🔍 Analyzing Manifest Structure...\n")

# Load the manifest
with open('nft_manifest_ready.json', 'r') as f:
    manifest = json.load(f)

# Check the structure
print("Manifest type:", manifest.get('manifest'))
print("Total paths:", len(manifest.get('paths', {})))

# Show some sample paths
paths = manifest.get('paths', {})
sample_keys = sorted([int(k) for k in paths.keys() if k.isdigit()])[:5]

print("\n📋 Sample path structure:")
for key in sample_keys:
    path_key = str(key)
    print(f"   Path: '{path_key}' → TXID: {paths[path_key]['id'][:20]}...")

print("\n❓ ISSUE IDENTIFIED:")
print("   Contract expects: ar://MANIFEST/metadata/1.json")
print("   Manifest has paths: '1', '2', '3' (no .json extension)")
print("   Result: Path mismatch!")

print("\n✅ SOLUTION OPTIONS:")
print("\n   Option 1: Update manifest paths to include .json")
print("      Change paths from '1' to '1.json'")
print("      Requires re-uploading manifest")

print("\n   Option 2: Change contract baseURI")
print("      Remove .json concatenation from contract (requires redeployment)")

print("\n   Option 3: Update base URI to point directly to files")
print("      Don't use manifest, just use individual TXIDs")

print("\n🔧 Creating fixed manifest with .json paths...")

# Create new manifest with .json extensions
fixed_manifest = {
    "manifest": manifest.get('manifest'),
    "version": manifest.get('version'),
    "index": {
        "path": "1.json"
    },
    "paths": {}
}

for token_id_str, value in paths.items():
    # Add .json extension to each path
    fixed_manifest['paths'][f"{token_id_str}.json"] = value

# Save fixed manifest
with open('nft_manifest_fixed.json', 'w') as f:
    json.dump(fixed_manifest, f, indent=2)

print(f"✅ Created: nft_manifest_fixed.json")
print(f"   Total paths: {len(fixed_manifest['paths'])}")
print(f"\n📋 Sample fixed paths:")
sample_fixed = sorted([k for k in fixed_manifest['paths'].keys() if k.replace('.json', '').isdigit()])[:5]
for path in sample_fixed:
    print(f"   Path: '{path}' → TXID: {fixed_manifest['paths'][path]['id'][:20]}...")

print("\n📤 NEXT STEP:")
print("   Upload nft_manifest_fixed.json to ArDrive")
print("   Get its transaction ID")
print("   Update contract base URI to: ar://NEW_TXID/metadata/")
