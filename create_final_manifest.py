import json

print("🔧 Creating manifest with metadata/ prefix...")

# Load the fixed manifest
with open('nft_manifest_fixed.json', 'r') as f:
    manifest = json.load(f)

# Create new manifest with metadata/ prefix
new_manifest = {
    "manifest": manifest['manifest'],
    "version": manifest['version'],
    "index": {
        "path": "metadata/1.json"
    },
    "paths": {}
}

# Add metadata/ prefix to all paths
for path_key, value in manifest['paths'].items():
    new_key = f"metadata/{path_key}"
    new_manifest['paths'][new_key] = value

# Save
with open('nft_manifest_final_with_path.json', 'w') as f:
    json.dump(new_manifest, f, indent=2)

print(f"✅ Created: nft_manifest_final_with_path.json")
print(f"Total paths: {len(new_manifest['paths'])}")
print("\nSample paths:")
for i, path in enumerate(list(new_manifest['paths'].keys())[:5]):
    print(f"  {path}")

print("\n📤 Upload this file to ArDrive and get its transaction ID")
