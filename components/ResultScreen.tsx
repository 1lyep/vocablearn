import React from 'react';
import { GameStats, GameMode } from '../types';
import { RefreshCw, Trophy, Home, Grid } from 'lucide-react';

interface ResultScreenProps {
  stats: GameStats;
  onBackToMenu: () => void;
  onNewList: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ stats, onBackToMenu, onNewList }) => {
  const isMatchMode = stats.mode === GameMode.MATCH;
  const percentage = stats.total > 0 ? Math.round((stats.score / stats.total) * 100) : 0;

  let message = "Keep practicing!";
  let color = "text-yellow-500";

  if (isMatchMode) {
    message = "Board Cleared!";
    color = "text-emerald-500";
  } else {
    if (percentage === 100) {
      message = "Perfect Score! You're a Genius!";
      color = "text-yellow-500";
    } else if (percentage >= 80) {
      message = "Great job! Almost there!";
      color = "text-emerald-500";
    } else if (percentage >= 50) {
      message = "Good effort, keep going!";
      color = "text-blue-500";
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl p-10 text-center">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full mb-6">
        <Trophy className={`w-12 h-12 ${color}`} />
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-2">{message}</h2>

      {isMatchMode ? (
        <div className="my-6 space-y-2">
          <div className="text-4xl font-black text-indigo-600">{stats.timeSeconds}s</div>
          <p className="text-gray-500">Total Time</p>
          <div className="text-xl font-bold text-gray-800 mt-2">{stats.moves} Moves</div>
        </div>
      ) : (
        <>
          <div className="text-6xl font-black text-indigo-600 mb-6">{percentage}%</div>
          <p className="text-gray-500 mb-8 text-lg">
            You got <span className="font-bold text-gray-800">{stats.score}</span> out of <span className="font-bold text-gray-800">{stats.total}</span> correct.
          </p>
        </>
      )}

      {!isMatchMode && stats.history && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left max-h-60 overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Review</h3>
          <div className="space-y-3">
            {stats.history.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
                <span className="font-semibold text-gray-700">{item.word}</span>
                <span className={`text-sm font-bold ${item.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                  {item.isCorrect ? 'Correct' : 'Missed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={onBackToMenu}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
        >
          <Grid size={20} />
          Choose Another Game
        </button>
        <button
          onClick={onNewList}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-gray-500 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
        >
          <Home size={20} />
          Start New List
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;