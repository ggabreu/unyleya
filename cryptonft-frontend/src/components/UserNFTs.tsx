import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { CryptoNFTABI } from '../contracts/CryptoNFT';
import { CONTRACT_ADDRESSES } from '../wagmi';

interface NFT {
  tokenId: number;
  tokenURI?: string;
}

export function UserNFTs() {
  const { address } = useAccount();
  const { writeContract, isPending: isWritePending } = useWriteContract();
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [transferAddress, setTransferAddress] = useState('');
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  // Lê o número de NFTs do usuário
  const { data: nftBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.CryptoNFT,
    abi: CryptoNFTABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Função para buscar NFTs do usuário
  // Nota: Esta é uma implementação simplificada
  // Em um cenário real, você precisaria de eventos ou uma indexação adequada
  useEffect(() => {
    const fetchUserNFTs = async () => {
      if (!address || !nftBalance) return;

      const nfts: NFT[] = [];
      
      // Verifica os primeiros 1000 token IDs (método não otimizado para produção)
      // Em produção, use eventos ou subgraph
      try {
        for (let tokenId = 1; tokenId <= 1000; tokenId++) {
          try {
            // Verifica se o usuário é dono deste token
            const owner = await fetch(`/api/nft-owner/${tokenId}`).catch(() => null);
            if (owner && owner === address) {
              nfts.push({ tokenId });
            }
          } catch {
            // Token não existe ou erro, continua
            continue;
          }
          
          if (nfts.length >= Number(nftBalance)) {
            break;
          }
        }
      } catch (error) {
        console.error('Erro ao buscar NFTs:', error);
      }

      setUserNFTs(nfts);
    };

    if (address && nftBalance && Number(nftBalance) > 0) {
      fetchUserNFTs();
    } else {
      setUserNFTs([]);
    }
  }, [address, nftBalance]);

  const handleTransferNFT = async () => {
    if (!selectedTokenId || !transferAddress || !address) return;

    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.CryptoNFT,
        abi: CryptoNFTABI,
        functionName: 'safeTransferFrom',
        args: [address, transferAddress as `0x${string}`, BigInt(selectedTokenId)],
      });
      
      setTransferAddress('');
      setSelectedTokenId(null);
      
      // Atualiza a lista após a transferência
      setTimeout(() => {
        window.location.reload(); // Simplificado - em produção use refetch
      }, 2000);
    } catch (error) {
      console.error('Erro ao transferir NFT:', error);
    }
  };

  if (!address) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Meus NFTs</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Conecte sua carteira para ver seus NFTs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Meus NFTs</h2>
      
      {/* Estatísticas */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-blue-900 font-medium">
          Total de NFTs: {nftBalance ? Number(nftBalance) : 0}
        </p>
      </div>

      {/* Lista de NFTs */}
      {userNFTs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {nftBalance && Number(nftBalance) > 0 
              ? 'Carregando seus NFTs...' 
              : 'Você ainda não possui NFTs.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Seus NFTs:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userNFTs.map((nft) => (
              <div
                key={nft.tokenId}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedTokenId === nft.tokenId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTokenId(nft.tokenId)}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold">#{nft.tokenId}</span>
                  </div>
                  <p className="font-medium text-gray-900">NFT #{nft.tokenId}</p>
                  <p className="text-sm text-gray-500">
                    {selectedTokenId === nft.tokenId ? 'Selecionado' : 'Clique para selecionar'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transferir NFT */}
      {selectedTokenId && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transferir NFT #{selectedTokenId}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço do Destinatário
              </label>
              <input
                type="text"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleTransferNFT}
                disabled={isWritePending || !transferAddress}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWritePending ? 'Transferindo...' : 'Transferir NFT'}
              </button>
              <button
                onClick={() => {
                  setSelectedTokenId(null);
                  setTransferAddress('');
                }}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
