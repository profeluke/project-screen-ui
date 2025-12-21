import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  Dimensions,
  FlatList,
  Alert,
  Modal,
  Clipboard
} from 'react-native';
import { X, CheckSquare, Camera, FileText, Download, Share, Sparkles, Code, Trash2, MoreVertical, Mic, Copy, RefreshCw, StickyNote } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface OrganizedNotesScreenProps {
  onClose: () => void;
  content: string;
  photos: Array<{ uri: string; timestamp?: number; aiDescription?: string; photoId?: string }>;
  tasks: Array<{ text: string; photoIds?: string[] }>;
  title?: string;
  promptSent?: string;
  rawTranscript?: string;
  noteId?: string;
  onDelete?: (noteId: string) => void;
  onRerunWithPrompt?: (noteId: string) => void;
  hasRawData?: boolean;
}

type TabType = 'ai-notes' | 'todos' | 'photos' | 'raw-notes';

export default function OrganizedNotesScreen({ 
  onClose, 
  content, 
  photos, 
  tasks,
  title,
  promptSent,
  rawTranscript,
  noteId,
  onDelete,
  onRerunWithPrompt,
  hasRawData 
}: OrganizedNotesScreenProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ai-notes');

  // Helper function to render text with embedded photo references
  const renderLineWithPhotos = (text: string, lineIndex: number) => {
    // Regular expression to find [[photo_X]] patterns
    const photoRegex = /\[\[photo_(\d+)\]\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    
    while ((match = photoRegex.exec(text)) !== null) {
      // Add text before the photo reference
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index);
        parts.push(
          <Text key={`${lineIndex}-text-${lastIndex}`} style={styles.bulletText}>
            {textBefore}
          </Text>
        );
      }
      
      // Find the photo with matching ID
      const photoId = `photo_${match[1]}`;
      const photo = photos.find(p => p.photoId === photoId);
      
      if (photo) {
        // Add the photo thumbnail
        parts.push(
          <TouchableOpacity
            key={`${lineIndex}-photo-${photoId}`}
            onPress={() => {
              const photoIndex = photos.findIndex(p => p.photoId === photoId);
              if (photoIndex !== -1) setSelectedPhotoIndex(photoIndex);
            }}
            style={styles.inlinePhotoWrapper}
          >
            <Image source={{ uri: photo.uri }} style={styles.inlinePhoto} />
          </TouchableOpacity>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after last photo
    if (lastIndex < text.length) {
      parts.push(
        <Text key={`${lineIndex}-text-end`} style={styles.bulletText}>
          {text.substring(lastIndex)}
        </Text>
      );
    }
    
    // If no photos found, return plain text
    if (parts.length === 0) {
      return <Text style={styles.bulletText}>{text}</Text>;
    }
    
    return <View style={styles.textWithPhotos}>{parts}</View>;
  };

  // Simple markdown parser for basic formatting
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Skip empty lines
      if (!line.trim()) {
        return <View key={index} style={styles.emptyLine} />;
      }

      // Headers
      if (line.startsWith('# ')) {
        return <Text key={index} style={styles.h1}>{line.substring(2).trim()}</Text>;
      }
      if (line.startsWith('## ')) {
        return <Text key={index} style={styles.h2}>{line.substring(3).trim()}</Text>;
      }
      if (line.startsWith('### ')) {
        return <Text key={index} style={styles.h3}>{line.substring(4).trim()}</Text>;
      }
      
      // Indented bullet points (sub-bullets)
      if (line.match(/^\s+[-•]\s/)) {
        const content = line.replace(/^\s+[-•]\s/, '').trim();
        return (
          <View key={index} style={styles.subBulletPoint}>
            <Text style={styles.subBullet}>•</Text>
            {renderLineWithPhotos(content, index)}
          </View>
        );
      }
      
      // Regular bullet points
      if (line.startsWith('- ') || line.startsWith('• ')) {
        const content = line.substring(2).trim();
        return (
          <View key={index} style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            {renderLineWithPhotos(content, index)}
          </View>
        );
      }
      
      // Tasks (checkbox items)
      if (line.startsWith('- [ ] ')) {
        const content = line.substring(6).trim();
        return (
          <View key={index} style={styles.task}>
            <View style={styles.checkbox} />
            <Text style={styles.taskText}>{content}</Text>
          </View>
        );
      }
      
      // Handle bold text and photos within regular content
      const renderTextWithBoldAndPhotos = (text: string) => {
        // First handle photos
        const photoRegex = /\[\[photo_(\d+)\]\]/g;
        const photoParts: Array<{text: string, photoId?: string}> = [];
        let lastIndex = 0;
        let match;
        
        while ((match = photoRegex.exec(text)) !== null) {
          if (match.index > lastIndex) {
            photoParts.push({ text: text.substring(lastIndex, match.index) });
          }
          photoParts.push({ text: '', photoId: `photo_${match[1]}` });
          lastIndex = match.index + match[0].length;
        }
        
        if (lastIndex < text.length) {
          photoParts.push({ text: text.substring(lastIndex) });
        }
        
        if (photoParts.length === 0) {
          photoParts.push({ text });
        }
        
        // Now render each part with bold text support
        const finalParts: React.ReactNode[] = [];
        photoParts.forEach((part, partIndex) => {
          if (part.photoId) {
            const photo = photos.find(p => p.photoId === part.photoId);
            if (photo) {
              finalParts.push(
                <TouchableOpacity
                  key={`${index}-photo-${part.photoId}`}
                  onPress={() => {
                    const photoIndex = photos.findIndex(p => p.photoId === part.photoId);
                    if (photoIndex !== -1) setSelectedPhotoIndex(photoIndex);
                  }}
                  style={styles.paragraphPhotoWrapper}
                >
                  <Image source={{ uri: photo.uri }} style={styles.paragraphPhoto} />
                </TouchableOpacity>
              );
            }
          } else {
            // Handle bold text
            const boldRegex = /\*\*(.*?)\*\*/g;
            const boldParts = [];
            let boldLastIndex = 0;
            let boldMatch;
            
            while ((boldMatch = boldRegex.exec(part.text)) !== null) {
              if (boldMatch.index > boldLastIndex) {
                boldParts.push(part.text.substring(boldLastIndex, boldMatch.index));
              }
              boldParts.push(<Text key={`${index}-${partIndex}-bold-${boldMatch.index}`} style={styles.bold}>{boldMatch[1]}</Text>);
              boldLastIndex = boldMatch.index + boldMatch[0].length;
            }
            
            if (boldLastIndex < part.text.length) {
              boldParts.push(part.text.substring(boldLastIndex));
            }
            
            if (boldParts.length > 0) {
              finalParts.push(...boldParts);
            } else {
              finalParts.push(part.text);
            }
          }
        });
        
        return finalParts;
      };
      
      // Regular paragraph with potential bold text and photos
      const textParts = renderTextWithBoldAndPhotos(line.trim());
      return (
        <Text key={index} style={styles.paragraph}>
          {textParts}
        </Text>
      );
    });
  };

  const formatTime = (seconds?: number) => {
    if (seconds === undefined) return '';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = () => {
    if (!noteId || !onDelete) return;
    
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(noteId);
            onClose();
          }
        }
      ]
    );
  };

  const handleCopyPrompt = () => {
    if (promptSent) {
      Clipboard.setString(promptSent);
      Alert.alert('Copied!', 'Prompt copied to clipboard');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title || ''}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Share size={20} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowOptionsMenu(true)}
          >
            <MoreVertical size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'ai-notes' && styles.activeTab]}
            onPress={() => setActiveTab('ai-notes')}
          >
            <FileText size={16} color={activeTab === 'ai-notes' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'ai-notes' && styles.activeTabText]}>AI Notes</Text>
          </TouchableOpacity>
          
                     <TouchableOpacity 
             style={[styles.tab, activeTab === 'todos' && styles.activeTab]}
             onPress={() => setActiveTab('todos')}
           >
             <CheckSquare size={16} color={activeTab === 'todos' ? '#FFFFFF' : '#64748B'} />
             <Text style={[styles.tabText, activeTab === 'todos' && styles.activeTabText]}>To-dos</Text>
             {tasks.length > 0 && (
               <View style={[styles.tabBadge, activeTab === 'todos' && styles.tabBadgeActive]}>
                 <Text style={[styles.tabBadgeText, activeTab === 'todos' && styles.tabBadgeTextActive]}>{tasks.length}</Text>
               </View>
             )}
           </TouchableOpacity>
          
                     <TouchableOpacity 
             style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
             onPress={() => setActiveTab('photos')}
           >
             <Camera size={16} color={activeTab === 'photos' ? '#FFFFFF' : '#64748B'} />
             <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>Photos</Text>
             {photos.length > 0 && (
               <View style={[styles.tabBadge, activeTab === 'photos' && styles.tabBadgeActive]}>
                 <Text style={[styles.tabBadgeText, activeTab === 'photos' && styles.tabBadgeTextActive]}>{photos.length}</Text>
               </View>
             )}
           </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'raw-notes' && styles.activeTab]}
            onPress={() => setActiveTab('raw-notes')}
          >
            <StickyNote size={16} color={activeTab === 'raw-notes' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'raw-notes' && styles.activeTabText]}>Raw Notes</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'ai-notes' && (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.contentSection}>
              {renderMarkdown(content)}
            </View>
          </ScrollView>
        )}
        
        {activeTab === 'todos' && (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.todosTabContent}>
              {tasks.length > 0 ? (
                <>
                  <View style={styles.todosHeader}>
                    <Text style={styles.todosTitle}>Tasks & Action Items</Text>
                    <TouchableOpacity 
                      style={styles.acceptAllButton}
                      onPress={async () => {
                        try {
                          const { saveTasks } = await import('../utils/taskStorage');
                          await saveTasks(tasks.map(task => ({
                            text: task.text,
                            noteId: noteId,
                            photoIds: task.photoIds,
                            projectId: 'oak-ridge-residence',
                            projectName: 'Oak Ridge Residence'
                          })));
                          Alert.alert(
                            'Tasks Accepted',
                            `${tasks.length} tasks have been added to your to-do list.`,
                            [{ text: 'OK' }]
                          );
                        } catch (error) {
                          console.error('Error saving tasks:', error);
                          Alert.alert(
                            'Error',
                            'Failed to save tasks. Please try again.',
                            [{ text: 'OK' }]
                          );
                        }
                      }}
                    >
                      <Text style={styles.acceptAllButtonText}>Accept All</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.todosListContainer}>
                    {tasks.map((task, index) => (
                      <View key={index} style={styles.todoItem}>
                        <View style={styles.todoCheckbox} />
                        <View style={styles.todoContent}>
                          <Text style={styles.todoText}>{task.text}</Text>
                          {task.photoIds && task.photoIds.length > 0 && (
                            <View style={styles.todoPhotos}>
                              {task.photoIds.map((photoId) => {
                                const photo = photos.find(p => p.photoId === photoId);
                                return photo ? (
                                  <TouchableOpacity
                                    key={photoId}
                                    onPress={() => {
                                      const photoIndex = photos.findIndex(p => p.photoId === photoId);
                                      if (photoIndex !== -1) setSelectedPhotoIndex(photoIndex);
                                    }}
                                  >
                                    <Image 
                                      source={{ uri: photo.uri }} 
                                      style={styles.todoPhotoThumbnail}
                                      resizeMode="cover"
                                    />
                                  </TouchableOpacity>
                                ) : null;
                              })}
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.emptyState}>
                  <CheckSquare size={48} color="#CBD5E1" />
                  <Text style={styles.emptyStateText}>No tasks found</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
        
        {activeTab === 'photos' && (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.photosTabContent}>
              {photos.length > 0 ? (
                <View style={styles.photosGrid}>
                  {photos.map((photo, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.photoGridItem}
                      onPress={() => setSelectedPhotoIndex(index)}
                    >
                      <Image source={{ uri: photo.uri }} style={styles.photoGridImage} />
                      {photo.photoId && (
                        <View style={styles.photoIdOverlay}>
                          <Text style={styles.photoIdText}>{photo.photoId}</Text>
                        </View>
                      )}
                      {photo.aiDescription && (
                        <View style={styles.photoAiIndicator}>
                          <Sparkles size={12} color="#10B981" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Camera size={48} color="#CBD5E1" />
                  <Text style={styles.emptyStateText}>No photos captured</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
        
        {activeTab === 'raw-notes' && (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.rawNotesTabContent}>
              {rawTranscript ? (
                <View style={styles.rawNotesContainer}>
                  <View style={styles.rawNotesHeader}>
                    <Mic size={20} color="#10B981" />
                    <Text style={styles.rawNotesTitle}>Audio Transcript</Text>
                  </View>
                  <Text style={styles.rawNotesText}>{rawTranscript}</Text>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <StickyNote size={48} color="#CBD5E1" />
                  <Text style={styles.emptyStateText}>No raw notes available</Text>
                </View>
              )}
              
              {promptSent && (
                <View style={styles.promptSentContainer}>
                  <View style={styles.promptSentHeader}>
                    <Code size={20} color="#6366F1" />
                    <Text style={styles.promptSentTitle}>AI Prompt Used</Text>
                    <TouchableOpacity onPress={handleCopyPrompt} style={styles.copyPromptButton}>
                      <Copy size={16} color="#6366F1" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.promptScrollView} horizontal showsHorizontalScrollIndicator={true}>
                    <Text style={styles.promptSentText} selectable>{promptSent}</Text>
                  </ScrollView>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Options Menu Modal */}
      <Modal
        visible={showOptionsMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptionsMenu(false)}
      >
        <TouchableOpacity 
          style={styles.optionsOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsMenu(false)}
        >
          <View style={styles.optionsMenu}>
            {rawTranscript && (
              <TouchableOpacity 
                style={styles.optionsMenuItem}
                onPress={() => {
                  setShowTranscript(!showTranscript);
                  setShowOptionsMenu(false);
                }}
              >
                <Mic size={18} color="#374151" />
                <Text style={styles.optionsMenuText}>
                  {showTranscript ? 'Hide Transcript' : 'Show Raw Transcript'}
                </Text>
              </TouchableOpacity>
            )}
            
            {promptSent && (
              <TouchableOpacity 
                style={styles.optionsMenuItem}
                onPress={() => {
                  setShowPromptModal(true);
                  setShowOptionsMenu(false);
                }}
              >
                <Code size={18} color="#374151" />
                <Text style={styles.optionsMenuText}>Show Prompt</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.optionsMenuItem}
              onPress={() => {
                setShowOptionsMenu(false);
                // TODO: Implement download functionality
                Alert.alert('Download', 'Download functionality coming soon!');
              }}
            >
              <Download size={18} color="#374151" />
              <Text style={styles.optionsMenuText}>Download</Text>
            </TouchableOpacity>
            
            {hasRawData && onRerunWithPrompt && noteId && (
              <TouchableOpacity 
                style={styles.optionsMenuItem}
                onPress={() => {
                  setShowOptionsMenu(false);
                  onRerunWithPrompt(noteId);
                }}
              >
                <RefreshCw size={18} color="#374151" />
                <Text style={styles.optionsMenuText}>Re-run with Different Prompt</Text>
              </TouchableOpacity>
            )}
            
            {noteId && onDelete && (
              <TouchableOpacity 
                style={[styles.optionsMenuItem, styles.deleteMenuItem]}
                onPress={() => {
                  setShowOptionsMenu(false);
                  handleDelete();
                }}
              >
                <Trash2 size={18} color="#EF4444" />
                <Text style={[styles.optionsMenuText, styles.deleteMenuText]}>Delete Note</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Photo Viewer Modal */}
      {selectedPhotoIndex !== null && (
        <TouchableOpacity 
          style={styles.photoModal} 
          activeOpacity={1}
          onPress={() => setSelectedPhotoIndex(null)}
        >
          <Image 
            source={{ uri: photos[selectedPhotoIndex].uri }} 
            style={styles.fullPhoto}
            resizeMode="contain"
          />
          <TouchableOpacity 
            style={styles.photoCloseButton}
            onPress={() => setSelectedPhotoIndex(null)}
          >
            <X size={24} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Full Screen Prompt Modal */}
      <Modal
        visible={showPromptModal}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <SafeAreaView style={styles.promptModalContainer}>
          {/* Header */}
          <View style={styles.promptModalHeader}>
            <TouchableOpacity 
              onPress={() => setShowPromptModal(false)} 
              style={styles.closeButton}
            >
              <X size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.promptModalTitle}>ChatGPT Prompt</Text>
            <TouchableOpacity 
              onPress={handleCopyPrompt}
              style={styles.copyButton}
            >
              <Copy size={20} color="#3B82F6" />
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
          
          {/* Prompt Content */}
          <ScrollView style={styles.promptModalContent}>
            <Text style={styles.promptModalText} selectable={true}>
              {promptSent}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  photosSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  photosContainer: {
    paddingHorizontal: 16,
  },
  photoItem: {
    marginRight: 12,
    alignItems: 'center',
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  photoId: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
    fontWeight: 'bold',
  },
  photoTimestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  tasksSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  tasksSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  acceptAllButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptAllButtonText: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  tasksList: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  taskCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 4,
    marginTop: 2,
  },
  taskItemText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 22,
  },
  taskContent: {
    flex: 1,
  },
  taskPhotos: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  taskPhotoThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  h1: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 16,
  },
  h2: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1E293B',
    marginTop: 20,
    marginBottom: 12,
  },
  h3: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  bold: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 16,
  },
  bullet: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#374151',
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  task: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    marginRight: 12,
    marginTop: 3,
  },
  taskText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  emptyLine: {
    height: 12,
  },
  photoModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPhoto: {
    width: screenWidth,
    height: '80%',
  },
  photoCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  aiDescriptionBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 2,
  },
  promptSection: {
    margin: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  promptSectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#10B981', // Changed to green for transcript
    padding: 16,
    paddingBottom: 8,
  },
  promptContainer: {
    maxHeight: 300,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  promptText: {
    fontFamily: 'Menlo',
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  transcriptText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  // Options Menu Styles
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  optionsMenu: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  optionsMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  optionsMenuText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#374151',
  },
  deleteMenuItem: {
    // Additional styles for delete item if needed
  },
  deleteMenuText: {
    color: '#EF4444',
  },
  // Full Screen Prompt Modal Styles
  promptModalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  promptModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  promptModalTitle: {
    flex: 1,
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EBF5FF',
    borderRadius: 8,
  },
  copyButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#3B82F6',
  },
  promptModalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  promptModalText: {
    fontFamily: 'Menlo',
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  subBulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 16,
  },
  subBullet: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#374151',
    marginRight: 8,
  },
  subBulletText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  // Tab styles
  tabBar: {
    backgroundColor: '#FFFFFF',
    paddingTop: 4,
    paddingBottom: 24,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    gap: 6,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  tabBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  tabBadgeActive: {
    backgroundColor: '#FFFFFF',
  },
  tabBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: 'white',
  },
  tabBadgeTextActive: {
    color: '#64748B',
  },
  tabContent: {
    flex: 1,
  },
  // To-dos tab styles
  todosTabContent: {
    padding: 16,
  },
  todosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todosTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
  },
  todosListContainer: {
    gap: 12,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  todoCheckbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 6,
    marginTop: 2,
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
  },
  todoPhotos: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  todoPhotoThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  // Photos tab styles
  photosTabContent: {
    padding: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoGridItem: {
    width: (screenWidth - 48) / 3,
    height: (screenWidth - 48) / 3,
    position: 'relative',
  },
  photoGridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  photoIdOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  photoIdText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: 'white',
  },
  photoAiIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  // Raw notes tab styles
  rawNotesTabContent: {
    padding: 16,
    gap: 16,
  },
  rawNotesContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  rawNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  rawNotesTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#10B981',
  },
  rawNotesText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  promptSentContainer: {
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  promptSentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  promptSentTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#6366F1',
    flex: 1,
  },
  copyPromptButton: {
    padding: 4,
  },
  promptScrollView: {
    maxHeight: 200,
  },
  promptSentText: {
    fontFamily: 'Menlo',
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 12,
  },
  // Inline photo styles
  textWithPhotos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    flex: 1,
  },
  inlinePhotoWrapper: {
    marginHorizontal: 8,
    marginVertical: 4,
  },
  inlinePhoto: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  paragraphPhotoWrapper: {
    marginVertical: 8,
    alignSelf: 'center',
  },
  paragraphPhoto: {
    width: screenWidth - 64,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
}); 