$multichain_download_url = 'https://www.multichain.com/download/multichain-2.1.3.zip'
$multichain_archive_name = 'multichain-2.1.3.zip'
$multichain_extracted_name = 'multichain-2.1.3'
$multichain_bin_path = "${PWD.ProviderPath}\${multichain_extracted_name}\multichaind.exe"

$chain_name = 'mychain'
$rpc_port = 12345

# Download and extract Multichain archive
Write-Host 'Downloading Multichain...'
Invoke-WebRequest -Uri $multichain_download_url -OutFile $multichain_archive_name
Expand-Archive -Path $multichain_archive_name -DestinationPath .\ -Force
Write-Host 'Multichain extracted successfully!'

# Configure environment variables for Multichain
$env:MULTICHAIN_HOME = "$($PWD.ProviderPath)\$multichain_extracted_name"
$env:PATH += ";$($env:MULTICHAIN_HOME)\bin"

# Create a new chain or connect to an existing one
Write-Host "Connecting to $chain_name chain..."
& $multichain_bin_path "$chain_name@localhost:$rpc_port"
Write-Host 'Connected to chain successfully!'