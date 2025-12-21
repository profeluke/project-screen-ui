import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckSquare, ChevronDown, Search as SearchIcon, X } from 'lucide-react-native';

type PhotosScreenProps = {
  onClose: () => void;
};

const PEOPLE = ['All', 'Sarah Anderson', 'Mike Johnson', 'Emily Chen', 'David Martinez', 'Lisa Thompson', 'James Wilson'];

const PHOTO_SOURCES = [
  require('../assets/images/thumb-warehouse.jpg'),
  require('../assets/images/thumb-family-home.jpg'),
  require('../assets/images/thumb-beach-house.jpg'),
  require('../assets/images/thumb-modern-loft.jpg'),
  require('../assets/images/thumb-downtown-office.jpg'),
  require('../assets/images/thumb-sunset-villa.jpg'),
  // Repeat to fill grid a bit more
  require('../assets/images/thumb-warehouse.jpg'),
  require('../assets/images/thumb-family-home.jpg'),
  require('../assets/images/thumb-beach-house.jpg'),
  require('../assets/images/thumb-modern-loft.jpg'),
  require('../assets/images/thumb-downtown-office.jpg'),
  require('../assets/images/thumb-sunset-villa.jpg'),
];

export default function PhotosScreen({ onClose }: PhotosScreenProps) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showPeoplePicker, setShowPeoplePicker] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string>('All');
  const [query, setQuery] = useState('');

  // Fake attribution for filtering by people (round-robin)
  const attributedPhotos = useMemo(() => {
    return PHOTO_SOURCES.map((src, idx) => ({
      id: idx,
      source: src,
      person: PEOPLE[(idx % (PEOPLE.length - 1)) + 1], // skip 'All'
      label: `photo_${idx + 1}`,
    }));
  }, []);

  const filteredPhotos = useMemo(() => {
    return attributedPhotos.filter(p => {
      const personOk = selectedPerson === 'All' || p.person === selectedPerson;
      const queryOk = query.trim().length === 0 || p.label.toLowerCase().includes(query.trim().toLowerCase());
      return personOk && queryOk;
    });
  }, [attributedPhotos, selectedPerson, query]);

  const toggleSelect = (id: number) => {
    if (!selectionMode) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const renderItem = ({ item }: { item: { id: number; source: any } }) => (
    <TouchableOpacity style={styles.photoWrap} activeOpacity={selectionMode ? 0.7 : 0.9} onPress={() => toggleSelect(item.id)}>
      <Image source={item.source} style={styles.photo} />
      {selectionMode && (
        <View style={[styles.selectBadge, selected.has(item.id) && styles.selectBadgeActive]}>
          <CheckSquare size={14} color={selected.has(item.id) ? '#FFFFFF' : '#94A3B8'} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      {/* Full-width Search */}
      <View style={styles.searchRow}>
        <SearchIcon size={16} color="#94A3B8" />
        <TextInput
          placeholder="Search your photos"
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearSearchBtn}>
            <X size={16} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Controls Row: People (left), Select (right) */}
      <View style={styles.topRow}>
        {/* People (left) */}
        <TouchableOpacity style={styles.topButton} onPress={() => setShowPeoplePicker(true)}>
          <Text style={styles.topButtonText}>{selectedPerson === 'All' ? 'People' : selectedPerson}</Text>
          <ChevronDown size={16} color="#64748B" />
        </TouchableOpacity>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Select photos (right) */}
        <TouchableOpacity style={[styles.topButton, selectionMode && styles.topButtonActive]} onPress={() => setSelectionMode(s => !s)}>
          <Text style={[styles.topButtonText, selectionMode && styles.topButtonTextActive]}>{selectionMode ? 'Selecting…' : 'Select photos'}</Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <FlatList
        data={filteredPhotos}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        renderItem={renderItem}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      />

      {/* People Picker */}
      <Modal visible={showPeoplePicker} transparent animationType="fade" onRequestClose={() => setShowPeoplePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Filter by People</Text>
            {PEOPLE.map(p => (
              <TouchableOpacity key={p} style={styles.modalOption} onPress={() => { setSelectedPerson(p); setShowPeoplePicker(false); }}>
                <Text style={[styles.modalOptionText, selectedPerson === p && styles.modalOptionTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowPeoplePicker(false)} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Close Button */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeText}>Done</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  topButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  topButtonActive: {
    backgroundColor: '#1E293B',
  },
  topButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  topButtonTextActive: {
    color: '#FFFFFF',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1E293B',
  },
  clearSearchBtn: {
    padding: 6,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  gridContent: {
    paddingBottom: 24,
  },
  photoWrap: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  selectBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectBadgeActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '90%',
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 10,
  },
  modalOptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#374151',
  },
  modalOptionTextActive: {
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  modalCloseBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  modalCloseText: {
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  closeBtn: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  closeText: {
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    fontSize: 14,
  },
});


