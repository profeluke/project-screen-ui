import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { X, ScanText, AudioLines } from 'lucide-react-native';

const suggestions = [
  'Search photos on the project',
  'Create a new task',
  'Make a new document',
];

export default function SearchCreateScreen({ onClose }: { onClose: () => void }) {
  const [inputValue, setInputValue] = useState('');

  const handleSuggestionPress = (suggestion: string) => {
    let textToSet = suggestion;
    if (suggestion.toLowerCase().includes('task')) {
      textToSet = 'Create a task: ';
    } else if (suggestion.toLowerCase().includes('document')) {
      textToSet = 'Make a document that... ';
    }
    setInputValue(textToSet);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <View style={styles.suggestionsContainer}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity key={index} style={styles.suggestionPill} onPress={() => handleSuggestionPress(suggestion)}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.searchBarWrapper}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search/create with AI"
              placeholderTextColor="#94A3B8"
              autoFocus
              value={inputValue}
              onChangeText={setInputValue}
            />
            <TouchableOpacity style={styles.iconButton}>
              <ScanText size={22} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <AudioLines size={22} color="#64748B" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  suggestionsContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  suggestionPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#3B82F6',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    paddingVertical: 12,
  },
  iconButton: {
    paddingLeft: 16,
  },
  cancelButton: {
    marginLeft: 8,
    padding: 8,
  },
  cancelButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#3B82F6',
  },
}); 