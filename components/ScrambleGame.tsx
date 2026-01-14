import React, { useState, useMemo, useEffect } from 'react';
import { WordData, GameStats, GameMode } from '../types';
import { ArrowRight, Shuffle, RotateCcw, LogOut } from 'lucide-react';

interface ScrambleGameProps {
  words: WordData[];
  onFinish: (stats: GameStats) => void;
  onExit: () => void;
}

interface Tile {
  id: string;
  char: string;
}

const ScrambleGame: React.FC<ScrambleGameProps> = ({ words, onFinish, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [availableTiles, setAvailableTiles] = useState<Tile[]>([]);
  const [answerTiles, setAnswerTiles] = useState<Tile[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasMistake, setHasMistake] = useState(false); // Track if they messed up at least once per word

  const [stats, setStats] = useState<GameStats>({
    mode: GameMode.SCRAMBLE,
    score: 0,
    total: 0,
    history: []
  });

  const currentTarget = words[currentIndex];

  useEffect(() => {
    // Initialize tiles for current word
    const chars = currentTarget.word.split('');
    const newTiles = chars.map((char, i) => ({ id: `${char}-${i}`, char }));

    // Shuffle tiles
    setAvailableTiles(newTiles.sort(() => Math.random() - 0.5));
    setAnswerTiles([]);
    setIsCorrect(false);
    setHasMistake(false);
  }, [currentTarget]);

  useEffect(() => {
    // Check answer
    const currentAnswerString = answerTiles.map(t => t.char).join('');
    if (currentAnswerString.toLowerCase() === currentTarget.word.toLowerCase()) {
      setIsCorrect(true);
      // Only increment score if they didn't make a mistake (pure solve) 
      // OR we can just count it as correct if they solve it eventually. 
      // Let's count it correct if they solve it, but maybe track mistakes internally?
      // For simplicity, let's just count 'correct' as solved.
    }
  }, [answerTiles, currentTarget]);

  const handleTileClick = (tile: Tile, from: 'pool' | 'answer') => {
    if (isCorrect) return;

    if (from === 'pool') {
      setAvailableTiles(prev => prev.filter(t => t.id !== tile.id));
      setAnswerTiles(prev => [...prev, tile]);
    } else {
      setAnswerTiles(prev => prev.filter(t => t.id !== tile.id));
      setAvailableTiles(prev => [...prev, tile]);
    }
  };

  const handleNext = () => {
    // Update stats before moving on
    // If they solved it, good.
    setStats(prev => ({
      ...prev,
      score: prev.score + 1, // In scramble, usually you always solve it eventually
      total: prev.total + 1,
      history: [...(prev.history || []), { word: currentTarget.word, isCorrect: true }]
    }));

    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinish(stats);
    }
  };

  const handleReset = () => {
    const chars = currentTarget.word.split('');
    const newTiles = chars.map((char, i) => ({ id: `${char}-${i}`, char }));
    setAvailableTiles(newTiles.sort(() => Math.random() - 0.5));
    setAnswerTiles([]);
    setHasMistake(true); // Resetting counts as a "mistake" or help
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onExit}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Exit to Hub"
        >
          <LogOut size={24} />
        </button>
        <div className="flex items-center gap-2 text-orange-600 font-bold">
          <span>Solved: {currentIndex} / {words.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Reshuffle">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex) / words.length) * 100}%` }}
        ></div>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-gray-500 uppercase tracking-widest text-sm font-bold mb-4">Construct the Word</h2>
        <p className="text-2xl font-medium text-gray-800 mb-2">{currentTarget.definition}</p>
        <p className="text-orange-400 font-mono">{currentTarget.phonetic}</p>
      </div>

      {/* Answer Area */}
      <div className="min-h-[80px] bg-white rounded-2xl shadow-inner border-2 border-gray-100 p-4 mb-8 flex flex-wrap gap-2 justify-center items-center transition-colors duration-300 relative">
        {answerTiles.length === 0 && (
          <span className="text-gray-300 text-sm absolute">Tap letters below</span>
        )}
        {answerTiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(tile, 'answer')}
            className={`w-12 h-12 rounded-xl text-xl font-bold shadow-sm transform transition-all active:scale-95
              ${isCorrect ? 'bg-green-500 text-white' : 'bg-orange-100 text-orange-800 border border-orange-200'}`}
          >
            {tile.char}
          </button>
        ))}
        {isCorrect && (
          <div className="absolute right-0 top-0 -mt-10 mr-0 animate-bounce">
            <span className="text-4xl">🎉</span>
          </div>
        )}
      </div>

      {/* Pool Area */}
      <div className="flex flex-wrap gap-3 justify-center mb-10 min-h-[60px]">
        {availableTiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(tile, 'pool')}
            className="w-12 h-12 bg-white rounded-xl text-xl font-bold shadow-md text-gray-700 border border-gray-200 hover:bg-gray-50 hover:-translate-y-1 transition-all"
          >
            {tile.char}
          </button>
        ))}
      </div>

      <div className="h-12">
        {isCorrect && (
          <button
            onClick={handleNext}
            className="w-full bg-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all flex items-center justify-center gap-2 animate-fade-in-up"
          >
            {currentIndex === words.length - 1 ? "Finish Scramble" : "Next Word"}
            <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ScrambleGame;