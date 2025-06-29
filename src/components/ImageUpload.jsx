import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const ImageUpload = ({ onFileSelect, selectedFile, isUploading }) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = useCallback((file) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card 
        className={`border-2 border-dashed transition-all duration-300 cursor-pointer ${
          dragOver 
            ? 'border-green-500 bg-green-50 dark:bg-green-950' 
            : 'border-blue-500 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('imageInput').click()}
      >
        <CardContent className="p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Arraste uma imagem aqui ou clique para selecionar
          </h3>
          <p className="text-muted-foreground mb-4">
            Formatos suportados: JPG, PNG, GIF (máx. 10MB)
          </p>
          <Button variant="outline" disabled={isUploading}>
            <ImageIcon className="mr-2 h-4 w-4" />
            Selecionar Imagem
          </Button>
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      {preview && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="text-center">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-w-full max-h-80 rounded-lg shadow-lg mx-auto"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUpload;

