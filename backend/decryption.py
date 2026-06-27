# services/decryption.py

from Crypto.Cipher import AES
from binascii import unhexlify

def xor_decrypt(data, key):
    return bytes([data[i] ^ key[i % len(key)] for i in range(len(data))])

def decrypt_data(payload):
    try:
        # Convert hex strings back to bytes
        nonce = unhexlify(payload['nonce'])
        tag = unhexlify(payload['tag'])
        ciphertext = unhexlify(payload['ciphertext'])
        key = unhexlify(payload['key'])

        # AES Decryption
        cipher = AES.new(key, AES.MODE_EAX, nonce=nonce)
        decrypted = cipher.decrypt_and_verify(ciphertext, tag)

        # XOR Decryption
        final_plaintext = xor_decrypt(decrypted, key)

        return final_plaintext.decode("utf-8")  # If it's a plain string
        # return json.loads(final_plaintext.decode("utf-8"))  # If it's JSON string

    except Exception as e:
        return {"error": f"Decryption failed: {str(e)}"}
