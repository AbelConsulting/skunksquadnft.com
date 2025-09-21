#!/usr/bin/env python3
"""
NFT Rarity Analyzer for Skunk Squad Collection

This script analyzes the generated NFT manifest to calculate rarity scores
and identify the top rarest NFTs based on trait combinations.
"""

import pandas as pd
import json
from pathlib import Path

def calculate_rarity_score(df):
    """Calculate rarity score for each NFT based on trait rarity."""
    
    # Define rarity tier weights (higher = rarer)
    rarity_weights = {
        'common': 1,
        'rare': 3,
        'legendary': 10,
        'ultra': 25  # Not present in current generation but defined for future
    }
    
    # Calculate rarity score for each NFT
    scores = []
    
    for _, row in df.iterrows():
        score = 0
        legendary_count = 0
        rare_count = 0
        
        # Check each trait layer for rarity
        trait_layers = ['background', 'tail', 'arm_right', 'arm_left', 'head', 'emblem', 'shoes']
        
        for layer in trait_layers:
            rarity_col = f"{layer}_rarity"
            if rarity_col in df.columns:
                rarity = str(row[rarity_col]).lower()
                weight = rarity_weights.get(rarity, 1)
                score += weight
                
                if rarity == 'legendary':
                    legendary_count += 1
                elif rarity == 'rare':
                    rare_count += 1
        
        # Bonus scoring for multiple rare/legendary traits
        if legendary_count >= 3:
            score += 50  # Triple legendary bonus
        elif legendary_count >= 2:
            score += 20  # Double legendary bonus
            
        if rare_count >= 4:
            score += 15  # Quad rare bonus
        elif rare_count >= 3:
            score += 8   # Triple rare bonus
            
        scores.append({
            'edition': row['edition'],
            'rarity_score': score,
            'legendary_traits': legendary_count,
            'rare_traits': rare_count,
            'signature': row['signature']
        })
    
    return pd.DataFrame(scores)

def get_trait_summary(df, edition_num):
    """Get a summary of traits for a specific edition."""
    row = df[df['edition'] == edition_num].iloc[0]
    
    traits = {}
    trait_layers = ['background', 'tail', 'arm_right', 'arm_left', 'head', 'emblem', 'shoes']
    
    for layer in trait_layers:
        trait_col = f"{layer}_trait"
        rarity_col = f"{layer}_rarity"
        
        if trait_col in df.columns and rarity_col in df.columns:
            trait_name = str(row[trait_col])
            rarity = str(row[rarity_col])
            traits[layer] = {'trait': trait_name, 'rarity': rarity}
    
    return traits

def main():
    # Load the manifest
    manifest_path = Path("output/manifest.csv")
    if not manifest_path.exists():
        print("Error: manifest.csv not found in output directory")
        return
    
    df = pd.read_csv(manifest_path)
    
    # Calculate rarity scores
    rarity_df = calculate_rarity_score(df)
    
    # Sort by rarity score (highest first)
    top_rare = rarity_df.sort_values('rarity_score', ascending=False).head(25)
    
    print("🏆 TOP 25 RAREST SKUNK SQUAD NFTs 🏆")
    print("=" * 80)
    
    # Create detailed report
    report = []
    
    for i, (_, nft) in enumerate(top_rare.iterrows(), 1):
        edition = int(nft['edition'])
        score = nft['rarity_score']
        legendary_count = nft['legendary_traits']
        rare_count = nft['rare_traits']
        
        # Get trait details
        traits = get_trait_summary(df, edition)
        
        print(f"\n#{i:2d} - Skunk Squad #{edition:3d}")
        print(f"     Rarity Score: {score:3d} | Legendary: {legendary_count} | Rare: {rare_count}")
        print(f"     Signature: {nft['signature'][:16]}...")
        
        # Print traits with rarity indicators
        for layer, info in traits.items():
            rarity_icon = "🔥" if info['rarity'] == 'legendary' else "✨" if info['rarity'] == 'rare' else "⚪"
            print(f"     {layer:12s}: {rarity_icon} {info['trait']:20s} ({info['rarity']})")
        
        # Add to report for file output
        report.append({
            'rank': i,
            'edition': edition,
            'rarity_score': score,
            'legendary_traits': legendary_count,
            'rare_traits': rare_count,
            'signature': nft['signature'],
            'traits': traits
        })
    
    print(f"\n" + "=" * 80)
    print(f"Analysis complete! Top 25 rarest NFTs identified.")
    print(f"Total legendary traits in top 25: {top_rare['legendary_traits'].sum()}")
    print(f"Total rare traits in top 25: {top_rare['rare_traits'].sum()}")
    print(f"Average rarity score: {top_rare['rarity_score'].mean():.1f}")
    
    # Save detailed report
    report_path = Path("output/top_25_rarest_report.json")
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\nDetailed report saved to: {report_path}")
    
    # Return edition numbers for copying files
    return top_rare['edition'].tolist()

if __name__ == "__main__":
    top_editions = main()
    
    # Print edition numbers for easy reference
    print(f"\nTop 25 Edition Numbers:")
    print(f"{', '.join(map(str, top_editions))}")
