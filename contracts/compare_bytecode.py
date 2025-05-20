import requests
import json
import sys
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_arbiscan_bytecode(address, api_key):
    url = f"https://api.arbiscan.io/api?module=proxy&action=eth_getCode&address={address}&apikey={api_key}"
    resp = requests.get(url)
    data = resp.json()
    if data.get('result'):
        return data['result'].lstrip('0x')
    else:
        raise Exception(f"Error fetching bytecode from Arbiscan: {data}")

def get_local_bytecode(build_info_path, contract_name):
    with open(build_info_path, 'r') as f:
        build_info = json.load(f)
    output = build_info['output']['contracts']
    for file_path in output:
        if contract_name in output[file_path]:
            return output[file_path][contract_name]['evm']['deployedBytecode']['object']
    raise Exception(f"Contract {contract_name} not found in build info")

def strip_metadata(bytecode):
    # Solidity metadata is appended as the last 86 hex chars (43 bytes)
    if len(bytecode) > 86:
        return bytecode[:-86]
    return bytecode

def main():
    # User config
    address = os.environ.get('ESCROW_CONTRACT_ADDRESS', '0xCEE0890216D71E58EE97807857AA6B2b786075D9')
    build_info_path = os.environ.get('BUILD_INFO_PATH', 'artifacts/build-info/7adb92e00b9ffef3e1d05b63bf3b8486.json')
    contract_name = os.environ.get('CONTRACT_NAME', 'KustodiaEscrow')
    api_key = os.environ.get('ARBISCAN_API_KEY')
    ignore_metadata = '--ignore-metadata' in sys.argv

    if not api_key:
        print("Error: Please set your ARBISCAN_API_KEY environment variable.")
        sys.exit(1)

    print(f"Fetching deployed bytecode for {address} from Arbiscan...")
    onchain_bytecode = get_arbiscan_bytecode(address, api_key)
    print(f"Fetching local deployed bytecode from {build_info_path}...")
    local_bytecode = get_local_bytecode(build_info_path, contract_name)

    if ignore_metadata:
        onchain_bytecode = strip_metadata(onchain_bytecode)
        local_bytecode = strip_metadata(local_bytecode)
        print("Comparing bytecode with metadata stripped...")
    else:
        print("Comparing full bytecode (including metadata)...")

    if onchain_bytecode == local_bytecode:
        print("\n✅ Bytecode MATCHES! Verification should succeed.")
    else:
        print("\n❌ Bytecode DOES NOT MATCH!")
        print(f"On-chain bytecode length: {len(onchain_bytecode)}")
        print(f"Local bytecode length: {len(local_bytecode)}")
        # Optionally print diffs (first 100 chars)
        for i in range(0, min(len(onchain_bytecode), len(local_bytecode)), 40):
            onchain_chunk = onchain_bytecode[i:i+40]
            local_chunk = local_bytecode[i:i+40]
            if onchain_chunk != local_chunk:
                print(f"Diff at offset {i}:\n  On-chain: {onchain_chunk}\n  Local:   {local_chunk}")
                break

if __name__ == '__main__':
    main()
