import React, { useState } from 'react';
import { ExternalLink, Search, Eye, Globe } from 'lucide-react';


const NFTMarketplaceChecker = ({ tokenId, setTokenId }) => {    
  const [contractAddress, setContractAddress] = useState('');
   // REMOVE esta linha:
  //const [tokenId, setTokenId] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Marketplaces que suportam Avalanche Fuji Testnet
  const marketplaces = [
    {
      name: 'Joepegs Fuji',
      url: (contract, tokenId) => `https://fuji.joepegs.com/item/avalanche/${contract}/${tokenId}`,
      description: 'Principal marketplace de NFTs na Avalanche',
      status: 'active',
      supportsTestnet: true
    },
    {
      name: 'Kalao Demo',
      url: (contract, tokenId) => `https://marketplace-demo.kalao.io/nft/${contract}/${tokenId}`,
      description: 'Marketplace com realidade virtual',
      status: 'active',
      supportsTestnet: true
    },
    {
      name: 'Element (Testnet)',
      url: (contract, tokenId) => `https://testnet.element.market/assets/avalanche/${contract}/${tokenId}`,
      description: 'Marketplace multi-chain',
      status: 'limited',
      supportsTestnet: true
    },
    {
      name: 'OpenSea (Limitado)',
      url: (contract, tokenId) => `https://testnets.opensea.io/assets/avalanche-fuji/${contract}/${tokenId}`,
      description: 'Marketplace global (suporte limitado para testnet)',
      status: 'limited',
      supportsTestnet: false
    }
  ];

  // Exploradores para verificar o NFT
  const explorers = [
    {
      name: 'SnowScan',
      url: (contract, tokenId) => `https://testnet.snowscan.xyz/token/${contract}?a=${tokenId}`,
      description: 'Explorer oficial Avalanche'
    },
    {
      name: 'AvaScan',
      url: (contract, tokenId) => `https://testnet.avascan.info/blockchain/c/address/${contract}/token/${tokenId}`,
      description: 'Explorer da Avalanche'
    }
  ];

  const handleSearch = () => {
    if (contractAddress && tokenId) {
      setSearchPerformed(true);
    }
  };

  const openLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔍 Verificador de NFT nos Marketplaces
        </h2>
        <p className="text-gray-600">
          Verifique se seu NFT está aparecendo nos marketplaces da Avalanche Fuji Testnet
        </p>
      </div>

      {/* Formulário de Busca MyNFT_FUJI.sol */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço do Contrato
            </label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x8d0c0E8515D236644F65A9152a3445987cE817b6"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token ID
            </label>
            <input
              type="text"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              //placeholder="0"
              placeholder={tokenId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button
          onClick={handleSearch}
        //  disabled={!contractAddress || !tokenId}
            disabled={!tokenId}
          className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Search size={20} />
          Verificar NFT
        </button>
      </div>

      {/* Exemplo com dados da sua transação */}
      {/* {false && ( */}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Exemplo com sua transação:</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Hash da Transação:</strong> 0x11fbaa6820f9c4f22cf82f89e5f92396cb99bf47b942029a58b09643d48b4c74</p>
          <p><strong>Token ID:</strong> 0</p>
          <p><strong>Rede:</strong> Avalanche Fuji Testnet</p>
        </div>
        <div className="mt-3">
          <button
            onClick={() => {
              // Você precisará substituir pelo endereço real do seu contrato
              setContractAddress('SEU_ENDERECO_DO_CONTRATO_AQUI');
              setTokenId('0');
              setSearchPerformed(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Usar Exemplo
          </button>
        </div>
      </div>
    
     {/*  )} */}

      {/* Resultados */}
      {searchPerformed && contractAddress && tokenId && (
        <div className="space-y-6">
          {/* Marketplaces */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🏪 Marketplaces de NFT
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketplaces.map((marketplace, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    marketplace.supportsTestnet 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">
                      {marketplace.name}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      marketplace.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {marketplace.status === 'active' ? '✅ Ativo' : '⚠️ Limitado'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {marketplace.description}
                  </p>
                  
                  <button
                    onClick={() => openLink(marketplace.url(contractAddress, tokenId))}
                    className={`w-full px-4 py-2 rounded-md flex items-center justify-center gap-2 ${
                      marketplace.supportsTestnet
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    <Eye size={16} />
                    Ver no {marketplace.name}
                    <ExternalLink size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Exploradores */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🔍 Exploradores da Blockchain
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {explorers.map((explorer, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {explorer.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {explorer.description}
                  </p>
                  <button
                    onClick={() => openLink(explorer.url(contractAddress, tokenId))}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <Globe size={16} />
                    Ver no {explorer.name}
                    <ExternalLink size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dicas */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 Dicas Importantes:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• <strong>Testnet vs Mainnet:</strong> NFTs na Fuji Testnet não aparecem nos marketplaces da mainnet</li>
              <li>• <strong>Tempo de Indexação:</strong> Pode levar alguns minutos para o NFT aparecer nos marketplaces</li>
              <li>• <strong>Metadados:</strong> Certifique-se de que os metadados estão acessíveis no IPFS</li>
              <li>• <strong>Padrão ERC-721:</strong> Verifique se seu contrato segue o padrão corretamente</li>
            </ul>
          </div>

          {/* Próximos Passos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🚀 Próximos Passos:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Para usar na <strong>Mainnet</strong>, você precisará fazer deploy do contrato na rede principal</li>
              <li>• Considere usar marketplaces como <strong>Joepegs</strong>, <strong>Kalao</strong>, ou <strong>OpenSea</strong> na mainnet</li>
              <li>• Teste todas as funcionalidades na testnet antes de migrar para mainnet</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTMarketplaceChecker;