import React, { useState } from 'react';
import { Button } from './Button';

interface ArticleInputProps {
    initialValue: string;
    onNext: (article: string) => void;
    onBack: () => void;
}

export const ArticleInput: React.FC<ArticleInputProps> = ({ initialValue, onNext, onBack }) => {
    const [text, setText] = useState(initialValue);
    const [error, setError] = useState('');

    const handleNext = () => {
        if (text.trim().length < 20) {
            setError("Article is too short. Please enter at least a sentence or two.");
            return;
        }
        onNext(text);
    };

    const loadSample = () => {
        const sample = `Space exploration has always fascinated humanity. From the early days of stargazing to the modern era of reusable rockets, our desire to understand the cosmos drives technological innovation. 
    
However, the journey is fraught with challenges. Astronauts face psychological isolation, radiation exposure, and the physiological effects of microgravity. Despite these hurdles, agencies like NASA and private companies continue to push the boundaries, aiming for Mars and beyond. The resilience of the human spirit is evident in every launch.`;
        setText(sample);
        setError('');
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
            <div className="text-center mb-8 relative">
                <Button variant="ghost" onClick={onBack} className="absolute left-0 top-1">
                    &larr; Home
                </Button>
                <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight pt-2">
                    What do you want to read?
                </h1>
                <p className="text-slate-500 text-lg">
                    Paste an article, a story, or a paragraph. We'll help you learn the vocabulary.
                </p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
                <div className="relative">
                    <textarea
                        className="w-full h-64 p-5 text-lg leading-relaxed text-slate-700 placeholder-slate-300 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-0 transition-colors resize-none"
                        placeholder="Paste your English text here..."
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            if (error) setError('');
                        }}
                    />
                    {error && (
                        <div className="absolute bottom-4 left-4 text-rose-500 text-sm font-medium bg-rose-50 px-3 py-1 rounded-lg">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-6">
                    <Button variant="ghost" onClick={loadSample} type="button">
                        Use Sample Text
                    </Button>
                    <Button onClick={handleNext} disabled={!text.trim()} size="lg">
                        Find New Words &rarr;
                    </Button>
                </div>
            </div>
        </div>
    );
};
