import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Sparkles } from 'lucide-react-native';

interface DocumentItem {
  id: string;
  type: 'text' | 'photo';
  content?: string;
  uri?: string;
  aiDescription?: string;
  isAnalyzing?: boolean;
  photoId?: string;
  indentLevel?: number; // 0 for main level, 1 for indented
}

interface EnhancedDocumentEditorProps {
  onTextChange?: (items: DocumentItem[]) => void;
  onPhotoPress?: (photo: DocumentItem) => void;
  onFocus?: () => void;
  autoFocus?: boolean;
  disableFocus?: boolean;
  capturedPhotos?: Array<{
    id: string;
    uri: string;
    aiDescription?: string;
    isAnalyzing?: boolean;
    photoId?: string;
  }>;
}

const EnhancedDocumentEditor: React.FC<EnhancedDocumentEditorProps> = ({
  onTextChange,
  onPhotoPress,
  onFocus,
  autoFocus = false,
  disableFocus = false,
  capturedPhotos = [],
}) => {
  const [documentItems, setDocumentItems] = useState<DocumentItem[]>([
    { id: '1', type: 'text', content: '', indentLevel: 0 }
  ]);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [processedPhotoIds, setProcessedPhotoIds] = useState<Set<string>>(new Set());
  const scrollViewRef = useRef<ScrollView>(null);
  const photoAnimations = useRef<Map<string, Animated.Value>>(new Map());
  const [emptyEnterCount, setEmptyEnterCount] = useState(0);

  // Process new photos
  useEffect(() => {
    capturedPhotos.forEach(photo => {
      if (!processedPhotoIds.has(photo.id)) {
        // Mark as processed
        setProcessedPhotoIds(prev => new Set([...prev, photo.id]));
        
        // Create animation for this photo
        const animation = new Animated.Value(0);
        photoAnimations.current.set(photo.id, animation);

        // Find where to insert the photo
        setTimeout(() => {
          setDocumentItems(prev => {
            // Insert photo after the last text item
            const lastTextIndex = prev.length - 1;
            const newItems = [...prev];
            
            // Insert the photo
            newItems.splice(lastTextIndex, 0, {
              id: photo.id,
              type: 'photo',
              uri: photo.uri,
              aiDescription: photo.aiDescription,
              isAnalyzing: photo.isAnalyzing,
              photoId: photo.photoId,
            });
            
            return newItems;
          });

          // Animate the photo in
          Animated.spring(animation, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }).start();

          // Scroll to show the new photo
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }, 100);
      }
    });
  }, [capturedPhotos, processedPhotoIds]);

  const handleTextChange = (text: string, itemId: string) => {
    setDocumentItems(prev => {
      const newItems = prev.map(item => {
        if (item.id === itemId && item.type === 'text') {
          // Preserve the content after the bullet
          const bulletPrefix = item.indentLevel === 1 ? '  • ' : '• ';
          const textWithoutBullet = text.replace(/^(\s*•\s*)/, '');
          return { ...item, content: textWithoutBullet };
        }
        return item;
      });

      // Notify parent of changes
      onTextChange?.(newItems);
      return newItems;
    });
  };

  const handleKeyPress = (event: any, itemId: string) => {
    const key = event.nativeEvent.key;
    
    if (key === 'Enter') {
      event.preventDefault();
      
      setDocumentItems(prev => {
        const currentIndex = prev.findIndex(item => item.id === itemId);
        if (currentIndex === -1) return prev;
        
        const currentItem = prev[currentIndex];
        if (currentItem.type !== 'text') return prev;
        
        // Check if current line is empty (just bullet)
        const isEmpty = !currentItem.content || currentItem.content.trim() === '';
        
        if (isEmpty) {
          // Increment empty enter count
          const newCount = emptyEnterCount + 1;
          setEmptyEnterCount(newCount);
          
          // After 2 empty enters, reset to main level
          if (newCount >= 2 && currentItem.indentLevel === 1) {
            const newItems = [...prev];
            newItems[currentIndex] = { ...currentItem, indentLevel: 0 };
            setEmptyEnterCount(0);
            onTextChange?.(newItems);
            return newItems;
          }
        } else {
          setEmptyEnterCount(0);
        }
        
        // Insert new bullet point after current item
        const newId = Date.now().toString();
        const newItems = [...prev];
        newItems.splice(currentIndex + 1, 0, {
          id: newId,
          type: 'text',
          content: '',
          indentLevel: currentItem.indentLevel || 0, // Keep same indent level
        });
        
        // Focus the new item after render
        setTimeout(() => {
          setFocusedItemId(newId);
        }, 50);
        
        onTextChange?.(newItems);
        return newItems;
      });
    } else if (key === 'Tab') {
      event.preventDefault();
      
      setDocumentItems(prev => {
        const currentIndex = prev.findIndex(item => item.id === itemId);
        if (currentIndex === -1) return prev;
        
        const currentItem = prev[currentIndex];
        if (currentItem.type !== 'text') return prev;
        
        // Toggle indent level (0 -> 1, 1 -> 0)
        const newItems = [...prev];
        const newIndentLevel = currentItem.indentLevel === 1 ? 0 : 1;
        newItems[currentIndex] = { ...currentItem, indentLevel: newIndentLevel };
        
        onTextChange?.(newItems);
        return newItems;
      });
    } else {
      // Reset empty enter count on any other key
      setEmptyEnterCount(0);
    }
  };

  const renderDocumentItem = (item: DocumentItem, index: number) => {
    if (item.type === 'text') {
      const bulletPrefix = item.indentLevel === 1 ? '  • ' : '• ';
      const displayText = bulletPrefix + (item.content || '');
      
      return (
        <View key={item.id} style={[styles.textInputContainer, item.indentLevel === 1 && styles.indentedContainer]}>
          <TextInput
            style={[styles.textInput, item.indentLevel === 1 && styles.indentedText]}
            value={displayText}
            onChangeText={(text) => handleTextChange(text, item.id)}
            onKeyPress={(e) => handleKeyPress(e, item.id)}
            onFocus={() => {
              if (!disableFocus) {
                setFocusedItemId(item.id);
                onFocus?.();
              }
            }}
            placeholder={bulletPrefix + "Add notes..."}
            placeholderTextColor="#94A3B8"
            multiline
            autoFocus={autoFocus && index === 0 && !disableFocus}
            blurOnSubmit={false}
            editable={!disableFocus}
            ref={input => {
              if (focusedItemId === item.id && input && !disableFocus) {
                input.focus();
                // Move cursor to end of bullet
                const cursorPos = bulletPrefix.length + (item.content?.length || 0);
                input.setSelection(cursorPos, cursorPos);
              }
            }}
          />
        </View>
      );
    } else if (item.type === 'photo') {
      const animation = photoAnimations.current.get(item.id) || new Animated.Value(1);
      
      return (
        <Animated.View
          key={item.id}
          style={[
            styles.photoThumbnailContainer,
            {
              opacity: animation,
              transform: [
                {
                  translateX: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.photoThumbnailWrapper}
            onPress={() => onPhotoPress?.(item)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: item.uri }} style={styles.photoThumbnail} />
            {item.isAnalyzing && (
              <View style={styles.photoThumbnailAnalyzingOverlay}>
                <ActivityIndicator size="small" color="#3B82F6" />
              </View>
            )}
            {item.aiDescription && !item.isAnalyzing && (
              <View style={styles.photoThumbnailAnalyzedIndicator}>
                <Sparkles size={10} color="#3B82F6" />
              </View>
            )}
          </TouchableOpacity>
          {item.aiDescription && !item.isAnalyzing && (
            <Text style={styles.photoThumbnailDescription} numberOfLines={1}>
              {item.aiDescription}
            </Text>
          )}
        </Animated.View>
      );
    }
    return null;
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {documentItems.map((item, index) => renderDocumentItem(item, index))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  textInputContainer: {
    position: 'relative',
  },
  indentedContainer: {
    marginLeft: 20,
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#334155',
    lineHeight: 24,
    paddingVertical: 4,
    paddingHorizontal: 12,
    minHeight: 32,
  },
  indentedText: {
    // Additional styling for indented text if needed
  },
  photoContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  photoWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: 300,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoAnalyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  photoAnalyzedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  photoDescription: {
    marginTop: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
  },
  // Thumbnail styles
  photoThumbnailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 12,
    gap: 12,
  },
  photoThumbnailWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  photoThumbnailAnalyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoThumbnailAnalyzedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  photoThumbnailDescription: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 18,
  },
});

export default EnhancedDocumentEditor; 