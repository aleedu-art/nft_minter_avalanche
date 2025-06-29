import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { config } from './lib/web3';

// Components
import ImageUpload from './components/ImageUpload';
import ChainlinkAnalysis from './components/ChainlinkAnalysis';
import MetadataGenerator from './components/MetadataGenerator';
import NFTMinter from './components/NFTMinter';
import DebugConsole from './components/DebugConsole';
import NFTMarketplaceChecker from './components/NFTMarketplaceChecker';

// Hooks
import { useIPFSUpload } from './hooks/useIPFSUpload';
import { useChainlinkFunctions } from './hooks/useChainlinkFunctions';
import { useDebugLogs } from './hooks/useDebugLogs';

// Styles
import './App.css';
import '@rainbow-me/rainbowkit/styles.css';

import { ethers } from 'ethers';
window.ethers = ethers; // Disponibilizar globalmente

const queryClient = new QueryClient();

function AppContent() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [metadata, setMetadata] = useState(null);

  //2025029
  const [tokenId, setTokenId] = useState('');

  // Hooks
  const { uploadToIPFS, isUploading } = useIPFSUpload();
  const { 
    sendAnalysisRequest, 
    checkResults,
    isAnalyzing, 
    analysisData: chainlinkData, 
    analysisError,
    hash: txHash,
    isConfirmed
  } = useChainlinkFunctions();
  const { logs, addLog, clearLogs, exportLogs } = useDebugLogs();

  // Handle file selection and upload
  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    addLog(`Imagem selecionada: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    try {
      addLog('Iniciando upload para IPFS...');
      const hash = await uploadToIPFS(file);
      setIpfsHash(hash);
      addLog(`Upload IPFS bem-sucedido: ${hash}`);
    } catch (error) {
      addLog(`Erro no upload IPFS: ${error.message}`);
    }
  };

  // Handle analysis start
  const handleStartAnalysis = async (hash) => {
    try {
      await sendAnalysisRequest(hash);
      addLog('Request de análise enviado para Chainlink Functions');
    } catch (error) {
      addLog(`xxx Erro ao enviar análise: ${error.message}`);
    }
  };

  // Handle analysis completion
  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    addLog('Análise de sentimentos concluída!');
  };

  // Handle metadata generation
  const handleMetadataGenerated = (generatedMetadata) => {
    setMetadata(generatedMetadata);
    addLog('Metadados NFT gerados e prontos para mint');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            NFT Sentiment Analyzer
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Análise de sentimentos automatizada via Chainlink Functions + OpenAI
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Image Upload */}
          <ImageUpload 
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            isUploading={isUploading}
          />

          {/* IPFS Info */}
          {ipfsHash && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                ✅ Upload IPFS Concluído!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Hash: <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">{ipfsHash}</code>
              </p>
            </div>
          )}

          {/* Chainlink Analysis */}
          <ChainlinkAnalysis
            ipfsHash={ipfsHash}
            onAnalysisComplete={handleAnalysisComplete}
            isAnalyzing={isAnalyzing}
            analysisData={chainlinkData}
            analysisError={analysisError}
            onStartAnalysis={handleStartAnalysis}
            onCheckResults={checkResults}
            isConfirmed={isConfirmed}
            addLog={addLog}
          />

          {/* Metadata Generator */}
          <MetadataGenerator
            analysisData={analysisData || chainlinkData}
            ipfsHash={ipfsHash}
            onMetadataGenerated={handleMetadataGenerated}
            addLog={addLog}
          />

          {/* NFT Minter */}
          <NFTMinter
            metadata={metadata}
            analysisData={analysisData || chainlinkData}
            ipfsHash={ipfsHash}
            addLog={addLog}

            //2025029
           tokenId={tokenId}        // <<< NOVO
           setTokenId={setTokenId}  // <<< NOVO
          />

          {/* NFT Marketplace Checker */}
            <NFTMarketplaceChecker 
             tokenId={tokenId}    // <<< NOVO
             setTokenId={setTokenId}
           />

          {/* Debug Console */}
          <DebugConsole
            logs={logs}
            onClearLogs={clearLogs}
            onExportLogs={exportLogs}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-muted-foreground">
          <p>Powered by Chainlink Functions, OpenAI, and Avalanche Fuji Testnet</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AppContent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;

