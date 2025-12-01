const db = require('../config/db-config');

async function seed() {
    try {
        console.log('🌱 Seeding database with sample data...');

        // Sample members
        const sampleMembers = [
            {
                wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
                name: 'Alex Rivera',
                title: 'Blockchain Developer',
                bio: 'Building the future of Web3. Passionate about DeFi and NFT infrastructure.',
                location: 'San Francisco, CA',
                region: 'north-america',
                industry: 'tech',
                nfts: 8,
                interests: ['DeFi', 'Smart Contracts', 'Gaming', 'DAOs'],
                socials: [
                    { platform: 'twitter', url: 'https://twitter.com/alexrivera', username: '@alexrivera' },
                    { platform: 'discord', username: 'alexrivera#1234' }
                ]
            },
            {
                wallet: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
                name: 'Sarah Chen',
                title: 'NFT Artist',
                bio: 'Digital artist exploring the intersection of traditional and crypto art.',
                location: 'New York, NY',
                region: 'north-america',
                industry: 'creative',
                nfts: 3,
                interests: ['Digital Art', 'PFP Collections', 'Generative Art'],
                socials: [
                    { platform: 'twitter', url: 'https://twitter.com/sarahchen', username: '@sarahchen' },
                    { platform: 'instagram', url: 'https://instagram.com/sarahchen', username: '@sarahchen' }
                ]
            },
            {
                wallet: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
                name: 'Marcus Johnson',
                title: 'Community Manager',
                bio: 'Helping Web3 communities grow and thrive. SkunkSquad forever!',
                location: 'Los Angeles, CA',
                region: 'north-america',
                industry: 'crypto',
                nfts: 15,
                interests: ['Community Building', 'NFTs', 'Metaverse', 'Gaming'],
                socials: [
                    { platform: 'twitter', url: 'https://twitter.com/marcusj', username: '@marcusj' },
                    { platform: 'discord', username: 'marcusj#5678' }
                ]
            }
        ];

        for (const member of sampleMembers) {
            // Insert member
            const memberResult = await db.query(
                `INSERT INTO members (wallet_address, display_name, title, bio, location, region, industry, nft_count, verified, online_status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, true)
                 RETURNING id`,
                [member.wallet, member.name, member.title, member.bio, member.location, member.region, member.industry, member.nfts]
            );

            const memberId = memberResult.rows[0].id;

            // Insert interests
            for (const interest of member.interests) {
                await db.query(
                    'INSERT INTO member_interests (member_id, interest) VALUES ($1, $2)',
                    [memberId, interest]
                );
            }

            // Insert socials
            for (const social of member.socials) {
                await db.query(
                    'INSERT INTO member_socials (member_id, platform, url, username) VALUES ($1, $2, $3, $4)',
                    [memberId, social.platform, social.url || null, social.username || null]
                );
            }

            console.log(`✅ Created member: ${member.name}`);
        }

        console.log('🎉 Database seeded successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

seed();
