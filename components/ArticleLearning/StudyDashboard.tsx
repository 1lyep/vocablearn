import React, { useState, useEffect, useMemo } from 'react';
import { WordDefinition } from '../../types';
import { Button } from './Button';
import { generateVocabularyData } from '../../services/geminiService';

// Utility to shuffle array
function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

interface StudyDashboardProps {
    article: string;
    selectedWords: string[];
    onRestart: () => void;
}

type ViewMode = 'FLASHCARD' | 'MATCHING' | 'QUIZ';

export const StudyDashboard: React.FC<StudyDashboardProps> = ({ article, selectedWords, onRestart }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<WordDefinition[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [mode, setMode] = useState<ViewMode>('FLASHCARD');
    const [showArticleContext, setShowArticleContext] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const result = await generateVocabularyData(article, selectedWords);
                if (isMounted) {
                    setData(result);
                    setLoading(false);
                }
            } catch (e) {
                console.error(e);
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [article, selectedWords]);

    // Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <p className="text-xl font-medium text-slate-600 animate-pulse">AI is crafting your study guide...</p>
                <p className="text-sm text-slate-400 mt-2">Generating definitions, translations, and context notes.</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center p-10 bg-white rounded-3xl shadow-xl">
                <h3 className="text-xl font-bold text-slate-800 mb-4">No data generated</h3>
                <p className="mb-6 text-slate-500">Something went wrong or no words were valid. Please try again.</p>
                <Button onClick={onRestart}>Start Over</Button>
            </div>
        )
    }

    // --- FLASHCARD LOGIC ---
    const currentWord = data[currentIndex];

    const getContextSentence = (word: string) => {
        const sentences = article.match(/[^.!?]+[.!?]+/g) || [article];
        const sentence = sentences.find(s => s.toLowerCase().includes(word.toLowerCase()));
        if (!sentence) return "Context unavailable.";

        const parts = sentence.split(new RegExp(`(${word})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === word.toLowerCase()
                        ? <span key={i} className="font-bold text-indigo-600 bg-indigo-50 px-1 rounded">{part}</span>
                        : <span key={i}>{part}</span>
                )}
            </span>
        );
    };

    const handleNextCard = () => {
        setIsFlipped(false);
        setShowArticleContext(false);
        setCurrentIndex((prev) => (prev + 1) % data.length);
    };

    const handlePrevCard = () => {
        setIsFlipped(false);
        setShowArticleContext(false);
        setCurrentIndex((prev) => (prev - 1 + data.length) % data.length);
    };

    // --- MATCHING GAME LOGIC ---
    const MatchingGame = () => {
        const BOARD_SIZE = 12; // 4x3 Grid
        interface Tile {
            id: string;
            content: string;
            pairId: string;
            type: 'WORD' | 'TRANS';
        }

        const [board, setBoard] = useState<(Tile | null)[]>(Array(BOARD_SIZE).fill(null));
        const [reserve, setReserve] = useState<WordDefinition[]>([]);
        const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
        const [errorSlots, setErrorSlots] = useState<number[]>([]);
        const [matchedSlots, setMatchedSlots] = useState<number[]>([]);
        const [isGameInitialized, setIsGameInitialized] = useState(false);
        const [matchCount, setMatchCount] = useState(0);

        useEffect(() => {
            startNewGame();
        }, []);

        // Refill Logic: Infinite Mode
        useEffect(() => {
            if (!isGameInitialized) return;

            const emptyIndices = board.map((t, i) => t === null ? i : -1).filter(i => i !== -1);

            // Wait for at least 4 empty slots (2 pairs) before refilling
            if (emptyIndices.length >= 4) {

                const slotsToFillCount = emptyIndices.length - (emptyIndices.length % 2);
                const pairsNeeded = slotsToFillCount / 2;

                // We work with a local copy of the reserve to potentially replenish it
                let currentReserve = [...reserve];

                // If reserve is running low, replenish it from the main data source
                if (currentReserve.length < pairsNeeded) {
                    // Identify words currently active on board to avoid duplicates
                    const activeWordIds = new Set(board.map(t => t?.pairId).filter(Boolean));

                    // Candidates are words NOT currently on the board
                    let candidates = data.filter(w => !activeWordIds.has(w.word));

                    // If all words are on board (or data is small), we might have 0 candidates.
                    // In that case, we can't refill yet.
                    if (candidates.length > 0) {
                        // Add candidates to reserve (shuffled)
                        currentReserve = [...currentReserve, ...shuffleArray(candidates)];
                    } else if (activeWordIds.size === 0 && data.length > 0) {
                        // Failsafe: if board is empty and candidates empty, reload everything
                        currentReserve = [...shuffleArray(data)];
                    }
                }

                // Attempt to take pairs from the (possibly replenished) reserve
                const pairsToTake = Math.min(pairsNeeded, currentReserve.length);

                if (pairsToTake > 0) {
                    const pairs = currentReserve.slice(0, pairsToTake);
                    const nextReserve = currentReserve.slice(pairsToTake);

                    // Create new tiles
                    const newTiles: Tile[] = [];
                    pairs.forEach(p => {
                        // Use timestamp in ID to ensure uniqueness as words reappear
                        const ts = Date.now() + Math.random();
                        newTiles.push({ id: `w-${p.word}-${ts}`, content: p.word, pairId: p.word, type: 'WORD' });
                        newTiles.push({ id: `t-${p.word}-${ts}`, content: p.translation, pairId: p.word, type: 'TRANS' });
                    });

                    const shuffledTiles = shuffleArray(newTiles);
                    const shuffledEmptyIndices = shuffleArray([...emptyIndices]);

                    setBoard(prevBoard => {
                        const nextBoard = [...prevBoard];
                        // Fill the random empty slots with the shuffled tiles
                        for (let i = 0; i < shuffledTiles.length; i++) {
                            const targetIndex = shuffledEmptyIndices[i];
                            if (targetIndex !== undefined) {
                                nextBoard[targetIndex] = shuffledTiles[i];
                            }
                        }
                        return nextBoard;
                    });
                    setReserve(nextReserve);
                }
            }
        }, [board, reserve, isGameInitialized, data]);

        const startNewGame = () => {
            const shuffledData = shuffleArray([...data]);

            // Initial Fill
            const maxPairs = Math.floor(BOARD_SIZE / 2);
            const initialPairs = shuffledData.slice(0, maxPairs);
            // Reserve gets the rest
            const remainingPairs = shuffledData.slice(maxPairs);

            let initialTiles: Tile[] = [];
            initialPairs.forEach(p => {
                const ts = Date.now() + Math.random();
                initialTiles.push({ id: `w-${p.word}-${ts}`, content: p.word, pairId: p.word, type: 'WORD' });
                initialTiles.push({ id: `t-${p.word}-${ts}`, content: p.translation, pairId: p.word, type: 'TRANS' });
            });

            const fullBoardArray: (Tile | null)[] = [...initialTiles];
            while (fullBoardArray.length < BOARD_SIZE) {
                fullBoardArray.push(null);
            }

            setBoard(shuffleArray(fullBoardArray));
            setReserve(remainingPairs);
            setSelectedSlot(null);
            setErrorSlots([]);
            setMatchedSlots([]);
            setMatchCount(0);
            setIsGameInitialized(true);
        };

        const handleSlotClick = (index: number) => {
            const tile = board[index];
            if (!tile) return; // Empty slot
            if (matchedSlots.includes(index)) return; // Currently matching
            if (errorSlots.length > 0) return; // Error locked

            if (selectedSlot === null) {
                setSelectedSlot(index);
            } else if (selectedSlot === index) {
                setSelectedSlot(null); // Deselect
            } else {
                // Check Match
                const prevIndex = selectedSlot;
                const prevTile = board[prevIndex];

                if (prevTile && prevTile.pairId === tile.pairId) {
                    // SUCCESS
                    handleMatch(prevIndex, index);
                } else {
                    // FAILURE
                    setErrorSlots([prevIndex, index]);
                    setTimeout(() => {
                        setErrorSlots([]);
                        setSelectedSlot(null);
                    }, 800);
                }
            }
        };

        const handleMatch = (idx1: number, idx2: number) => {
            setMatchedSlots([idx1, idx2]);
            setSelectedSlot(null);
            setMatchCount(prev => prev + 1);

            // Animation delay before removal. Refill happens via useEffect automatically.
            setTimeout(() => {
                setBoard(prevBoard => {
                    const newBoard = [...prevBoard];
                    newBoard[idx1] = null;
                    newBoard[idx2] = null;
                    return newBoard;
                });
                setMatchedSlots([]);
            }, 400);
        };

        return (
            <div className="flex flex-col h-full max-w-4xl mx-auto">
                <div className="flex justify-between items-end mb-6 flex-shrink-0 px-2">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800">Match Words</h3>
                        <p className="text-slate-500 text-sm">Clear pairs to get new words</p>
                    </div>
                    <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-indigo-200">
                        <span className="text-xs font-bold uppercase opacity-80 block">Matches</span>
                        <span className="text-2xl font-bold leading-none">{matchCount}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 overflow-y-auto p-2">
                    {board.map((tile, index) => {
                        // Empty Slot
                        if (!tile) {
                            return (
                                <div key={`empty-${index}`} className="h-24 md:h-32 rounded-xl border-2 border-slate-100 bg-slate-50/50 transition-all duration-300"></div>
                            );
                        }

                        const isSelected = selectedSlot === index;
                        const isError = errorSlots.includes(index);
                        const isMatched = matchedSlots.includes(index);

                        return (
                            <div
                                key={tile.id}
                                onClick={() => handleSlotClick(index)}
                                className={`
                                h-24 md:h-32 rounded-xl border-2 cursor-pointer flex items-center justify-center p-2 md:p-4 text-center transition-all duration-300 shadow-sm relative overflow-hidden animate-fade-in-up
                                ${isSelected
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-indigo-100 transform scale-105 z-10'
                                        : 'border-white bg-white hover:border-indigo-200 text-slate-700 hover:shadow-md'}
                                ${isError ? 'border-rose-500 bg-rose-50 text-rose-700 animate-pulse' : ''}
                                ${isMatched ? 'border-green-400 bg-green-50 text-green-700 scale-90 opacity-0' : 'opacity-100'}
                            `}
                            >
                                <span className={`font-semibold ${tile.type === 'WORD' ? 'text-sm md:text-lg' : 'text-xs md:text-base'}`}>
                                    {tile.content}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-4 text-xs text-slate-400">
                    Infinite Mode &bull; Words will reappear for reinforcement
                </div>
            </div>
        );
    };

    // --- QUIZ LOGIC ---
    const QuizView = () => {
        const [draggedWord, setDraggedWord] = useState<string | null>(null);
        const [droppedWords, setDroppedWords] = useState<{ [key: number]: string }>({});
        const [checked, setChecked] = useState(false);

        // Shuffle word bank ONCE when component mounts
        const wordBank = useMemo(() => {
            const words = data.map(d => d.word);
            return shuffleArray(words);
        }, []);

        const renderClozeText = () => {
            const tokens = article.split(/([a-zA-Z0-9]+)/).filter(Boolean);
            return tokens.map((token, i) => {
                const cleanToken = token.toLowerCase();
                const isTarget = data.some(d => d.word.toLowerCase() === cleanToken);

                if (!isTarget) return <span key={i} className="whitespace-pre-wrap">{token}</span>;

                const isDropped = droppedWords[i];
                const isCorrect = isDropped && isDropped.toLowerCase() === cleanToken;

                let content: React.ReactNode = isDropped || <span className="text-xs text-slate-400">drop here</span>;

                if (checked) {
                    if (isCorrect) {
                        content = isDropped;
                    } else {
                        content = (
                            <span className="flex items-center gap-2">
                                {isDropped && <span className="line-through opacity-60 text-xs text-rose-800">{isDropped}</span>}
                                <span className="text-emerald-700 font-bold">{token}</span>
                            </span>
                        );
                    }
                }

                return (
                    <span
                        key={i}
                        onDragOver={(e) => {
                            if (!checked) e.preventDefault();
                        }}
                        onDrop={(e) => {
                            if (checked) return;
                            e.preventDefault();
                            if (draggedWord) {
                                setDroppedWords(prev => ({ ...prev, [i]: draggedWord }));
                            }
                        }}
                        className={`
                        inline-block min-w-[80px] border-b-2 mx-1 text-center transition-colors px-2 py-1 rounded
                        ${checked && isCorrect ? 'border-green-500 text-green-700 font-bold bg-green-50' : ''}
                        ${checked && !isCorrect ? 'border-rose-300 text-rose-700 bg-rose-50' : ''}
                        ${!checked && isDropped ? 'border-indigo-500 text-indigo-700 font-medium bg-indigo-50 cursor-pointer' : ''}
                        ${!checked && !isDropped ? 'border-slate-300 text-slate-400 select-none bg-slate-100 cursor-pointer' : ''}
                    `}
                    >
                        {content}
                    </span>
                )
            });
        };

        const checkAnswers = () => {
            setChecked(true);
        };

        return (
            <div className="flex flex-col h-full">
                <div className="bg-indigo-50 p-4 rounded-xl mb-4 border border-indigo-100 flex-shrink-0">
                    <h3 className="font-semibold text-indigo-900 mb-2">Word Bank (Drag to fill blanks)</h3>
                    <div className="flex flex-wrap gap-2">
                        {wordBank.map((w, idx) => (
                            <div
                                key={`${w}-${idx}`}
                                draggable={!checked}
                                onDragStart={() => !checked && setDraggedWord(w)}
                                className={`
                                bg-white px-3 py-1.5 rounded-lg shadow-sm border border-indigo-200 text-indigo-700 transition-shadow select-none
                                ${checked ? 'opacity-50 cursor-not-allowed' : 'cursor-move hover:shadow-md active:cursor-grabbing'}
                            `}
                            >
                                {w}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto bg-white p-6 rounded-2xl shadow-inner border border-slate-200 leading-loose text-lg text-slate-700">
                    {renderClozeText()}
                </div>

                <div className="mt-4 flex justify-between flex-shrink-0">
                    <Button variant="ghost" onClick={() => setMode('MATCHING')}>&larr; Back to Matching</Button>
                    <div className="flex gap-2">
                        {!checked && <Button onClick={checkAnswers} disabled={Object.keys(droppedWords).length === 0}>Check Answers</Button>}
                        {checked && <Button onClick={onRestart} variant="secondary">Finish & Restart</Button>}
                    </div>
                </div>
            </div>
        );
    };

    // --- FLASHCARD VIEW (Render Variable) ---
    const renderFlashcardView = () => (
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-6 h-full">
            {/* Left: Card Area */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                        Word {currentIndex + 1} of {data.length}
                    </div>
                </div>

                <div className="relative flex-grow perspective-1000 group min-h-[300px]">
                    <div
                        className={`
                relative w-full h-full duration-500 preserve-3d cursor-pointer transition-transform
                ${isFlipped ? 'rotate-y-180' : ''}
            `}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        {/* Front */}
                        <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 flex flex-col items-center justify-center p-8 text-center hover:shadow-2xl hover:border-indigo-100 transition-all">
                            <h2 className="text-5xl font-bold text-slate-800 mb-4">{currentWord.word}</h2>
                            <p className="text-2xl text-slate-400 font-serif italic mb-8">/{currentWord.phonetic}/</p>
                            <p className="text-sm text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-full">Tap to flip</p>
                        </div>

                        {/* Back */}
                        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-200 flex flex-col p-8 overflow-y-auto custom-scrollbar">
                            <div className="flex-grow flex flex-col justify-center">
                                <h3 className="text-3xl font-bold mb-2">{currentWord.word}</h3>
                                <p className="text-indigo-200 text-lg mb-6">/{currentWord.phonetic}/</p>

                                <div className="mb-6">
                                    <span className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Translation</span>
                                    <p className="text-2xl font-medium mt-1">{currentWord.translation}</p>
                                </div>

                                <div className="mb-6">
                                    <span className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Definition</span>
                                    <p className="text-lg mt-1 leading-relaxed">{currentWord.definition}</p>
                                </div>

                                <div className="mb-4 bg-indigo-700/50 p-4 rounded-xl border border-indigo-500/30">
                                    <span className="text-indigo-300 text-xs font-bold uppercase tracking-widest block mb-2">Example</span>
                                    <p className="text-indigo-50 italic">"{currentWord.example}"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-6 flex-shrink-0">
                    <Button variant="outline" onClick={handlePrevCard}>&larr; Prev</Button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowArticleContext(!showArticleContext)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showArticleContext ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            {showArticleContext ? 'Hide Context' : 'Show Context'}
                        </button>
                    </div>

                    <Button variant="outline" onClick={handleNextCard}>Next &rarr;</Button>
                </div>
            </div>

            {/* Right: Context Panel */}
            {showArticleContext && (
                <div className="w-full md:w-1/3 bg-white p-6 rounded-3xl shadow-lg border border-slate-100 overflow-y-auto animate-fade-in-right h-64 md:h-auto flex-shrink-0 md:flex-shrink">
                    <h4 className="font-bold text-slate-800 mb-4 border-b pb-2">Article Context</h4>
                    <div className="text-slate-600 leading-relaxed text-sm">
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-slate-800 mb-4">
                            <span className="text-xs font-bold text-yellow-600 uppercase block mb-1">AI Context Note</span>
                            {currentWord.contextNote || "Context note not available."}
                        </div>
                        <div className="mb-4">
                            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Found in sentence:</span>
                            <p className="italic text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
                                "{getContextSentence(currentWord.word)}"
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full h-[calc(100vh-120px)] flex flex-col">
            {/* Mode Navigation with Exit Button */}
            <div className="relative mb-6 flex-shrink-0 flex justify-center items-center">
                {/* Exit Button - Absolute Left */}
                <button
                    onClick={onRestart}
                    className="absolute left-0 text-slate-400 hover:text-rose-600 transition-colors p-2 hover:bg-slate-100 rounded-lg flex items-center gap-2 group z-10"
                    title="Exit Session"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    <span className="hidden sm:inline font-medium text-sm">Exit</span>
                </button>

                <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex z-0">
                    <button
                        onClick={() => setMode('FLASHCARD')}
                        className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${mode === 'FLASHCARD' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        1. Study Cards
                    </button>
                    <button
                        onClick={() => setMode('MATCHING')}
                        className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${mode === 'MATCHING' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        2. Match Pairs
                    </button>
                    <button
                        onClick={() => setMode('QUIZ')}
                        className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${mode === 'QUIZ' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        3. Fill Blanks
                    </button>
                </div>
            </div>

            <div className="flex-grow min-h-0">
                {mode === 'FLASHCARD' && renderFlashcardView()}
                {mode === 'MATCHING' && <MatchingGame />}
                {mode === 'QUIZ' && <QuizView />}
            </div>
        </div>
    );
};
