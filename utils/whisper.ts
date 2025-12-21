import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

/**
 * Transcribe audio using OpenAI's Whisper API.
 * @param audioUri The local URI of the audio file.
 * @returns The transcribed text as a string, or null if an error occurs.
 */
export async function transcribeWithWhisper(audioUri: string): Promise<string | null> {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.error('OpenAI API key is not configured');
    Alert.alert(
      'API Key Missing', 
      'OpenAI API key is not configured.\n\nTo enable audio transcription:\n1. Create a .env file in the project root\n2. Add: EXPO_PUBLIC_OPENAI_API_KEY=your_api_key\n3. Get your key from: platform.openai.com/api-keys\n4. Restart the Expo server',
      [{ text: 'OK' }]
    );
    return null;
  }

  try {
    // Log the audio URI for debugging
    console.log('Audio URI:', audioUri);
    
    // Get file info to determine the actual format
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    console.log('File info:', fileInfo);
    
    if (!fileInfo.exists) {
      throw new Error('Audio file does not exist');
    }
    
    if (fileInfo.size < 100) {
      throw new Error(`Audio file is too small (${fileInfo.size} bytes). Recording may have failed.`);
    }
    
    console.log('Uploading audio to Whisper API...');
    
    // Use FileSystem.uploadAsync which properly handles multipart uploads in React Native
    const uploadUrl = 'https://api.openai.com/v1/audio/transcriptions';
    
    const uploadResult = await FileSystem.uploadAsync(uploadUrl, audioUri, {
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'file',
      mimeType: 'audio/m4a',
      parameters: {
        model: 'whisper-1',
        response_format: 'json',
      },
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    });
    
    console.log('Upload response status:', uploadResult.status);
    
    if (uploadResult.status !== 200 && uploadResult.status !== 201) {
      const errorData = JSON.parse(uploadResult.body);
      console.error('Whisper API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to transcribe audio.');
    }
    
    const data = JSON.parse(uploadResult.body);
    
    console.log('Transcription successful');
    return data.text || 'No transcription available.';
  } catch (error) {
    console.error('Error in transcribeWithWhisper:', error);
    Alert.alert('Transcription Error', 'Could not transcribe the audio. Please try again.');
    return null;
  }
} 