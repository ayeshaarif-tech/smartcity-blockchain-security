import os
import json
from Crypto.Cipher import AES
import base64 

STORAGE_FOLDER = "IPFS/encrypted_data"

def decrypt_data(encrypted_payload):
    try:
        print("🔍 Checking Encrypted Payload:", encrypted_payload)  

        # Ensure required keys exist
        if not all(k in encrypted_payload for k in ["key", "nonce", "tag", "ciphertext"]):
            raise ValueError("Missing required encryption fields (key, nonce, tag, ciphertext)")

        # Decode values
        key = bytes.fromhex(encrypted_payload["key"])
        nonce = bytes.fromhex(encrypted_payload["nonce"])
        tag = bytes.fromhex(encrypted_payload["tag"])
        ciphertext = bytes.fromhex(encrypted_payload["ciphertext"])

        print(f"🔑 Key: {key.hex()}")
        print(f"🆔 Nonce: {nonce.hex()}")
        print(f"🏷️ Tag: {tag.hex()}")
        print(f"🔒 Ciphertext: {ciphertext.hex()}")

        # Decrypt using AES-GCM
        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        decrypted = cipher.decrypt_and_verify(ciphertext, tag)

        print("✅ Decryption Successful!")
        return decrypted.decode("utf-8")

    except Exception as e:
        print("❌ Decryption Error:", str(e))
        return None

files = sorted(os.listdir(STORAGE_FOLDER), reverse=True)
if files:
    latest_file = os.path.join(STORAGE_FOLDER, files[0])
    print(f"🔍 Checking latest encrypted file: {latest_file}\n")
    
    with open(latest_file, "r", encoding="utf-8") as f:
        encrypted_data = json.load(f)
        print(json.dumps(encrypted_data, indent=4))  # Pretty-print JSON
    try:
        decrypted_data = decrypt_data(encrypted_data)
        print("✅ Decryption Successful:", decrypted_data)
    except Exception as e:
        print("❌ Decryption Failed:", str(e))
else:
    print("❌ No encrypted files found!")
