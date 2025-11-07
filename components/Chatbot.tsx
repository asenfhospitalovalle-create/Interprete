import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageAuthor } from '../types';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';

interface ChatbotProps {
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatMessageContent: React.FC<{ text: string }> = ({ text }) => {
  // Regex to find markdown links: [Title](url)
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const parts = text.split(linkRegex);

  return (
    <div className="text-sm whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (index % 3 === 1) { // This is the title of the link
          const url = parts[index + 1];
          return (
            <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">
              {part}
            </a>
          );
        }
        if (index % 3 === 2) { // This is the URL, which we've already used
          return null;
        }

        // Regex for bold text: **text**
        const boldRegex = /\*\*(.*?)\*\*/g;
        const boldParts = part.split(boldRegex);

        return boldParts.map((boldPart, boldIndex) => {
          if (boldIndex % 2 === 1) {
            return <strong key={`${index}-${boldIndex}`}>{boldPart}</strong>;
          }
          return boldPart; // Regular text
        });
      }).filter(Boolean)}
    </div>
  );
};


export const Chatbot: React.FC<ChatbotProps> = ({ history, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history, isLoading]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white text-center">Chat de Asistencia</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {history.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.author === MessageAuthor.USER ? 'justify-end' : 'justify-start'}`}>
              {msg.author === MessageAuthor.BOT && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"><BotIcon className="w-5 h-5 text-white" /></div>}
              <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${msg.author === MessageAuthor.USER ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                <ChatMessageContent text={msg.text} />
              </div>
              {msg.author === MessageAuthor.USER && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"><UserIcon className="w-5 h-5 text-white" /></div>}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"><BotIcon className="w-5 h-5 text-white" /></div>
               <div className="max-w-xs md:max-w-md px-4 py-2 rounded-lg bg-gray-700 text-gray-200 rounded-bl-none">
                 <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                 </div>
               </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Haz una pregunta..."
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            disabled={isLoading}
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors" disabled={isLoading}>
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};