import React, { useState, useMemo } from 'react';
import { Button } from './Button';

interface WordSelectorProps {
    article: string;
    onNext: (selectedWords: string[]) => void;
    onBack: () => void;
}

export const WordSelector: React.FC<WordSelectorProps> = ({ article, onNext, onBack }) => {
    const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());

    // Split text into tokens (words and non-words) to preserve layout
    // Regex: Split by non-word characters but keep delimiters.
    // Actually, better to split by spaces to keep it simple for the UI, 
    // but we want to strip punctuation for the "word value" while displaying punctuation.
    const tokens = useMemo(() => {
        // This regex matches a sequence of word characters, OR a sequence of non-word characters (punctuation/space)
        return article.split(/([a-zA-Z0-9]+)/).filter(Boolean);
    }, [article]);

    const toggleWord = (word: string) => {
        const cleanWord = word.toLowerCase();
        const newSet = new Set(selectedSet);
        if (newSet.has(cleanWord)) {
            newSet.delete(cleanWord);
        } else {
            newSet.add(cleanWord);
        }
        setSelectedSet(newSet);
    };

    const isWord = (token: string) => /^[a-zA-Z0-9]+$/.test(token);

    const handleNext = () => {
        onNext(Array.from(selectedSet));
    };

    return (
        <div className="w-full max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
            <div className="text-center mb-6 flex-shrink-0">
                <h2 className="text-3xl font-bold text-slate-800">Select Unknown Words</h2>
                <p className="text-slate-500">
                    Click on the words you don't know. We will generate a study guide for them.
                </p>
            </div>

            <div className="flex-grow overflow-y-auto bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 leading-loose text-lg text-slate-700">
                {tokens.map((token, index) => {
                    if (!isWord(token)) {
                        // Render punctuation/whitespace as is
                        return <span key={index} className="whitespace-pre-wrap">{token}</span>;
                    }

                    const cleanWord = token.toLowerCase();
                    const isSelected = selectedSet.has(cleanWord);

                    return (
                        <span
                            key={index}
                            onClick={() => toggleWord(token)}
                            className={`
                cursor-pointer rounded-md px-1 py-0.5 transition-all duration-200 mx-0.5 select-none
                ${isSelected
                                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200 transform scale-105 inline-block'
                                    : 'hover:bg-indigo-100 text-slate-700 hover:text-indigo-800'}
              `}
                        >
                            {token}
                        </span>
                    );
                })}
            </div>

            <div className="flex justify-between items-center mt-6 flex-shrink-0 pt-4 border-t border-slate-200">
                <div className="text-slate-500 font-medium">
                    {selectedSet.size} words selected
                </div>
                <div className="flex gap-4">
                    <Button variant="ghost" onClick={onBack}>
                        Back
                    </Button>
                    <Button onClick={handleNext} disabled={selectedSet.size === 0} size="lg">
                        Generate Study Guide &rarr;
                    </Button>
                </div>
            </div>
        </div>
    );
};
