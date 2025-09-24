const fs = require('fs');
const csv = require('csv-parser');

async function generateTestCollection() {
    console.log('🎨 Generating 100 SkunkSquad Test NFTs...');
    
    // Create output directories
    if (!fs.existsSync('test_collection')) fs.mkdirSync('test_collection');
    if (!fs.existsSync('test_collection/metadata')) fs.mkdirSync('test_collection/metadata');
    
    const traits = {};
    
    // Load your traits catalog
    fs.createReadStream('traits_catalog.mapped.fixed.csv')
        .pipe(csv())
        .on('data', (row) => {
            if (!traits[row.layer]) traits[row.layer] = [];
            traits[row.layer].push({
                name: row.trait_name,
                file: row.file,
                weight: parseInt(row.weight) || 1,
                rarity: row.rarity_tier
            });
        })
        .on('end', () => {
            console.log('✅ Traits loaded from catalog');
            console.log('📊 Trait layers found:', Object.keys(traits));
            generateTestMetadata(traits);
        })
        .on('error', (error) => {
            console.error('❌ Error reading traits catalog:', error.message);
        });
}

function generateTestMetadata(traits) {
    const generatedCombinations = new Set();
    let successCount = 0;
    
    for (let i = 1; i <= 100; i++) {
        try {
            let selectedTraits;
            let combinationKey;
            let attempts = 0;
            
            // Try to generate unique combination (with fallback)
            do {
                selectedTraits = selectRandomTraits(traits);
                combinationKey = JSON.stringify(selectedTraits);
                attempts++;
            } while (generatedCombinations.has(combinationKey) && attempts < 50);
            
            generatedCombinations.add(combinationKey);
            
            // Generate metadata
            const metadata = {
                name: `SkunkSquad Test #${i}`,
                description: "A test member of the revolutionary SkunkSquad NFT collection featuring credit card payments and ERC-721 Ultra smart contracts.",
                image: `ipfs://QmPLACEHOLDER${i}`, // Will be updated after IPFS upload
                external_url: "https://skunksquadnft.com",
                attributes: Object.keys(selectedTraits).map(layer => ({
                    trait_type: layer.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    value: selectedTraits[layer].name,
                    rarity: selectedTraits[layer].rarity
                }))
            };
            
            // Save metadata
            fs.writeFileSync(`test_collection/metadata/${i}.json`, JSON.stringify(metadata, null, 2));
            successCount++;
            
            if (i % 10 === 0) console.log(`✅ Generated ${i}/100 test NFTs`);
            
        } catch (error) {
            console.error(`❌ Error generating NFT #${i}:`, error.message);
        }
    }
    
    console.log(`🎉 Test collection generated! ${successCount}/100 successful`);
    console.log('📁 Files saved to: test_collection/metadata/');
    console.log('🔄 Next: Upload to IPFS');
}

function selectRandomTraits(traits) {
    const selected = {};
    
    for (const [layer, options] of Object.entries(traits)) {
        if (options.length === 0) continue;
        
        try {
            const totalWeight = options.reduce((sum, trait) => sum + (trait.weight || 1), 0);
            let random = Math.random() * totalWeight;
            
            for (const trait of options) {
                random -= (trait.weight || 1);
                if (random <= 0) {
                    selected[layer] = trait;
                    break;
                }
            }
        } catch (error) {
            // Fallback: random selection if weights fail
            const randomIndex = Math.floor(Math.random() * options.length);
            selected[layer] = options[randomIndex];
        }
    }
    
    return selected;
}

generateTestCollection();