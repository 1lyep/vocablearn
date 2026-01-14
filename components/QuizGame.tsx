import React, { useState, useMemo } from 'react';
import { WordData, GameStats, GameMode } from '../types';
import { CheckCircle, XCircle, ArrowRight, Award, LogOut } from 'lucide-react';

interface QuizGameProps {
  words: WordData[];
  onFinish: (stats: GameStats) => void;
  onExit: () => void;
}

const QuizGame: React.FC<QuizGameProps> = ({ words, onFinish, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [stats, setStats] = useState<GameStats>({
    mode: GameMode.QUIZ,
    score: 0,
    total: 0,
    history: []
  });

  // Shuffle words for quiz order
  const shuffledWords = useMemo(() => {
    return [...words].sort(() => Math.random() - 0.5);
  }, [words]);

  const currentTarget = shuffledWords[currentIndex];

  // Generate options (1 correct, 3 wrong)
  const options = useMemo(() => {
    if (!currentTarget) return [];

    const correct = currentTarget.definition;
    const others = words
      .filter(w => w.word !== currentTarget.word)
      .map(w => w.definition);

    // Shuffle others and pick 3
    const distractors = others.sort(() => 0.5 - Math.random()).slice(0, 3);

    // Combine and shuffle
    return [...distractors, correct].sort(() => 0.5 - Math.random());
  }, [currentTarget, words]);

  const handleSelect = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentTarget.definition;

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
        <div className="flex items-center gap-2 text-indigo-600 font-bold">
          <Award size={24} />
          <span>Score: {stats.score}</span>
        </div>
        <div className="text-gray-400 font-medium">
          Question {currentIndex + 1} / {words.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex) / words.length) * 100}%` }}
        ></div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 border-b-4 border-indigo-100 mb-6">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-2">{currentTarget.word}</h2>
        <p className="text-center text-indigo-400 font-mono text-lg">{currentTarget.phonetic}</p>
      </div>

      <div className="space-y-3">
        {options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === currentTarget.definition;

          let buttonStyle = "bg-white border-2 border-gray-100 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50";
          let icon = null;

          if (isAnswered) {
            if (isCorrect) {
              buttonStyle = "bg-green-100 border-2 border-green-500 text-green-800";
              icon = <CheckCircle size={20} className="text-green-600" />;
            } else if (isSelected && !isCorrect) {
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
              className={`w-full p-4 rounded-xl text-left font-medium text-lg transition-all flex justify-between items-center ${buttonStyle} shadow-sm`}
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
            className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 animate-bounce"
          >
            {currentIndex === words.length - 1 ? "Finish Quiz" : "Next Question"}
            <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizGame;