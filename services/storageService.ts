import { WordGroup, SavedStory } from "../types";

const STORAGE_KEY = 'vocab_quest_library_v1';
const STORY_STORAGE_KEY = 'vocab_quest_stories_v1';

export const getLibrary = (): WordGroup[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load library", e);
    return [];
  }
};

export const saveGroup = (group: WordGroup): void => {
  const library = getLibrary();
  // Check if updating or new
  const index = library.findIndex(g => g.id === group.id);
  if (index >= 0) {
    library[index] = group;
  } else {
    library.unshift(group); // Add to top
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
};

export const deleteGroup = (id: string): void => {
  const library = getLibrary().filter(g => g.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
};

export const createGroup = (name: string, words: any[]): WordGroup => {
  return {
    id: crypto.randomUUID(),
    name,
    words,
    createdAt: Date.now()
  };
};

// --- Story Storage ---

export const getStories = (): SavedStory[] => {
  try {
    const data = localStorage.getItem(STORY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load stories", e);
    return [];
  }
};

export const saveStory = (story: SavedStory): void => {
  const stories = getStories();
  const index = stories.findIndex(s => s.id === story.id);
  if (index >= 0) {
    stories[index] = story;
  } else {
    stories.unshift(story);
  }
  localStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(stories));
};

export const deleteStory = (id: string): void => {
  const stories = getStories().filter(s => s.id !== id);
  localStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(stories));
};