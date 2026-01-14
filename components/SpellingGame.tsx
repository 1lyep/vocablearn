import React, { useState, useRef, useEffect } from 'react';
import { WordData, GameStats, GameMode } from '../types';
import { Check, X, ArrowRight, Volume2, LogOut } from 'lucide-react';

interface SpellingGameProps {
  words: WordData[];
  onFinish: (stats: GameStats) => void;
  onExit: () => void;
}

const SpellingGame: React.FC<SpellingGameProps> = ({ words, onFinish, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stats, setStats] = useState<GameStats>({
    mode: GameMode.SPELLING,
    score: 0,
    total: 0,
    history: []
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const currentWord = words[currentIndex];

  useEffect(() => {
    if (inputRef.current && !isChecked) {
      inputRef.current.focus();
    }
  }, [currentIndex, isChecked]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isChecked) {
      handleNext();
      return;
    }

    if (!input.trim()) return;

    const correct = input.trim().toLowerCase() === currentWord.word.toLowerCase();
    setIsCorrect(correct);
    setIsChecked(true);

    setStats(prev => ({
      ...prev,
      score: correct ? prev.score + 1 : prev.score,
      total: prev.total + 1,
      history: [...(prev.history || []), { word: currentWord.word, isCorrect: correct }]
    }));
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setInput('');
      setIsChecked(false);
      setIsCorrect(false);
    } else {
      onFinish(stats);
    }
  };

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6 text-gray-500 font-medium">
        <button
          onClick={onExit}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Exit to Hub"
        >
          <LogOut size={24} />
        </button>
        <span>Question {currentIndex + 1} of {words.length}</span>
        <span className="text-purple-600 font-bold">Score: {stats.score}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex) / words.length) * 100}%` }}
        ></div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
        <div className="mb-6 text-center">
          <h3 className="text-gray-500 uppercase tracking-wide text-sm font-bold mb-2">Definition</h3>
          <p className="text-2xl font-medium text-gray-800">{currentWord.definition}</p>
        </div>

        <div className="flex justify-center items-center gap-3 mb-8 bg-gray-50 py-3 rounded-lg">
          <span className="font-mono text-gray-500">{currentWord.phonetic}</span>
          <button onClick={speak} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 text-indigo-600">
            <Volume2 size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isChecked}
            placeholder="Type the word..."
            className={`w-full text-center text-3xl font-bold p-4 border-b-4 bg-transparent outline-none transition-colors
              ${isChecked
                ? (isCorrect ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600')
                : 'border-gray-200 focus:border-indigo-500 text-gray-800'}`}
          />

          {isChecked && !isCorrect && (
            <div className="mt-4 text-center animate-fade-in-up">
              <p className="text-gray-400 text-sm mb-1">Correct answer:</p>
              <p className="text-xl font-bold text-green-600">{currentWord.word}</p>
            </div>
          )}
        </form>
      </div>

      <button
        onClick={() => handleSubmit()}
        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
          ${isChecked
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
            : 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-400'}`}
      >
        {isChecked ? (
          <>Next <ArrowRight /></>
        ) : (
          <>Check Answer</>
        )}
      </button>
    </div>
  );
};

export default SpellingGame;