import { useState } from 'react';
import { IPFS_ENDPOINTS } from '../lib/web3';

export const useIPFSUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const uploadToIPFS = async (file) => {
    setIsUploading(true);
    setUploadError(null);

    for (const endpoint of IPFS_ENDPOINTS) {
      try {
        console.log(`Tentando endpoint: ${endpoint}`);
        
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Upload IPFS bem-sucedido: ${data.IpfsHash}`);
        
        setIsUploading(false);
        return data.IpfsHash;
      } catch (error) {
        console.log(`Endpoint ${endpoint} falhou: ${error.message}`);
      }
    }
    
    setIsUploading(false);
    const error = new Error('Todos os endpoints de upload falharam');
    setUploadError(error);
    throw error;
  };

  return {
    uploadToIPFS,
    isUploading,
    uploadError
  };
};

