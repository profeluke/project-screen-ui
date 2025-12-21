import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, Dimensions, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LineSquiggle, Tag, CheckSquare, AtSign, Share, Sparkles, AudioLines } from 'lucide-react-native';
import CamAIIcon from '../components/CamAIIcon';
import WavelengthAnimation from '../components/WavelengthAnimation';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PhotoDetailScreenProps {
  photoUri: string;
  onClose: () => void;
  onEdit?: () => void;
  onTag?: () => void;
  onCreateTask?: () => void;
  onMention?: () => void;
  onShare?: () => void;
  onAskAI?: () => void;
  onStartRecording?: () => void;
  onStopRecording?: (callback: (transcription: string) => void) => void;
  onSaveNotes?: (notes: string) => void;
  isRecording?: boolean;
  isProcessing?: boolean;
  aiDescription?: string;
  initialNotes?: string;
}

const PhotoDetailScreen = ({
  photoUri,
  onClose,
  onEdit,
  onTag,
  onCreateTask,
  onMention,
  onShare,
  onAskAI,
  onStartRecording,
  onStopRecording,
  onSaveNotes,
  isRecording = false,
  isProcessing = false,
  aiDescription,
  initialNotes = ''
}: PhotoDetailScreenProps) => {
  const [photoNotes, setPhotoNotes] = useState(initialNotes);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleSpeakPress = () => {
    if (isRecording) {
      onStopRecording?.((transcription: string) => {
        setPhotoNotes(transcription);
      });
    } else {
      onStartRecording?.();
    }
  };

  const handleSaveNotes = () => {
    if (photoNotes.trim()) {
      onSaveNotes?.(photoNotes.trim());
    }
  };

  // Function to receive transcribed text (would be called from parent)
  const handleTranscriptionReceived = (transcription: string) => {
    setPhotoNotes(transcription);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      {/* Close button - outside KeyboardAvoidingView to maintain position */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 64,
          right: 20,
          zIndex: 10,
          backgroundColor: 'white',
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 24,
        }}
        onPress={onClose}
      >
        <Text style={{
          color: 'black',
          fontSize: 14,
          fontFamily: 'Inter-Bold'
        }}>Done</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >

      {/* Full screen photo */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 0, paddingVertical: 80 }}>
        <View style={{
          width: '100%',
          height: '100%',
          borderRadius: 24,
          overflow: 'hidden',
          backgroundColor: '#000'
        }}>
          <Image
            source={{ uri: photoUri }}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover'
            }}
          />
        </View>
      </View>

      {/* Photo Notes Field */}
      <View style={{
        position: 'absolute',
        bottom: 96,
        left: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 24,
        paddingLeft: 16,
        paddingRight: 8,
        paddingVertical: 12,
        minHeight: aiDescription ? 140 : 56,
        maxHeight: 200,
      }}>
          {/* AI Description at top if available */}
          {aiDescription && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 8,
              paddingBottom: 12,
              marginBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.2)',
            }}>
              <Sparkles size={16} color="#3B82F6" style={{ marginTop: 2 }} />
              <Text style={{
                flex: 1,
                fontFamily: 'Inter-Regular',
                fontSize: 13,
                color: '#CBD5E1',
                lineHeight: 18,
              }}>
                {aiDescription}
              </Text>
            </View>
          )}

          {/* User Notes Field */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <TextInput
              style={{
                flex: 1,
                fontFamily: 'Inter-Regular',
                fontSize: 14,
                color: '#1E293B',
                paddingVertical: 0,
                paddingLeft: 8,
                marginRight: 8,
                minHeight: 40,
              }}
              placeholder="Add your notes..."
              placeholderTextColor="#CBD5E1"
              value={photoNotes}
              onChangeText={setPhotoNotes}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSpeakPress}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
              }}
            >
              {isRecording ? (
                <WavelengthAnimation color="#FFFFFF" />
              ) : (
                <AudioLines
                  size={24}
                  color="#FFFFFF"
                />
              )}
            </TouchableOpacity>
          </View>
      </View>


      {/* Save Button - appears when input is focused or has text */}
      {(isInputFocused || photoNotes.trim()) && (
        <View style={{
          position: 'absolute',
          bottom: isInputFocused ? 320 : 100, // Higher when keyboard is open
          right: 20,
          zIndex: 10,
        }}>
          <TouchableOpacity
            onPress={handleSaveNotes}
            style={{
              backgroundColor: '#3B82F6',
              borderRadius: 25,
              paddingHorizontal: 20,
              paddingVertical: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
      </KeyboardAvoidingView>

      {/* Bottom button row - outside KeyboardAvoidingView for proper positioning */}
      <View style={{
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 20
      }}>
        {/* Left side buttons */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: 'rgba(0,0,0,0.6)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={onEdit}
          >
            <LineSquiggle size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: 'rgba(0,0,0,0.6)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={onTag}
          >
            <Tag size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: 'rgba(0,0,0,0.6)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={onCreateTask}
          >
            <CheckSquare size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: 'rgba(0,0,0,0.6)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={onMention}
          >
            <AtSign size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: 'rgba(0,0,0,0.6)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={onShare}
          >
            <Share size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Right side Ask AI button */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 25,
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 8
          }}
          onPress={onAskAI}
        >
          <CamAIIcon size={16} glyphColor="black" />
          <Text style={{ color: 'black', fontSize: 14, fontWeight: '600' }}>Ask AI</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PhotoDetailScreen;
