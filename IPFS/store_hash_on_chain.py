import json
import os
import time
from web3 import Web3

# Connect to Private Ethereum Blockchain
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8547"))

# Smart Contract Address and ABI
contract_address = "generate your own"
abi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": False,
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "IPFSHashStored",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "authorizedNode",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_ipfsHash",
          "type": "string"
        }
      ],
      "name": "storeIPFSHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getIPFSHash",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getLatestIPFSHash",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalHashes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
# Load contract
contract = w3.eth.contract(address=contract_address, abi=abi)

# Path to stored IPFS hash
IPFS_HASH_FILE = "encrypted_data/ipfs_hash_log.json"

# MetaMask Account Details
#sender_address = "generate your own"  # Replace with your address
#private_key = "generate your own"  # Replace with your private key

sender_address = "generate your own"  # Replace with your address
private_key = "generate your own"  # Replace with your private key

# Read the latest IPFS hash from the file
def get_latest_ipfs_hash():
    if os.path.exists(IPFS_HASH_FILE):
        with open(IPFS_HASH_FILE, "r") as file:
            try:
                data = json.load(file)
                if isinstance(data, list) and len(data) > 0:
                    return data[-1]["ipfs_hash"]
                return None
            except json.JSONDecodeError:
                print("Error: Corrupted JSON file.")
                return None
    return None

# Store the latest IPFS hash on the blockchain
def store_hash():
    last_stored_hash = None  # Store last hash to avoid duplicate entries
    
    while True:
        ipfs_hash = get_latest_ipfs_hash()
        
        if ipfs_hash and ipfs_hash != last_stored_hash:
            print(f"New IPFS Hash Found: {ipfs_hash}. Storing in blockchain...")
            try:
                nonce = w3.eth.get_transaction_count(sender_address)
                tx = contract.functions.storeIPFSHash(ipfs_hash).build_transaction({
                    "from": sender_address,
                    "gas": 2000000,
                    "gasPrice": w3.to_wei('0', 'gwei'),
                    "nonce": nonce
                })

                # Sign and send transaction
                signed_tx = w3.eth.account.sign_transaction(tx, private_key)
                tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
                print(f"Stored Hash: {ipfs_hash} | Transaction Hash: {w3.to_hex(tx_hash)}")
                last_stored_hash = ipfs_hash
            except Exception as e:
                print(f"Error storing hash: {e}")
        else:
            print("No new IPFS hash found. Waiting for 10 seconds...")
        
        time.sleep(10)

# Run the function
store_hash()
