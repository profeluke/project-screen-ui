import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { 
  BottomSheetView, 
  BottomSheetBackdrop,
  BottomSheetBackdropProps 
} from '@gorhom/bottom-sheet';
import { Mic, FileText, CheckSquare, MessageCircle, X, Image as ImageIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CamAIIcon from './CamAIIcon';

interface ProjectMagicAIBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: 'conversation' | 'notes' | 'checklist') => void;
}

const ProjectMagicAIBottomSheet: React.FC<ProjectMagicAIBottomSheetProps> = ({
  visible,
  onClose,
  onSelectOption,
}) => {
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
    } else {
      // Close when not visible
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={['100%']}
      backdropComponent={renderBackdrop}
      onClose={onClose}
      enablePanDownToClose={true}
      style={styles.bottomSheet}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      containerStyle={{ zIndex: 99999 }}
    >
      <BottomSheetView style={[styles.container, { paddingBottom: Math.max(insets.bottom, 32) }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Magic AI</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Record Conversation */}
          <TouchableOpacity style={styles.option} onPress={() => handleOptionPress('conversation')}>
            <View style={[styles.iconContainer, styles.conversationIcon]}>
              <MessageCircle size={24} color="#1E293B" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Record Conversation</Text>
              <Text style={styles.optionSubtitle}>Record a conversation and get organized notes and to-dos for your project</Text>
            </View>
          </TouchableOpacity>

          {/* Speak Notes */}
          <TouchableOpacity style={styles.option} onPress={() => handleOptionPress('notes')}>
            <View style={[styles.iconContainer, styles.notesIcon]}>
              <FileText size={24} color="#1E293B" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Speak Notes</Text>
              <Text style={styles.optionSubtitle}>Just speak your notes and let AI organize them automatically</Text>
            </View>
          </TouchableOpacity>

          {/* Create Checklist */}
          <TouchableOpacity style={styles.option} onPress={() => handleOptionPress('checklist')}>
            <View style={[styles.iconContainer, styles.checklistIcon]}>
              <CheckSquare size={24} color="#1E293B" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Create Checklist</Text>
              <Text style={styles.optionSubtitle}>Create a checklist or punch list by speaking your items</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* AI Input Container - Single rectangular container */}
        <View style={styles.aiInputContainer}>
          <View style={styles.aiInputField}>
            {/* Suggestion pills at top */}
            <View style={styles.aiSuggestionsContainer}>
              <TouchableOpacity style={styles.aiSuggestion} activeOpacity={0.7}>
                <FileText size={16} color="#7C3AED" />
                <Text style={styles.aiSuggestionText}>Build an invoice</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.aiSuggestion} activeOpacity={0.7}>
                <ImageIcon size={16} color="#7C3AED" />
                <Text style={styles.aiSuggestionText}>Send a photo report</Text>
              </TouchableOpacity>
            </View>
            
            {/* AI input row at bottom */}
            <View style={styles.aiInputRow}>
              <CamAIIcon size={20} glyphColor="#7C3AED" />
              <Text style={styles.altSearchText}>Ask AI anything...</Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => handleOptionPress('conversation')}>
                <Mic size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 50,
    zIndex: 99999,
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
    justifyContent: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
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
  content: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  conversationIcon: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  notesIcon: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
  },
  checklistIcon: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#64748B',
    lineHeight: 20,
  },
  // AI Input Container styles - Complete container from ProjectDetailScreen
  aiInputContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: 16,
  },
  aiInputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
    borderRadius: 14,
    padding: 16,
  },
  aiSuggestionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  aiSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F0FF',
    borderRadius: 14,
  },
  aiSuggestionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#7C3AED',
  },
  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
    paddingTop: 4,
    gap: 10,
  },
  altSearchText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
  },
});

export default ProjectMagicAIBottomSheet;
