// Contract ABI for CryptoNFT (ERC-721)
export const CryptoNFTABI = [
  {
    "type": "constructor",
    "inputs": [
      {"name": "_name", "type": "string", "internalType": "string"},
      {"name": "_symbol", "type": "string", "internalType": "string"},
      {"name": "_tokenAddress", "type": "address", "internalType": "address"},
      {"name": "_price", "type": "uint256", "internalType": "uint256"}
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {"name": "to", "type": "address", "internalType": "address"},
      {"name": "tokenId", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {"name": "owner", "type": "address", "internalType": "address"}
    ],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getApproved",
    "inputs": [
      {"name": "tokenId", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [{"name": "", "type": "address", "internalType": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isApprovedForAll",
    "inputs": [
      {"name": "owner", "type": "address", "internalType": "address"},
      {"name": "operator", "type": "address", "internalType": "address"}
    ],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "mint",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [{"name": "", "type": "string", "internalType": "string"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [{"name": "", "type": "address", "internalType": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [
      {"name": "tokenId", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [{"name": "", "type": "address", "internalType": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "paymentToken",
    "inputs": [],
    "outputs": [{"name": "", "type": "address", "internalType": "contract IERC20"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "price",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "safeTransferFrom",
    "inputs": [
      {"name": "from", "type": "address", "internalType": "address"},
      {"name": "to", "type": "address", "internalType": "address"},
      {"name": "tokenId", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "safeTransferFrom",
    "inputs": [
      {"name": "from", "type": "address", "internalType": "address"},
      {"name": "to", "type": "address", "internalType": "address"},
      {"name": "tokenId", "type": "uint256", "internalType": "uint256"},
      {"name": "data", "type": "bytes", "internalType": "bytes"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setApprovalForAll",
    "inputs": [
      {"name": "operator", "type": "address", "internalType": "address"},
      {"name": "approved", "type": "bool", "internalType": "bool"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setPrice",
    "inputs": [
      {"name": "_price", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "supportsInterface",
    "inputs": [
      {"name": "interfaceId", "type": "bytes4", "internalType": "bytes4"}
    ],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [{"name": "", "type": "string", "internalType": "string"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenURI",
    "inputs": [
      {"name": "tokenId", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [{"name": "", "type": "string", "internalType": "string"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transferFrom",
    "inputs": [
      {"name": "from", "type": "address", "internalType": "address"},
      {"name": "to", "type": "address", "internalType": "address"},
      {"name": "tokenId", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Approval",
    "inputs": [
      {"name": "owner", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "approved", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ApprovalForAll",
    "inputs": [
      {"name": "owner", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "operator", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "approved", "type": "bool", "indexed": false, "internalType": "bool"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "NFTMinted",
    "inputs": [
      {"name": "to", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "price", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PriceUpdated",
    "inputs": [
      {"name": "oldPrice", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "newPrice", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      {"name": "from", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "to", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256"}
    ],
    "anonymous": false
  }
] as const;
