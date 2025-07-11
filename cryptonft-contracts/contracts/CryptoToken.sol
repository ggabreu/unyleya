// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CryptoToken
 * @dev Token ERC-20 fungível que pode ser cunhado apenas pelo proprietário
 */
contract CryptoToken is ERC20, Ownable {
    uint8 private constant DECIMALS = 18;
    
    /**
     * @dev Constructor que define o nome e símbolo do token
     * @param _name Nome do token
     * @param _symbol Símbolo do token
     */
    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) Ownable(msg.sender) {}

    /**
     * @dev Função para cunhar novos tokens e transferi-los para uma conta
     * Só pode ser chamada pelo proprietário do contrato
     * @param to Endereço que receberá os tokens
     * @param amount Quantidade de tokens a serem cunhados (em wei)
     */
    function mintAndTransfer(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "CryptoToken: mint to the zero address");
        require(amount > 0, "CryptoToken: amount must be greater than 0");
        
        _mint(to, amount);
    }

    /**
     * @dev Retorna o número de casas decimais do token
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
}
