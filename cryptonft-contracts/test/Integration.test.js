const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Integration Tests - CryptoToken & CryptoNFT", function () {
  let CryptoToken;
  let cryptoToken;
  let CryptoNFT;
  let cryptoNFT;
  let owner;
  let user1;
  let user2;

  const TOKEN_NAME = "CryptoToken";
  const TOKEN_SYMBOL = "CRT";
  const NFT_NAME = "CryptoNFT";
  const NFT_SYMBOL = "CNFT";
  const NFT_PRICE = ethers.parseEther("100");
  const INITIAL_TOKEN_SUPPLY = ethers.parseEther("10000");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy contracts
    CryptoToken = await ethers.getContractFactory("CryptoToken");
    cryptoToken = await CryptoToken.deploy(TOKEN_NAME, TOKEN_SYMBOL);

    CryptoNFT = await ethers.getContractFactory("CryptoNFT");
    cryptoNFT = await CryptoNFT.deploy(
      NFT_NAME,
      NFT_SYMBOL,
      await cryptoToken.getAddress(),
      NFT_PRICE
    );
  });

  describe("Complete Workflow", function () {
    it("Should complete the full NFT purchase workflow", async function () {
      // Step 1: Owner mints tokens and distributes to users
      await cryptoToken.mintAndTransfer(user1.address, INITIAL_TOKEN_SUPPLY);
      
      expect(await cryptoToken.balanceOf(user1.address)).to.equal(INITIAL_TOKEN_SUPPLY);

      // Step 2: User1 approves NFT contract to spend tokens
      await cryptoToken.connect(user1).approve(await cryptoNFT.getAddress(), NFT_PRICE);
      
      expect(await cryptoToken.allowance(user1.address, await cryptoNFT.getAddress())).to.equal(NFT_PRICE);

      // Step 3: User1 mints NFT
      const initialOwnerBalance = await cryptoToken.balanceOf(owner.address);
      
      await expect(cryptoNFT.connect(user1).mint())
        .to.emit(cryptoNFT, "NFTMinted")
        .withArgs(user1.address, 1, NFT_PRICE);

      // Step 4: Verify results
      expect(await cryptoNFT.ownerOf(1)).to.equal(user1.address);
      expect(await cryptoNFT.balanceOf(user1.address)).to.equal(1);
      expect(await cryptoToken.balanceOf(user1.address)).to.equal(INITIAL_TOKEN_SUPPLY - NFT_PRICE);
      expect(await cryptoToken.balanceOf(owner.address)).to.equal(initialOwnerBalance + NFT_PRICE);
    });

    it("Should handle multiple users and price changes", async function () {
      // Distribute tokens to multiple users
      await cryptoToken.mintAndTransfer(user1.address, ethers.parseEther("1000"));
      await cryptoToken.mintAndTransfer(user2.address, ethers.parseEther("2000"));

      // User1 mints NFT at original price
      await cryptoToken.connect(user1).approve(await cryptoNFT.getAddress(), NFT_PRICE);
      await cryptoNFT.connect(user1).mint();

      expect(await cryptoNFT.ownerOf(1)).to.equal(user1.address);

      // Owner changes price
      const newPrice = ethers.parseEther("150");
      await cryptoNFT.setPrice(newPrice);

      // User2 mints NFT at new price
      await cryptoToken.connect(user2).approve(await cryptoNFT.getAddress(), newPrice);
      await cryptoNFT.connect(user2).mint();

      expect(await cryptoNFT.ownerOf(2)).to.equal(user2.address);
      expect(await cryptoToken.balanceOf(user2.address)).to.equal(ethers.parseEther("2000") - newPrice);
    });

    it("Should handle NFT transfers between users", async function () {
      // Setup: User1 gets tokens and mints NFT
      await cryptoToken.mintAndTransfer(user1.address, NFT_PRICE);
      await cryptoToken.connect(user1).approve(await cryptoNFT.getAddress(), NFT_PRICE);
      await cryptoNFT.connect(user1).mint();

      // User1 transfers NFT to User2
      await cryptoNFT.connect(user1).transferFrom(user1.address, user2.address, 1);

      expect(await cryptoNFT.ownerOf(1)).to.equal(user2.address);
      expect(await cryptoNFT.balanceOf(user1.address)).to.equal(0);
      expect(await cryptoNFT.balanceOf(user2.address)).to.equal(1);
    });

    it("Should handle edge cases and error conditions", async function () {
      // User tries to mint without tokens
      await expect(
        cryptoNFT.connect(user1).mint()
      ).to.be.revertedWith("CryptoNFT: payment transfer failed");

      // User gets tokens but doesn't approve
      await cryptoToken.mintAndTransfer(user1.address, NFT_PRICE);
      
      await expect(
        cryptoNFT.connect(user1).mint()
      ).to.be.revertedWith("CryptoNFT: payment transfer failed");

      // User approves insufficient amount
      await cryptoToken.connect(user1).approve(await cryptoNFT.getAddress(), NFT_PRICE - ethers.parseEther("1"));
      
      await expect(
        cryptoNFT.connect(user1).mint()
      ).to.be.revertedWith("CryptoNFT: payment transfer failed");
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should efficiently handle bulk operations", async function () {
      // Mint tokens for multiple users
      const users = [user1, user2];
      const tokenAmount = ethers.parseEther("500");

      for (let user of users) {
        await cryptoToken.mintAndTransfer(user.address, tokenAmount);
        await cryptoToken.connect(user).approve(await cryptoNFT.getAddress(), NFT_PRICE);
      }

      // Each user mints an NFT
      for (let i = 0; i < users.length; i++) {
        await cryptoNFT.connect(users[i]).mint();
        expect(await cryptoNFT.ownerOf(i + 1)).to.equal(users[i].address);
      }

      expect(await cryptoNFT.getNextTokenId()).to.equal(3);
    });
  });

  describe("Security Tests", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This test ensures the ReentrancyGuard is working
      await cryptoToken.mintAndTransfer(user1.address, NFT_PRICE);
      await cryptoToken.connect(user1).approve(await cryptoNFT.getAddress(), NFT_PRICE);

      // Normal mint should work
      await cryptoNFT.connect(user1).mint();
      expect(await cryptoNFT.ownerOf(1)).to.equal(user1.address);
    });

    it("Should enforce proper access controls", async function () {
      // Only owner can mint tokens
      await expect(
        cryptoToken.connect(user1).mintAndTransfer(user2.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(cryptoToken, "OwnableUnauthorizedAccount");

      // Only owner can change NFT price
      await expect(
        cryptoNFT.connect(user1).setPrice(ethers.parseEther("200"))
      ).to.be.revertedWithCustomError(cryptoNFT, "OwnableUnauthorizedAccount");

      // Only owner can set base URI
      await expect(
        cryptoNFT.connect(user1).setBaseURI("https://example.com/")
      ).to.be.revertedWithCustomError(cryptoNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Token Economics", function () {
    it("Should track token flow correctly", async function () {
      const initialOwnerBalance = await cryptoToken.balanceOf(owner.address);
      const mintAmount = ethers.parseEther("1000");

      // Owner mints tokens to user1
      await cryptoToken.mintAndTransfer(user1.address, mintAmount);

      // User1 buys NFT
      await cryptoToken.connect(user1).approve(await cryptoNFT.getAddress(), NFT_PRICE);
      await cryptoNFT.connect(user1).mint();

      // Check final balances
      expect(await cryptoToken.balanceOf(user1.address)).to.equal(mintAmount - NFT_PRICE);
      expect(await cryptoToken.balanceOf(owner.address)).to.equal(initialOwnerBalance + NFT_PRICE);
      expect(await cryptoToken.totalSupply()).to.equal(mintAmount);
    });
  });
});
