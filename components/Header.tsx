
import React from 'react';
import { DocumentIcon } from './icons/DocumentIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-center">
        <DocumentIcon className="w-8 h-8 text-blue-400 mr-3" />
        <h1 className="text-2xl font-bold text-white tracking-wider">Interprete AI</h1>
      </div>
    </header>
  );
};
