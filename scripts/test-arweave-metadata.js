/**
 * Test Arweave Metadata Access
 */

async function testArweaveURL(txid) {
    const arweaveUrl = `https://arweave.net/${txid}`;
    console.log(`Testing: ${arweaveUrl}\n`);
    
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(arweaveUrl);
        
        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));
        
        const text = await response.text();
        console.log('\nFirst 500 characters:');
        console.log(text.substring(0, 500));
        
        // Try to parse as JSON
        try {
            const json = JSON.parse(text);
            console.log('\n✅ Valid JSON!');
            console.log('Parsed:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('\n❌ Not valid JSON');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Test the current TXID
const currentTXID = 'XuqILdM62RXGOWLChX5KE4WUNRlXuM-TpQRgMsXXcoA';
console.log('Testing current unrevealed URI TXID:\n');
testArweaveURL(currentTXID);
