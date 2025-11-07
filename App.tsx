import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ThinkingModeToggle } from './components/ThinkingModeToggle';
import { AnalysisResult } from './components/AnalysisResult';
import { Chatbot } from './components/Chatbot';
import { analyzeDocument, getChatResponse } from './services/geminiService';
import type { ChatMessage } from './types';
import { MessageAuthor } from './types';

function App() {
  // State for Document Analysis
  const [file, setFile] = useState<File | null>(null);
  const [isThinkingMode, setIsThinkingMode] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // State for Chatbot
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { author: MessageAuthor.BOT, text: '¡Hola! Soy tu asistente de IA. Sube un documento para analizar o hazme una pregunta.' },
  ]);
  const [isChatting, setIsChatting] = useState<boolean>(false);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setAnalysisError(null);
    } else {
      setFile(null);
      setAnalysisError("Por favor, sube un archivo de imagen (PNG, JPG) o un PDF.");
    }
  }, []);

  const handleAnalyze = async () => {
    if (!file) {
      setAnalysisError('Por favor, selecciona un archivo primero.');
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    try {
      const result = await analyzeDocument(file, isThinkingMode);
      setAnalysisResult(result);
      // Reset chat with new context
      setChatHistory([
        { author: MessageAuthor.BOT, text: '¡Análisis completo! Ahora puedes hacerme preguntas específicas sobre el documento que subiste.' },
      ]);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Un error desconocido ocurrió.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = { author: MessageAuthor.USER, text: message };
    setChatHistory(prev => [...prev, userMessage]);
    setIsChatting(true);
    
    try {
        // Pass the analysis result as context to the chat
        const botResponseText = await getChatResponse(message, analysisResult);
        const botMessage: ChatMessage = { author: MessageAuthor.BOT, text: botResponseText };
        setChatHistory(prev => [...prev, botMessage]);
    } catch (error) {
        const errorMessage: ChatMessage = { author: MessageAuthor.BOT, text: "Lo siento, tuve un problema al procesar tu mensaje." };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsChatting(false);
    }
  };

  const isLoading = isAnalyzing || isChatting;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Analysis */}
          <div className="flex flex-col gap-6">
            <div className="bg-gray-800/50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">1. Sube tu Documento</h2>
              <FileUpload onFileSelect={handleFileSelect} disabled={isAnalyzing} />
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-white mb-4">2. Elige el Modo de Análisis</h2>
                <ThinkingModeToggle 
                    isThinkingMode={isThinkingMode}
                    setIsThinkingMode={setIsThinkingMode}
                    disabled={isAnalyzing}
                />
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={!file || isAnalyzing}
              className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all text-lg flex items-center justify-center"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analizando...
                </>
              ) : 'Analizar Documento'}
            </button>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">3. Resultado del Análisis</h2>
              <AnalysisResult result={analysisResult} isLoading={isAnalyzing} error={analysisError} />
            </div>
          </div>

          {/* Right Column: Chatbot */}
          <div className="h-[90vh] sticky top-24">
             <Chatbot history={chatHistory} onSendMessage={handleSendMessage} isLoading={isChatting} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
