import React, { useState } from 'react';
import { BookOpen, Sparkles, AlertCircle, Library } from 'lucide-react';

interface WordInputProps {
  onStart: (words: string[]) => void;
  onOpenLibrary: () => void;
  isLoading: boolean;
}

const WordInput: React.FC<WordInputProps> = ({ onStart, onOpenLibrary, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    // Split by comma or newline
    const words = inputText
      .split(/[\n,]/)
      .map(w => w.trim())
      .filter(w => w.length > 0);

    if (words.length < 1) {
      setError("Please enter at least one word.");
      return;
    }
    if (words.length > 20) {
      setError("Please try fewer than 20 words at a time for the best experience.");
      return;
    }

    setError(null);
    onStart(words);
  };

  const loadPreset = () => {
    setInputText("epiphany, serendipity, resilience, aesthetic, melancholy, euphoria");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Build Your Vocabulary</h1>
        <p className="text-gray-500">Enter words below, and our AI will generate definitions, phonetics, and quizzes for you.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="words" className="block text-sm font-medium text-gray-700 mb-2">
            Quick Start (English Words)
          </label>
          <textarea
            id="words"
            className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-lg"
            placeholder="e.g., apple, banana, cherry (one per line or comma separated)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            onClick={loadPreset}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            Preset
          </button>
          <button
            onClick={handleStart}
            disabled={isLoading}
            className={`flex-[2] px-6 py-3 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200
              ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300 transform hover:-translate-y-0.5'}`}
          >
            {isLoading ? 'Generating...' : 'Start Learning'}
          </button>
        </div>
        
        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button 
            onClick={onOpenLibrary}
            className="w-full px-6 py-4 bg-white border-2 border-indigo-100 text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
        >
            <Library size={20} />
            Open My Library
        </button>
      </div>
    </div>
  );
};

export default WordInput;