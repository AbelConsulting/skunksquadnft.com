const db = require('../config/db-config');

async function seed() {
    try {
        console.log('🌱 Seeding SkunkSquad Networking database with sample data...');

        // Sample members from the SkunkSquad community
        const sampleMembers = [
            {
                wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
                name: 'CryptoSkunk',
                title: 'Blockchain Developer & DeFi Enthusiast',
                bio: 'Building the future of Web3 with SkunkSquad. Core contributor to multiple DeFi protocols.',
                location: 'San Francisco, CA',
                region: 'north-america',
                industry: 'tech',
                nfts: 12,
                interests: ['DeFi', 'Smart Contracts', 'DAO Governance', 'NFT Infrastructure'],
                socials: [
                    { platform: 'twitter', url: 'https://twitter.com/cryptoskunk', username: '@cryptoskunk' },
                    { platform: 'discord', username: 'CryptoSkunk#1337' }
                ]
            },
            {
                wallet: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
                name: 'SkunkArtist',
                title: 'Digital Artist & NFT Creator',
                bio: 'Passionate about creating unique digital art. SkunkSquad holder and community artist.',
                location: 'New York, NY',
                region: 'north-america',
                industry: 'creative',
                nfts: 5,
                interests: ['Digital Art', 'PFP Collections', 'Generative Art', 'Web3 Design'],
                socials: [
                    { platform: 'twitter', url: 'https://twitter.com/skunkartist', username: '@skunkartist' },
                    { platform: 'instagram', url: 'https://instagram.com/skunkartist', username: '@skunkartist' }
                ]
            },
            {
                wallet: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
                name: 'SkunkWhale',
                title: 'Community Leader & Early Adopter',
                bio: 'Early SkunkSquad supporter and whale holder. Helping build the strongest NFT community in Web3!',
                location: 'Los Angeles, CA',
                region: 'north-america',
                industry: 'crypto',
                nfts: 25,
                interests: ['Community Building', 'NFT Collecting', 'Alpha Calls', 'Web3 Gaming'],
                socials: [
                    { platform: 'twitter', url: 'https://twitter.com/skunkwhale', username: '@skunkwhale' },
                    { platform: 'discord', username: 'SkunkWhale#0420' }
                ]
            },
            {
                wallet: '0xBCD4042DE499D14e55001CcbB24a551F3b954096',
                name: 'EuroSkunk',
                title: 'Crypto Investor & Trader',
                bio: 'Professional crypto investor. SkunkSquad diamond hands since day one. WAGMI!',
                location: 'London, UK',
                region: 'europe',
                industry: 'finance',
                nfts: 8,
                interests: ['DeFi', 'Blue Chip NFTs', 'Trading Strategies', 'Market Analysis'],
                socials: [
                    { platform: 'twitter', url: 'https://twitter.com/euroskunk', username: '@euroskunk' }
                ]
            },
            {
                wallet: '0x71bE63f3384f5fb98995898A86B02Fb2426c5788',
                name: 'TokyoSkunk',
                title: 'GameFi Developer',
                bio: 'Building play-to-earn games for SkunkSquad holders. Let\'s bring utility to NFTs!',
                location: 'Tokyo, Japan',
                region: 'asia',
                industry: 'tech',
                nfts: 7,
                interests: ['GameFi', 'Metaverse', 'Unity Development', 'NFT Utility'],
                socials: [
                    { platform: 'twitter', url: 'https://twitter.com/tokyoskunk', username: '@tokyoskunk' },
                    { platform: 'discord', username: 'TokyoSkunk#8888' },
                    { platform: 'github', url: 'https://github.com/tokyoskunk', username: 'tokyoskunk' }
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
