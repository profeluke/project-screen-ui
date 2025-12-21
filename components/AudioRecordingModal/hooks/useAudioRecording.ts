import { useState, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import { transcribeWithWhisper } from '../../../utils/whisper';

export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioPower, setAudioPower] = useState(0);
  
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const meeteringInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      // Start metering for audio levels
      meeteringInterval.current = setInterval(async () => {
        if (audioRecorder.isRecording) {
          try {
            // Simulate wavelength animation with random values
            const randomPower = Math.random() * 0.7 + 0.3;
            setAudioPower(randomPower * 30);
          } catch (error) {
            console.log('Metering not available');
          }
        }
      }, 100);
    } else {
      setAudioPower(0);
      if (meeteringInterval.current) {
        clearInterval(meeteringInterval.current);
        meeteringInterval.current = null;
      }
    }
    
    return () => {
      if (meeteringInterval.current) {
        clearInterval(meeteringInterval.current);
        meeteringInterval.current = null;
      }
    };
  }, [isRecording, audioRecorder]);

  const startRecording = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone access to record audio.');
        return false;
      }

      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Use HIGH_QUALITY preset which works across platforms
      await audioRecorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
      await audioRecorder.record();
      
      console.log('Recording started successfully');
      setIsRecording(true);
      return true;
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
      return false;
    }
  };

  const stopRecording = async () => {
    if (!audioRecorder.isRecording) return null;

    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      const duration = audioRecorder.getStatus()?.durationMillis 
        ? audioRecorder.getStatus().durationMillis / 1000 
        : 10;
      
      if (uri) {
        const transcription = await transcribeWithWhisper(uri);
        return { uri, duration, transcription };
      }
      
      return null;
    } catch (err) {
      console.error('Failed to stop recording:', err);
      Alert.alert('Error', 'Failed to stop recording.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isRecording,
    isProcessing,
    audioPower,
    startRecording,
    stopRecording,
  };
}; 