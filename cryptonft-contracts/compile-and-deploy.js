const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');

// Configuração do provider
const provider = new ethers.JsonRpcProvider('http://localhost:7545');
const privateKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
const wallet = new ethers.Wallet(privateKey, provider);

function compileSolidity() {
    console.log('📦 Compiling Solidity contracts...');
    
    // Lê os arquivos dos contratos
    const cryptoTokenSource = fs.readFileSync(path.join(__dirname, 'contracts/CryptoToken.sol'), 'utf8');
    const cryptoNFTSource = fs.readFileSync(path.join(__dirname, 'contracts/CryptoNFT.sol'), 'utf8');
    
    // Prepara o input para o compilador
    const input = {
        language: 'Solidity',
        sources: {
            'CryptoToken.sol': { content: cryptoTokenSource },
            'CryptoNFT.sol': { content: cryptoNFTSource }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode']
                }
            }
        }
    };

    // Compila os contratos
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (output.errors) {
        console.log('⚠️ Compilation warnings/errors:');
        output.errors.forEach(error => {
            console.log(error.formattedMessage);
        });
    }

    return {
        CryptoToken: {
            abi: output.contracts['CryptoToken.sol'].CryptoToken.abi,
            bytecode: output.contracts['CryptoToken.sol'].CryptoToken.evm.bytecode.object
        },
        CryptoNFT: {
            abi: output.contracts['CryptoNFT.sol'].CryptoNFT.abi,
            bytecode: output.contracts['CryptoNFT.sol'].CryptoNFT.evm.bytecode.object
        }
    };
}

async function deployContracts() {
    console.log('🚀 Starting deployment...');
    console.log('Deploying with account:', wallet.address);
    
    const balance = await provider.getBalance(wallet.address);
    console.log('Account balance:', ethers.formatEther(balance), 'ETH');

    // Compila os contratos
    const contracts = compileSolidity();
    
    // Deploy CryptoToken
    console.log('\n📝 Deploying CryptoToken...');
    const CryptoTokenFactory = new ethers.ContractFactory(
        contracts.CryptoToken.abi,
        contracts.CryptoToken.bytecode,
        wallet
    );
    
    const cryptoToken = await CryptoTokenFactory.deploy();
    await cryptoToken.waitForDeployment();
    const cryptoTokenAddress = await cryptoToken.getAddress();
    console.log('✅ CryptoToken deployed to:', cryptoTokenAddress);

    // Deploy CryptoNFT
    console.log('\n🎨 Deploying CryptoNFT...');
    const CryptoNFTFactory = new ethers.ContractFactory(
        contracts.CryptoNFT.abi,
        contracts.CryptoNFT.bytecode,
        wallet
    );
    
    const cryptoNFT = await CryptoNFTFactory.deploy(cryptoTokenAddress);
    await cryptoNFT.waitForDeployment();
    const cryptoNFTAddress = await cryptoNFT.getAddress();
    console.log('✅ CryptoNFT deployed to:', cryptoNFTAddress);

    // Salva as informações de deploy
    const deployInfo = {
        network: 'localhost',
        chainId: 1337,
        rpcUrl: 'http://localhost:7545',
        contracts: {
            CryptoToken: {
                address: cryptoTokenAddress,
                abi: contracts.CryptoToken.abi
            },
            CryptoNFT: {
                address: cryptoNFTAddress,
                abi: contracts.CryptoNFT.abi
            }
        },
        deployedAt: new Date().toISOString()
    };

    // Salva em deployed-addresses.json
    fs.writeFileSync(
        path.join(__dirname, 'deployed-addresses.json'),
        JSON.stringify(deployInfo, null, 2)
    );

    // Salva também no frontend
    const frontendPath = path.join(__dirname, '../frontend/src/contracts');
    if (!fs.existsSync(frontendPath)) {
        fs.mkdirSync(frontendPath, { recursive: true });
    }
    
    fs.writeFileSync(
        path.join(frontendPath, 'deployed-addresses.json'),
        JSON.stringify(deployInfo, null, 2)
    );

    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Contract Addresses:');
    console.log('CryptoToken:', cryptoTokenAddress);
    console.log('CryptoNFT:', cryptoNFTAddress);
    console.log('\n📁 Deployment info saved to:');
    console.log('- contracts/deployed-addresses.json');
    console.log('- frontend/src/contracts/deployed-addresses.json');
    
    return deployInfo;
}

// Executa o deploy
deployContracts()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
