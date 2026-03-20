import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Plus, Mic, ChevronLeft, FolderOpen, FileText, BarChart3, CheckSquare, ListChecks, Camera, ArrowUpRight, Clock } from 'lucide-react-native';

interface SearchPageScreenProps {
  onClose: () => void;
}

const suggestions = [
  'Find my latest project photos',
  'Show open tasks this week',
  'Reports due this month',
  'Documents needing approval',
];

const categories = [
  { id: 'projects', label: 'Projects', icon: FolderOpen, color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'documents', label: 'Documents', icon: FileText, color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 'reports', label: 'Reports', icon: BarChart3, color: '#F59E0B', bg: '#FFFBEB' },
  { id: 'checklists', label: 'Checklists', icon: CheckSquare, color: '#10B981', bg: '#ECFDF5' },
  { id: 'tasks', label: 'Tasks', icon: ListChecks, color: '#EF4444', bg: '#FEF2F2' },
  { id: 'photos', label: 'Photos', icon: Camera, color: '#EC4899', bg: '#FDF2F8' },
];

const recents = [
  { id: '1', label: 'Oakridge Residence', type: 'Project' },
  { id: '2', label: 'Safety Checklist', type: 'Checklist' },
  { id: '3', label: 'Material Invoice', type: 'Document' },
  { id: '4', label: 'Downtown Office', type: 'Project' },
  { id: '5', label: 'Budget Report Q4', type: 'Report' },
];

export default function SearchPageScreen({ onClose }: SearchPageScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <TouchableOpacity onPress={onClose} style={styles.backButton}>
        <ChevronLeft size={24} color="#1E293B" />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heroTitle}>What are you{'\n'}looking for?</Text>

        {/* Search Input Card */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.searchInput}
            placeholder="Ask anything"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            multiline={false}
          />
          <View style={styles.inputActions}>
            <TouchableOpacity style={styles.inputIconButton}>
              <Plus size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.micButton}>
              <Mic size={18} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sendButton, searchQuery.length > 0 && styles.sendButtonActive]}>
              <ArrowRight size={18} color={searchQuery.length > 0 ? '#FFFFFF' : '#D1D5DB'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Suggestion Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsContainer}
        >
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity key={index} style={styles.suggestionChip}>
              <ArrowUpRight size={14} color="#6B7280" />
              <Text style={styles.suggestionText} numberOfLines={1}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Categories Grid */}
        <Text style={styles.sectionTitle}>Browse</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <TouchableOpacity key={cat.id} style={styles.categoryItem}>
                <View style={[styles.categoryIcon, { backgroundColor: cat.bg }]}>
                  <Icon size={18} color={cat.color} />
                </View>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recents */}
        <Text style={styles.sectionTitle}>Recents</Text>
        <View style={styles.recentsList}>
          {recents.map((item) => (
            <TouchableOpacity key={item.id} style={styles.recentItem}>
              <Clock size={16} color="#9CA3AF" />
              <View style={styles.recentTextContainer}>
                <Text style={styles.recentLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.recentType}>{item.type}</Text>
              </View>
              <ArrowUpRight size={16} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#111827',
    lineHeight: 40,
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 24,
  },
  inputCard: {
    marginHorizontal: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  searchInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
    marginBottom: 10,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#111827',
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
    marginRight: 8,
  },
  suggestionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#374151',
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#6B7280',
    paddingHorizontal: 24,
    marginTop: 28,
    marginBottom: 14,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryItem: {
    width: (Dimensions.get('window').width - 40 - 20) / 3,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#374151',
  },
  recentsList: {
    paddingHorizontal: 20,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  recentTextContainer: {
    flex: 1,
  },
  recentLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#111827',
  },
  recentType: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 1,
  },
});
