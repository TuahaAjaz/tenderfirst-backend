#!/bin/bash

multichain_download_url='https://www.multichain.com/download/multichain-2.1.3.tar.gz'
multichain_archive_name='multichain-2.1.3.tar.gz'
multichain_extracted_name='multichain-2.1.3'
multichain_bin_path="/usr/local/bin/${multichain_extracted_name}/multichaind"

chain_name='mychain'
rpc_port=12345

# Download and extract Multichain archive
echo 'Downloading Multichain...'
wget "$multichain_download_url"
tar -xzvf "$multichain_archive_name"
echo 'Multichain extracted successfully!'

# Configure environment variables for Multichain
export MULTICHAIN_HOME="$(pwd)/${multichain_extracted_name}"
export PATH="$PATH:$MULTICHAIN_HOME/bin"

# Create a new chain or connect to an existing one
echo "Connecting to $chain_name chain..."
$multichain_bin_path "$chain_name@localhost:$rpc_port"
echo 'Connected to chain successfully!'