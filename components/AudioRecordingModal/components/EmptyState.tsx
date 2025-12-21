import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Camera, Mic, Sparkles } from 'lucide-react-native';
import { styles } from '../styles';

interface EmptyStateProps {
  onDismiss: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onDismiss }) => {
  return (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateCard}>
        <View style={styles.emptyStateContent}>
          <Text style={styles.emptyStateTitle}>Just take photos and talk</Text>
          <Text style={styles.emptyStateDescription}>
            Don't worry about the order. When you're done, we'll organize everything into editable notes and tasks.
          </Text>
          <View style={styles.emptyStateActions}>
            <View style={styles.emptyStateAction}>
              <Camera size={20} color="#6366F1" />
              <Text style={styles.emptyStateActionText}>Take photos</Text>
            </View>
            <View style={styles.emptyStateAction}>
              <Mic size={20} color="#6366F1" />
              <Text style={styles.emptyStateActionText}>Speak your thoughts</Text>
            </View>
            <View style={styles.emptyStateAction}>
              <Sparkles size={20} color="#6366F1" />
              <Text style={styles.emptyStateActionText}>We'll organize it all</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.emptyStateGotItButton}
            onPress={onDismiss}
          >
            <Text style={styles.emptyStateGotItButtonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}; 