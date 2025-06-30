import { useState, useCallback } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, CHAINLINK_ABI, GAS_CONFIG } from '../lib/web3';

export const useChainlinkFunctions = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const { writeContract, data: hash, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // CORRIGIDO: Usar a função getLastAnalysis que retorna a estrutura decodificada
  const { data: lastAnalysis, refetch: refetchAnalysis } = useReadContract({
    address: CONTRACTS.CHAINLINK_FUNCTIONS,
    abi: CHAINLINK_ABI,
    functionName: 'getLastAnalysis',
  });

  const { data: lastResponse, refetch: refetchResponse } = useReadContract({
    address: CONTRACTS.CHAINLINK_FUNCTIONS,
    abi: CHAINLINK_ABI,
    functionName: 's_lastResponse',
  });

  const { data: lastError, refetch: refetchError } = useReadContract({
    address: CONTRACTS.CHAINLINK_FUNCTIONS,
    abi: CHAINLINK_ABI,
    functionName: 's_lastError',
  });

  const { data: lastRequestId, refetch: refetchRequestId } = useReadContract({
    address: CONTRACTS.CHAINLINK_FUNCTIONS,
    abi: CHAINLINK_ABI,
    functionName: 's_lastRequestId',
  });

  // CORRIGIDO: Usar analyzeImage em vez de sendRequest genérico
  const sendAnalysisRequest = useCallback(async (ipfsHash) => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      setAnalysisData(null);
      
      console.log(`🚀 Enviando request para análise: ${ipfsHash}`);
      console.log('⚙️ Configuração de gas:', GAS_CONFIG);
      console.log('📍 Contrato:', CONTRACTS.CHAINLINK_FUNCTIONS);
      console.log('🔑 Subscription ID:', CONTRACTS.SUBSCRIPTION_ID);

      const donHostedSecretsSlotID = 0; // slotId
     // const donHostedSecretsVersion = 1751066415; // version - MUDAR A CADA DOIS DIAS PORQUE VENCE 
      const donHostedSecretsVersion = 1751315377; // version - MUDAR A CADA DOIS DIAS PORQUE VENCE 

      // Construir URL completa do IPFS
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      
      // Parâmetros para analyzeImage
      const subscriptionId = CONTRACTS.SUBSCRIPTION_ID;
      const gasLimit = 300000;
      const donID = "0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000";

/*
        uint8 donHostedSecretsSlotID,
        uint64 donHostedSecretsVersion,
        string memory imageUrl,
        uint64 subscriptionId,
        uint32 gasLimit,
        bytes32 donID
*/

      console.log('📋 Parâmetros da transação:', {
        donHostedSecretsSlotID,
        donHostedSecretsVersion,
        imageUrl,
        subscriptionId,
        gasLimit,
        donID
      });

      const result = await writeContract({
        address: CONTRACTS.CHAINLINK_FUNCTIONS,
        abi: CHAINLINK_ABI,
        functionName: 'analyzeImage',
        args: [
          imageUrl,
          subscriptionId,
          gasLimit,
          donID
        ],
        ...GAS_CONFIG,
      });

      console.log('✅ Transação enviada com sucesso:', result);

    } catch (error) {
      console.error('❌ Erro detalhado ao enviar request:', {
        message: error.message,
        code: error.code,
        data: error.data,
        stack: error.stack
      });
      
      // Tratamento específico de erros
      let userFriendlyError = error.message;
      
      if (error.message.includes('insufficient funds')) {
        userFriendlyError = 'Saldo insuficiente de AVAX para gas';
      } else if (error.message.includes('gas')) {
        userFriendlyError = 'Problema com configuração de gas';
      } else if (error.message.includes('revert')) {
        userFriendlyError = 'Transação rejeitada pelo contrato';
      } else if (error.message.includes('network')) {
        userFriendlyError = 'Problema de conexão com a rede';
      }
      
      setAnalysisError(new Error(userFriendlyError));
      setIsAnalyzing(false);
    }
  }, [writeContract]);

  // CORRIGIDO: Transformar os dados do contrato para o formato esperado pelo frontend
  const transformAnalysisData = (contractData) => {
    if (!contractData || contractData.length < 5) return null;

    const [sentiment, colors, visualStyle, keywords, attributes] = contractData;

    // Transformar para o formato esperado pelo frontend
    return {
      sentiment_analysis: sentiment || 'Não disponível',
      color_psychology: colors || 'Não disponível', 
      visual_language: visualStyle || 'Não disponível',
      symbol_relation: attributes || 'Não disponível',
      keywords: keywords && keywords.length > 0 ? keywords : ['arte', 'nft'],
      attributes: [
        { trait_type: 'Sentiment', value: sentiment || 'neutral' },
        { trait_type: 'Colors', value: colors || 'mixed' },
        { trait_type: 'Style', value: visualStyle || 'digital' },
        { trait_type: 'Attributes', value: attributes || 'standard' }
      ]
    };
  };

  // Manual check for results
  const checkResults = useCallback(async () => {
    try {
      console.log('Verificando resultados manualmente...');
      
      // Refetch the latest data
      await refetchAnalysis();
      await refetchResponse();
      await refetchError();
      await refetchRequestId();

      // CORRIGIDO: Verificar a análise decodificada primeiro
      if (lastAnalysis && lastAnalysis[0] && lastAnalysis[0].length > 0) {
        console.log('Análise decodificada encontrada:', lastAnalysis);
        
        const transformedData = transformAnalysisData(lastAnalysis);
        if (transformedData) {
          setAnalysisData(transformedData);
          setIsAnalyzing(false);
          return { success: true, data: transformedData };
        }
      }

      // Fallback: verificar resposta bruta se a análise decodificada não estiver disponível
      if (lastResponse && lastResponse !== '0x' && lastResponse.length > 2) {
        try {
          // Convert hex to string
          const responseString = lastResponse.slice(2); // Remove 0x
          const bytes = [];
          for (let i = 0; i < responseString.length; i += 2) {
            bytes.push(parseInt(responseString.substr(i, 2), 16));
          }
          const decodedString = new TextDecoder().decode(new Uint8Array(bytes));
          
          console.log('Resposta bruta encontrada:', decodedString);
          
          // Try to parse as JSON
          const parsedData = JSON.parse(decodedString);
          
          // Transformar dados JSON compactos para formato completo
          const transformedData = {
            sentiment_analysis: parsedData.s || 'Não disponível',
            color_psychology: parsedData.c || 'Não disponível',
            visual_language: parsedData.v || 'Não disponível', 
            symbol_relation: parsedData.a || 'Não disponível',
            keywords: parsedData.k || ['arte', 'nft'],
            attributes: [
              { trait_type: 'Sentiment', value: parsedData.s || 'neutral' },
              { trait_type: 'Colors', value: parsedData.c || 'mixed' },
              { trait_type: 'Style', value: parsedData.v || 'digital' },
              { trait_type: 'Attributes', value: parsedData.a || 'standard' }
            ]
          };
          
          setAnalysisData(transformedData);
          setIsAnalyzing(false);
          
          return { success: true, data: transformedData };
        } catch (parseError) {
          console.error('Erro ao parsear resposta:', parseError);
          return { success: false, error: 'Resposta ainda não está pronta ou é inválida' };
        }
      }

      // Check for errors
      if (lastError && lastError !== '0x' && lastError.length > 2) {
        const errorString = lastError.slice(2);
        const bytes = [];
        for (let i = 0; i < errorString.length; i += 2) {
          bytes.push(parseInt(errorString.substr(i, 2), 16));
        }
        const decodedError = new TextDecoder().decode(new Uint8Array(bytes));
        
        const error = new Error(`Chainlink Error: ${decodedError}`);
        setAnalysisError(error);
        setIsAnalyzing(false);
        
        return { success: false, error: decodedError };
      }

      // No response yet
      return { success: false, error: 'Ainda aguardando resposta...' };

    } catch (error) {
      console.error('Erro ao verificar resultados:', error);
      return { success: false, error: error.message };
    }
  }, [lastAnalysis, lastResponse, lastError, refetchAnalysis, refetchResponse, refetchError, refetchRequestId]);

  return {
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
  };
};