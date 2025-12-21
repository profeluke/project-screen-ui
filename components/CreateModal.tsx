import React, { useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Upload, CheckSquare, CreditCard, FileText, List, Wand2, Briefcase, FolderPlus, Sparkles, AudioLines, BarChart3, Send } from 'lucide-react-native';

interface CreateModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateModal({ visible, onClose }: CreateModalProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['80%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={onClose}
      />
    ),
    [onClose]
  );

  const horizontalActions = [
    { id: 'upload', label: 'Upload', icon: Upload, color: '#3B82F6' },
    { id: 'task', label: 'Task', icon: CheckSquare, color: '#10B981' },
    { id: 'payment', label: 'Collect', icon: CreditCard, color: '#F59E0B' },
    { id: 'document', label: 'New Page', icon: FileText, color: '#8B5CF6' },
    { id: 'checklist', label: 'New Checklist', icon: List, color: '#EF4444' },
  ];

  const verticalActions = [
    { id: 'project', label: 'Create Project', icon: FolderPlus, color: '#3B82F6' },
    { id: 'portfolio', label: 'Build Your Portfolio', icon: Briefcase, color: '#10B981' },
    { id: 'walkthrough', label: 'AI Walkthrough', icon: Wand2, color: '#F59E0B' },
  ];

  const handleActionPress = (actionId: string) => {
    console.log(`${actionId} pressed`);
    // TODO: Handle different actions
    onClose();
  };

  const handleAIChatPress = () => {
    console.log('AI chat pressed');
    // TODO: Handle AI chat
  };

  const handleAudioPress = () => {
    console.log('Audio button pressed');
    // TODO: Handle audio recording
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.bottomSheetBackground}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
      >
        <BottomSheetView style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create</Text>
            <Text style={styles.headerSubtitle}>What would you like to create?</Text>
          </View>

          {/* Vertical Actions */}
          <View style={styles.verticalActionsContainer}>
            {verticalActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={styles.verticalActionItem}
                  onPress={() => handleActionPress(action.id)}
                >
                  <View style={[styles.verticalActionIcon, { backgroundColor: action.color }]}>
                    <IconComponent size={24} color="white" />
                  </View>
                  <Text style={styles.verticalActionLabel}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Horizontal Actions */}
          <View style={styles.horizontalActionsContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalActionsScroll}
            >
              {horizontalActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.horizontalActionItem}
                    onPress={() => handleActionPress(action.id)}
                  >
                    <View style={[styles.horizontalActionIcon, { backgroundColor: action.color }]}>
                      <IconComponent size={20} color="white" />
                    </View>
                    <Text style={styles.horizontalActionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* AI Chat Bar */}
          <View style={styles.aiChatContainer}>
            <TouchableOpacity style={styles.aiChatBar} onPress={handleAIChatPress}>
              <View style={styles.aiChatContent}>
                <View style={styles.aiChatTop}>
                  <Text style={styles.aiChatText}>Tell AI to do things</Text>
                  <TouchableOpacity style={styles.audioButton} onPress={handleAudioPress}>
                    <AudioLines size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
                <View style={styles.aiChatBottom}>
                  <View style={styles.aiChatExamples}>
                    <TouchableOpacity style={styles.exampleChip} onPress={() => handleActionPress('report')}>
                      <BarChart3 size={12} color="#94A3B8" />
                      <Text style={styles.exampleChipText}>Make a report</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.exampleChip} onPress={() => handleActionPress('task')}>
                      <CheckSquare size={12} color="#94A3B8" />
                      <Text style={styles.exampleChipText}>New task</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.exampleChip} onPress={() => handleActionPress('invoice')}>
                      <Send size={12} color="#94A3B8" />
                      <Text style={styles.exampleChipText}>Send an invoice</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
  },
  verticalActionsContainer: {
    flex: 1,
    gap: 16,
    marginBottom: 32,
  },
  verticalActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  verticalActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  verticalActionLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
    flex: 1,
  },
  horizontalActionsContainer: {
    marginBottom: 20,
  },
  horizontalActionsScroll: {
    paddingHorizontal: 4,
    gap: 4,
  },
  horizontalActionItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  horizontalActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  horizontalActionLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 80,
  },
  handleIndicator: {
    backgroundColor: '#CBD5E1',
    width: 40,
  },
  bottomSheetBackground: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  aiChatContainer: {
    paddingBottom: 32,
  },
  aiChatBar: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 120,
  },
  aiChatContent: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 80,
  },
  aiChatTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  aiChatText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#94A3B8',
  },
  aiChatBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  aiChatExamples: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    flexWrap: 'nowrap',
  },
  exampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exampleChipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#94A3B8',
  },
  exampleText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
  },
  exampleDivider: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#CBD5E1',
  },
  audioButton: {
    padding: 4,
  },
}); 