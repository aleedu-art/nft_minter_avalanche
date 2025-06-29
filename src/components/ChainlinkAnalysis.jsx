import React, { useState, useEffect } from 'react';
import { useChainlinkFunctions } from '../hooks/useChainlinkFunctions';
import { useAccount } from 'wagmi';

const ChainlinkAnalysis = ({ 
  ipfsHash, 
  onAnalysisComplete, 
  onAnalysisError,
  className = "" 
}) => {
  const { isConnected } = useAccount();
  const [pollingInterval, setPollingInterval] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, analyzing, polling, completed, error
  
  const {
    sendAnalysisRequest,
    checkResults,
    isAnalyzing,
    isConfirming,
    isConfirmed,
    analysisData,
    analysisError,
    writeError,
    hash,
    lastResponse,
    lastError,
    lastRequestId,
    lastAnalysis
  } = useChainlinkFunctions();

  // Iniciar análise quando o componente receber um ipfsHash
  useEffect(() => {
    if (ipfsHash && isConnected && status === 'idle') {
      handleStartAnalysis();
    }
  }, [ipfsHash, isConnected]);

  // Monitorar confirmação da transação para iniciar polling
  useEffect(() => {
    if (isConfirmed && status === 'analyzing') {
      console.log('✅ Transação confirmada, iniciando polling...');
      setStatus('polling');
      startPolling();
    }
  }, [isConfirmed, status]);

  // Monitorar dados de análise para completar
  useEffect(() => {
    if (analysisData && status === 'polling') {
      console.log('🎉 Análise completada:', analysisData);
      setStatus('completed');
      stopPolling();
      onAnalysisComplete?.(analysisData);
    }
  }, [analysisData, status]);

  // Monitorar erros
  useEffect(() => {
    if ((analysisError || writeError) && status !== 'error') {
      console.error('❌ Erro na análise:', analysisError || writeError);
      setStatus('error');
      stopPolling();
      onAnalysisError?.(analysisError || writeError);
    }
  }, [analysisError, writeError, status]);

  const handleStartAnalysis = async () => {
    if (!ipfsHash) {
      console.error('❌ IPFS hash não fornecido');
      return;
    }

    if (!isConnected) {
      console.error('❌ Carteira não conectada');
      return;
    }

    console.log(`🚀 Iniciando análise para IPFS: ${ipfsHash}`);
    setStatus('analyzing');
    setAttempts(0);
    
    try {
      await sendAnalysisRequest(ipfsHash);
    } catch (error) {
      console.error('❌ Erro ao enviar request:', error);
      setStatus('error');
    }
  };

  const startPolling = () => {
    console.log('🔄 Iniciando polling para resultados...');
    
    const interval = setInterval(async () => {
      setAttempts(prev => prev + 1);
      
      console.log(`🔍 Tentativa ${attempts + 1} de verificação...`);
      
      const result = await checkResults();
      
      if (result.success) {
        console.log('✅ Resultado encontrado:', result.data);
        stopPolling();
      } else if (attempts >= 20) { // Máximo 20 tentativas (2 minutos)
        console.log('⏰ Timeout: máximo de tentativas atingido');
        setStatus('error');
        stopPolling();
        onAnalysisError?.(new Error('Timeout: análise demorou mais que o esperado'));
      } else {
        console.log(`⏳ ${result.error} (tentativa ${attempts + 1}/20)`);
      }
    }, 6000); // Verificar a cada 6 segundos

    setPollingInterval(interval);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setAttempts(0);
    stopPolling();
    if (ipfsHash) {
      handleStartAnalysis();
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'analyzing':
        return isConfirming ? 'Confirmando transação...' : 'Enviando para análise...';
      case 'polling':
        return `Aguardando resultado... (${attempts}/20)`;
      case 'completed':
        return 'Análise completada!';
      case 'error':
        return 'Erro na análise';
      default:
        return 'Pronto para análise';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'analyzing':
      case 'polling':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Análise Chainlink Functions
        </h3>
        <div className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>

      {/* Status visual */}
         {/*  Para grande: */}
      
        {/* 
      <div className="mb-4">

     
     
        <div className="flex items-center space-x-2 text-xl text-gray-600">
          <div className={`w-3 h-3 rounded-full ${
            status === 'analyzing' || status === 'polling' ? 'bg-blue-500 animate-pulse' :
            status === 'completed' ? 'bg-green-500' :
            status === 'error' ? 'bg-red-500' : 'bg-gray-300'
          }`}></div>
          <span>
            {status === 'idle' && 'Aguardando...'}
            {status === 'analyzing' && 'Processando transação...'}
            {status === 'polling' && `Verificando resultados (${attempts}/20)...`}
            {status === 'completed' && 'Análise concluída!'}
            {status === 'error' && 'Erro ocorrido'}
          </span>
        </div>
      </div>
      */}

      <div className="mb-4">
  <div className="flex items-center space-x-3 text-xl font-semibold text-gray-700">
    <div className={`relative w-6 h-6`}>
      <div className={`absolute inset-0 rounded-full ${
        status === 'analyzing' || status === 'polling' ? 'bg-blue-400 animate-ping' : ''
      }`}></div>
      <div className={`relative w-6 h-6 rounded-full border-2 ${
        status === 'analyzing' || status === 'polling' ? 'bg-blue-500 border-blue-700' :
        status === 'completed' ? 'bg-green-500 border-green-700' :
        status === 'error' ? 'bg-red-500 border-red-700' :
        'bg-gray-300 border-gray-400'
      }`}></div>
    </div>
    <span>
      {status === 'idle' && 'Aguardando...'}
      {status === 'analyzing' && '⏳ Processando transação...'}
      {status === 'polling' && `🔍 Verificando resultados (${attempts}/20)...`}
      {status === 'completed' && '✅ Análise concluída!'}
      {status === 'error' && '❌ Erro ocorrido'}
    </span>
  </div>
</div>


      {/* Informações da transação */}
      {hash && (
        <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
          <div className="font-medium text-gray-700 mb-1">Hash da Transação:</div>
          <div className="text-gray-600 font-mono break-all">{hash}</div>
        </div>
      )}

      {/* Request ID */}
      {lastRequestId && lastRequestId !== '0x0000000000000000000000000000000000000000000000000000000000000000' && (
        <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
          <div className="font-medium text-blue-700 mb-1">Request ID:</div>
          <div className="text-blue-600 font-mono break-all">{lastRequestId}</div>
        </div>
      )}

      {/* Resultados da análise */}
      {analysisData && (
        <div className="mb-4 p-4 bg-green-50 rounded">
          <h4 className="font-semibold text-green-800 mb-3">Resultados da Análise:</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-green-700">Sentimento:</span>
              <span className="ml-2 text-green-600">{analysisData.sentiment_analysis}</span>
            </div>
            <div>
              <span className="font-medium text-green-700">Psicologia das Cores:</span>
              <span className="ml-2 text-green-600">{analysisData.color_psychology}</span>
            </div>
            <div>
              <span className="font-medium text-green-700">Linguagem Visual:</span>
              <span className="ml-2 text-green-600">{analysisData.visual_language}</span>
            </div>
            <div>
              <span className="font-medium text-green-700">Relação Simbólica:</span>
              <span className="ml-2 text-green-600">{analysisData.symbol_relation}</span>
            </div>
            <div>
              <span className="font-medium text-green-700">Palavras-chave:</span>
              <span className="ml-2 text-green-600">{analysisData.keywords?.join(', ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Dados brutos para debug */}
      {(lastResponse || lastError) && (
        <details className="mb-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            Dados técnicos (debug)
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
            {lastResponse && lastResponse !== '0x' && (
              <div className="mb-2">
                <div className="font-medium text-gray-700">Resposta:</div>
                <div className="text-gray-600 font-mono break-all">{lastResponse}</div>
              </div>
            )}
            {lastError && lastError !== '0x' && (
              <div>
                <div className="font-medium text-red-700">Erro:</div>
                <div className="text-red-600 font-mono break-all">{lastError}</div>
              </div>
            )}
          </div>
        </details>
      )}

      {/* Erros */}
      {(analysisError || writeError) && (
        <div className="mb-4 p-4 bg-red-50 rounded">
          <h4 className="font-semibold text-red-800 mb-2">Erro:</h4>
          <p className="text-red-600 text-sm">
            {analysisError?.message || writeError?.message || 'Erro desconhecido'}
          </p>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex space-x-3">
        {status === 'idle' && ipfsHash && (
          <button
            onClick={handleStartAnalysis}
            disabled={!isConnected}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Iniciar Análise
          </button>
        )}

        {status === 'error' && (
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Tentar Novamente
          </button>
        )}

        {status === 'polling' && (
          <button
            onClick={async () => {
              const result = await checkResults();
              console.log('Verificação manual:', result);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            style={{ display: 'none' }}
          >
            Verificar Agora
          </button>
        )}

        {!isConnected && (
          <p className="text-sm text-red-600">
            Por favor, conecte sua carteira para usar a análise Chainlink.
          </p>
        )}
      </div>

      {/* Informações adicionais */}
      {ipfsHash && (
        <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
          <div className="font-medium text-gray-700 mb-1">IPFS Hash:</div>
          <div className="text-gray-600 font-mono break-all">{ipfsHash}</div>
        </div>
      )}
    </div>
  );
};

export default ChainlinkAnalysis;