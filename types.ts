export interface WordData {
  word: string;
  definition: string;
  example: string;
  phonetic: string;
}

export interface WordGroup {
  id: string;
  name: string;
  words: WordData[];
  createdAt: number;
}

export enum GameMode {
  HOME = 'HOME',
  SETUP = 'SETUP',
  LIBRARY = 'LIBRARY',
  LOADING = 'LOADING',
  FLASHCARD = 'FLASHCARD',
  GAME_HUB = 'GAME_HUB',
  QUIZ = 'QUIZ',
  SPELLING = 'SPELLING',
  MATCH = 'MATCH',
  CONTEXT = 'CONTEXT',
  SCRAMBLE = 'SCRAMBLE',
  RESULT = 'RESULT',

  // Article Learning Modes
  ARTICLE_SETUP = 'ARTICLE_SETUP',
  ARTICLE_SELECTION = 'ARTICLE_SELECTION',
  ARTICLE_STUDY = 'ARTICLE_STUDY',

  // Generator
  ARTICLE_GENERATOR = 'ARTICLE_GENERATOR'
}

export interface GameStats {
  mode: GameMode;
  score: number; // For Quiz/Spelling (correct count)
  total: number; // For Quiz/Spelling (total questions) or Match (total pairs)
  history?: {
    word: string;
    isCorrect: boolean;
  }[];
  // For Match
  timeSeconds?: number;
  moves?: number;
}

export interface SavedStory {
  id: string;
  title: string;
  content: string; // The English story
  translation: string; // The Chinese translation
  style: string;
  createdAt: number;
  relatedWords: string[]; // List of words used/targeted
}

export enum AppStep {
  INPUT = 'INPUT',
  SELECTION = 'SELECTION',
  LOADING = 'LOADING',
  STUDY = 'STUDY',
  QUIZ = 'QUIZ'
}

export interface WordDefinition {
  word: string;
  phonetic: string;
  translation: string;
  definition: string;
  example: string;
  contextNote?: string; // How it relates to the article context
}

export interface VocabularyState {
  article: string;
  selectedWords: string[];
  wordData: WordDefinition[];
}