import React, { useState } from 'react';
import WordInput from './components/WordInput';
import Library from './components/Library';
import FlashCard from './components/FlashCard';
import QuizGame from './components/QuizGame';
import SpellingGame from './components/SpellingGame';
import MatchGame from './components/MatchGame';
import ContextGame from './components/ContextGame';
import ScrambleGame from './components/ScrambleGame';
import ResultScreen from './components/ResultScreen';
import GameHub from './components/GameHub';
import StoryGenerator from './components/StoryGenerator';
import { HomeSelection } from './components/HomeSelection';
import { ArticleInput } from './components/ArticleLearning/ArticleInput';
import { WordSelector } from './components/ArticleLearning/WordSelector';
import { StudyDashboard } from './components/ArticleLearning/StudyDashboard';
import { enrichVocabularyList } from './services/geminiService';
import { WordData, GameMode, GameStats, VocabularyState } from './types';
import { Gamepad2, BrainCircuit, Home } from 'lucide-react';

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.HOME);
  const [words, setWords] = useState<WordData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);

  // Article Learning State
  const [vocabState, setVocabState] = useState<VocabularyState>({
    article: '',
    selectedWords: [],
    wordData: []
  });

  // --- Home Navigation ---
  const handleSelectMode = (mode: 'custom' | 'article') => {
    if (mode === 'custom') {
      setGameMode(GameMode.SETUP);
    } else {
      setVocabState({ article: '', selectedWords: [], wordData: [] });
      setGameMode(GameMode.ARTICLE_SETUP);
    }
  };

  const handleGoHome = () => {
    setGameMode(GameMode.HOME);
  };

  // --- Custom Vocabulary Handlers ---
  const handleStartGame = async (inputWords: string[]) => {
    setIsLoading(true);
    try {
      const data = await enrichVocabularyList(inputWords);
      setWords(data);
      setGameMode(GameMode.FLASHCARD);
    } catch (error) {
      alert("Failed to generate content. Please try again or check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenLibrary = () => {
    setGameMode(GameMode.LIBRARY);
  };

  const handlePlayFromLibrary = (libraryWords: WordData[]) => {
    setWords(libraryWords);
    setGameMode(GameMode.FLASHCARD);
  };

  const handleFlashcardFinish = () => {
    setGameMode(GameMode.GAME_HUB);
  };

  const handleGameSelect = (mode: GameMode) => {
    setGameMode(mode);
  };

  const handleGameFinish = (stats: GameStats) => {
    setGameStats(stats);
    setGameMode(GameMode.RESULT);
  };

  const handleBackToMenu = () => {
    setGameMode(GameMode.GAME_HUB);
    setGameStats(null);
  };

  const handleNewList = () => {
    setWords([]);
    setGameMode(GameMode.HOME); // Go back home instead of setup
    setGameStats(null);
  };

  // --- Article Learning Handlers ---
  const handleArticleSubmit = (article: string) => {
    setVocabState(prev => ({ ...prev, article }));
    setGameMode(GameMode.ARTICLE_SELECTION);
  };

  const handleWordsSubmit = (selectedWords: string[]) => {
    setVocabState(prev => ({ ...prev, selectedWords }));
    setGameMode(GameMode.ARTICLE_STUDY);
  };

  const handleArticleBack = () => {
    setGameMode(GameMode.ARTICLE_SETUP);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-700 cursor-pointer" onClick={handleGoHome}>
            <Gamepad2 size={28} />
            <span className="font-extrabold text-xl tracking-tight">VocabQuest</span>
          </div>

          <div className="flex items-center gap-4">
            {gameMode !== GameMode.HOME && (
              <button onClick={handleGoHome} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors" title="Back to Home">
                <Home size={20} />
              </button>
            )}

            {/* Show Word Count only for Custom Game modes where words exist */}
            {words.length > 0 && !Object.values(GameMode).filter(m => m.toString().startsWith('ARTICLE')).includes(gameMode) && gameMode !== GameMode.HOME && gameMode !== GameMode.SETUP && (
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <BrainCircuit size={16} />
                <span>{words.length} Words</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl animate-fade-in-up">

          {/* Home Selection */}
          {gameMode === GameMode.HOME && (
            <HomeSelection onSelectMode={handleSelectMode} />
          )}

          {/* Custom Vocabulary Flows */}
          {gameMode === GameMode.SETUP && (
            <WordInput
              onStart={handleStartGame}
              onOpenLibrary={handleOpenLibrary}
              isLoading={isLoading}
            />
          )}

          {gameMode === GameMode.LIBRARY && (
            <Library
              onPlay={handlePlayFromLibrary}
              onBack={() => setGameMode(GameMode.SETUP)}
            />
          )}

          {gameMode === GameMode.FLASHCARD && words.length > 0 && (
            <FlashCard
              words={words}
              onFinish={handleFlashcardFinish}
              onBack={() => setGameMode(GameMode.LIBRARY)}
            />
          )}

          {gameMode === GameMode.GAME_HUB && words.length > 0 && (
            <GameHub
              onSelect={handleGameSelect}
              onBack={() => setGameMode(GameMode.FLASHCARD)}
              onExit={handleNewList}
              wordCount={words.length}
            />
          )}

          {gameMode === GameMode.QUIZ && words.length > 0 && (
            <QuizGame words={words} onFinish={handleGameFinish} onExit={() => setGameMode(GameMode.GAME_HUB)} />
          )}

          {gameMode === GameMode.SPELLING && words.length > 0 && (
            <SpellingGame words={words} onFinish={handleGameFinish} onExit={() => setGameMode(GameMode.GAME_HUB)} />
          )}

          {gameMode === GameMode.MATCH && words.length > 0 && (
            <MatchGame words={words} onFinish={handleGameFinish} onExit={() => setGameMode(GameMode.GAME_HUB)} />
          )}

          {gameMode === GameMode.CONTEXT && words.length > 0 && (
            <ContextGame words={words} onFinish={handleGameFinish} onExit={() => setGameMode(GameMode.GAME_HUB)} />
          )}

          {gameMode === GameMode.SCRAMBLE && words.length > 0 && (
            <ScrambleGame words={words} onFinish={handleGameFinish} onExit={() => setGameMode(GameMode.GAME_HUB)} />
          )}

          {gameMode === GameMode.RESULT && gameStats && (
            <ResultScreen
              stats={gameStats}
              onBackToMenu={handleBackToMenu}
              onNewList={handleNewList}
            />
          )}

          {gameMode === GameMode.ARTICLE_GENERATOR && words.length > 0 && (
            <StoryGenerator words={words} onExit={() => setGameMode(GameMode.GAME_HUB)} />
          )}

          {/* Article Learning Flows */}
          {gameMode === GameMode.ARTICLE_SETUP && (
            <ArticleInput
              initialValue={vocabState.article}
              onNext={handleArticleSubmit}
              onBack={handleGoHome}
            />
          )}

          {gameMode === GameMode.ARTICLE_SELECTION && (
            <WordSelector
              article={vocabState.article}
              onNext={handleWordsSubmit}
              onBack={handleArticleBack}
            />
          )}

          {gameMode === GameMode.ARTICLE_STUDY && (
            <StudyDashboard
              article={vocabState.article}
              selectedWords={vocabState.selectedWords}
              onRestart={handleGoHome}
            />
          )}

        </div>
      </main>

      <footer className="py-6 text-center text-gray-400 text-sm">
        <p>Powered by Gemini AI • Build your vocabulary efficiently</p>
      </footer>
    </div>
  );
};

export default App;