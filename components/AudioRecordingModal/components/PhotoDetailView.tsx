import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import { styles } from '../styles';

interface PhotoDetailViewProps {
  photo: {
    uri: string;
    isAnalyzing?: boolean;
    aiDescription?: string;
  };
  onBack: () => void;
}

export const PhotoDetailView: React.FC<PhotoDetailViewProps> = ({ photo, onBack }) => {
  return (
    <View style={styles.photoDetailContainer}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <ChevronLeft size={24} color="#1E293B" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Image source={{ uri: photo.uri }} style={styles.photoDetailImage} />
      <View style={styles.photoDetailContent}>
        <Text style={styles.photoDetailTitle}>AI Analysis</Text>
        {photo.isAnalyzing ? (
          <View style={styles.analyzingContent}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.analyzingText}>Analyzing...</Text>
          </View>
        ) : (
          <ScrollView>
            <Text style={styles.photoDetailDescription}>
              {photo.aiDescription || 'No description available.'}
            </Text>
          </ScrollView>
        )}
      </View>
    </View>
  );
}; 