import React, { useState, useEffect } from 'react';
import { WordGroup, WordData } from '../types';
import { getLibrary, saveGroup, deleteGroup, createGroup } from '../services/storageService';
import { enrichVocabularyList } from '../services/geminiService';
import { Book, Plus, Trash2, Play, Calendar, ChevronRight, X, Loader2, Library as LibraryIcon, ArrowLeft, Edit2 } from 'lucide-react';

interface LibraryProps {
  onPlay: (words: WordData[]) => void;
  onBack: () => void;
}

const Library: React.FC<LibraryProps> = ({ onPlay, onBack }) => {
  const [groups, setGroups] = useState<WordGroup[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Creation Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupWords, setNewGroupWords] = useState('');

  // Edit State
  const [editingGroup, setEditingGroup] = useState<WordGroup | null>(null);
  const [editRequestName, setEditRequestName] = useState('');
  const [addWordsInput, setAddWordsInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = () => {
    setGroups(getLibrary());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this word group?")) {
      deleteGroup(id);
      loadLibrary();
    }
  };

  const handleEditClick = (group: WordGroup, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGroup(group);
    setEditRequestName(group.name);
    setAddWordsInput('');
    setError(null);
  };

  const handleCreate = async () => {
    if (!newGroupName.trim()) {
      setError("Please enter a group name.");
      return;
    }

    const rawWords = newGroupWords
      .split(/[\n,]/)
      .map(w => w.trim())
      .filter(w => w.length > 0);

    if (rawWords.length === 0) {
      setError("Please enter at least one word.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Enrich words via API
      const enrichedWords = await enrichVocabularyList(rawWords);

      // 2. Save to local storage
      const newGroup = createGroup(newGroupName, enrichedWords);
      saveGroup(newGroup);

      // 3. Reset UI
      setNewGroupName('');
      setNewGroupWords('');
      setIsCreating(false);
      loadLibrary();
    } catch (err) {
      setError("Failed to generate word definitions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingGroup) return;
    if (!editRequestName.trim()) {
      setError("Group name cannot be empty.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let updatedWords = [...editingGroup.words];

      // If there are new words to add
      const rawNewWords = addWordsInput
        .split(/[\n,]/)
        .map(w => w.trim())
        .filter(w => w.length > 0);

      if (rawNewWords.length > 0) {
        const enrichedNewWords = await enrichVocabularyList(rawNewWords);
        // Filter duplicates based on word text
        const existingWordTexts = new Set(updatedWords.map(w => w.word.toLowerCase()));
        const uniqueNewWords = enrichedNewWords.filter(w => !existingWordTexts.has(w.word.toLowerCase()));
        updatedWords = [...updatedWords, ...uniqueNewWords];
      }

      const updatedGroup: WordGroup = {
        ...editingGroup,
        name: editRequestName,
        words: updatedWords
      };

      saveGroup(updatedGroup);
      setEditingGroup(null);
      loadLibrary();
    } catch (err) {
      setError("Failed to update group. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeWordFromEdit = (wordIndex: number) => {
    if (!editingGroup) return;
    const newWords = [...editingGroup.words];
    newWords.splice(wordIndex, 1);
    setEditingGroup({ ...editingGroup, words: newWords });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <LibraryIcon className="text-indigo-600" />
          My Library
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} />
          New Group
        </button>
      </div>

      {/* Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Add New Word Group</h3>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Chapter 1, Food, Travel"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Words (English)</label>
                <textarea
                  value={newGroupWords}
                  onChange={(e) => setNewGroupWords(e.target.value)}
                  placeholder="apple, banana, cherry..."
                  className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                />
                <p className="text-xs text-gray-400 mt-1">Separate words by commas or new lines.</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Create & Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingGroup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-up max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-800">Edit Group</h3>
              <button onClick={() => setEditingGroup(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 flex-grow overflow-y-auto px-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input
                  type="text"
                  value={editRequestName}
                  onChange={(e) => setEditRequestName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Words ({editingGroup.words.length})</label>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 h-40 overflow-y-auto custom-scrollbar resize-y">
                  {editingGroup.words.map((w, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 hover:bg-white rounded-lg group transition-colors">
                      <div>
                        <span className="font-bold text-slate-700">{w.word}</span>
                        <span className="text-slate-400 text-xs ml-2">{w.definition.slice(0, 15)}...</span>
                      </div>
                      <button
                        onClick={() => removeWordFromEdit(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove word"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {editingGroup.words.length === 0 && (
                    <p className="text-center text-slate-400 text-sm py-4">No words remaining. Add some below!</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Add More Words</label>
                <textarea
                  value={addWordsInput}
                  onChange={(e) => setAddWordsInput(e.target.value)}
                  placeholder="Enter new words to append..."
                  className="w-full h-24 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4 flex-shrink-0">
              <button
                onClick={() => setEditingGroup(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isLoading}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group List */}
      {groups.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500">Your library is empty</h3>
          <p className="text-gray-400 mt-2 mb-6">Create a group to start building your personal vocabulary bank.</p>
          <button
            onClick={() => setIsCreating(true)}
            className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline"
          >
            Create your first group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  onClick={(e) => handleEditClick(group, e)}
                  className="p-2 bg-indigo-50 text-indigo-500 rounded-full hover:bg-indigo-100 transition-colors"
                  title="Edit Group"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={(e) => handleDelete(group.id, e)}
                  className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                  title="Delete Group"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
                    <Calendar size={12} />
                    {new Date(group.createdAt).toLocaleDateString()}
                    <span className="mx-1 text-gray-300">|</span>
                    <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">
                      {group.words.length} Words
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-500 text-sm line-clamp-2">
                  {group.words.map(w => w.word).join(', ')}
                </p>
              </div>

              <button
                onClick={() => onPlay(group.words)}
                className="w-full py-3 bg-gray-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Play size={18} />
                Start Learning
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;