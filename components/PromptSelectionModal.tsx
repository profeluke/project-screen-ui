import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  TextInput,
  ScrollView
} from 'react-native';
import { X, Plus, Edit, Trash2, Check, Code, Settings } from 'lucide-react-native';
import { 
  SavedPrompt, 
  getAllPrompts, 
  savePrompt, 
  deletePrompt, 
  updatePrompt,
  getDefaultPrompt,
  initializeDefaultPrompts 
} from '../utils/promptStorage';

interface PromptSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: SavedPrompt) => void;
  title?: string;
}

export default function PromptSelectionModal({
  visible,
  onClose,
  onSelectPrompt,
  title = "Select AI Prompt"
}: PromptSelectionModalProps) {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<SavedPrompt | null>(null);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptDescription, setNewPromptDescription] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');

  useEffect(() => {
    if (visible) {
      // Initialize default prompts if needed
      initializeDefaultPrompts().then(() => {
        loadPrompts();
      });
    }
  }, [visible]);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const allPrompts = await getAllPrompts();
      setPrompts(allPrompts);
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrompt = () => {
    setNewPromptName('');
    setNewPromptDescription('');
    setNewPromptContent(getDefaultPrompt());
    setEditingPrompt(null);
    setShowCreateModal(true);
  };

  const handleEditPrompt = (prompt: SavedPrompt) => {
    setNewPromptName(prompt.name);
    setNewPromptDescription(prompt.description || '');
    setNewPromptContent(prompt.prompt);
    setEditingPrompt(prompt);
    setShowCreateModal(true);
  };

  const handleSavePrompt = async () => {
    if (!newPromptName.trim()) {
      Alert.alert('Error', 'Please enter a prompt name');
      return;
    }

    if (!newPromptContent.trim()) {
      Alert.alert('Error', 'Please enter prompt content');
      return;
    }

    try {
      if (editingPrompt) {
        // Update existing prompt
        await updatePrompt(editingPrompt.id, {
          name: newPromptName.trim(),
          description: newPromptDescription.trim(),
          prompt: newPromptContent.trim(),
        });
      } else {
        // Create new prompt
        await savePrompt({
          name: newPromptName.trim(),
          description: newPromptDescription.trim(),
          prompt: newPromptContent.trim(),
        });
      }

      setShowCreateModal(false);
      await loadPrompts();
    } catch (error) {
      console.error('Error saving prompt:', error);
      Alert.alert('Error', 'Failed to save prompt');
    }
  };

  const handleDeletePrompt = (prompt: SavedPrompt) => {
    Alert.alert(
      'Delete Prompt',
      `Are you sure you want to delete "${prompt.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePrompt(prompt.id);
              await loadPrompts();
            } catch (error) {
              console.error('Error deleting prompt:', error);
              Alert.alert('Error', 'Failed to delete prompt');
            }
          }
        }
      ]
    );
  };

  const handleSetDefault = async (prompt: SavedPrompt) => {
    try {
      await updatePrompt(prompt.id, { isDefault: true });
      await loadPrompts();
    } catch (error) {
      console.error('Error setting default prompt:', error);
      Alert.alert('Error', 'Failed to set default prompt');
    }
  };

  const renderPromptItem = ({ item }: { item: SavedPrompt }) => (
    <TouchableOpacity
      style={[styles.promptItem, item.isDefault && styles.defaultPromptItem]}
      onPress={() => {
        onSelectPrompt(item);
        onClose();
      }}
    >
      <View style={styles.promptItemHeader}>
        <View style={styles.promptItemInfo}>
          <Text style={styles.promptItemName}>{item.name}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <View style={styles.promptItemActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditPrompt(item)}
          >
            <Edit size={16} color="#64748B" />
          </TouchableOpacity>
          {!item.isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSetDefault(item)}
            >
              <Check size={16} color="#10B981" />
            </TouchableOpacity>
          )}
          {prompts.length > 1 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeletePrompt(item)}
            >
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {item.description && (
        <Text style={styles.promptItemDescription}>{item.description}</Text>
      )}
      <Text style={styles.promptPreview} numberOfLines={2}>
        {item.prompt.substring(0, 100)}...
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleCreatePrompt} style={styles.addButton}>
              <Plus size={24} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={prompts}
            keyExtractor={(item) => item.id}
            renderItem={renderPromptItem}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>

      {/* Create/Edit Prompt Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <SafeAreaView style={styles.createContainer}>
          <View style={styles.createHeader}>
            <TouchableOpacity 
              onPress={() => setShowCreateModal(false)} 
              style={styles.closeButton}
            >
              <X size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.createTitle}>
              {editingPrompt ? 'Edit Prompt' : 'Create Prompt'}
            </Text>
            <TouchableOpacity onPress={handleSavePrompt} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.createContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={newPromptName}
                onChangeText={setNewPromptName}
                placeholder="Enter prompt name"
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={newPromptDescription}
                onChangeText={setNewPromptDescription}
                placeholder="Brief description of this prompt"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Prompt Content</Text>
              <TextInput
                style={styles.promptTextInput}
                value={newPromptContent}
                onChangeText={setNewPromptContent}
                placeholder="Enter the AI prompt content"
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
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
  title: {
    flex: 1,
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    padding: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  promptItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  defaultPromptItem: {
    borderColor: '#3B82F6',
    backgroundColor: '#F8FAFC',
  },
  promptItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  promptItemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promptItemName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
  },
  defaultBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: 'white',
  },
  promptItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  promptItemDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  promptPreview: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  // Create/Edit Modal Styles
  createContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  createHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  createTitle: {
    flex: 1,
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: 'white',
  },
  createContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1F2937',
  },
  promptTextInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: 'Menlo',
    fontSize: 13,
    color: '#1F2937',
    minHeight: 200,
  },
}); 