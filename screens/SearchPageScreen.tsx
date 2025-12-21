import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import WavelengthAnimation from '../components/WavelengthAnimation';

interface SearchPageScreenProps {
  onClose: () => void;
}

interface JumpBackItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'project' | 'document' | 'checklist';
  timestamp: string;
}

const jumpBackItems: JumpBackItem[] = [
  { id: '1', title: 'Oakridge Residence', subtitle: 'Project', type: 'project', timestamp: '2m ago' },
  { id: '2', title: 'Safety Checklist', subtitle: 'Checklist', type: 'checklist', timestamp: '15m ago' },
  { id: '3', title: 'Material Invoice', subtitle: 'Document', type: 'document', timestamp: '1h ago' },
  { id: '4', title: 'Downtown Office', subtitle: 'Project', type: 'project', timestamp: '2h ago' },
  { id: '5', title: 'Contract Amendment', subtitle: 'Document', type: 'document', timestamp: '3h ago' },
  { id: '6', title: 'Final Walkthrough', subtitle: 'Checklist', type: 'checklist', timestamp: '1d ago' },
  { id: '7', title: 'Sunset Villa', subtitle: 'Project', type: 'project', timestamp: '2d ago' },
  { id: '8', title: 'Budget Report', subtitle: 'Document', type: 'document', timestamp: '3d ago' },
];

export default function SearchPageScreen({ onClose }: SearchPageScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'project':
        return '🏗️';
      case 'document':
        return '📄';
      case 'checklist':
        return '☑️';
      default:
        return '📁';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Search Field with Back Button */}
      <View style={styles.searchSection}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects, documents, and more..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <View style={styles.wavelengthContainer}>
            <WavelengthAnimation />
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Jump Back In Section */}
        <View style={styles.jumpBackSection}>
          <Text style={styles.sectionTitle}>Jump Back In</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.jumpBackScroll}
          >
            {jumpBackItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.jumpBackItem}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemIcon}>{getItemIcon(item.type)}</Text>
                  <Text style={styles.itemTimestamp}>{item.timestamp}</Text>
                </View>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.itemSubtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Additional spacing for content */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  wavelengthContainer: {
    marginLeft: 12,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  jumpBackSection: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  jumpBackScroll: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  jumpBackItem: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemIcon: {
    fontSize: 16,
  },
  itemTimestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#94A3B8',
  },
  itemTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  bottomPadding: {
    height: 80,
  },
}); 