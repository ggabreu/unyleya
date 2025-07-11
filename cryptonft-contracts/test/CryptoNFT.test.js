const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoNFT", function () {
  let CryptoToken;
  let cryptoToken;
  let CryptoNFT;
  let cryptoNFT;
  let owner;
  let addr1;
  let addr2;

  const TOKEN_NAME = "CryptoToken";
  const TOKEN_SYMBOL = "CRT";
  const NFT_NAME = "CryptoNFT";
  const NFT_SYMBOL = "CNFT";
  const NFT_PRICE = ethers.parseEther("100"); // 100 tokens para 1 NFT
  const INITIAL_TOKEN_SUPPLY = ethers.parseEther("10000");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy CryptoToken
    CryptoToken = await ethers.getContractFactory("CryptoToken");
    cryptoToken = await CryptoToken.deploy(TOKEN_NAME, TOKEN_SYMBOL);

    // Deploy CryptoNFT
    CryptoNFT = await ethers.getContractFactory("CryptoNFT");
    cryptoNFT = await CryptoNFT.deploy(
      NFT_NAME,
      NFT_SYMBOL,
      await cryptoToken.getAddress(),
      NFT_PRICE
    );

    // Mint tokens to addr1 for testing
    await cryptoToken.mintAndTransfer(addr1.address, INITIAL_TOKEN_SUPPLY);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await cryptoNFT.owner()).to.equal(owner.address);
    });

    it("Should set the correct name and symbol", async function () {
      expect(await cryptoNFT.name()).to.equal(NFT_NAME);
      expect(await cryptoNFT.symbol()).to.equal(NFT_SYMBOL);
    });

    it("Should set the correct payment token", async function () {
      expect(await cryptoNFT.paymentToken()).to.equal(await cryptoToken.getAddress());
    });

    it("Should set the correct price", async function () {
      expect(await cryptoNFT.price()).to.equal(NFT_PRICE);
    });

    it("Should start with token ID 1", async function () {
      expect(await cryptoNFT.getNextTokenId()).to.equal(1);
    });

    it("Should revert with zero token address", async function () {
      await expect(
        CryptoNFT.deploy(NFT_NAME, NFT_SYMBOL, ethers.ZeroAddress, NFT_PRICE)
      ).to.be.revertedWith("CryptoNFT: token address cannot be zero");
    });

    it("Should revert with zero price", async function () {
      await expect(
        CryptoNFT.deploy(NFT_NAME, NFT_SYMBOL, await cryptoToken.getAddress(), 0)
      ).to.be.revertedWith("CryptoNFT: price must be greater than 0");
    });
  });

  describe("Minting NFTs", function () {
    beforeEach(async function () {
      // Approve NFT contract to spend tokens
      await cryptoToken.connect(addr1).approve(await cryptoNFT.getAddress(), NFT_PRICE);
    });

    it("Should allow minting NFT with sufficient tokens and approval", async function () {
      const initialBalance = await cryptoToken.balanceOf(addr1.address);
      const initialOwnerBalance = await cryptoToken.balanceOf(owner.address);

      await expect(cryptoNFT.connect(addr1).mint())
        .to.emit(cryptoNFT, "NFTMinted")
        .withArgs(addr1.address, 1, NFT_PRICE);

      // Check NFT ownership
      expect(await cryptoNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await cryptoNFT.balanceOf(addr1.address)).to.equal(1);

      // Check token transfer
      expect(await cryptoToken.balanceOf(addr1.address)).to.equal(
        initialBalance - NFT_PRICE
      );
      expect(await cryptoToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance + NFT_PRICE
      );

      // Check next token ID
      expect(await cryptoNFT.getNextTokenId()).to.equal(2);
    });

    it("Should fail without sufficient token approval", async function () {
      await cryptoToken.connect(addr1).approve(await cryptoNFT.getAddress(), NFT_PRICE - ethers.parseEther("1"));

      await expect(
        cryptoNFT.connect(addr1).mint()
      ).to.be.revertedWith("CryptoNFT: payment transfer failed");
    });

    it("Should fail without sufficient token balance", async function () {
      // Transfer all tokens away
      await cryptoToken.connect(addr1).transfer(addr2.address, INITIAL_TOKEN_SUPPLY);
      
      await expect(
        cryptoNFT.connect(addr1).mint()
      ).to.be.revertedWith("CryptoNFT: payment transfer failed");
    });

    it("Should allow multiple mints", async function () {
      // Approve for multiple mints
      await cryptoToken.connect(addr1).approve(await cryptoNFT.getAddress(), NFT_PRICE * 3n);

      // Mint first NFT
      await cryptoNFT.connect(addr1).mint();
      expect(await cryptoNFT.ownerOf(1)).to.equal(addr1.address);

      // Mint second NFT
      await cryptoNFT.connect(addr1).mint();
      expect(await cryptoNFT.ownerOf(2)).to.equal(addr1.address);

      // Check balance
      expect(await cryptoNFT.balanceOf(addr1.address)).to.equal(2);
    });
  });

  describe("Price Management", function () {
    it("Should allow owner to update price", async function () {
      const newPrice = ethers.parseEther("200");

      await expect(cryptoNFT.setPrice(newPrice))
        .to.emit(cryptoNFT, "PriceUpdated")
        .withArgs(NFT_PRICE, newPrice);

      expect(await cryptoNFT.price()).to.equal(newPrice);
    });

    it("Should not allow non-owner to update price", async function () {
      const newPrice = ethers.parseEther("200");

      await expect(
        cryptoNFT.connect(addr1).setPrice(newPrice)
      ).to.be.revertedWithCustomError(cryptoNFT, "OwnableUnauthorizedAccount");
    });

    it("Should not allow setting price to zero", async function () {
      await expect(
        cryptoNFT.setPrice(0)
      ).to.be.revertedWith("CryptoNFT: price must be greater than 0");
    });
  });

  describe("Token URI", function () {
    beforeEach(async function () {
      await cryptoToken.connect(addr1).approve(await cryptoNFT.getAddress(), NFT_PRICE);
      await cryptoNFT.connect(addr1).mint();
    });

    it("Should return empty URI by default", async function () {
      expect(await cryptoNFT.tokenURI(1)).to.equal("");
    });

    it("Should return correct URI after setting base URI", async function () {
      const baseURI = "https://api.cryptonft.com/metadata/";
      await cryptoNFT.setBaseURI(baseURI);

      expect(await cryptoNFT.tokenURI(1)).to.equal(baseURI + "1.json");
    });

    it("Should not allow non-owner to set base URI", async function () {
      await expect(
        cryptoNFT.connect(addr1).setBaseURI("https://example.com/")
      ).to.be.revertedWithCustomError(cryptoNFT, "OwnableUnauthorizedAccount");
    });

    it("Should revert for non-existent token", async function () {
      await expect(
        cryptoNFT.tokenURI(999)
      ).to.be.revertedWith("CryptoNFT: URI query for nonexistent token");
    });
  });

  describe("Access Control", function () {
    it("Owner should not be able to mint without paying", async function () {
      // Even the owner must pay to mint
      await cryptoToken.mintAndTransfer(owner.address, NFT_PRICE);
      await cryptoToken.approve(await cryptoNFT.getAddress(), NFT_PRICE);
      
      const initialBalance = await cryptoToken.balanceOf(owner.address);
      
      await cryptoNFT.mint();
      
      // Owner paid for the NFT (to himself)
      expect(await cryptoToken.balanceOf(owner.address)).to.equal(initialBalance);
      expect(await cryptoNFT.ownerOf(1)).to.equal(owner.address);
    });
  });

  describe("ERC721 Standard Compliance", function () {
    beforeEach(async function () {
      await cryptoToken.connect(addr1).approve(await cryptoNFT.getAddress(), NFT_PRICE * 2n);
      await cryptoNFT.connect(addr1).mint();
    });

    it("Should support ERC721 interface", async function () {
      const ERC721_INTERFACE_ID = "0x80ac58cd";
      expect(await cryptoNFT.supportsInterface(ERC721_INTERFACE_ID)).to.be.true;
    });

    it("Should allow token transfers", async function () {
      await cryptoNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
      
      expect(await cryptoNFT.ownerOf(1)).to.equal(addr2.address);
      expect(await cryptoNFT.balanceOf(addr1.address)).to.equal(0);
      expect(await cryptoNFT.balanceOf(addr2.address)).to.equal(1);
    });

    it("Should allow approved transfers", async function () {
      await cryptoNFT.connect(addr1).approve(addr2.address, 1);
      await cryptoNFT.connect(addr2).transferFrom(addr1.address, addr2.address, 1);
      
      expect(await cryptoNFT.ownerOf(1)).to.equal(addr2.address);
    });
  });
});
