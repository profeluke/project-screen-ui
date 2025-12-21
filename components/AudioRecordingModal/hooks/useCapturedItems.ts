import { useState, useCallback } from 'react';
import { CapturedItem } from '../types';
import { getGeminiVision } from '../../../utils/gemini';

export const useCapturedItems = () => {
  const [capturedItems, setCapturedItems] = useState<CapturedItem[]>([]);

  const addPhoto = useCallback(async (uri: string) => {
    const existingPhotos = capturedItems.filter(item => item.type === 'photo');
    const photoId = `photo_${existingPhotos.length + 1}`;
    
    const newPhoto: CapturedItem = {
      id: Date.now().toString(),
      type: 'photo',
      uri,
      timestamp: 0,
      isAnalyzing: true,
      photoId,
      capturedAt: Date.now()
    };
    
    setCapturedItems(prev => [...prev, newPhoto]);
    
    // Analyze photo with AI
    try {
      const visionResult = await getGeminiVision(uri);

      setCapturedItems(prev => prev.map(item => {
        if (item.type === 'photo' && item.photoId === photoId) {
          const description = visionResult?.description || 'Analysis failed.';
          const docHypothesis = visionResult?.documentHypothesis;
          const isDocument = !!docHypothesis?.isDocument;
          const documentTitle = isDocument && typeof docHypothesis?.title === 'string'
            ? docHypothesis.title.trim()
            : undefined;

          return {
            ...item,
            isAnalyzing: false,
            aiDescription: description,
            aiDocumentTitle: documentTitle,
            aiDocumentType: docHypothesis?.documentType,
            aiDocumentConfidence: typeof docHypothesis?.confidence === 'number' ? docHypothesis.confidence : undefined,
            aiDocumentIsDocument: isDocument,
            aiSuggestedTags: visionResult?.suggestedTags,
          };
        }
        return item;
      }));
    } catch (error) {
      console.error('Photo analysis failed:', error);
      setCapturedItems(prev => prev.map(item => {
        if (item.type === 'photo' && item.photoId === photoId) {
          return { 
            ...item, 
            isAnalyzing: false, 
            aiDescription: 'Analysis unavailable' 
          };
        }
        return item;
      }));
    }
  }, [capturedItems]);

  const addAudioTranscription = useCallback((transcription: string, duration: number, uri?: string) => {
    const newAudio: CapturedItem = {
      id: Date.now().toString(),
      type: 'audio',
      transcription,
      duration,
      uri,
      capturedAt: Date.now()
    };
    
    setCapturedItems(prev => [...prev, newAudio]);
  }, []);

  const addNote = useCallback((bulletPoints: string[]) => {
    const newNote: CapturedItem = {
      id: Date.now().toString(),
      type: 'note',
      bulletPoints,
      source: 'manual',
      capturedAt: Date.now()
    };
    
    setCapturedItems(prev => [...prev, newNote]);
  }, []);

  const updateItem = useCallback((itemId: string, updates: any) => {
    setCapturedItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    setCapturedItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const clearItems = useCallback(() => {
    setCapturedItems([]);
  }, []);

  return {
    capturedItems,
    addPhoto,
    addAudioTranscription,
    addNote,
    updateItem,
    deleteItem,
    clearItems,
  };
}; 