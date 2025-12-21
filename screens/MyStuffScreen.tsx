import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MyStuffItem {
  id: string;
  title: string;
  subtitle: string;
  type: string;
}

type MyStuffCategory = 'To-dos' | 'Photos' | 'Projects' | 'Notes' | 'Documents';

interface MyStuffScreenProps {
  onClose: () => void;
}

export default function MyStuffScreen({ onClose }: MyStuffScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<MyStuffCategory>('To-dos');

  const myStuffCategories: MyStuffCategory[] = ['To-dos', 'Photos', 'Projects', 'Notes', 'Documents'];

  const myStuffData: Record<MyStuffCategory, MyStuffItem[]> = {
    'To-dos': [
      { id: '1', title: 'Review electrical plans', subtitle: 'Due tomorrow', type: 'task' },
      { id: '2', title: 'Schedule inspection', subtitle: 'Oakridge Residence', type: 'task' },
      { id: '3', title: 'Safety checklist', subtitle: '8/12 items complete', type: 'checklist' },
      { id: '4', title: 'Order materials', subtitle: 'Downtown Office Complex', type: 'task' },
      { id: '5', title: 'Final walkthrough checklist', subtitle: '3/15 items complete', type: 'checklist' },
      { id: '6', title: 'Client meeting prep', subtitle: 'Friday 2:00 PM', type: 'task' },
    ],
    Photos: [
      { id: '5', title: 'Foundation progress', subtitle: 'Oakridge Residence • 2 hours ago', type: 'photo' },
      { id: '6', title: 'Electrical rough-in', subtitle: 'Downtown Office • Yesterday', type: 'photo' },
      { id: '7', title: 'Framing complete', subtitle: 'Sunset Villa • 3 days ago', type: 'photo' },
      { id: '8', title: 'Site preparation', subtitle: 'Modern Loft • 1 week ago', type: 'photo' },
      { id: '9', title: 'Roofing progress', subtitle: 'Oakridge • 2 days ago', type: 'photo' },
      { id: '10', title: 'Interior walls', subtitle: 'Downtown Office • 3 days ago', type: 'photo' },
      { id: '11', title: 'Plumbing rough-in', subtitle: 'Sunset Villa • 4 days ago', type: 'photo' },
      { id: '12', title: 'HVAC installation', subtitle: 'Modern Loft • 5 days ago', type: 'photo' },
    ],
    Projects: [
      { id: '9', title: 'Oakridge Residence', subtitle: '85% complete • 12 photos', type: 'project' },
      { id: '10', title: 'Downtown Office Complex', subtitle: '60% complete • 28 photos', type: 'project' },
      { id: '11', title: 'Sunset Villa Renovation', subtitle: '40% complete • 15 photos', type: 'project' },
      { id: '13', title: 'Modern Loft Project', subtitle: '25% complete • 8 photos', type: 'project' },
      { id: '14', title: 'Family Home Addition', subtitle: '90% complete • 35 photos', type: 'project' },
    ],
    Notes: [
      { id: '15', title: 'Project Notes', subtitle: 'Oakridge Residence', type: 'note' },
      { id: '16', title: 'Construction Updates', subtitle: 'Downtown Office', type: 'note' },
      { id: '17', title: 'Site Inspection Report', subtitle: 'Sunset Villa', type: 'note' },
    ],
    Documents: [
      { id: '12', title: 'Building Permit #2024-001', subtitle: 'Oakridge Residence • Approved', type: 'document' },
      { id: '13', title: 'Contract Amendment', subtitle: 'Downtown Office • Signed', type: 'document' },
      { id: '14', title: 'Material Invoice #INV-456', subtitle: 'Sunset Villa • $12,450', type: 'document' },
      { id: '15', title: 'Safety Inspection Report', subtitle: 'Modern Loft • Passed', type: 'document' },
      { id: '16', title: 'Change Order #CO-789', subtitle: 'Family Home • Pending', type: 'document' },
      { id: '17', title: 'Final Certificate', subtitle: 'Historic Building • Issued', type: 'document' },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 16, 32) }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <ChevronRight size={24} color="#1E293B" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Stuff</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {myStuffCategories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {selectedCategory === 'To-dos' && (
          <View style={styles.todosContainer}>
            {myStuffData[selectedCategory].map((item) => (
              <TouchableOpacity key={item.id} style={styles.todoItem}>
                <View style={styles.todoCheckbox}>
                  <Text style={styles.todoCheckboxText}>
                    {item.type === 'checklist' ? '📋' : ''}
                  </Text>
                </View>
                <View style={styles.todoContent}>
                  <Text style={styles.todoTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.todoSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
                {item.type === 'checklist' && (
                  <View style={styles.progressIndicator}>
                    <Text style={styles.progressText}>→</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedCategory === 'Photos' && (
          <View style={styles.photosGrid}>
            {myStuffData[selectedCategory].map((item) => (
              <TouchableOpacity key={item.id} style={styles.photoGridItem}>
                <View style={styles.photoPlaceholder} />
                <View style={styles.photoOverlay}>
                  <Text style={styles.photoTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.photoSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {(selectedCategory === 'Projects' || selectedCategory === 'Documents' || selectedCategory === 'Notes') && (
          <View style={styles.listContainer}>
            {myStuffData[selectedCategory].map((item) => (
              <TouchableOpacity key={item.id} style={styles.listItem}>
                <View style={styles.listIcon}>
                  <Text style={styles.listIconText}>
                    {item.type === 'project' ? '🏗️' : item.type === 'note' ? '📝' : '📄'}
                  </Text>
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.listSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
                <ChevronRight size={20} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
  },
  placeholder: {
    width: 44,
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
  },
  categoryScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  categoryButtonActive: {
    backgroundColor: '#64748B',
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  todosContainer: {
    gap: 8,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  todoCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoCheckboxText: {
    fontSize: 16,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 2,
  },
  todoSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  progressIndicator: {
    marginLeft: 8,
  },
  progressText: {
    fontSize: 16,
    color: '#64748B',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoGridItem: {
    width: '48%',
    aspectRatio: 1,
    position: 'relative',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
  },
  photoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  photoTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 2,
  },
  photoSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listIconText: {
    fontSize: 18,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 2,
  },
  listSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
}); 