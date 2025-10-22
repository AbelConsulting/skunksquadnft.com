import json

with open('nft_manifest_ready.json') as f:
    manifest = json.load(f)

existing = set(int(k) for k in manifest['paths'].keys())
all_tokens = set(range(1, 10001))
missing = all_tokens - existing

if missing:
    print(f"❌ Missing {len(missing)} token ID(s): {sorted(missing)}")
else:
    print("✅ All 10,000 tokens present!")

print(f"\nTotal tokens in manifest: {len(existing)}")
