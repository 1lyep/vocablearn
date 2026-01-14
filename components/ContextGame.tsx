import React, { useState, useMemo } from 'react';
import { WordData, GameStats, GameMode } from '../types';
import { CheckCircle, XCircle, ArrowRight, Quote, LogOut } from 'lucide-react';

interface ContextGameProps {
  words: WordData[];
  onFinish: (stats: GameStats) => void;
  onExit: () => void;
}

const ContextGame: React.FC<ContextGameProps> = ({ words, onFinish, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [stats, setStats] = useState<GameStats>({
    mode: GameMode.CONTEXT,
    score: 0,
    total: 0,
    history: []
  });

  // Shuffle for order
  const shuffledWords = useMemo(() => {
    return [...words].sort(() => Math.random() - 0.5);
  }, [words]);

  const currentTarget = shuffledWords[currentIndex];

  // Prepare question sentence
  const questionSentence = useMemo(() => {
    if (!currentTarget) return "";
    // Replace the word (case insensitive) with blanks
    const regex = new RegExp(currentTarget.word, 'gi');
    return currentTarget.example.replace(regex, '_______');
  }, [currentTarget]);

  // Generate options (1 correct, 3 wrong)
  const options = useMemo(() => {
    if (!currentTarget) return [];

    const correct = currentTarget.word;
    const others = words
      .filter(w => w.word !== currentTarget.word)
      .map(w => w.word);

    // Shuffle others and pick 3
    const distractors = others.sort(() => 0.5 - Math.random()).slice(0, 3);

    // Combine and shuffle
    return [...distractors, correct].sort(() => 0.5 - Math.random());
  }, [currentTarget, words]);

  const handleSelect = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentTarget.word;

    setStats(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      total: prev.total + 1,
      history: [...(prev.history || []), { word: currentTarget.word, isCorrect }]
    }));
  };

  const handleNext = () => {
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      onFinish(stats);
    }
  };

  if (!currentTarget) return <div>Loading...</div>;

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
        <div className="flex items-center gap-2 text-blue-600 font-bold">
          <span>Score: {stats.score}</span>
        </div>
        <div className="text-gray-400 font-medium">
          Question {currentIndex + 1} / {words.length}
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex) / words.length) * 100}%` }}
        ></div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 border-b-4 border-blue-100 mb-8 relative">
        <div className="absolute top-0 left-0 -mt-5 ml-6 bg-blue-100 p-2 rounded-full">
          <Quote size={24} className="text-blue-600" />
        </div>
        <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed text-center">
          "{questionSentence}"
        </p>
        <p className="mt-4 text-center text-gray-400 text-sm">
          Hint: {currentTarget.definition}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isCorrectAnswer = option === currentTarget.word;

          let buttonStyle = "bg-white border-2 border-gray-100 text-gray-700 hover:border-blue-300 hover:bg-blue-50";
          let icon = null;

          if (isAnswered) {
            if (isCorrectAnswer) {
              buttonStyle = "bg-green-100 border-2 border-green-500 text-green-800";
              icon = <CheckCircle size={20} className="text-green-600" />;
            } else if (isSelected && !isCorrectAnswer) {
              buttonStyle = "bg-red-100 border-2 border-red-500 text-red-800";
              icon = <XCircle size={20} className="text-red-600" />;
            } else {
              buttonStyle = "bg-gray-50 border-2 border-gray-100 text-gray-400 opacity-50";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(option)}
              disabled={isAnswered}
              className={`p-4 rounded-xl font-bold text-lg transition-all flex justify-between items-center ${buttonStyle} shadow-sm`}
            >
              <span>{option}</span>
              {icon}
            </button>
          );
        })}
      </div>

      <div className="mt-8 h-12">
        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 animate-bounce"
          >
            {currentIndex === words.length - 1 ? "Finish Context Mode" : "Next Question"}
            <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ContextGame;