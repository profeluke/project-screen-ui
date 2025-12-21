import React from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type NotesScreenProps = {
  onClose: () => void;
};

export default function NotesScreen({ onClose }: NotesScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={[styles.headerRow, { paddingTop: Math.max(insets.top, 12) }]}>
        <Text style={styles.title}>Notes</Text>
        <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>Your notes will appear here</Text>
        <Text style={styles.placeholderBody}>
          Add voice notes, typed notes, or re-run prompts. This is a simple placeholder screen.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1E293B',
  },
  doneBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  doneText: {
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    fontSize: 14,
  },
  placeholderCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  placeholderTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 6,
  },
  placeholderBody: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});


