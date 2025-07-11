const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Iniciando deploy dos contratos...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployando com a conta:", deployer.address);
  console.log("💰 Saldo da conta:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Deploy CryptoToken
  console.log("\n📦 Deployando CryptoToken...");
  const CryptoToken = await ethers.getContractFactory("CryptoToken");
  const cryptoToken = await CryptoToken.deploy("CryptoToken", "CRT");
  
  await cryptoToken.waitForDeployment();
  const tokenAddress = await cryptoToken.getAddress();
  console.log("✅ CryptoToken deployado em:", tokenAddress);

  // Deploy CryptoNFT
  console.log("\n📦 Deployando CryptoNFT...");
  const NFT_PRICE = ethers.parseEther("100"); // 100 tokens CRT = 1 NFT
  const CryptoNFT = await ethers.getContractFactory("CryptoNFT");
  const cryptoNFT = await CryptoNFT.deploy(
    "CryptoNFT",
    "CNFT",
    tokenAddress,
    NFT_PRICE
  );
  
  await cryptoNFT.waitForDeployment();
  const nftAddress = await cryptoNFT.getAddress();
  console.log("✅ CryptoNFT deployado em:", nftAddress);

  // Mint some initial tokens for testing
  console.log("\n🪙 Mintando tokens iniciais...");
  const initialSupply = ethers.parseEther("10000"); // 10,000 tokens
  await cryptoToken.mintAndTransfer(deployer.address, initialSupply);
  console.log("✅ Mintados", ethers.formatEther(initialSupply), "CRT tokens para o deployer");

  // Set base URI for NFT metadata
  console.log("\n🔗 Configurando URI base para metadados...");
  const baseURI = "https://api.cryptonft.com/metadata/";
  await cryptoNFT.setBaseURI(baseURI);
  console.log("✅ URI base configurada:", baseURI);

  // Verification info
  console.log("\n📋 RESUMO DO DEPLOY");
  console.log("=".repeat(50));
  console.log("🪙 CryptoToken (CRT):", tokenAddress);
  console.log("🖼️  CryptoNFT (CNFT):", nftAddress);
  console.log("💰 Preço do NFT:", ethers.formatEther(NFT_PRICE), "CRT");
  console.log("👤 Owner:", deployer.address);
  console.log("🔗 Base URI:", baseURI);

  // Save deployment info
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    deployer: deployer.address,
    contracts: {
      CryptoToken: {
        address: tokenAddress,
        name: "CryptoToken",
        symbol: "CRT"
      },
      CryptoNFT: {
        address: nftAddress,
        name: "CryptoNFT",
        symbol: "CNFT",
        price: NFT_PRICE.toString()
      }
    },
    timestamp: new Date().toISOString()
  };

  console.log("\n💾 Informações de deploy salvas em deployment.json");
  
  // For verification on Etherscan (if needed)
  console.log("\n🔍 Comandos para verificação no Etherscan:");
  console.log(`npx hardhat verify ${tokenAddress} "CryptoToken" "CRT"`);
  console.log(`npx hardhat verify ${nftAddress} "CryptoNFT" "CNFT" "${tokenAddress}" "${NFT_PRICE}"`);

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
  });
