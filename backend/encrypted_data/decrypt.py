import json
import os
from Crypto.Cipher import AES
from binascii import unhexlify

# XOR Decryption
def xor_decrypt(data, key):
    return bytes([data[i] ^ key[i % len(key)] for i in range(len(data))])

# AES + XOR Decryption
def decrypt_data(encrypted_payload):
    try:
        # Extract values
        nonce = unhexlify(encrypted_payload["nonce"])
        tag = unhexlify(encrypted_payload["tag"])
        ciphertext = unhexlify(encrypted_payload["ciphertext"])
        key = unhexlify(encrypted_payload["key"])  # Retrieve encryption key

        # AES Decryption
        cipher = AES.new(key, AES.MODE_EAX, nonce=nonce)
        xor_encrypted = cipher.decrypt_and_verify(ciphertext, tag)

        # XOR Decryption
        decrypted_data = xor_decrypt(xor_encrypted, key)

        # Convert to JSON
        return json.loads(decrypted_data.decode())

    except Exception as e:
        print(f"[ERROR] Decryption failed: {e}")
        return None
