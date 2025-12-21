import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { 
  BottomSheetView, 
  BottomSheetBackdrop,
  BottomSheetBackdropProps 
} from '@gorhom/bottom-sheet';
import { MessageCircle, FileText, CheckSquare, X, Mic } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface VoiceOptionsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: 'conversation' | 'notes' | 'checklist') => void;
}

export default function VoiceOptionsBottomSheet({ 
  visible, 
  onClose, 
  onSelectOption 
}: VoiceOptionsBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleOptionPress = (option: 'conversation' | 'notes' | 'checklist') => {
    onSelectOption(option);
    onClose();
  };

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  // Expand when visible
  useEffect(() => {
    if (visible) {
      // Delay to ensure mount before expand
      requestAnimationFrame(() => {
        bottomSheetRef.current?.expand();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={['55%']}
      backdropComponent={renderBackdrop}
      onClose={onClose}
      enablePanDownToClose={true}
      style={styles.bottomSheet}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={[styles.container, { paddingBottom: Math.max(insets.bottom, 32) }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Voice Recording Options</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsContainer}>
          {/* Option 1: Record Conversation */}
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => handleOptionPress('conversation')}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#EEF2FF' }]}>
              <MessageCircle size={24} color="#4F46E5" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Record Conversation</Text>
              <Text style={styles.optionDescription}>
                Record a conversation and get organized notes and to-dos for your project
              </Text>
            </View>
            <View style={styles.optionArrow}>
              <Mic size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>

          {/* Option 2: Speak Notes */}
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => handleOptionPress('notes')}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#F0FDF4' }]}>
              <FileText size={24} color="#059669" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Speak Notes</Text>
              <Text style={styles.optionDescription}>
                Just speak your notes and let AI organize them automatically
              </Text>
            </View>
            <View style={styles.optionArrow}>
              <Mic size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>

          {/* Option 3: Create Checklist */}
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => handleOptionPress('checklist')}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#FEF3C7' }]}>
              <CheckSquare size={24} color="#D97706" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Create Checklist</Text>
              <Text style={styles.optionDescription}>
                Create a checklist or punch list by speaking your items
              </Text>
            </View>
            <View style={styles.optionArrow}>
              <Mic size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Choose how you'd like to use voice recording for your project
          </Text>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
    zIndex: 10000, // Ensure it appears above FAB which has zIndex: 9999
  },
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#CBD5E1',
    width: 40,
  },
  container: {
    flex: 1,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    // Removed divider under header
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1E293B',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  optionsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  optionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  optionArrow: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
});