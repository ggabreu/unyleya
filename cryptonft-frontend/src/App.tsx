import '@rainbow-me/rainbowkit/styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { config } from './wagmi';
import { Header } from './components/Header';
import { AdminPanel } from './components/AdminPanel';
import { NFTPurchase } from './components/NFTPurchase';
import { UserNFTs } from './components/UserNFTs';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="min-h-screen bg-gray-100">
            <Header />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-8">
                {/* Seção Administrativa */}
                <section>
                  <AdminPanel />
                </section>

                {/* Seção de Usuários */}
                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Área do Usuário</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Comprar NFT */}
                    <NFTPurchase />
                    
                    {/* Tokens/NFTs do usuário */}
                    <UserNFTs />
                  </div>
                </section>
              </div>
            </main>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
