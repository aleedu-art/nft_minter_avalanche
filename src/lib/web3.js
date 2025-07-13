import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { avalancheFuji } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'NFT Sentiment Analyzer',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c4f79cc821944d9680842e34466bfbd',
  chains: [avalancheFuji],
  ssr: false,
});

// Contract addresses

// CHAINLINK_FUNCTIONS: FunctionsConsumerAnaliseSent1212.sol
// NFT_CONTRACT: NÃO É USADO PARA NADA O QUE VALÉ É O CONTRATO MyNFT_FUJI.sol = 0x8d0c0E8515D236644F65A9152a3445987cE817b6

//20250628
// CHAINLINK_FUNCTIONS: "0x0d0b74eFb597cd8cD90590C05C48e8ee8858C23B",  
// NFT_CONTRACT: "0xDb9Ac4b53e1A325D41Ed527895357614a3b2D03f",


//20250704
// CHAINLINK_FUNCTIONS: "0xF46f269E68801aA1e46cBC5703c72F3cb2c6c885",  

//20250706
// CHAINLINK_FUNCTIONS: "0xA47a0B46043444E3e61AfABF4dEd0A795abfB1f5",  

//20250709
// CHAINLINK_FUNCTIONS: "0x136CD9E2a379F0408936321225B7B8593F1216F9",  

//20250713
// CHAINLINK_FUNCTIONS: "0x9267e314f62D0b506F2FD2DbA5E820D12641a33D",  


export const CONTRACTS = {
  CHAINLINK_FUNCTIONS: "0x7288B39E50bfe8F2E92f1212aBd21805818BC8F5",  
  NFT_CONTRACT: "0xca66891E70E863e8A779b25143F28A977101C297",
  SUBSCRIPTION_ID: 15580
};

// Gas configuration for Avalanche Fuji
export const GAS_CONFIG = {
  gasLimit: 3000000n,
  maxFeePerGas: 50000000000n,
  maxPriorityFeePerGas: 5000000000n,
};

// NFT Contract ABI
export const NFT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "string", "name": "uri", "type": "string"},
      {"internalType": "string", "name": "ipfsImageHash", "type": "string"},
      {"internalType": "string", "name": "sentimentAnalysis", "type": "string"},
      {"internalType": "string", "name": "colorPsychology", "type": "string"},
      {"internalType": "string", "name": "symbolRelation", "type": "string"},
      {"internalType": "string", "name": "visualLanguage", "type": "string"},
      {"internalType": "string[]", "name": "keywords", "type": "string[]"}
    ],
    "name": "mintWithSentiment",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// CORRIGIDO: Usar a ABI correta do contrato
