import React, { useState, useEffect, useMemo } from 'react';
import { WordData, GameStats, GameMode } from '../types';
import { Timer, Check, LogOut } from 'lucide-react';

interface MatchGameProps {
  words: WordData[];
  onFinish: (stats: GameStats) => void;
  onExit: () => void;
}

interface Card {
  id: string;
  content: string;
  type: 'word' | 'def';
  matched: boolean;
  wordRef: string; // The word this card belongs to, for matching logic
}

const MatchGame: React.FC<MatchGameProps> = ({ words, onFinish, onExit }) => {
  // Limit to 8 pairs (16 cards) to fit screen
  const gameWords = useMemo(() => words.slice(0, 8), [words]);

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // Generate deck
    const deck: Card[] = [];
    gameWords.forEach((w, idx) => {
      deck.push({ id: `w-${idx}`, content: w.word, type: 'word', matched: false, wordRef: w.word });
      deck.push({ id: `d-${idx}`, content: w.definition, type: 'def', matched: false, wordRef: w.word });
    });
    // Shuffle
    setCards(deck.sort(() => Math.random() - 0.5));

    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [gameWords, startTime]);

  useEffect(() => {
    if (matchedCount === gameWords.length && gameWords.length > 0) {
      // Game Over
      setTimeout(() => {
        onFinish({
          mode: GameMode.MATCH,
          score: 100,
          total: gameWords.length,
          timeSeconds: elapsed,
          moves: moves
        });
      }, 1000);
    }
  }, [matchedCount, gameWords.length, onFinish, elapsed, moves]);

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].matched || flippedIndices.includes(index)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsLocked(true);

      const idx1 = newFlipped[0];
      const idx2 = newFlipped[1];

      if (cards[idx1].wordRef === cards[idx2].wordRef) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            (i === idx1 || i === idx2) ? { ...c, matched: true } : c
          ));
          setFlippedIndices([]);
          setMatchedCount(c => c + 1);
          setIsLocked(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onExit}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Exit to Hub"
        >
          <LogOut size={24} />
        </button>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-gray-600 font-medium">
          <Timer size={18} />
          <span>{Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</span>
        </div>
        <div className="text-gray-600 font-medium">
          Moves: <span className="text-indigo-600 font-bold">{moves}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx) || card.matched;
          const isWord = card.type === 'word';

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              className={`aspect-square rounded-xl flex items-center justify-center p-2 text-center text-sm sm:text-base font-bold transition-all duration-300 transform perspective-1000
                ${isFlipped
                  ? (card.matched
                    ? 'bg-green-100 text-green-700 border-2 border-green-200 scale-95'
                    : (isWord ? 'bg-white text-indigo-700 border-2 border-indigo-200 rotate-y-180' : 'bg-white text-purple-700 border-2 border-purple-200 rotate-y-180'))
                  : 'bg-indigo-600 text-transparent hover:bg-indigo-500 shadow-md'
                }`}
            >
              <div className={isFlipped ? 'block' : 'hidden'}>
                {card.content}
              </div>
              {card.matched && <div className="absolute top-1 right-1"><Check size={12} /></div>}
            </button>
          );
        })}
      </div>
      <p className="text-center text-gray-400 mt-6 text-sm">Find all matches as fast as you can!</p>
    </div>
  );
};

export default MatchGame;