
import React from 'react';
import { DocumentIcon } from './icons/DocumentIcon';

interface AnalysisResultProps {
  result: string | null;
  isLoading: boolean;
  error: string | null;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400">Analizando documento... Esto puede tardar unos segundos.</p>
    </div>
);

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, isLoading, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return (
        <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      );
    }
    if (result) {
      return (
        <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none whitespace-pre-wrap">
            {result.split('\n').map((line, index) => {
                if (line.startsWith('# ')) return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>
                if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-bold mt-3 mb-1">{line.substring(3)}</h2>
                if (line.startsWith('* ')) return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>
                return <p key={index}>{line}</p>;
            })}
        </div>
      );
    }
    return (
      <div className="text-center text-gray-500">
        <DocumentIcon className="w-16 h-16 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-400">Esperando documento</h3>
        <p>Sube un documento y haz clic en "Analizar" para ver la interpretación de la IA aquí.</p>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg min-h-[200px] flex items-center justify-center">
      {renderContent()}
    </div>
  );
};
