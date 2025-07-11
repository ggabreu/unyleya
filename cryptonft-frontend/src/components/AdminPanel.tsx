import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CryptoTokenABI } from '../contracts/CryptoToken';
import { CryptoNFTABI } from '../contracts/CryptoNFT';
import { CONTRACT_ADDRESSES } from '../wagmi';

export function AdminPanel() {
  const { address } = useAccount();
  const { writeContract, isPending: isWritePending } = useWriteContract();

  // Estados para os formulários
  const [mintAddress, setMintAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Verifica se o usuário é owner do contrato de tokens
  const { data: tokenOwner } = useReadContract({
    address: CONTRACT_ADDRESSES.CryptoToken,
    abi: CryptoTokenABI,
    functionName: 'owner',
  });

  // Verifica se o usuário é owner do contrato de NFTs
  const { data: nftOwner } = useReadContract({
    address: CONTRACT_ADDRESSES.CryptoNFT,
    abi: CryptoNFTABI,
    functionName: 'owner',
  });

  // Lê o preço atual dos NFTs
  const { data: currentPrice } = useReadContract({
    address: CONTRACT_ADDRESSES.CryptoNFT,
    abi: CryptoNFTABI,
    functionName: 'price',
  });

  const isTokenOwner = address && tokenOwner && address.toLowerCase() === tokenOwner.toLowerCase();
  const isNftOwner = address && nftOwner && address.toLowerCase() === nftOwner.toLowerCase();

  const handleMintTokens = async () => {
    if (!mintAddress || !mintAmount) return;

    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.CryptoToken,
        abi: CryptoTokenABI,
        functionName: 'mintAndTransfer',
        args: [mintAddress as `0x${string}`, parseEther(mintAmount)],
      });
      setMintAddress('');
      setMintAmount('');
    } catch (error) {
      console.error('Erro ao cunhar tokens:', error);
    }
  };

  const handleUpdatePrice = async () => {
    if (!newPrice) return;

    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.CryptoNFT,
        abi: CryptoNFTABI,
        functionName: 'setPrice',
        args: [parseEther(newPrice)],
      });
      setNewPrice('');
    } catch (error) {
      console.error('Erro ao atualizar preço:', error);
    }
  };

  if (!address) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">
          Conecte sua carteira para acessar o painel administrativo.
        </p>
      </div>
    );
  }

  if (!isTokenOwner && !isNftOwner) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">
          Você não tem permissões administrativas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Painel Administrativo</h2>

      {/* Cunhar Tokens */}
      {isTokenOwner && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Cunhar e Transferir Tokens</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço do Destinatário
              </label>
              <input
                type="text"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade (em tokens)
              </label>
              <input
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder="100"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleMintTokens}
              disabled={isWritePending || !mintAddress || !mintAmount}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWritePending ? 'Cunhando...' : 'Cunhar Tokens'}
            </button>
          </div>
        </div>
      )}

      {/* Gerenciar Preço dos NFTs */}
      {isNftOwner && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Gerenciar Preço dos NFTs</h3>
          
          {/* Preço atual */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Preço Atual:</p>
            <p className="text-lg font-bold text-gray-900">
              {currentPrice ? formatEther(currentPrice) : '0'} CTK
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Novo Preço (em tokens)
              </label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="10"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleUpdatePrice}
              disabled={isWritePending || !newPrice}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWritePending ? 'Atualizando...' : 'Atualizar Preço'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
