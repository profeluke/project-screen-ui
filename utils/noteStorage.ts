import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedNote {
  id: string;
  timestamp: number;
  title: string;
  content: string;
  photos: Array<{ uri: string; timestamp?: number; aiDescription?: string; photoId?: string }>;
  tasks: Array<{ text: string; photoIds?: string[] }>;
  promptSent?: string;
  promptId?: string; // ID of the prompt used to generate this note
  rawTranscript?: string;
  rawSessionData?: any; // Store the original session data for re-processing
}

const STORAGE_KEY = 'oak_ridge_residence_notes';

/**
 * Save a new AI-organized note to local storage under Oak Ridge Residence Project
 */
export async function saveNote(note: Omit<SavedNote, 'id' | 'timestamp'>): Promise<string> {
  try {
    const newNote: SavedNote = {
      ...note,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    // Get existing notes
    const existingNotes = await getAllNotes();
    
    // Add new note to the beginning of the array
    const updatedNotes = [newNote, ...existingNotes];
    
    // Save back to storage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
    
    console.log('Note saved successfully:', newNote.id);
    return newNote.id;
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
}

/**
 * Get all saved notes for Oak Ridge Residence Project
 */
export async function getAllNotes(): Promise<SavedNote[]> {
  try {
    const notesJson = await AsyncStorage.getItem(STORAGE_KEY);
    if (!notesJson) {
      return [];
    }
    
    const notes = JSON.parse(notesJson) as SavedNote[];
    return notes;
  } catch (error) {
    console.error('Error loading notes:', error);
    return [];
  }
}

/**
 * Update an existing note
 */
export async function updateNote(noteId: string, updates: Partial<SavedNote>): Promise<void> {
  try {
    const existingNotes = await getAllNotes();
    const noteIndex = existingNotes.findIndex(note => note.id === noteId);
    
    if (noteIndex === -1) {
      throw new Error('Note not found');
    }
    
    existingNotes[noteIndex] = { ...existingNotes[noteIndex], ...updates };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingNotes));
    console.log('Note updated:', noteId);
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
}

/**
 * Delete a specific note
 */
export async function deleteNote(noteId: string): Promise<void> {
  try {
    const existingNotes = await getAllNotes();
    const filteredNotes = existingNotes.filter(note => note.id !== noteId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredNotes));
    console.log('Note deleted:', noteId);
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}

/**
 * Clear all notes (for testing/debugging)
 */
export async function clearAllNotes(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('All notes cleared');
  } catch (error) {
    console.error('Error clearing notes:', error);
    throw error;
  }
}

/**
 * Get notes count
 */
export async function getNotesCount(): Promise<number> {
  try {
    const notes = await getAllNotes();
    return notes.length;
  } catch (error) {
    console.error('Error getting notes count:', error);
    return 0;
  }
}

/**
 * Format timestamp for display with human-readable relative time
 */
export function formatNoteTimestamp(timestamp: number): string {
  const now = new Date();
  const noteDate = new Date(timestamp);
  
  // Calculate the difference in milliseconds
  const diffMs = now.getTime() - noteDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // Get today's date at midnight for accurate comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const noteDay = new Date(noteDate.getFullYear(), noteDate.getMonth(), noteDate.getDate());
  
  // Format time
  const timeStr = noteDate.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }).toLowerCase();
  
  if (noteDay.getTime() === today.getTime()) {
    // Today
    return `today at ${timeStr}`;
  } else if (noteDay.getTime() === yesterday.getTime()) {
    // Yesterday
    return 'yesterday';
  } else if (diffDays < 7) {
    // Within the last week - show day of week
    return noteDate.toLocaleDateString([], { weekday: 'long' }).toLowerCase();
  } else {
    // More than a week - show the date
    return noteDate.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: now.getFullYear() !== noteDate.getFullYear() ? 'numeric' : undefined
    }).toLowerCase();
  }
} 