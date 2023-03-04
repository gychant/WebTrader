"""
Module for generating the RSA public and private key pair.
"""
import os
import argparse

from Crypto.PublicKey import RSA


def generate_rsa_keys(output_dir, public_key_file, private_key_file):
    key_pair = RSA.generate(1024)
    public_key = key_pair.publickey().exportKey()
    private_key = key_pair.exportKey()

    os.makedirs(output_dir, exist_ok=True)
    with open(os.path.join(output_dir, public_key_file), "w") as f:
        f.write(public_key.decode())
    with open(os.path.join(output_dir, private_key_file), "w") as f:
        f.write(private_key.decode())
    print(f"RSA key pairs generated. Saved to {output_dir}.")


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output_dir', type=str, required=True, 
        help="The path to the directory for saving the RSA key files.")
    parser.add_argument('--public_key_file', type=str, default="rsa_private.pem", 
        help="The name of the public key file.")
    parser.add_argument('--private_key_file', type=str, default="rsa_public.pem", 
        help="The name of the private key file.")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    generate_rsa_keys(
        output_dir=args.output_dir, 
        public_key_file=args.public_key_file, 
        private_key_file=args.private_key_file
    )