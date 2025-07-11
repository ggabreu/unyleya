# 🔐 CryptoNFT Smart Contracts

Smart contracts para o DApp CryptoNFT - um sistema completo de tokens ERC-20 e NFTs ERC-721.

## � Contratos

```
contracts/
├── contracts/
│   ├── CryptoToken.sol      # Token ERC-20 fungível
│   └── CryptoNFT.sol        # Token ERC-721 não fungível
├── test/
│   ├── CryptoToken.test.js  # Testes do token ERC-20
│   ├── CryptoNFT.test.js    # Testes do token ERC-721
│   └── Integration.test.js  # Testes de integração
├── scripts/
│   └── deploy.js           # Script de deploy
├── metadata/
│   └── 1.json             # Exemplo de metadados NFT
└── hardhat.config.js      # Configuração do Hardhat
```

## 🔧 Contratos

### CryptoToken (ERC-20)
- **Nome**: CryptoToken
- **Símbolo**: CRT
- **Decimais**: 18
- **Funcionalidades**:
  - Cunhagem de tokens (apenas proprietário)
  - Transferência de tokens
  - Sistema de allowances
  - Compatível com padrão ERC-20

### CryptoNFT (ERC-721)
- **Nome**: CryptoNFT
- **Símbolo**: CNFT
- **Funcionalidades**:
  - Cunhagem de NFTs em troca de tokens ERC-20
  - Preço configurável pelo proprietário
  - URI de metadados configurável
  - Compatível com padrão ERC-721
  - Proteção contra reentrância

## 🚀 Como usar

### Instalação

```bash
npm install
```

### Compilação

```bash
npm run compile
```

### Testes

```bash
# Executar todos os testes
npm test

# Testes com relatório de cobertura
npm run test:coverage

# Testes com relatório de gas
npm run test:gas
```

### Deploy

```bash
# Deploy local (requer hardhat node rodando)
npm run deploy:local

# Deploy na rede hardhat
npm run deploy:hardhat

# Iniciar node local
npm run node
```

## 📋 Funcionalidades Principais

### Para Administradores (Owner)

1. **Cunhar Tokens ERC-20**
   ```solidity
   function mintAndTransfer(address to, uint256 amount) external onlyOwner
   ```

2. **Alterar Preço do NFT**
   ```solidity
   function setPrice(uint256 _newPrice) external onlyOwner
   ```

3. **Configurar URI Base**
   ```solidity
   function setBaseURI(string memory baseURI) external onlyOwner
   ```

### Para Usuários

1. **Aprovar Transferência de Tokens**
   ```solidity
   function approve(address spender, uint256 amount) external returns (bool)
   ```

2. **Cunhar NFT**
   ```solidity
   function mint() external nonReentrant
   ```

3. **Transferir NFT**
   ```solidity
   function transferFrom(address from, address to, uint256 tokenId) external
   ```

## 🔒 Segurança

- **Ownable**: Controle de acesso para funções administrativas
- **ReentrancyGuard**: Proteção contra ataques de reentrância
- **Zero Address Checks**: Validações contra endereços zero
- **Amount Validations**: Validações de quantidades

## 📊 Cobertura de Testes

Os testes cobrem:
- ✅ Deploy e configuração inicial
- ✅ Cunhagem de tokens e NFTs
- ✅ Transferências e allowances
- ✅ Controle de acesso
- ✅ Casos de erro
- ✅ Integração entre contratos
- ✅ Segurança contra ataques

## 📝 Metadados NFT

Os metadados seguem o padrão OpenSea:

```json
{
  "name": "CryptoNFT #1",
  "description": "Um NFT exclusivo da coleção CryptoNFT",
  "image": "https://ipfs.io/ipfs/QmYourImageHashHere",
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Common"
    }
  ]
}
```

## 🌐 Redes Suportadas

- Hardhat Local Network
- Localhost (para desenvolvimento)
- Testnet Ethereum (Goerli, Sepolia)
- Mainnet Ethereum (produção)

## 📚 Dependências

- **Hardhat**: Framework de desenvolvimento
- **OpenZeppelin**: Contratos seguros e testados
- **Ethers.js**: Biblioteca para interação com Ethereum
- **Chai**: Framework de testes

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PRIVATE_KEY=sua_chave_privada_aqui
ETHERSCAN_API_KEY=sua_api_key_etherscan
REPORT_GAS=true
```

### Hardhat Config

O arquivo `hardhat.config.js` está configurado com:
- Compilador Solidity 0.8.19
- Otimizador habilitado
- Redes local e localhost
- Relatório de gas opcional
- Integração com Etherscan

## 📈 Gas Optimization

Os contratos foram otimizados para:
- Uso eficiente de storage
- Minimização de operações custosas
- Agrupamento de variáveis de estado
- Uso de eventos para dados off-chain

## 🆘 Troubleshooting

### Erros Comuns

1. **"Insufficient allowance"**
   - Certifique-se de aprovar o contrato NFT antes de cunhar

2. **"Price must be greater than 0"**
   - O preço do NFT deve ser maior que zero

3. **"Payment transfer failed"**
   - Verifique se há tokens suficientes e allowance aprovado

## 📜 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Contato

Para dúvidas ou suporte, abra uma issue no repositório.
