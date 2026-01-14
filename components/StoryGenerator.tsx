import React, { useState, useEffect } from 'react';
import { WordData, SavedStory } from '../types';
import { generateStory } from '../services/geminiService';
import { saveStory, getStories, deleteStory } from '../services/storageService';
import { Sparkles, Save, BookOpen, Clock, Trash2, Globe, FileText, Loader2, ArrowLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface StoryGeneratorProps {
    words: WordData[];
    onExit: () => void;
}

const STYLES = [
    "Fun & Humorous (有趣幽默)",
    "Imaginative / Brain-hole (脑洞大开)",
    "Sci-Fi (科幻)",
    "Mystery (悬疑)",
    "Romance (浪漫)",
    "Daily Life (日常生活)",
    "Fairy Tale (童话)"
];

const StoryGenerator: React.FC<StoryGeneratorProps> = ({ words, onExit }) => {
    // Saved Stories State
    const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
    const [selectedStory, setSelectedStory] = useState<SavedStory | null>(null);

    // Generator State
    const [style, setStyle] = useState(STYLES[0]);
    const [isGenerating, setIsGenerating] = useState(false);

    // View Settings
    const [showTranslation, setShowTranslation] = useState(false);
    const [showHighlights, setShowHighlights] = useState(true);

    // Current Story Display (either newly generated or loaded)
    const [currentContent, setCurrentContent] = useState<{
        id?: string;
        title: string;
        content: string;
        translation: string;
        createdAt?: number;
    } | null>(null);

    useEffect(() => {
        loadSavedStories();
    }, []);

    const loadSavedStories = () => {
        setSavedStories(getStories());
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const wordList = words.map(w => w.word);
            const result = await generateStory(wordList, style);

            const newStoryState = {
                title: result.title,
                content: result.content,
                translation: result.translation,
            };

            setCurrentContent(newStoryState);
            setSelectedStory(null); // Clear selection as we have a new temp story
        } catch (error) {
            alert("Failed to generate story. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        if (!currentContent) return;

        // Check if already saved (by id check) to update, or create new
        const storyToSave: SavedStory = {
            id: currentContent.id || crypto.randomUUID(),
            title: currentContent.title,
            content: currentContent.content,
            translation: currentContent.translation,
            style: style,
            createdAt: currentContent.createdAt || Date.now(),
            relatedWords: words.map(w => w.word)
        };

        saveStory(storyToSave);
        setCurrentContent(storyToSave); // Update current content with ID
        loadSavedStories();
        setSelectedStory(storyToSave); // Mark as selected
    };

    const handleSelectStory = (story: SavedStory) => {
        setSelectedStory(story);
        setCurrentContent(story);
        // Reset view options if desired? Keep them for consistency.
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Delete this story?")) {
            deleteStory(id);
            loadSavedStories();
            if (selectedStory?.id === id) {
                setSelectedStory(null);
                setCurrentContent(null);
            }
        }
    };

    // Helper to highlight words
    const renderContent = () => {
        if (!currentContent) return null;

        if (!showHighlights) {
            return <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">{currentContent.content}</p>;
        }

        // Simple highlighting logic
        const wordSet = new Set(words.map(w => w.word.toLowerCase()));

        // Split by word boundaries but keep delimiters
        const parts = currentContent.content.split(/(\b[\w']+\b)/g);

        return (
            <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
                {parts.map((part, i) => {
                    if (wordSet.has(part.toLowerCase())) {
                        return <span key={i} className="bg-indigo-100 text-indigo-700 px-1 rounded font-semibold">{part}</span>;
                    }
                    return part;
                })}
            </p>
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6">

            {/* Left Sidebar: Controls & List */}
            <div className="w-full md:w-80 flex flex-col gap-6 h-full">

                {/* Generator Controls */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold text-lg">
                        <Sparkles size={24} />
                        <h3>Generator</h3>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Style</label>
                        <select
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Generate Story</>}
                    </button>
                </div>

                {/* Saved List */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <span className="font-bold text-gray-600 flex items-center gap-2">
                            <BookOpen size={18} /> Saved Stories
                        </span>
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{savedStories.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {savedStories.length === 0 ? (
                            <div className="text-center p-6 text-gray-400 text-sm">No saved stories yet.</div>
                        ) : (
                            savedStories.map(story => (
                                <div
                                    key={story.id}
                                    onClick={() => handleSelectStory(story)}
                                    className={`p-3 rounded-xl cursor-pointer transition-colors group relative
                    ${selectedStory?.id === story.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50 border border-transparent'}`}
                                >
                                    <h4 className={`font-bold text-sm mb-1 pr-6 truncate ${selectedStory?.id === story.id ? 'text-indigo-700' : 'text-gray-800'}`}>
                                        {story.title}
                                    </h4>
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Clock size={10} />
                                        {new Date(story.createdAt).toLocaleDateString()}
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, story.id)}
                                        className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right Content: Reader */}
            <div className="flex-1 bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col overflow-hidden h-full">
                {currentContent ? (
                    <>
                        {/* Reader Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{currentContent.title}</h2>
                                <div className="flex gap-2 text-sm text-gray-500 mt-1">
                                    {currentContent.createdAt && <span>{new Date(currentContent.createdAt).toLocaleDateString()}</span>}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {!currentContent.id ? (
                                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
                                        <Save size={18} /> Save
                                    </button>
                                ) : (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                        <Save size={14} /> Saved
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* View Toggles */}
                        <div className="px-6 py-3 border-b border-gray-100 flex gap-4">
                            <button
                                onClick={() => setShowHighlights(!showHighlights)}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${showHighlights ? 'text-indigo-600' : 'text-gray-400'}`}
                            >
                                {showHighlights ? <Eye size={18} /> : <EyeOff size={18} />}
                                Highlights
                            </button>
                            <button
                                onClick={() => setShowTranslation(!showTranslation)}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${showTranslation ? 'text-indigo-600' : 'text-gray-400'}`}
                            >
                                <Globe size={18} />
                                Translation
                            </button>
                        </div>

                        {/* Content Display */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="max-w-3xl mx-auto space-y-8">
                                <div className="prose prose-lg text-gray-700">
                                    {renderContent()}
                                </div>

                                {showTranslation && (
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-8 animate-fade-in-up">
                                        <h4 className="text-sm uppercase tracking-wide text-slate-400 font-bold mb-4 flex items-center gap-2">
                                            <Globe size={16} /> Chinese Translation
                                        </h4>
                                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{currentContent.translation}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <FileText size={48} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-600 mb-2">No Story Selected</h3>
                        <p className="max-w-md">Generate a new story using your words, or select a saved story from the list to start reading.</p>
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <button onClick={onExit} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium">
                        <ArrowLeft size={18} /> Back to Hub
                    </button>
                    {currentContent && (
                        <button onClick={handleGenerate} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors font-medium text-sm">
                            <RefreshCw size={16} /> Regenerate
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoryGenerator;
