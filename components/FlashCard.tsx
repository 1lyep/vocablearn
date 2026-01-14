import React, { useState, useEffect } from 'react';
import { WordData } from '../types';
import { Volume2, Gamepad2, ArrowRight, ArrowLeft, Library, Target } from 'lucide-react';

interface FlashCardProps {
  words: WordData[];
  onFinish: () => void;
  onBack: () => void;
}

const FlashCard: React.FC<FlashCardProps> = ({ words, onFinish, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentWord = words[currentIndex];

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const progress = ((currentIndex + 1) / words.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto">
      {/* Navigation Header */}
      <div className="w-full flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors text-sm font-semibold"
          title="Back to Library"
        >
          <Library size={18} />
          Library
        </button>

        <button
          onClick={onFinish}
          className="flex items-center gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors text-sm font-bold"
          title="Go to Game Hub"
        >
          <Target size={18} />
          Game Hub
        </button>
      </div>

      <div className="w-full flex justify-between items-center mb-6 text-gray-500 font-medium">
        <span>Word {currentIndex + 1} of {words.length}</span>
        <span>Review Mode</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
        <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      <div
        className="w-full h-80 card-flip cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full card-inner transition-transform duration-500 shadow-2xl rounded-2xl ${isFlipped ? 'flipped' : ''}`}>

          {/* Front */}
          <div className="absolute w-full h-full card-front bg-white rounded-2xl p-8 flex flex-col items-center justify-center border-b-4 border-indigo-100">
            <span className="text-gray-400 text-sm font-semibold tracking-wider mb-2">TAP TO FLIP</span>
            <h2 className="text-5xl font-bold text-gray-800 mb-4 text-center">{currentWord.word}</h2>
            <div className="flex items-center gap-2 text-indigo-500 bg-indigo-50 px-4 py-1 rounded-full">
              <span className="font-mono text-lg">{currentWord.phonetic}</span>
              <button onClick={speak} className="p-1 hover:bg-indigo-100 rounded-full transition-colors">
                <Volume2 size={20} />
              </button>
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full card-back bg-indigo-600 rounded-2xl p-8 flex flex-col items-center justify-center text-white border-b-4 border-indigo-800">
            <h3 className="text-2xl font-bold mb-6 text-center">{currentWord.definition}</h3>
            <div className="w-full border-t border-indigo-400 my-4"></div>
            <p className="text-indigo-100 text-lg text-center italic">"{currentWord.example}"</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between w-full mt-8">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
            ${currentIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'}`}
        >
          <ArrowLeft size={20} />
          Prev
        </button>

        {currentIndex === words.length - 1 ? (
          <button
            onClick={onFinish}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-600 transform hover:-translate-y-0.5 transition-all"
          >
            Play Games
            <Gamepad2 size={20} />
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all"
          >
            Next
            <ArrowRight size={20} />
          </button>
        )}
      </div>

      <p className="mt-6 text-gray-400 text-sm">Tap the card to reveal the definition</p>
    </div>
  );
};

export default FlashCard;