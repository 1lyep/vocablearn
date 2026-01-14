import React from 'react';
import { Gamepad2, GraduationCap } from 'lucide-react';

interface HomeSelectionProps {
    onSelectMode: (mode: 'custom' | 'article') => void;
}

export const HomeSelection: React.FC<HomeSelectionProps> = ({ onSelectMode }) => {
    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-fade-in-up">
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
                    Welcome to VocabQuest
                </h1>
                <p className="text-slate-500 text-lg md:text-xl">
                    Choose how you want to learn today
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 w-full px-4">
                {/* Card 1: Custom Vocabulary */}
                <div
                    onClick={() => onSelectMode('custom')}
                    className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200 border-2 border-slate-100 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-indigo-200 flex flex-col items-center text-center overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Gamepad2 size={40} />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-indigo-700 transition-colors">Custom Vocabulary</h2>
                    <p className="text-slate-500 leading-relaxed group-hover:text-slate-600">
                        Paste a list of words you want to master. We'll generate definitions, flashcards, and mini-games automatically.
                    </p>
                </div>

                {/* Card 2: Article-Based Learning */}
                <div
                    onClick={() => onSelectMode('article')}
                    className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200 border-2 border-slate-100 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-teal-200 flex flex-col items-center text-center overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        <GraduationCap size={40} />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-teal-700 transition-colors">Context Learning</h2>
                    <p className="text-slate-500 leading-relaxed group-hover:text-slate-600">
                        Read an article or story. Identify unknown words in context and generate a personalized study guide.
                    </p>
                </div>
            </div>
        </div>
    );
};
