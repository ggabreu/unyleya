import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { CryptoTokenABI } from '../contracts/CryptoToken';
import { CONTRACT_ADDRESSES } from '../wagmi';

export function Header() {
  const { address } = useAccount();

  // Lê o saldo de tokens ERC-20 do usuário
  const { data: tokenBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.CryptoToken,
    abi: CryptoTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: tokenSymbol } = useReadContract({
    address: CONTRACT_ADDRESSES.CryptoToken,
    abi: CryptoTokenABI,
    functionName: 'symbol',
  });

  return (
    <header className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              CryptoNFT DApp
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Saldo de tokens quando conectado */}
            {address && tokenBalance && (
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-blue-900">
                  Saldo: {formatEther(tokenBalance)} {tokenSymbol || 'CTK'}
                </span>
              </div>
            )}
            
            {/* Botão de conexão da carteira */}
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
