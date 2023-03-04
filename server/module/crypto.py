import os

from Crypto import Random
from Crypto.Cipher import AES, PKCS1_v1_5
from Crypto.PublicKey import RSA
import base64
from hashlib import md5

BLOCK_SIZE = 16

def pad(data):
    length = BLOCK_SIZE - (len(data) % BLOCK_SIZE)
    return data + (chr(length)*length).encode()

def unpad(data):
    return data[:-(data[-1] if type(data[-1]) == int else ord(data[-1]))]

def bytes_to_key(data, salt, output=48):
    # extended from https://gist.github.com/gsakkis/4546068
    assert len(salt) == 8, len(salt)
    data += salt
    key = md5(data).digest()
    final_key = key
    while len(final_key) < output:
        key = md5(key + data).digest()
        final_key += key
    return final_key[:output]

def aes_encrypt(message, passphrase):
    salt = Random.new().read(8)
    key_iv = bytes_to_key(passphrase, salt, 32+16)
    key = key_iv[:32]
    iv = key_iv[32:]
    aes = AES.new(key, AES.MODE_CBC, iv)
    return base64.b64encode(b"Salted__" + salt + aes.encrypt(pad(message)))

def aes_decrypt(encrypted, passphrase):
    encrypted = base64.b64decode(encrypted)
    assert encrypted[0:8] == b"Salted__"
    salt = encrypted[8:16]
    key_iv = bytes_to_key(passphrase, salt, 32+16)
    key = key_iv[:32]
    iv = key_iv[32:]
    aes = AES.new(key, AES.MODE_CBC, iv)
    return unpad(aes.decrypt(encrypted[16:]))

def rsa_encrypt(message, public_key_or_file):
    if os.path.isfile(public_key_or_file):
        with open(public_key_or_file, "r") as f:
            key_text = f.read()
    else:
        key_text = public_key_or_file

    key = RSA.importKey(key_text)
    cipher = PKCS1_v1_5.new(key)
    encrypted = cipher.encrypt(message)
    return base64.b64encode(encrypted)

def rsa_decrypt(message, private_key_or_file):
    if os.path.isfile(private_key_or_file):
        with open(private_key_or_file, "r") as f:
            key_text = f.read()
    else:
        key_text = private_key_or_file

    key = RSA.importKey(key_text)
    cipher = PKCS1_v1_5.new(key)
    decrypted = cipher.decrypt(base64.b64decode(message), None)
    return decrypted


if __name__ == "__main__":
    password = "some password".encode()
    ct_b64 = "U2FsdGVkX1+ATH716DgsfPGjzmvhr+7+pzYfUzR+25u0D7Z5Lw04IJ+LmvPXJMpz"

    pt = aes_decrypt(ct_b64, password)
    print("pt", pt)
    print("pt", aes_decrypt(aes_encrypt(pt, password), password))