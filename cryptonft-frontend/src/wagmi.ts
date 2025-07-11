import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';
import deployedAddresses from './contracts/deployed-addresses.json';

// Configuração da rede local (Ganache)
const ganacheLocal = {
  id: 1337,
  name: 'Ganache Local',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://localhost:7545'] },
    public: { http: ['http://localhost:7545'] },
  },
} as const;

export const config = getDefaultConfig({
  appName: 'CryptoNFT DApp',
  projectId: '63c4ce7cb57a66b9d6bc3e14de02b60c', // Replace with your actual WalletConnect projectId
  chains: [ganacheLocal, sepolia, mainnet],
  ssr: false,
});

// Contract addresses from deployed contracts
export const CONTRACT_ADDRESSES = {
  CryptoToken: deployedAddresses.contracts.CryptoToken.address as `0x${string}`,
  CryptoNFT: deployedAddresses.contracts.CryptoNFT.address as `0x${string}`,
} as const;
