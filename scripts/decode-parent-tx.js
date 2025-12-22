const https = require('https');
const { ethers } = require('ethers');
require('dotenv').config();

function fetch4byte(selector) {
  const url = `https://www.4byte.directory/api/v1/signatures/?hex_signature=${selector}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let d = '';
      res.on('data', (c) => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch (e) { reject(e); }
      });
    }).on('error', (e) => reject(e));
  });
}

(async () => {
  try {
    const TX = '0xfe1b5a1e8de3c2caf194908ee2105b92cac352fdb6d0968d311f06662d1d643c';
    const RPC = process.env.RPC_URL || process.env.MAINNET_RPC_URL || 'https://rpc.ankr.com/eth';
    const provider = new ethers.providers.JsonRpcProvider(RPC);

    const tx = await provider.getTransaction(TX);
    if (!tx) return console.error('Transaction not found');

    console.log('Tx:', TX);
    console.log('From:', tx.from);
    console.log('To:', tx.to);
    console.log('Block:', tx.blockNumber);
    console.log('Input (hex):', tx.data);

    const selector = tx.data.slice(0, 10);
    console.log('\nSelector:', selector);

    const res = await fetch4byte(selector);
    console.log('4byte matches:', res.count);
    if (res.count > 0) {
      res.results.forEach(r => console.log(' -', r.text_signature));
    }

    // Try to decode using the first 4byte signature (if any)
    if (res.count > 0) {
      const sig = res.results[0].text_signature; // e.g. "foo(address,uint256)"
      const abiEntry = `function ${sig}`;
      console.log('\nTrying to decode with ABI fragment:', abiEntry);
      const iface = new ethers.utils.Interface([abiEntry]);
      const name = sig.split('(')[0];
      try {
        const decoded = iface.decodeFunctionData(name, tx.data);
        console.log('Decoded params:', decoded);
      } catch (e) {
        console.warn('Failed to decode with that signature:', e.message);
      }
    }

    // If no 4byte results or decode failed, try some common safe / multisig ABIs
    const candidateAbis = [
      'function execTransaction(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,bytes signatures)',
      'function execute(address to,uint256 value,bytes data)',
      'function executeTransaction(address to,uint256 value,bytes data)',
      'function handlePayment(address to,uint256 amount)' // generic
    ];

    for (const abi of candidateAbis) {
      try {
        const iface = new ethers.utils.Interface([`function ${abi.replace(/^function\s+/, '')}`]);
        const name = Object.keys(iface.functions)[0].split('(')[0];
        const decoded = iface.decodeFunctionData(name, tx.data);
        console.log('\nDecoded with candidate ABI:', abi);
        console.log(decoded);
        break;
      } catch (e) {
        // ignore
      }
    }

  } catch (e) {
    console.error('Error:', e.stack || e.message);
  }
})();
