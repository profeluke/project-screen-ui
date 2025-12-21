import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { Mic, Sparkles } from 'lucide-react-native';
import { styles } from '../styles';
import { CapturedItem } from '../types';

interface TimelineProps {
  items: CapturedItem[];
  onPhotoPress: (photo: any) => void;
  onItemUpdate: (itemId: string, updates: Partial<CapturedItem>) => void;
  onItemDelete: (itemId: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ 
  items, 
  onPhotoPress, 
  onItemUpdate,
  onItemDelete 
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  // Group items for timeline display
  const getTimelineGroups = () => {
    const sortedItems = [...items].sort((a, b) => a.capturedAt - b.capturedAt);
    const groups: Array<{
      id: string;
      type: 'single' | 'photoGroup';
      items: CapturedItem[];
      timestamp: number;
    }> = [];

    let i = 0;
    while (i < sortedItems.length) {
      const item = sortedItems[i];
      
      if (item.type === 'photo') {
        const photoGroup = [item];
        let j = i + 1;
        
        // Collect consecutive photos within 1 minute
        while (j < sortedItems.length) {
          const nextItem = sortedItems[j];
          if (nextItem.type === 'photo' && 
              Math.abs(item.capturedAt - nextItem.capturedAt) <= 60000) {
            photoGroup.push(nextItem);
            j++;
          } else {
            break;
          }
        }
        
        groups.push({
          id: `group_${item.id}`,
          type: photoGroup.length > 1 ? 'photoGroup' : 'single',
          items: photoGroup,
          timestamp: item.capturedAt
        });
        
        i = j;
      } else {
        groups.push({
          id: `group_${item.id}`,
          type: 'single',
          items: [item],
          timestamp: item.capturedAt
        });
        i++;
      }
    }
    
    return groups;
  };

  const renderPhotoGroup = (items: CapturedItem[]) => {
    return (
      <View style={styles.photoGrid}>
        {items.map((photo) => (
          <TouchableOpacity
            key={photo.id}
            style={styles.timelinePhotoWrapper}
            onPress={() => onPhotoPress(photo)}
          >
            <Image
              source={{ uri: (photo as any).uri }}
              style={styles.timelinePhoto}
            />
            {(photo as any).isAnalyzing && (
              <View style={styles.timelinePhotoAnalyzingOverlay}>
                <ActivityIndicator size="small" color="#3B82F6" />
              </View>
            )}
            {(photo as any).aiDescription && (
              <View style={styles.timelinePhotoAnalyzedIndicator}>
                <Sparkles size={10} color="#3B82F6" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderNote = (item: CapturedItem) => {
    const isEditing = editingNoteId === item.id;
    
    if (isEditing) {
      return (
        <View style={styles.timelineNoteSeamless}>
          <TextInput
            style={styles.timelineNoteEditTextInputSeamless}
            value={editingNoteText}
            onChangeText={(text) => {
              setEditingNoteText(text);
              
              const bulletPoints = text
                .split('\n')
                .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
                .filter(line => line.length > 0);
              
              if (bulletPoints.length > 0) {
                onItemUpdate(item.id, { bulletPoints });
              } else {
                onItemDelete(item.id);
                setEditingNoteId(null);
                setEditingNoteText('');
              }
            }}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Enter') {
                setEditingNoteText(editingNoteText + '\n• ');
              }
            }}
            onBlur={() => {
              setEditingNoteId(null);
              setEditingNoteText('');
            }}
            multiline
            autoFocus
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => {
          setEditingNoteId(item.id);
          const bulletText = (item as any).bulletPoints
            .map((point: string) => `• ${point}`)
            .join('\n');
          setEditingNoteText(bulletText);
        }}
      >
        <View style={styles.timelineNote}>
          <View style={styles.bulletPointList}>
            {(item as any).bulletPoints.map((bulletPoint: string, index: number) => (
              <View key={index} style={styles.bulletPointItem}>
                <Text style={styles.bulletPointDot}>•</Text>
                <Text style={styles.bulletPointText}>{bulletPoint}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAudio = (item: CapturedItem) => {
    const isEditing = editingNoteId === item.id;
    
    if (isEditing) {
      return (
        <View style={styles.timelineNoteSeamless}>
          <View style={styles.audioEditingRow}>
            <Mic size={16} color="#64748B" style={styles.timelineNoteIcon} />
            <TextInput
              style={styles.timelineAudioEditTextInputSeamless}
              value={editingNoteText}
              onChangeText={(text) => {
                setEditingNoteText(text);
                
                if (text.trim()) {
                  onItemUpdate(item.id, { transcription: text.trim() });
                } else {
                  onItemDelete(item.id);
                  setEditingNoteId(null);
                  setEditingNoteText('');
                }
              }}
              onBlur={() => {
                setEditingNoteId(null);
                setEditingNoteText('');
              }}
              multiline
              autoFocus
            />
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => {
          setEditingNoteId(item.id);
          setEditingNoteText((item as any).transcription);
        }}
      >
        <View style={styles.timelineNote}>
          <Mic size={16} color="#64748B" style={styles.timelineNoteIcon} />
          <Text style={styles.timelineNoteText}>{(item as any).transcription}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const photoItems = items.filter(item => item.type === 'photo');
  
  if (photoItems.length === 0) return null;

  return (
    <View style={styles.timelineContainer}>
      {getTimelineGroups()
        .filter(group => group.items.every(item => item.type === 'photo'))
        .map(group => (
          <View key={group.id} style={styles.timelineGroup}>
            {group.type === 'photoGroup' ? (
              renderPhotoGroup(group.items)
            ) : group.items[0].type === 'photo' ? (
              <TouchableOpacity
                style={styles.timelineSinglePhotoWrapper}
                onPress={() => onPhotoPress(group.items[0])}
              >
                <Image
                  source={{ uri: (group.items[0] as any).uri }}
                  style={styles.timelineSinglePhoto}
                />
                {(group.items[0] as any).isAnalyzing && (
                  <View style={styles.timelinePhotoAnalyzingOverlay}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                  </View>
                )}
                {(group.items[0] as any).aiDescription && (
                  <View style={styles.timelinePhotoAnalyzedIndicator}>
                    <Sparkles size={12} color="#3B82F6" />
                  </View>
                )}
              </TouchableOpacity>
            ) : group.items[0].type === 'note' ? (
              renderNote(group.items[0])
            ) : group.items[0].type === 'audio' ? (
              renderAudio(group.items[0])
            ) : null}
          </View>
        ))}
    </View>
  );
}; 