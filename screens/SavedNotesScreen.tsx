import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  ScrollView
} from 'react-native';
import { X, FileText, Calendar, Camera, CheckSquare, Trash2 } from 'lucide-react-native';
import { getAllNotes, deleteNote, formatNoteTimestamp, SavedNote } from '../utils/noteStorage';
import OrganizedNotesScreen from './OrganizedNotesScreen';

interface SavedNotesScreenProps {
  onClose: () => void;
}

export default function SavedNotesScreen({ onClose }: SavedNotesScreenProps) {
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNote, setSelectedNote] = useState<SavedNote | null>(null);

  const loadNotes = async () => {
    try {
      const savedNotes = await getAllNotes();
      setNotes(savedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotes();
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(noteId);
              await loadNotes(); // Reload the list
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          }
        }
      ]
    );
  };

  const getNotePreview = (content: string): string => {
    // Extract first meaningful line from the content
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const firstLine = lines.find(line => !line.startsWith('#') && line.trim() !== '');
    return firstLine?.substring(0, 100) + (firstLine && firstLine.length > 100 ? '...' : '') || 'No preview available';
  };

  const renderNoteItem = ({ item }: { item: SavedNote }) => (
    <TouchableOpacity 
      style={styles.noteItem}
      onPress={() => setSelectedNote(item)}
    >
      <View style={styles.noteHeader}>
        <View style={styles.noteInfo}>
          <Text style={styles.noteDate}>{formatNoteTimestamp(item.timestamp)}</Text>
          <Text style={styles.notePreview}>{getNotePreview(item.content)}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNote(item.id)}
        >
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.noteStats}>
        {item.photos.length > 0 && (
          <View style={styles.statItem}>
            <Camera size={14} color="#64748B" />
            <Text style={styles.statText}>{item.photos.length} photos</Text>
          </View>
        )}
        {item.tasks.length > 0 && (
          <View style={styles.statItem}>
            <CheckSquare size={14} color="#64748B" />
            <Text style={styles.statText}>{item.tasks.length} tasks</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (selectedNote) {
    return (
      <OrganizedNotesScreen
        onClose={() => setSelectedNote(null)}
        content={selectedNote.content}
        photos={selectedNote.photos}
        tasks={selectedNote.tasks}
        promptSent={selectedNote.promptSent}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Oak Ridge Residence</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.projectInfo}>
        <FileText size={20} color="#3B82F6" />
        <Text style={styles.projectTitle}>Saved Notes</Text>
        <Text style={styles.noteCount}>{notes.length} notes saved</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notes...</Text>
        </View>
      ) : notes.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <FileText size={48} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No Notes Yet</Text>
          <Text style={styles.emptyText}>
            AI-organized notes will be saved here automatically when you use the voice notes feature.
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
          style={styles.notesList}
          contentContainerStyle={styles.notesListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  headerRight: {
    width: 40,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  projectTitle: {
    flex: 1,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
  },
  noteCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  notesList: {
    flex: 1,
  },
  notesListContent: {
    padding: 16,
  },
  noteItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  noteInfo: {
    flex: 1,
  },
  noteDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 4,
  },
  notePreview: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 12,
  },
  noteStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
  },
}); 