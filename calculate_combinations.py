#!/usr/bin/env python3
"""
Calculate total possible combinations for Skunk Squad NFT collection
"""

import pandas as pd
from collections import defaultdict
import math

def calculate_combinations():
    # Load the traits catalog
    df = pd.read_csv('traits_catalog.csv')
    
    # Count unique traits per layer
    layer_counts = defaultdict(set)
    
    for _, row in df.iterrows():
        layer = str(row['layer']).strip()
        trait_name = str(row['trait_name']).strip()
        layer_counts[layer].add(trait_name)
    
    # Convert sets to counts
    counts_per_layer = {layer: len(traits) for layer, traits in layer_counts.items()}
    
    # Display per-layer breakdown
    print("🎨 SKUNK SQUAD NFT COMBINATIONS CALCULATOR")
    print("=" * 50)
    print("\n📊 Traits per Layer:")
    
    total_combinations = 1
    for layer in sorted(counts_per_layer.keys()):
        count = counts_per_layer[layer]
        total_combinations *= count
        print(f"   {layer.capitalize():12} : {count:2d} traits")
    
    # Calculate total combinations
    print(f"\n🧮 Calculation:")
    calculation_str = " × ".join([str(counts_per_layer[layer]) for layer in sorted(counts_per_layer.keys())])
    print(f"   {calculation_str}")
    
    print(f"\n🎯 TOTAL POSSIBLE COMBINATIONS: {total_combinations:,}")
    
    # Analysis for 10K collection
    print(f"\n📈 Collection Analysis:")
    print(f"   Target Collection Size: 10,000 NFTs")
    print(f"   Possible Combinations:  {total_combinations:,}")
    
    if total_combinations >= 10000:
        uniqueness_ratio = (10000 / total_combinations) * 100
        print(f"   Uniqueness Potential:   ✅ EXCELLENT")
        print(f"   Collection will use:    {uniqueness_ratio:.1f}% of possibilities")
        print(f"   Rarity distribution:    🎲 Highly varied and collectible!")
    else:
        print(f"   Uniqueness Potential:   ⚠️  LIMITED")
        print(f"   May have duplicate combinations in 10K collection")
    
    # Rarity breakdown
    print(f"\n🏆 Rarity Tier Analysis:")
    rarity_counts = df['rarity_tier'].value_counts()
    for rarity, count in rarity_counts.items():
        percentage = (count / len(df)) * 100
        print(f"   {rarity.capitalize():10} : {count:2d} traits ({percentage:.1f}%)")
    
    return total_combinations, counts_per_layer

if __name__ == "__main__":
    calculate_combinations()