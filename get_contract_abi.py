"""
Get Contract ABI from Etherscan

Retrieves the ABI for a verified smart contract using the Etherscan API.

Usage:
    python get_contract_abi.py <contract_address> [network]

Examples:
    python get_contract_abi.py 0xf14F75aEDBbDE252616410649f4dd7C1963191c4 sepolia
    python get_contract_abi.py 0x16Be43d7571Edf69cec8D6221044638d161aA994 mainnet
"""

import os
import sys
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Network configurations
NETWORKS = {
    'mainnet': {
        'chain_id': '1',
        'api_url': 'https://api.etherscan.io/api',
        'explorer_url': 'https://etherscan.io'
    },
    'sepolia': {
        'chain_id': '11155111',
        'api_url': 'https://api-sepolia.etherscan.io/api',
        'explorer_url': 'https://sepolia.etherscan.io'
    }
}

def get_contract_abi(contract_address, network='sepolia'):
    """Fetch contract ABI from Etherscan"""
    
    # Validate network
    if network not in NETWORKS:
        print(f'❌ Error: Unknown network "{network}"')
        print(f'Available networks: {", ".join(NETWORKS.keys())}')
        sys.exit(1)
    
    # Get API key
    api_key = os.getenv('ETHERSCAN_API_KEY')
    if not api_key:
        print('❌ Error: ETHERSCAN_API_KEY not found in environment variables')
        print('Please add ETHERSCAN_API_KEY to your .env file')
        sys.exit(1)
    
    network_config = NETWORKS[network]
    
    print(f'\n🔍 Fetching ABI for contract on {network}...')
    print(f'📍 Contract Address: {contract_address}')
    print(f'🌐 Network: {network} (Chain ID: {network_config["chain_id"]})')
    print(f'🔗 Explorer: {network_config["explorer_url"]}/address/{contract_address}#code\n')
    
    # Make API request - standard endpoint
    params = {
        'module': 'contract',
        'action': 'getabi',
        'address': contract_address,
        'apikey': api_key
    }
    
    try:
        response = requests.get(network_config['api_url'], params=params)
        response.raise_for_status()
        data = response.json()
        
        if data['status'] == '1' and data['message'] == 'OK':
            abi = json.loads(data['result'])
            
            print('✅ ABI retrieved successfully!\n')
            
            # Save ABI to file (formatted)
            filename = f'abi_{contract_address}_{network}.json'
            with open(filename, 'w') as f:
                json.dump(abi, f, indent=2)
            print(f'💾 ABI saved to: {filename}\n')
            
            # Display ABI summary
            functions = [item for item in abi if item.get('type') == 'function']
            view_funcs = [f for f in functions if f.get('stateMutability') in ['view', 'pure']]
            write_funcs = [f for f in functions if f.get('stateMutability') not in ['view', 'pure']]
            events = [item for item in abi if item.get('type') == 'event']
            
            print('📊 ABI Summary:')
            print(f'   Total functions: {len(functions)}')
            print(f'   View functions: {len(view_funcs)}')
            print(f'   Write functions: {len(write_funcs)}')
            print(f'   Events: {len(events)}')
            
            # Display key functions
            key_function_names = ['mintNFT', 'totalSupply', 'tokenURI', 'setBaseURI', 'reveal', 'withdraw']
            key_functions = [f for f in functions if f.get('name') in key_function_names]
            
            if key_functions:
                print('\n🔧 Key Functions:')
                for func in key_functions:
                    params_str = ', '.join([f"{inp['type']} {inp['name']}" for inp in func.get('inputs', [])])
                    mutability = ''
                    if func.get('stateMutability') in ['view', 'pure']:
                        mutability = ' [view]'
                    elif func.get('payable'):
                        mutability = ' [payable]'
                    print(f"   • {func['name']}({params_str}){mutability}")
            
            # Save compact version for web3 integration
            compact_filename = f'abi_{network}.json'
            with open(compact_filename, 'w') as f:
                json.dump(abi, f)
            print(f'\n💾 Compact ABI saved to: {compact_filename}')
            
            print('\n✨ Done!\n')
            
            return abi
            
        else:
            print('❌ Error fetching ABI:')
            print(f'   Status: {data["status"]}')
            print(f'   Message: {data["message"]}')
            print(f'   Result: {data.get("result", "N/A")}')
            
            if data.get('result') == 'Contract source code not verified':
                print('\n💡 Tip: Make sure the contract is verified on Etherscan first.')
                print(f'   Verify at: {network_config["explorer_url"]}/verifyContract?a={contract_address}')
            
            sys.exit(1)
            
    except requests.exceptions.RequestException as e:
        print(f'❌ Request error: {e}')
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f'❌ Error parsing JSON: {e}')
        sys.exit(1)
    except Exception as e:
        print(f'❌ Unexpected error: {e}')
        sys.exit(1)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('❌ Error: Contract address is required')
        print('\nUsage: python get_contract_abi.py <contract_address> [network]')
        print('Example: python get_contract_abi.py 0xf14F75aEDBbDE252616410649f4dd7C1963191c4 sepolia')
        sys.exit(1)
    
    contract_address = sys.argv[1]
    network = sys.argv[2] if len(sys.argv) > 2 else 'sepolia'
    
    get_contract_abi(contract_address, network)
