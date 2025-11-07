
import React, { useState, useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setFileName(file.name);
        onFileSelect(file);
      } else {
        setFileName("Tipo de archivo no soportado. Use JPG, PNG o PDF.");
      }
    }
  };
  
  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
       if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setFileName(file.name);
        onFileSelect(file);
      } else {
        setFileName("Tipo de archivo no soportado. Use JPG, PNG o PDF.");
      }
      event.dataTransfer.clearData();
    }
  }, [onFileSelect]);


  return (
    <div className="w-full">
      <label 
        htmlFor="file-upload" 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg
        ${disabled ? 'bg-gray-800 cursor-not-allowed' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 cursor-pointer'} transition-colors`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-10 h-10 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
          </svg>
          <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click para subir</span> o arrastra y suelta</p>
          <p className="text-xs text-gray-500">PNG, JPG o PDF</p>
        </div>
        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".png,.jpg,.jpeg,.pdf" disabled={disabled} />
      </label>
      {fileName && (
        <p className="mt-2 text-sm text-center text-gray-400">
          Archivo seleccionado: <span className="font-medium text-gray-300">{fileName}</span>
        </p>
      )}
    </div>
  );
};
