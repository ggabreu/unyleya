const { ethers } = require("hardhat");

async function main() {
  console.log("🎮 Demo de Interação com os Contratos");
  console.log("=" .repeat(50));
  
  // Get signers
  const [owner, user1, user2] = await ethers.getSigners();
  console.log("👤 Owner:", owner.address);
  console.log("👤 User1:", user1.address);
  console.log("👤 User2:", user2.address);
  
  // Get deployed contracts (assumindo que estão deployados)
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const nftAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  const CryptoToken = await ethers.getContractFactory("CryptoToken");
  const CryptoNFT = await ethers.getContractFactory("CryptoNFT");
  
  const token = CryptoToken.attach(tokenAddress);
  const nft = CryptoNFT.attach(nftAddress);
  
  console.log("\n📊 Informações dos Contratos");
  console.log("-".repeat(30));
  
  // Token info
  const tokenName = await token.name();
  const tokenSymbol = await token.symbol();
  const tokenDecimals = await token.decimals();
  console.log(`🪙 Token: ${tokenName} (${tokenSymbol}) - ${tokenDecimals} decimais`);
  
  // NFT info
  const nftName = await nft.name();
  const nftSymbol = await nft.symbol();
  const nftPrice = await nft.price();
  console.log(`🖼️  NFT: ${nftName} (${nftSymbol}) - Preço: ${ethers.formatEther(nftPrice)} CRY`);
  
  console.log("\n💰 1. Mintando Tokens CRY");
  console.log("-".repeat(30));
  
  // Mint tokens para user1
  const mintAmount = ethers.parseEther("1000");
  console.log(`🔨 Mintando ${ethers.formatEther(mintAmount)} CRY para ${user1.address}`);
  
  const mintTx = await token.connect(owner).mintAndTransfer(user1.address, mintAmount);
  await mintTx.wait();
  console.log("✅ Tokens mintados com sucesso!");
  
  // Check balance
  const user1Balance = await token.balanceOf(user1.address);
  console.log(`💳 Saldo de User1: ${ethers.formatEther(user1Balance)} CRY`);
  
  console.log("\n🎨 2. Processo de Compra de NFT");
  console.log("-".repeat(30));
  
  // User1 aprova o contrato NFT para gastar tokens
  console.log("🔐 User1 aprovando gasto de tokens...");
  const approveTx = await token.connect(user1).approve(nftAddress, nftPrice);
  await approveTx.wait();
  console.log("✅ Aprovação concedida!");
  
  // Check allowance
  const allowance = await token.allowance(user1.address, nftAddress);
  console.log(`📝 Allowance: ${ethers.formatEther(allowance)} CRY`);
  
  // User1 compra NFT
  console.log("🛒 User1 comprando NFT...");
  const mintNFTTx = await nft.connect(user1).mint();
  const receipt = await mintNFTTx.wait();
  
  // Parse events
  const events = receipt.logs.map(log => {
    try {
      return nft.interface.parseLog(log);
    } catch {
      return null;
    }
  }).filter(Boolean);
  
  const mintEvent = events.find(e => e.name === 'NFTMinted');
  if (mintEvent) {
    console.log(`✅ NFT #${mintEvent.args.tokenId} mintado para ${mintEvent.args.to}`);
  }
  
  // Check NFT balance
  const user1NFTBalance = await nft.balanceOf(user1.address);
  console.log(`🖼️  NFTs de User1: ${user1NFTBalance}`);
  
  // Check token balance after purchase
  const user1BalanceAfter = await token.balanceOf(user1.address);
  console.log(`💳 Saldo de User1 após compra: ${ethers.formatEther(user1BalanceAfter)} CRY`);
  
  console.log("\n🔄 3. Transferindo NFT");
  console.log("-".repeat(30));
  
  if (user1NFTBalance > 0) {
    console.log("📤 User1 transferindo NFT #1 para User2...");
    const transferTx = await nft.connect(user1).transferFrom(user1.address, user2.address, 1);
    await transferTx.wait();
    console.log("✅ NFT transferido com sucesso!");
    
    // Check balances after transfer
    const user1NFTBalanceAfter = await nft.balanceOf(user1.address);
    const user2NFTBalance = await nft.balanceOf(user2.address);
    console.log(`🖼️  NFTs de User1: ${user1NFTBalanceAfter}`);
    console.log(`🖼️  NFTs de User2: ${user2NFTBalance}`);
  }
  
  console.log("\n⚙️ 4. Funções Administrativas");
  console.log("-".repeat(30));
  
  // Owner altera preço do NFT
  const newPrice = ethers.parseEther("150");
  console.log(`💰 Owner alterando preço para ${ethers.formatEther(newPrice)} CRY`);
  const setPriceTx = await nft.connect(owner).setPrice(newPrice);
  await setPriceTx.wait();
  
  const updatedPrice = await nft.price();
  console.log(`✅ Novo preço: ${ethers.formatEther(updatedPrice)} CRY`);
  
  // Mint mais tokens para demonstração
  console.log("🔨 Mintando mais tokens para User2...");
  const additionalMint = ethers.parseEther("500");
  const mintTx2 = await token.connect(owner).mintAndTransfer(user2.address, additionalMint);
  await mintTx2.wait();
  
  const user2Balance = await token.balanceOf(user2.address);
  console.log(`💳 Saldo de User2: ${ethers.formatEther(user2Balance)} CRY`);
  
  console.log("\n📊 5. Resumo Final");
  console.log("-".repeat(30));
  
  // Balances finais
  const finalUser1TokenBalance = await token.balanceOf(user1.address);
  const finalUser2TokenBalance = await token.balanceOf(user2.address);
  const finalUser1NFTBalance = await nft.balanceOf(user1.address);
  const finalUser2NFTBalance = await nft.balanceOf(user2.address);
  
  console.log("💳 Saldos de Tokens CRY:");
  console.log(`   User1: ${ethers.formatEther(finalUser1TokenBalance)} CRY`);
  console.log(`   User2: ${ethers.formatEther(finalUser2TokenBalance)} CRY`);
  
  console.log("🖼️  Saldos de NFTs:");
  console.log(`   User1: ${finalUser1NFTBalance} NFTs`);
  console.log(`   User2: ${finalUser2NFTBalance} NFTs`);
  
  console.log(`💰 Preço atual do NFT: ${ethers.formatEther(await nft.price())} CRY`);
  
  console.log("\n🎉 Demo concluída com sucesso!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro na execução:", error);
    process.exit(1);
  });
