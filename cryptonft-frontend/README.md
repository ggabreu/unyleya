# 🌐 CryptoNFT Frontend

Interface React para o DApp CryptoNFT - uma aplicação Web3 moderna para compra de NFTs usando tokens ERC-20.

## ✨ Funcionalidades

### Header
- ✅ Conexão à carteira usando RainbowKit
- ✅ Exibição do saldo de tokens ERC-20 após conectar

### Administração
- ✅ **Cunhar e transferir tokens**: função `mintAndTransfer` do ERC-20 (com atenção às casas decimais)
- ✅ **Atualizar preço**: função `setPrice` do ERC-721 (com atenção às casas decimais)
- ✅ **Consultar preço**: função `price` (variável de estado pública)

### Usuários
- ✅ **Saldo dos tokens ERC-20** no cabeçalho após conectar a carteira
- ✅ **Comprar NFT**:
  - Frontend consulta o preço do ERC-721 chamando a função `price`
  - Solicita que o usuário aprove a transferência chamando a função `approve` do ERC-20
  - Chama a função `mint` do ERC-721

### Tokens
- ✅ **Lista NFT do usuário** (carteira deve estar conectada)
- ✅ **Transferir NFT** para outra carteira

## 🛠️ Tecnologias

- **React.js** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **RainbowKit** para conexão de carteira
- **Wagmi** para interação com contratos
- **Viem** para utilitários Ethereum
- **TanStack Query** para gerenciamento de estado

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## ⚙️ Configuração

1. **Atualize os endereços dos contratos** em `src/wagmi.ts`:
   ```typescript
   export const CONTRACT_ADDRESSES = {
     CryptoToken: '0x...', // Endereço do contrato ERC-20
     CryptoNFT: '0x...', // Endereço do contrato ERC-721
   };
   ```

2. **Configure o Project ID do WalletConnect** em `src/wagmi.ts`

## 🔧 Estrutura do Projeto

```
src/
├── components/
│   ├── Header.tsx          # Header com conexão de carteira
│   ├── AdminPanel.tsx      # Painel administrativo
│   ├── NFTPurchase.tsx     # Comprar NFTs
│   └── UserNFTs.tsx        # Listar e transferir NFTs
├── contracts/
│   ├── CryptoToken.ts      # ABI do contrato ERC-20
│   └── CryptoNFT.ts        # ABI do contrato ERC-721
├── wagmi.ts                # Configuração wagmi/RainbowKit
├── App.tsx                 # Componente principal
└── main.tsx                # Ponto de entrada
```

## 🎯 Funcionalidades

### Para Administradores:
1. **Cunhar Tokens**: Mint de tokens ERC-20 para qualquer endereço
2. **Definir Preço**: Atualizar o preço dos NFTs em tokens ERC-20

### Para Usuários:
1. **Ver Saldo**: Saldo de tokens ERC-20 no header
2. **Comprar NFT**: Processo em 2 etapas (aprovar + mint)
3. **Gerenciar NFTs**: Visualizar e transferir NFTs

## 🔗 Integração com Contratos

O frontend integra com dois contratos inteligentes:

- **CryptoToken (ERC-20)**: Token fungível usado como moeda
- **CryptoNFT (ERC-721)**: NFTs que podem ser comprados com tokens ERC-20

## 📱 Interface

- **Design responsivo** com Tailwind CSS
- **Feedback visual** para operações
- **Estados de loading** durante transações
- **Validações** de saldo e permissões

## 🌐 Redes Suportadas

- Hardhat (desenvolvimento local)
- Sepolia (testnet)  
- Mainnet Ethereum
