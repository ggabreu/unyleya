import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { CryptoTokenABI } from '../contracts/CryptoToken';
import { CryptoNFTABI } from '../contracts/CryptoNFT';
import { CONTRACT_ADDRESSES } from '../wagmi';

export function NFTPurchase() {
  const { address } = useAccount();
  const { writeContract, isPending: isWritePending } = useWriteContract();
  const [purchaseStep, setPurchaseStep] = useState<'approve' | 'mint' | 'idle'>('idle');

  // Lê o preço atual dos NFTs
  const { data: nftPrice, refetch: refetchPrice } = useReadContract({
    address: CONTRACT_ADDRESSES.CryptoNFT,
    abi: CryptoNFTABI,
    functionName: 'price',
  });

  // Lê o saldo de tokens do usuário
  const { data: tokenBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.CryptoToken,
    abi: CryptoTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Lê a allowance atual para o contrato de NFT
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.CryptoToken,
    abi: CryptoTokenABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESSES.CryptoNFT] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const hasEnoughBalance = tokenBalance && nftPrice && tokenBalance >= nftPrice;
  const hasEnoughAllowance = allowance && nftPrice && allowance >= nftPrice;

  const handleApprove = async () => {
    if (!nftPrice) return;

    setPurchaseStep('approve');
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.CryptoToken,
        abi: CryptoTokenABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.CryptoNFT, nftPrice],
      });
      
      // Aguarda um pouco e refaz a consulta da allowance
      setTimeout(() => {
        refetchAllowance();
        setPurchaseStep('idle');
      }, 2000);
    } catch (error) {
      console.error('Erro ao aprovar tokens:', error);
      setPurchaseStep('idle');
    }
  };

  const handleMintNFT = async () => {
    setPurchaseStep('mint');
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.CryptoNFT,
        abi: CryptoNFTABI,
        functionName: 'mint',
      });
      
      // Aguarda um pouco e refaz as consultas
      setTimeout(() => {
        refetchPrice();
        refetchAllowance();
        setPurchaseStep('idle');
      }, 2000);
    } catch (error) {
      console.error('Erro ao cunhar NFT:', error);
      setPurchaseStep('idle');
    }
  };

  if (!address) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Comprar NFT</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Conecte sua carteira para comprar NFTs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Comprar NFT</h2>
      
      {/* Informações do NFT */}
      <div className="space-y-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Preço do NFT</h3>
          <p className="text-2xl font-bold text-blue-600">
            {nftPrice ? formatEther(nftPrice) : '0'} CTK
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Seu Saldo</h3>
          <p className="text-lg font-medium text-gray-700">
            {tokenBalance ? formatEther(tokenBalance) : '0'} CTK
          </p>
        </div>

        {!hasEnoughBalance && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              Saldo insuficiente para comprar este NFT.
            </p>
          </div>
        )}
      </div>

      {/* Processo de compra */}
      {hasEnoughBalance && (
        <div className="space-y-4">
          {/* Passo 1: Aprovar tokens */}
          {!hasEnoughAllowance && (
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Passo 1: Aprovar Tokens
              </h3>
              <p className="text-gray-600 mb-3">
                Primeiro, você precisa aprovar o contrato de NFT para gastar seus tokens.
              </p>
              <button
                onClick={handleApprove}
                disabled={isWritePending || purchaseStep === 'approve'}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchaseStep === 'approve' ? 'Aprovando...' : 'Aprovar Tokens'}
              </button>
            </div>
          )}

          {/* Passo 2: Cunhar NFT */}
          {hasEnoughAllowance && (
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Passo 2: Cunhar NFT
              </h3>
              <p className="text-gray-600 mb-3">
                Agora você pode cunhar seu NFT!
              </p>
              <button
                onClick={handleMintNFT}
                disabled={isWritePending || purchaseStep === 'mint'}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchaseStep === 'mint' ? 'Cunhando NFT...' : 'Cunhar NFT'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
