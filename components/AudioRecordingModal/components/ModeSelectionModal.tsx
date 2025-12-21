import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X, FileText, ListChecks, CheckSquare, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../styles';

interface ModeOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  type?: string;
}

interface ModeSelectionModalProps {
  visible: boolean;
  currentMode: string;
  modes: ModeOption[];
  onSelectMode: (mode: string) => void;
  onClose: () => void;
}

export const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({
  visible,
  currentMode,
  modes,
  onSelectMode,
  onClose
}) => {
  const insets = useSafeAreaInsets();

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText size={20} color="#64748B" />;
      case 'ListChecks':
        return <ListChecks size={20} color="#64748B" />;
      case 'CheckSquare':
        return <CheckSquare size={20} color="#64748B" />;
      default:
        return <FileText size={20} color="#64748B" />;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
    >
      <View style={styles.modeSelectionModal}>
        <View style={[styles.modeSelectionHeader, { paddingTop: Math.max(insets.top + 16, 32) }]}>
          <Text style={styles.modeSelectionTitle}>Select Mode</Text>
          <TouchableOpacity
            style={styles.modeSelectionCloseButton}
            onPress={onClose}
          >
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modeSelectionContent}>
          <Text style={styles.modeSelectionSubtitle}>
            Choose how you want to capture and organize your session
          </Text>
          {modes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeOption,
                currentMode === mode.label && styles.modeOptionActive
              ]}
              onPress={() => {
                onSelectMode(mode.label);
                onClose();
              }}
            >
              <View style={styles.modeOptionIcon}>
                {renderIcon(mode.icon)}
              </View>
              <View style={styles.modeOptionContent}>
                <Text style={styles.modeOptionTitle}>{mode.label}</Text>
                <Text style={styles.modeOptionDescription}>{mode.description}</Text>
              </View>
              {currentMode === mode.label && (
                <View style={styles.modeOptionCheckIcon}>
                  <Check size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}; 