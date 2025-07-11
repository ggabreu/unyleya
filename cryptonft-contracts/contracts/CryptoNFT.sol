// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CryptoNFT
 * @dev Token ERC-721 não fungível que pode ser cunhado em troca de tokens ERC-20
 */
contract CryptoNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    IERC20 public paymentToken;
    uint256 public price;
    uint256 private _nextTokenId;
    
    // URI base para os metadados dos NFTs
    string private _baseTokenURI;
    
    event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 price);
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    
    /**
     * @dev Constructor que define o endereço do token ERC-20 e o preço inicial
     * @param _name Nome da coleção NFT
     * @param _symbol Símbolo da coleção NFT
     * @param _tokenAddress Endereço do contrato do token ERC-20
     * @param _price Preço em tokens ERC-20 para cunhar um NFT
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address _tokenAddress,
        uint256 _price
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        require(_tokenAddress != address(0), "CryptoNFT: token address cannot be zero");
        require(_price > 0, "CryptoNFT: price must be greater than 0");
        
        paymentToken = IERC20(_tokenAddress);
        price = _price;
        _nextTokenId = 1;
    }

    /**
     * @dev Função para cunhar um NFT em troca de tokens ERC-20
     * Transfere tokens ERC-20 do usuário para o proprietário do contrato
     */
    function mint() external nonReentrant {
        address minter = msg.sender;
        require(minter != address(0), "CryptoNFT: mint to the zero address");
        
        // Transfere tokens ERC-20 do usuário para o proprietário do contrato
        require(
            paymentToken.transferFrom(minter, owner(), price),
            "CryptoNFT: payment transfer failed"
        );
        
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        _safeMint(minter, tokenId);
        
        emit NFTMinted(minter, tokenId, price);
    }

    /**
     * @dev Função para definir novo preço - apenas o proprietário pode chamar
     * @param _newPrice Novo preço em tokens ERC-20
     */
    function setPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "CryptoNFT: price must be greater than 0");
        
        uint256 oldPrice = price;
        price = _newPrice;
        
        emit PriceUpdated(oldPrice, _newPrice);
    }

    /**
     * @dev Função para definir URI base dos metadados
     * @param baseURI Nova URI base
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Retorna a URI dos metadados do token
     * @param tokenId ID do token
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "CryptoNFT: URI query for nonexistent token");
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, _toString(tokenId), ".json"))
            : "";
    }

    /**
     * @dev Retorna a URI base para os metadados
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Função para converter uint256 para string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Retorna o próximo ID do token a ser cunhado
     */
    function getNextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @dev Override necessário para ERC721URIStorage
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