export const CHAINLINK_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "router", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "requestId", "type": "bytes32"}
    ],
    "name": "UnexpectedRequestID",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "requestId", "type": "bytes32"},
      {"indexed": false, "internalType": "string", "name": "sentiment", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "colors", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "visualStyle", "type": "string"}
    ],
    "name": "AnalysisDecoded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"}
    ],
    "name": "OwnershipTransferRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"}
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "requestId", "type": "bytes32"},
      {"indexed": false, "internalType": "bytes", "name": "response", "type": "bytes"},
      {"indexed": false, "internalType": "bytes", "name": "err", "type": "bytes"}
    ],
    "name": "Response",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "acceptOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "imageUrl", "type": "string"},
      {"internalType": "uint64", "name": "subscriptionId", "type": "uint64"},
      {"internalType": "uint32", "name": "gasLimit", "type": "uint32"},
      {"internalType": "bytes32", "name": "donID", "type": "bytes32"}
    ],
    "name": "analyzeImage",
    "outputs": [
      {"internalType": "bytes32", "name": "requestId", "type": "bytes32"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "analysisHistory",
    "outputs": [
      {"internalType": "string", "name": "sentiment", "type": "string"},
      {"internalType": "string", "name": "colors", "type": "string"},
      {"internalType": "string", "name": "visualStyle", "type": "string"},
      {"internalType": "string", "name": "attributes", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "requestId", "type": "bytes32"}
    ],
    "name": "getAnalysisByRequestId",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "sentiment", "type": "string"},
          {"internalType": "string", "name": "colors", "type": "string"},
          {"internalType": "string", "name": "visualStyle", "type": "string"},
          {"internalType": "string[]", "name": "keywords", "type": "string[]"},
          {"internalType": "string", "name": "attributes", "type": "string"}
        ],
        "internalType": "struct FunctionsConsumerAnaliseSent1211.ImageAnalysis",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "index", "type": "uint256"}
    ],
    "name": "getAnalysisFromHistory",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "sentiment", "type": "string"},
          {"internalType": "string", "name": "colors", "type": "string"},
          {"internalType": "string", "name": "visualStyle", "type": "string"},
          {"internalType": "string[]", "name": "keywords", "type": "string[]"},
          {"internalType": "string", "name": "attributes", "type": "string"}
        ],
        "internalType": "struct FunctionsConsumerAnaliseSent1211.ImageAnalysis",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAnalysisHistoryLength",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLastAnalysis",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "sentiment", "type": "string"},
          {"internalType": "string", "name": "colors", "type": "string"},
          {"internalType": "string", "name": "visualStyle", "type": "string"},
          {"internalType": "string[]", "name": "keywords", "type": "string[]"},
          {"internalType": "string", "name": "attributes", "type": "string"}
        ],
        "internalType": "struct FunctionsConsumerAnaliseSent1211.ImageAnalysis",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "jsonResponse", "type": "string"}
    ],
    "name": "manualDecode",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "sentiment", "type": "string"},
          {"internalType": "string", "name": "colors", "type": "string"},
          {"internalType": "string", "name": "visualStyle", "type": "string"},
          {"internalType": "string[]", "name": "keywords", "type": "string[]"},
          {"internalType": "string", "name": "attributes", "type": "string"}
        ],
        "internalType": "struct FunctionsConsumerAnaliseSent1211.ImageAnalysis",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "", "type": "bytes32"}
    ],
    "name": "requestAnalyses",
    "outputs": [
      {"internalType": "string", "name": "sentiment", "type": "string"},
      {"internalType": "string", "name": "colors", "type": "string"},
      {"internalType": "string", "name": "visualStyle", "type": "string"},
      {"internalType": "string", "name": "attributes", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "s_lastAnalysis",
    "outputs": [
      {"internalType": "string", "name": "sentiment", "type": "string"},
      {"internalType": "string", "name": "colors", "type": "string"},
      {"internalType": "string", "name": "visualStyle", "type": "string"},
      {"internalType": "string", "name": "attributes", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "s_lastError",
    "outputs": [
      {"internalType": "bytes", "name": "", "type": "bytes"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "s_lastRequestId",
    "outputs": [
      {"internalType": "bytes32", "name": "", "type": "bytes32"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "s_lastResponse",
    "outputs": [
      {"internalType": "bytes", "name": "", "type": "bytes"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes", "name": "encryptedSecretsUrls", "type": "bytes"},
      {"internalType": "uint8", "name": "donHostedSecretsSlotID", "type": "uint8"},
      {"internalType": "uint64", "name": "donHostedSecretsVersion", "type": "uint64"},
      {"internalType": "string[]", "name": "args", "type": "string[]"},
      {"internalType": "bytes[]", "name": "bytesArgs", "type": "bytes[]"},
      {"internalType": "uint64", "name": "subscriptionId", "type": "uint64"},
      {"internalType": "uint32", "name": "gasLimit", "type": "uint32"},
      {"internalType": "bytes32", "name": "donID", "type": "bytes32"}
    ],
    "name": "sendRequest",
    "outputs": [
      {"internalType": "bytes32", "name": "requestId", "type": "bytes32"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sendRequestDefault",
    "outputs": [
      {"internalType": "bytes32", "name": "requestId", "type": "bytes32"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "source",
    "outputs": [
      {"internalType": "string", "name": "", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"}
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes", "name": "response", "type": "bytes"},
      {"internalType": "bytes32", "name": "requestId", "type": "bytes32"}
    ],
    "name": "tryDecodeResponse",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// IPFS Upload endpoints
export const IPFS_ENDPOINTS = [
  'https://nft-fuji-minter.onrender.com/upload',
  'https://nft-fuji-minter.onrender.com/api/upload'
];