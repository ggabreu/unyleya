const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoToken", function () {
  let CryptoToken;
  let cryptoToken;
  let owner;
  let addr1;
  let addr2;

  const TOKEN_NAME = "CryptoToken";
  const TOKEN_SYMBOL = "CRT";
  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1 milhão de tokens

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    CryptoToken = await ethers.getContractFactory("CryptoToken");
    cryptoToken = await CryptoToken.deploy(TOKEN_NAME, TOKEN_SYMBOL);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await cryptoToken.owner()).to.equal(owner.address);
    });

    it("Should set the correct name and symbol", async function () {
      expect(await cryptoToken.name()).to.equal(TOKEN_NAME);
      expect(await cryptoToken.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should have 18 decimals", async function () {
      expect(await cryptoToken.decimals()).to.equal(18);
    });

    it("Should start with zero total supply", async function () {
      expect(await cryptoToken.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      await cryptoToken.mintAndTransfer(addr1.address, INITIAL_SUPPLY);
      
      expect(await cryptoToken.balanceOf(addr1.address)).to.equal(INITIAL_SUPPLY);
      expect(await cryptoToken.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      await expect(
        cryptoToken.connect(addr1).mintAndTransfer(addr2.address, INITIAL_SUPPLY)
      ).to.be.revertedWithCustomError(cryptoToken, "OwnableUnauthorizedAccount");
    });

    it("Should not allow minting to zero address", async function () {
      await expect(
        cryptoToken.mintAndTransfer(ethers.ZeroAddress, INITIAL_SUPPLY)
      ).to.be.revertedWith("CryptoToken: mint to the zero address");
    });

    it("Should not allow minting zero amount", async function () {
      await expect(
        cryptoToken.mintAndTransfer(addr1.address, 0)
      ).to.be.revertedWith("CryptoToken: amount must be greater than 0");
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      await cryptoToken.mintAndTransfer(addr1.address, INITIAL_SUPPLY);
    });

    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseEther("100");
      
      await cryptoToken.connect(addr1).transfer(addr2.address, transferAmount);
      
      expect(await cryptoToken.balanceOf(addr1.address)).to.equal(
        INITIAL_SUPPLY - transferAmount
      );
      expect(await cryptoToken.balanceOf(addr2.address)).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const transferAmount = INITIAL_SUPPLY + ethers.parseEther("1");
      
      await expect(
        cryptoToken.connect(addr1).transfer(addr2.address, transferAmount)
      ).to.be.revertedWithCustomError(cryptoToken, "ERC20InsufficientBalance");
    });
  });

  describe("Allowances", function () {
    beforeEach(async function () {
      await cryptoToken.mintAndTransfer(addr1.address, INITIAL_SUPPLY);
    });

    it("Should approve allowance", async function () {
      const allowanceAmount = ethers.parseEther("500");
      
      await cryptoToken.connect(addr1).approve(addr2.address, allowanceAmount);
      
      expect(await cryptoToken.allowance(addr1.address, addr2.address)).to.equal(
        allowanceAmount
      );
    });

    it("Should transfer from with allowance", async function () {
      const allowanceAmount = ethers.parseEther("500");
      const transferAmount = ethers.parseEther("200");
      
      await cryptoToken.connect(addr1).approve(addr2.address, allowanceAmount);
      await cryptoToken.connect(addr2).transferFrom(addr1.address, addr2.address, transferAmount);
      
      expect(await cryptoToken.balanceOf(addr1.address)).to.equal(
        INITIAL_SUPPLY - transferAmount
      );
      expect(await cryptoToken.balanceOf(addr2.address)).to.equal(transferAmount);
      expect(await cryptoToken.allowance(addr1.address, addr2.address)).to.equal(
        allowanceAmount - transferAmount
      );
    });
  });
});
