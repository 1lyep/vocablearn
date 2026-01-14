import React from 'react';
import { GameMode } from '../types';
import { BrainCircuit, Keyboard, Grid3X3, ArrowLeft, MessageSquareDashed, Puzzle, LogOut, Sparkles } from 'lucide-react';

interface GameHubProps {
  onSelect: (mode: GameMode) => void;
  onBack: () => void;
  onExit: () => void;
  wordCount: number;
}

const GameHub: React.FC<GameHubProps> = ({ onSelect, onBack, onExit, wordCount }) => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Challenge</h2>
        <p className="text-gray-500 text-lg">You've reviewed {wordCount} words. Pick a mode to master them!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {/* Quiz Mode */}
        <button
          onClick={() => onSelect(GameMode.QUIZ)}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-indigo-50 group flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
            <BrainCircuit size={32} className="text-indigo-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Quiz Challenge</h3>
          <p className="text-sm text-gray-500">Classic multiple choice. Identify the correct definition.</p>
        </button>

        {/* Spelling Mode */}
        <button
          onClick={() => onSelect(GameMode.SPELLING)}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-purple-50 group flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
            <Keyboard size={32} className="text-purple-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Spelling Bee</h3>
          <p className="text-sm text-gray-500">Type the word correctly based on audio & definition.</p>
        </button>

        {/* Match Mode */}
        <button
          onClick={() => onSelect(GameMode.MATCH)}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-emerald-50 group flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
            <Grid3X3 size={32} className="text-emerald-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Memory Match</h3>
          <p className="text-sm text-gray-500">Flip cards to match words with their meanings.</p>
        </button>

        {/* Context Mode */}
        <button
          onClick={() => onSelect(GameMode.CONTEXT)}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-blue-50 group flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
            <MessageSquareDashed size={32} className="text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Context Master</h3>
          <p className="text-sm text-gray-500">Fill in the blank within a real sentence.</p>
        </button>

        {/* Scramble Mode */}
        <button
          onClick={() => onSelect(GameMode.SCRAMBLE)}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-orange-50 group flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-600 transition-colors">
            <Puzzle size={32} className="text-orange-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Word Scramble</h3>
          <p className="text-sm text-gray-500">Unscramble the jumbled letters to find the word.</p>
        </button>

        {/* Story Generator Mode */}
        <button
          onClick={() => onSelect(GameMode.ARTICLE_GENERATOR)}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-pink-50 group flex flex-col items-center text-center md:col-span-2 lg:col-span-3 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100"
        >
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-pink-600 transition-colors shadow-inner">
            <Sparkles size={32} className="text-pink-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">AI Story Generator</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Generate fun, creative stories using your words. Explore different styles and contexts to master usage in key sentences!
          </p>
        </button>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Flashcards
        </button>

        <button
          onClick={onExit}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium px-6 py-3 rounded-xl hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
        >
          <LogOut size={20} />
          Exit to Menu
        </button>
      </div>
    </div>
  );
};

export default GameHub;