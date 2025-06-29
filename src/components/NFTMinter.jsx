// NFTMinter.jsx - Correção completa para Ethers v6

import { useState } from 'react';
import { ethers } from 'ethers'; // Importação do ethers
import { Coins, Loader2, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const NFTMinter = ({ metadata, metadataIpfsHash, addLog, tokenId, setTokenId }) => {
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState('');
 
  // remova a linha: 
  // const [tokenId, setTokenId] = useState('');

  const [recipientAddress, setRecipientAddress] = useState('');
  //const [contractAddress, setContractAddress] = useState('0x...');
  const [contractAddress, setContractAddress] = useState('0x322b94B67d4Ce89bA8fF061c6f527273a22654A8');
   
  const isValidAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Função para fazer upload dos metadados diretamente para Pinata (caso necessário)
  const uploadMetadataToPinata = async (metadataObj) => {
    addLog('📤 Fazendo upload dos metadados para Pinata...');

    try {
      // Validar token JWT
      const token = import.meta.env.VITE_PINATA_JWT;
      if (!token) {
        throw new Error('Token JWT do Pinata não encontrado. Verifique VITE_PINATA_JWT no arquivo .env');
      }

      const formData = new FormData();
      
      // Criar blob JSON dos metadados
      const metadataBlob = new Blob([JSON.stringify(metadataObj, null, 2)], {
        type: 'application/json'
      });
      
      formData.append('file', metadataBlob, `nft-metadata-${Date.now()}.json`);
      
      // Adicionar metadata do Pinata
      const pinataMetadata = JSON.stringify({
        name: `NFT Metadata ${Date.now()}`,
        keyvalues: {
          type: 'nft-metadata',
          timestamp: new Date().toISOString()
        }
      });
      formData.append('pinataMetadata', pinataMetadata);

      // Adicionar opções do Pinata
      const pinataOptions = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', pinataOptions);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erro no upload para Pinata: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      addLog(`✅ Metadados enviados para Pinata: ${data.IpfsHash}`);
      return data.IpfsHash;
      
    } catch (error) {
      addLog(`❌ Erro no upload de metadados: ${error.message}`);
      throw error;
    }
  };

  // Função para conectar carteira
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask não instalado');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      addLog(`💳 Carteira conectada: ${accounts[0]}`);
      setRecipientAddress(accounts[0]);
      return accounts[0];
    } catch (error) {
      addLog(`❌ Erro ao conectar carteira: ${error.message}`);
      throw error;
    }
  };

  // Função para verificar rede
  const checkNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const fujiChainId = '0xa869'; // 43113 em hexadecimal
      
      if (chainId !== fujiChainId) {
        addLog('🔄 Mudando para rede Avalanche Fuji...');
        
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: fujiChainId }],
          });
        } catch (switchError) {
          // Se a rede não estiver adicionada, adicionar
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: fujiChainId,
                chainName: 'Avalanche Fuji Testnet',
                nativeCurrency: {
                  name: 'AVAX',
                  symbol: 'AVAX',
                  decimals: 18
                },
                rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
               // blockExplorerUrls: ['https://testnet.snowtrace.io/']
               blockExplorerUrls: ['https://testnet.snowscan.xyz/']
               //https://testnet.snowscan.xyz/tx/0x11fbaa6820f9c4f22cf82f89e5f92396cb99bf47b942029a58b09643d48b4c74
              }]
            });
          } else {
            throw switchError;
          }
        }
      }
      
      addLog('✅ Conectado à rede Avalanche Fuji');
    } catch (error) {
      addLog(`❌ Erro ao verificar rede: ${error.message}`);
      throw error;
    }
  };

  // Função principal para fazer mint do NFT
  const mintNFT = async () => {
    if (!metadata) {
      alert('Metadados necessários para mint');
      return;
    }

    if (!recipientAddress || !isValidAddress(recipientAddress)) {
      alert('Endereço de destino inválido');
      return;
    }

    setIsMinting(true);
    
    try {
      addLog('🚀 Iniciando processo de mint do NFT...');

      // 1. Conectar carteira
      const account = await connectWallet();
      
      // 2. Verificar rede
      await checkNetwork();

      // 3. Garantir que temos o hash dos metadados
      let finalMetadataHash = metadataIpfsHash;
      
      if (!finalMetadataHash) {
        addLog('📤 Hash dos metadados não encontrado, fazendo upload...');
        finalMetadataHash = await uploadMetadataToPinata(metadata);
      }

      const metadataUri = `https://gateway.pinata.cloud/ipfs/${finalMetadataHash}`;
      addLog(`📋 URI dos metadados: ${metadataUri}`);

      // 4. Preparar contrato - ABI correto para seu contrato MyNFT
      const contractABI = [
        {
          "inputs": [
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "string", "name": "metadataUri", "type": "string"}
          ],
          "name": "safeMint",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "tokenIdCounter",
          "outputs": [{"internalType": "uint256", "name": "_value", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
            {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}
          ],
          "name": "Transfer",
          "type": "event"
        }
      ];

      // 5. Interagir com o contrato - SINTAXE CORRIGIDA PARA ETHERS V6
      const provider = new ethers.BrowserProvider(window.ethereum); // ← MUDANÇA PRINCIPAL
      const signer = await provider.getSigner(); // ← await necessário no v6
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      addLog('📝 Enviando transação de mint...');
      
      // Chamar a função correta do contrato: safeMint
      const tx = await contract.safeMint(recipientAddress, metadataUri);
      addLog(`⏳ Transação enviada: ${tx.hash}`);
      setTxHash(tx.hash);

      // 6. Aguardar confirmação
      addLog('⏳ Aguardando confirmação...');
      const receipt = await tx.wait();
      
      // 7. Extrair token ID dos logs - método melhorado para seu contrato
      let newTokenId = null;
      
      // Método 1: Tentar obter do contador (token atual - 1)
      try {
        const currentCounter = await contract.tokenIdCounter();
        newTokenId = (currentCounter - 1n).toString(); // BigInt subtraction
        addLog(`🎉 NFT mintado com sucesso! Token ID: ${newTokenId}`);
      } catch (counterError) {
        addLog('⚠️ Não foi possível obter o Token ID do contador');
        
        // Método 2: Tentar extrair do evento Transfer
        const transferEvent = receipt.logs?.find(log => {
          try {
            const parsedLog = contract.interface.parseLog(log);
            return parsedLog.name === 'Transfer';
          } catch {
            return false;
          }
        });
        
        if (transferEvent) {
          const parsedLog = contract.interface.parseLog(transferEvent);
          newTokenId = parsedLog.args.tokenId.toString();
          addLog(`🎉 NFT mintado com sucesso! Token ID: ${newTokenId}`);
        } else {
          addLog('🎉 NFT mintado com sucesso! (Token ID não identificado)');
        }
      }
      
      if (newTokenId) {
        setTokenId(newTokenId);
      }

      addLog(`✅ Transação confirmada: ${tx.hash}`);
      addLog(`🔗 Ver no SnowTrace: https://testnet.snowtrace.io/tx/${tx.hash}`);

    } catch (error) {
      addLog(`❌ Erro no mint: ${error.message}`);
      
      // Sugestões baseadas no tipo de erro
      if (error.message.includes('user rejected')) {
        addLog('💡 Transação cancelada pelo usuário');
      } else if (error.message.includes('insufficient funds')) {
        addLog('💡 Saldo insuficiente para pagar as taxas de gas');
      } else if (error.message.includes('MetaMask')) {
        addLog('💡 Instale e configure o MetaMask');
      }
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Mint NFT
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Alertas informativos */}
          {!metadata && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ⚠️ Metadados necessários primeiro
              </AlertDescription>
            </Alert>
          )}

          {!window.ethereum && (
            <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ⚠️ MetaMask não detectado. <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Instale aqui</a>
              </AlertDescription>
            </Alert>
          )}

          {/* Configurações */}
          <div className="space-y-4" >
            <div >
              <Label htmlFor="contractAddress" style={{ display: 'none' }}>0x322b94B67d4Ce89bA8fF061c6f527273a22654A8</Label>
              <Label htmlFor="contractAddress" >Contrato</Label>
              <Input
                id="contractAddress"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x322b94B67d4Ce89bA8fF061c6f527273a22654A8"
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="recipientAddress">Endereço de Destino</Label>
              <Input
                id="recipientAddress"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x... (ou clique em Conectar Carteira)"
                className="font-mono"
              />
            </div>
          </div>

          {/* Informações dos metadados */}
          {metadata && (
            <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <div><strong>NFT:</strong> {metadata.name}</div>
                <div><strong>Descrição:</strong> {metadata.description?.substring(0, 100)}...</div>
                {metadataIpfsHash && (
                  <div className="font-mono text-xs">
                    <strong>Hash IPFS:</strong> {metadataIpfsHash}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Botões de ação */}
          <div className="flex gap-2">
            <Button 
              onClick={connectWallet}
              variant="outline"
              disabled={isMinting}
            >
              💳 Conectar Carteira
            </Button>

            <Button 
              onClick={mintNFT}
              disabled={!metadata || isMinting || !window.ethereum}
              className="flex-1"
            >
              {isMinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mintando...
                </>
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  Mint NFT
                </>
              )}
            </Button>
          </div>

          {/* Resultado da transação */}
          {txHash && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <div>✅ NFT mintado com sucesso!</div>
                {tokenId && <div><strong>Token ID:</strong> {tokenId}</div>}
                <div className="font-mono text-xs break-all">
                  <strong>TX Hash:</strong> {txHash}
                </div>
                <div>
                  <a 
                    href={`https://testnet.snowtrace.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    🔗 Ver no SnowTrace <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Informações técnicas */}
          <div className="text-xs text-muted-foreground border rounded p-3 bg-muted/50">
            <p><strong>Processo de Mint:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>Conecta carteira MetaMask</li>
              <li>Verifica/muda para rede Avalanche Fuji</li>
              <li>Garante upload dos metadados no IPFS</li>
              <li>Executa função mintNFT do contrato</li>
              <li>Aguarda confirmação da transação</li>
            </ol>
            
            <p className="mt-3"><strong>Requisitos:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>MetaMask instalado e configurado</li>
              <li>AVAX suficiente para gas (Fuji Testnet)</li>
              <li>Contrato NFT deployado no Fuji</li>
              <li>Metadados já enviados para IPFS</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NFTMinter;