import { useState } from 'react';
import { FileText, Copy, Download, Upload, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MetadataGenerator = ({ analysisData, ipfsHash, onMetadataGenerated, addLog }) => {
  const [metadata, setMetadata] = useState(null);
  const [metadataString, setMetadataString] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [metadataIpfsHash, setMetadataIpfsHash] = useState('');

  // Função para validar o token JWT
  const validateJWTToken = (token) => {
    if (!token) {
      throw new Error('Token JWT não encontrado. Verifique se VITE_PINATA_JWT está definido no arquivo .env');
    }

    // JWT deve ter 3 partes separadas por pontos
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error(`Token JWT inválido. Deve ter 3 segmentos, mas tem ${parts.length}. Verifique se o token não está truncado ou corrompido.`);
    }

    // Verificar se não há espaços ou caracteres especiais
    if (token.includes(' ') || token.includes('\n') || token.includes('\t')) {
      throw new Error('Token JWT contém caracteres inválidos (espaços, quebras de linha). Verifique se foi copiado corretamente.');
    }

    return token.trim();
  };

  // Função para fazer upload dos metadados para Pinata
  const uploadMetadataToPinata = async (metadataObj) => {
    setIsUploading(true);
    addLog('Validando credenciais do Pinata...');

    try {
      // Obter e validar o token
      const rawToken = import.meta.env.VITE_PINATA_JWT;
      const validToken = validateJWTToken(rawToken);
      
      addLog('✅ Token JWT validado com sucesso');
      addLog('Fazendo upload dos metadados para Pinata IPFS...');

      const formData = new FormData();
      
      // Criar um blob JSON dos metadados
      const metadataBlob = new Blob([JSON.stringify(metadataObj, null, 2)], {
        type: 'application/json'
      });
      
      // Adicionar ao FormData
      formData.append('file', metadataBlob, `nft-metadata-${Date.now()}.json`);
      
      // Adicionar metadata do Pinata
      const pinataMetadata = JSON.stringify({
        name: `NFT Metadata ${Date.now()}`,
        keyvalues: {
          type: 'nft-metadata',
          sentiment: analysisData.sentiment_analysis?.substring(0, 50) || 'analyzed',
          timestamp: new Date().toISOString()
        }
      });
      formData.append('pinataMetadata', pinataMetadata);

      // Adicionar opções do Pinata
      const pinataOptions = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', pinataOptions);

      // Log do token para debug (apenas primeiros e últimos caracteres por segurança)
      addLog(`Usando token: ${validToken.substring(0, 10)}...${validToken.substring(validToken.length - 10)}`);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${validToken}`,
        },
        body: formData,
      });

      // Log da resposta para debug
      addLog(`Status da resposta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorData);
          if (errorJson.error) {
            errorMessage += `\nDetalhes: ${errorJson.error.reason} - ${errorJson.error.details}`;
          }
        } catch (e) {
          errorMessage += `\nResposta: ${errorData}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const newIpfsHash = data.IpfsHash;
      
      setMetadataIpfsHash(newIpfsHash);
      addLog(`✅ Metadados enviados para Pinata IPFS: ${newIpfsHash}`);
      addLog(`🔗 Link dos metadados: https://gateway.pinata.cloud/ipfs/${newIpfsHash}`);
      
      // Retornar o hash dos metadados para uso no mint
      return newIpfsHash;
      
    } catch (error) {
      addLog(`❌ Erro no upload dos metadados: ${error.message}`);
      
      // Sugestões específicas baseadas no tipo de erro
      if (error.message.includes('INVALID_CREDENTIALS')) {
        addLog('💡 Sugestão: Verifique se o token JWT do Pinata está correto no arquivo .env');
        addLog('💡 O token deve começar com "eyJ" e ter 3 partes separadas por pontos');
      } else if (error.message.includes('malformed')) {
        addLog('💡 Sugestão: Recrie o token JWT no dashboard do Pinata');
        addLog('💡 Certifique-se de copiar o token completo sem espaços extras');
      }
      
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const generateMetadata = async () => {
    if (!analysisData || !ipfsHash) {
      alert('Análise de sentimentos necessária primeiro');
      return;
    }

    try {
      addLog('Gerando metadados NFT...');

      const nftMetadata = {
        name: `Sentiment NFT #${Date.now()}`,
        description: `NFT com análise de sentimentos automatizada via Chainlink Functions. ${analysisData.sentiment_analysis || 'Análise emocional da imagem.'}`,
        image: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        external_url: "https://nft-sentiment-analyzer.vercel.app",
        attributes: [
          {
            trait_type: "Sentiment Analysis",
            value: analysisData.sentiment_analysis?.substring(0, 50) || "Analyzed"
          },
          {
            trait_type: "Color Psychology", 
            value: analysisData.color_psychology?.substring(0, 50) || "Analyzed"
          },
          {
            trait_type: "Visual Language",
            value: analysisData.visual_language?.substring(0, 50) || "Analyzed"
          },
          {
            trait_type: "Symbol Relation",
            value: analysisData.symbol_relation?.substring(0, 50) || "Analyzed"
          },
          {
            trait_type: "Analysis Method",
            value: "Chainlink Functions + OpenAI"
          },
          {
            trait_type: "IPFS Hash",
            value: ipfsHash
          },
          ...(analysisData.attributes || [])
        ],
        properties: {
          sentiment_analysis: analysisData.sentiment_analysis,
          color_psychology: analysisData.color_psychology,
          visual_language: analysisData.visual_language,
          symbol_relation: analysisData.symbol_relation,
          keywords: analysisData.keywords || [],
          ipfs_hash: ipfsHash,
          analysis_timestamp: new Date().toISOString(),
          chainlink_functions: true
        }
      };

      const metadataStr = JSON.stringify(nftMetadata, null, 2);
      setMetadata(nftMetadata);
      setMetadataString(metadataStr);
      
      addLog('✅ Metadados NFT gerados com sucesso!');

      // Fazer upload automático para Pinata
      const metadataHash = await uploadMetadataToPinata(nftMetadata);
      
      // Chamar callback com metadados e hash IPFS dos metadados
      onMetadataGenerated(nftMetadata, metadataHash);
      
    } catch (error) {
      addLog(`❌ Erro ao gerar/enviar metadados: ${error.message}`);
    }
  };

  const copyMetadata = () => {
    navigator.clipboard.writeText(metadataString);
    addLog('📋 Metadados copiados para clipboard');
  };

  const downloadMetadata = () => {
    const blob = new Blob([metadataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nft-metadata-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('💾 Metadados baixados como arquivo JSON');
  };

  // Verificar se o token está configurado
  const hasValidToken = () => {
    try {
      const token = import.meta.env.VITE_PINATA_JWT;
      validateJWTToken(token);
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Gerador de Metadados NFT
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Alertas informativos */}
          {!hasValidToken() && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ⚠️ Token JWT do Pinata inválido ou não configurado. Verifique sua variável de ambiente VITE_PINATA_JWT.
              </AlertDescription>
            </Alert>
          )}

          {!analysisData && (
            <Alert>
              <AlertDescription>
                ⚠️ Análise de sentimentos necessária primeiro
              </AlertDescription>
            </Alert>
          )}

          {!ipfsHash && (
            <Alert>
              <AlertDescription>
                ⚠️ Upload da imagem para IPFS necessário primeiro
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center">
            <Button 
              onClick={generateMetadata}
              disabled={!analysisData || !ipfsHash || isUploading || !hasValidToken()}
              size="lg"
              className="w-full md:w-auto"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando para IPFS...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar e Enviar Metadados
                </>
              )}
            </Button>
          </div>

          {/* Mostrar hash IPFS dos metadados */}
          {metadataIpfsHash && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <AlertDescription className="space-y-2">
                <div>✅ Metadados enviados para Pinata IPFS!</div>
                <div className="font-mono text-sm break-all">
                  Hash: {metadataIpfsHash}
                </div>
                <div>
                  <a 
                    href={`https://gateway.pinata.cloud/ipfs/${metadataIpfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    🔗 Ver metadados no IPFS
                  </a>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {metadata && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={copyMetadata}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar
                </Button>
                <Button variant="outline" onClick={downloadMetadata}>
                  <Download className="mr-2 h-4 w-4" />
                  Download JSON
                </Button>
              </div>
              
              <Textarea
                value={metadataString}
                readOnly
                className="h-80 font-mono text-sm"
                placeholder="Metadados aparecerão aqui..."
              />
            </div>
          )}

          {/* Informações sobre requisitos */}
          <div className="text-xs text-muted-foreground border rounded p-3 bg-muted/50">
            <p><strong>Processo:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>Valida o token JWT do Pinata</li>
              <li>Gera metadados NFT baseado na análise</li>
              <li>Envia automaticamente para Pinata IPFS</li>
              <li>Retorna hash IPFS dos metadados para mint</li>
            </ol>
            
{false && (
  <>
    <p className="mt-3"><strong>Resolução de problemas:</strong></p>
    <ul className="list-disc list-inside space-y-1 mt-1">
      <li>Verifique se VITE_PINATA_JWT está no arquivo .env</li>
      <li>O token deve ter 3 segmentos separados por pontos</li>
      <li>Certifique-se de que não há espaços extras no token</li>
      <li>Recrie o token no dashboard do Pinata se necessário</li>
    </ul>
  </>
)}

          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetadataGenerator;