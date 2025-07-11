const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuração do provider para Ganache
const provider = new ethers.JsonRpcProvider('http://localhost:7545');

// Chave privada da primeira conta do Ganache
const privateKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
const wallet = new ethers.Wallet(privateKey, provider);

async function main() {
    console.log('Deploying contracts with account:', wallet.address);
    console.log('Account balance:', ethers.formatEther(await provider.getBalance(wallet.address)), 'ETH');

    try {
        // Lê os bytecodes compilados (se existirem)
        const cryptoTokenBytecode = fs.readFileSync(
            path.join(__dirname, 'artifacts/contracts/CryptoToken.sol/CryptoToken.json'), 
            'utf8'
        );
        const cryptoNFTBytecode = fs.readFileSync(
            path.join(__dirname, 'artifacts/contracts/CryptoNFT.sol/CryptoNFT.json'), 
            'utf8'
        );

        const cryptoTokenArtifact = JSON.parse(cryptoTokenBytecode);
        const cryptoNFTArtifact = JSON.parse(cryptoNFTBytecode);

        // Deploy CryptoToken
        console.log('\nDeploying CryptoToken...');
        const CryptoTokenFactory = new ethers.ContractFactory(
            cryptoTokenArtifact.abi,
            cryptoTokenArtifact.bytecode,
            wallet
        );
        
        const cryptoToken = await CryptoTokenFactory.deploy();
        await cryptoToken.waitForDeployment();
        console.log('CryptoToken deployed to:', await cryptoToken.getAddress());

        // Deploy CryptoNFT
        console.log('\nDeploying CryptoNFT...');
        const CryptoNFTFactory = new ethers.ContractFactory(
            cryptoNFTArtifact.abi,
            cryptoNFTArtifact.bytecode,
            wallet
        );
        
        const cryptoNFT = await CryptoNFTFactory.deploy(await cryptoToken.getAddress());
        await cryptoNFT.waitForDeployment();
        console.log('CryptoNFT deployed to:', await cryptoNFT.getAddress());

        // Salva os endereços dos contratos
        const deployedAddresses = {
            CryptoToken: await cryptoToken.getAddress(),
            CryptoNFT: await cryptoNFT.getAddress(),
            network: 'localhost',
            chainId: 1337
        };

        fs.writeFileSync(
            path.join(__dirname, 'deployed-addresses.json'),
            JSON.stringify(deployedAddresses, null, 2)
        );

        console.log('\n✅ Deployment successful!');
        console.log('Addresses saved to deployed-addresses.json');
        console.log('\nContract Addresses:');
        console.log('CryptoToken:', deployedAddresses.CryptoToken);
        console.log('CryptoNFT:', deployedAddresses.CryptoNFT);

    } catch (error) {
        console.error('❌ Error during deployment:', error.message);
        if (error.message.includes('artifacts')) {
            console.log('\n💡 Tip: Contracts need to be compiled first. Let me try to compile them...');
            // Vamos tentar compilar usando solc diretamente
        }
    }
}

main().catch(console.error);
