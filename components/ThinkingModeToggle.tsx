
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface ThinkingModeToggleProps {
  isThinkingMode: boolean;
  setIsThinkingMode: (value: boolean) => void;
  disabled: boolean;
}

export const ThinkingModeToggle: React.FC<ThinkingModeToggleProps> = ({ isThinkingMode, setIsThinkingMode, disabled }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
      <div className="flex items-center">
        <SparklesIcon className={`w-6 h-6 mr-3 ${isThinkingMode ? 'text-yellow-400' : 'text-gray-500'}`} />
        <div>
            <span className="font-semibold text-white">Thinking Mode</span>
            <p className="text-sm text-gray-400">Análisis profundo para casos complejos (usa Gemini 2.5 Pro).</p>
        </div>
      </div>
      <label htmlFor="thinking-mode-toggle" className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
        <input
          type="checkbox"
          id="thinking-mode-toggle"
          className="sr-only peer"
          checked={isThinkingMode}
          onChange={(e) => setIsThinkingMode(e.target.checked)}
          disabled={disabled}
        />
        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
};
