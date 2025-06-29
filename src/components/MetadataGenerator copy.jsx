import { useState } from 'react';
import { FileText, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const MetadataGenerator = ({ analysisData, ipfsHash, onMetadataGenerated, addLog }) => {
  const [metadata, setMetadata] = useState(null);
  const [metadataString, setMetadataString] = useState('');

  const generateMetadata = () => {
    if (!analysisData || !ipfsHash) {
      alert('Análise de sentimentos necessária primeiro');
      return;
    }

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
    
    addLog('Metadados NFT gerados com sucesso!');
    onMetadataGenerated(nftMetadata);
  };

  const copyMetadata = () => {
    navigator.clipboard.writeText(metadataString);
    addLog('Metadados copiados para clipboard');
  };

  const downloadMetadata = () => {
    const blob = new Blob([metadataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nft-metadata-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('Metadados baixados como arquivo JSON');
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
          <div className="text-center">
            <Button 
              onClick={generateMetadata}
              disabled={!analysisData || !ipfsHash}
              size="lg"
              className="w-full md:w-auto"
            >
              <FileText className="mr-2 h-4 w-4" />
              Gerar Metadados NFT
            </Button>
          </div>

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
        </div>
      </CardContent>
    </Card>
  );
};

export default MetadataGenerator;

