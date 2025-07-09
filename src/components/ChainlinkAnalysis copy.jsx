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
  const [status, setStatus] = useState('idle'); // idle, analyzing, waiting, polling, completed, error
  
  // Estados para o contador de 2 minutos
  const [waitingInterval, setWaitingInterval] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const WAIT_TIME = 120; // 2 minutos em segundos
  
  // Armazenar o hash da transação atual para verificação
  const [currentTransactionHash, setCurrentTransactionHash] = useState(null);
  const [lastProcessedHash, setLastProcessedHash] = useState(null);
  
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

  // Monitorar confirmação da transação para iniciar contador de 2 minutos
  useEffect(() => {
    if (isConfirmed && hash && status === 'analyzing') {
      console.log('✅ Transação confirmada:', hash);
      console.log('🎯 Armazenando hash da transação atual:', hash);
      
      setCurrentTransactionHash(hash);
      setStatus('waiting');
      startWaitingTimer();
    }
  }, [isConfirmed, hash, status]);

  // Monitorar dados de análise para completar (com verificação de hash)
  useEffect(() => {
    if (analysisData && status === 'polling' && currentTransactionHash) {
      // Só aceitar dados se for uma nova análise (diferente da última processada)
      if (currentTransactionHash !== lastProcessedHash) {
        console.log('🎉 Nova análise completada:', analysisData);
        console.log('📝 Hash da transação processada:', currentTransactionHash);
        
        setLastProcessedHash(currentTransactionHash);
        setStatus('completed');
        stopPolling();
        onAnalysisComplete?.(analysisData);
      } else {
        console.log('⚠️ Dados antigos detectados, continuando polling...');
      }
    }
  }, [analysisData, status, currentTransactionHash, lastProcessedHash]);

  // Monitorar erros
  useEffect(() => {
    if ((analysisError || writeError) && status !== 'error') {
      console.error('❌ Erro na análise:', analysisError || writeError);
      setStatus('error');
      stopPolling();
      stopWaitingTimer();
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
    
    // Limpar completamente dados antigos
    console.log('🧹 Limpando dados antigos da análise...');
    
    setStatus('analyzing');
    setAttempts(0);
    
    try {
      await sendAnalysisRequest(ipfsHash);
    } catch (error) {
      console.error('❌ Erro ao enviar request:', error);
      setStatus('error');
    }
  };

  const startWaitingTimer = () => {
    console.log('⏰ Iniciando contador de 2 minutos...');
    setRemainingTime(WAIT_TIME);
    
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        const newTime = prev - 1;
        
        if (newTime <= 0) {
          console.log('✅ Contador finalizado, iniciando polling...');
          clearInterval(interval);

          //20250706
        //  stopWaitingTimer();

          setWaitingInterval(null);
          setStatus('polling');
          startPolling();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    setWaitingInterval(interval);
  };
 


  const stopWaitingTimer = () => {
    if (waitingInterval) {
      clearInterval(waitingInterval);
      setWaitingInterval(null);
      setRemainingTime(0);
    }
  };

  const startPolling = () => {
    console.log('🔄 Iniciando polling para resultados...');
    
    // Limpar dados antigos antes de iniciar polling
    console.log('🧹 Limpando dados antigos...');
    
    let currentAttempt = 0;
    
    const interval = setInterval(async () => {
      currentAttempt++;
      setAttempts(currentAttempt);
      
      console.log(`🔍 Tentativa ${currentAttempt} de verificação...`);
      
      const result = await checkResults();
      
      if (result.success) {
        console.log('✅ Resultado encontrado:', result.data);
        stopPolling();
      } else if (currentAttempt >= 20) { // Máximo 20 tentativas (2 minutos)
        console.log('⏰ Timeout: máximo de tentativas atingido');
        setStatus('error');
        stopPolling();
        onAnalysisError?.(new Error('Timeout: análise demorou mais que o esperado'));
      } else {
        console.log(`⏳ ${result.error} (tentativa ${currentAttempt}/20)`);
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
    setCurrentTransactionHash(null);
    stopPolling();
    stopWaitingTimer();
    if (ipfsHash) {
      handleStartAnalysis();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (status) {
      case 'analyzing':
        return isConfirming ? 'Confirmando transação...' : 'Enviando para análise...';
      case 'waiting':
        return `Aguardando processamento... (${formatTime(remainingTime)})`;
      case 'polling':
        return `Verificando resultado... (${attempts}/20)`;
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
      case 'waiting':
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

      {/* Status visual com contador */}
      <div className="mb-4">
        <div className="flex items-center space-x-3 text-xl font-semibold text-gray-700">
          <div className={`relative w-6 h-6`}>
            <div className={`absolute inset-0 rounded-full ${
              status === 'analyzing' || status === 'waiting' || status === 'polling' ? 'bg-blue-400 animate-ping' : ''
            }`}></div>
            <div className={`relative w-6 h-6 rounded-full border-2 ${
              status === 'analyzing' || status === 'waiting' || status === 'polling' ? 'bg-blue-500 border-blue-700' :
              status === 'completed' ? 'bg-green-500 border-green-700' :
              status === 'error' ? 'bg-red-500 border-red-700' :
              'bg-gray-300 border-gray-400'
            }`}></div>
          </div>
          <span>
            {status === 'idle' && 'Aguardando...'}
            {status === 'analyzing' && '⏳ Processando transação...'}
            {status === 'waiting' && '⏰ Aguardando processamento...'}
            {status === 'polling' && `🔍 Verificando resultados (${attempts}/20)...`}
            {status === 'completed' && '✅ Análise concluída!'}
            {status === 'error' && '❌ Erro ocorrido'}
          </span>
        </div>
      </div>

      {/* Contador visual quando estiver esperando */}
      {status === 'waiting' && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-800 font-medium">Tempo de espera para garantir processamento:</span>
            <span className="text-blue-600 font-mono text-lg">{formatTime(remainingTime)}</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((WAIT_TIME - remainingTime) / WAIT_TIME) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            Aguardando para garantir que a nova imagem seja processada pela Chainlink Functions...
          </p>
        </div>
      )}

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
          <h4 className="font-semibold text-green-800 mb-3">Resultados da Análise de Sentimentos:</h4>
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
            Dados técnicos (Hexadecimal)
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

        {status === 'waiting' && (
          <button
            onClick={() => {
              console.log('⏭️ Pulando tempo de espera...');
              stopWaitingTimer();
              setStatus('polling');
              startPolling();
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Pular Espera (Debug)
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