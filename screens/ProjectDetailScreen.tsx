import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Modal, FlatList, RefreshControl, Alert, ActivityIndicator, useWindowDimensions } from 'react-native';
 
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Contact, Plus, Camera, Sparkles, ScanText, AudioLines, DollarSign, Search, FileText, Mic, User, Check, CheckSquare, Trash2, MessageCircle, Clock, Phone, ChevronDown, Filter, Users, Settings, ImagePlus, Upload, Tag, Image as ImageIcon } from 'lucide-react-native';
import Shimmer from 'react-native-shimmer';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
// import AudioIcon from '../components/AudioIcon';
import CamAIIcon from '../components/CamAIIcon';
import Header from '../components/Header';
import ScanInterstitialScreen from './ScanInterstitialScreen';
import SearchCreateScreen from './SearchCreateScreen';
import SearchPageScreen from './SearchPageScreen';
import AudioRecordingModal, { AudioRecordingModalHandles } from '../components/AudioRecordingModal';
import VoiceOptionsBottomSheet from '../components/VoiceOptionsBottomSheet';
import ProjectMagicAIBottomSheet from '../components/ProjectMagicAIBottomSheet';
import PhotoUploadBottomSheet from '../components/PhotoUploadBottomSheet';
import CameraScreen from './CameraScreen';
import OrganizedNotesScreen from './OrganizedNotesScreen';
import { getAllNotes, deleteNote, formatNoteTimestamp, SavedNote, updateNote } from '../utils/noteStorage';
import PromptSelectionModal from '../components/PromptSelectionModal';
import { SavedPrompt } from '../utils/promptStorage';
import PaymentsScreen from './PaymentsScreen';
import ProjectManageScreen from './ProjectManageScreen';
import DocumentsScreen from './DocumentsScreen';
import PhotosScreen from './PhotosScreen';
import NotesScreen from './NotesScreen';
import ChatScreen from './ChatScreen';
import TodosScreen from './TodosScreen';
import EmptyTasksScreen from './EmptyTasksScreen';
import { getTasksByProject, toggleTaskComplete, deleteTask as deleteTaskFromStorage, Task } from '../utils/taskStorage';



// Sample activity data for the timeline
const sampleActivityData = [
  {
    id: '0a',
    type: 'photos',
    user: { name: 'Sarah Anderson', avatar: require('../assets/images/activity-sarah.jpg'), isYou: true },
    timestamp: new Date(Date.now() - 15 * 1000), // 15 seconds ago
    content: {
      photos: [
        require('../assets/images/thumb-warehouse.jpg'),
        require('../assets/images/thumb-family-home.jpg'),
        require('../assets/images/thumb-beach-house.jpg'),
        require('../assets/images/thumb-modern-loft.jpg')
      ]
    }
  },
  {
    id: '0',
    type: 'ai_recap',
    user: { name: 'Cam AI', avatar: 'sparkle', isYou: false },
    timestamp: new Date(Date.now() - 30 * 1000), // 30 seconds ago - end of today
    content: {
      title: 'Daily Recap',
      summary: 'Today was highly productive with successful electrical inspection completion, comprehensive documentation, and strong team coordination. All scheduled tasks were completed on time with quality results.',
      stats: [
        { count: 8, icon: 'camera' },
        { count: 3, icon: 'check' },
        { count: 1, icon: 'file' },
        { count: 2, icon: 'audio' }
      ]
    }
  },
  {
    id: '1',
    type: 'photos',
    user: { name: 'Sarah Anderson', avatar: require('../assets/images/activity-sarah.jpg'), isYou: true },
    timestamp: new Date(Date.now() - 4 * 60 * 1000), // 4 minutes ago
    content: {
      photos: [
        require('../assets/images/thumb-downtown-office.jpg'),
        require('../assets/images/thumb-sunset-villa.jpg'),
        require('../assets/images/thumb-modern-loft.jpg')
      ]
    }
  },
  {
    id: '2',
    type: 'audio',
    user: { name: 'Mike Johnson', avatar: require('../assets/images/activity-mike.jpg'), isYou: false },
    timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    content: {
      transcription: "Just finished the electrical inspection for the second floor. Everything looks good, but we need to schedule the drywall team for next week.",
      duration: 45
    }
  },
  {
    id: '3',
    type: 'document',
    user: { name: 'Emily Chen', avatar: require('../assets/images/activity-emily.jpg'), isYou: false },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    content: {
      title: 'Electrical Inspection Report',
      type: 'PDF'
    }
  },
  {
    id: '4',
    type: 'photos',
    user: { name: 'David Martinez', avatar: require('../assets/images/activity-david.jpg'), isYou: false },
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    content: {
      photos: [
        require('../assets/images/thumb-family-home.jpg'),
        require('../assets/images/thumb-warehouse.jpg'),
        require('../assets/images/thumb-beach-house.jpg'),
        require('../assets/images/thumb-modern-loft.jpg'),
        require('../assets/images/thumb-sunset-villa.jpg')
      ]
    }
  },
  {
    id: '5',
    type: 'audio',
    user: { name: 'Sarah Anderson', avatar: require('../assets/images/activity-sarah.jpg'), isYou: true },
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    content: {
      transcription: "Meeting with the client went well. They approved the kitchen layout changes and want to proceed with the premium tile option.",
      duration: 78
    }
  },

  {
    id: '6',
    type: 'section_header',
    sectionTitle: 'Yesterday',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
  },
  {
    id: '6b',
    type: 'ai_recap',
    user: { name: 'Cam AI', avatar: 'sparkle', isYou: false },
    timestamp: new Date(Date.now() - 24.5 * 60 * 60 * 1000), // End of yesterday (first item)
    content: {
      title: 'Daily Recap',
      summary: 'Yesterday focused on foundational work and preparation. The foundation inspection was completed successfully, site documentation was updated, and coordination with upcoming concrete work was finalized.',
      stats: [
        { count: 2, icon: 'camera' },
        { count: 2, icon: 'check' },
        { count: 1, icon: 'file' },
        { count: 1, icon: 'audio' }
      ]
    }
  },
  {
    id: '7',
    type: 'document',
    user: { name: 'Lisa Thompson', avatar: require('../assets/images/activity-lisa.jpg'), isYou: false },
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000), // Yesterday
    content: {
      title: 'Foundation Inspection Certificate',
      type: 'PDF'
    }
  },
  {
    id: '8',
    type: 'photos',
    user: { name: 'James Wilson', avatar: require('../assets/images/activity-james.jpg'), isYou: false },
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000), // Yesterday
    content: {
      photos: [
        require('../assets/images/thumb-downtown-office.jpg'),
        require('../assets/images/thumb-sunset-villa.jpg')
      ]
    }
  },
  {
    id: '9',
    type: 'audio',
    user: { name: 'Sarah Anderson', avatar: require('../assets/images/activity-sarah.jpg'), isYou: true },
    timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000), // Yesterday
    content: {
      transcription: "Coordinated with the concrete team for tomorrow's pour. Weather looks good and all materials are on site.",
            duration: 32
    }
  }
];
// Helper function to format relative time
const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInMinutes < 24 * 60) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else {
    // For times more than 24 hours, show actual time
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
};

interface ProjectDetailScreenProps {
  onClose: () => void;
}

export default function ProjectDetailScreen({ onClose }: ProjectDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const barWidth = Math.round(screenWidth * 0.84);
  const circleSize = Math.max(56, Math.round(screenWidth * 0.14));
  const iconSize = Math.round(circleSize * 0.44);
  const camAiLabelSize = Math.max(14, Math.min(18, Math.round(circleSize * 0.32)));
  const audioModalRef = useRef<AudioRecordingModalHandles>(null);
  const [showScanInterstitial, setShowScanInterstitial] = useState(false);
  const [showSearchScreen, setShowSearchScreen] = useState(false);
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Activity');
  
  // Notes-related state
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesRefreshing, setNotesRefreshing] = useState(false);
  const [selectedNote, setSelectedNote] = useState<SavedNote | null>(null);
  const [showRerunPromptSelection, setShowRerunPromptSelection] = useState(false);
  const [rerunNoteId, setRerunNoteId] = useState<string | null>(null);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [showPaymentsScreen, setShowPaymentsScreen] = useState(false);
  const [showOrganizedNotesFromAudio, setShowOrganizedNotesFromAudio] = useState(false);
  const [organizedNotesDataFromAudio, setOrganizedNotesDataFromAudio] = useState<{
    content: string;
    photos: Array<{ uri: string; timestamp?: number; aiDescription?: string; photoId?: string }>;
    tasks: Array<{ text: string; photoIds?: string[] }>;
    promptSent?: string;
  } | null>(null);
  const [showManageScreen, setShowManageScreen] = useState(false);
  const [showDocumentsScreen, setShowDocumentsScreen] = useState(false);
  const [showPhotosScreen, setShowPhotosScreen] = useState(false);
  const [showPhotoUploadOptions, setShowPhotoUploadOptions] = useState(false);
  const [showNotesScreen, setShowNotesScreen] = useState(false);
  const [showChatScreen, setShowChatScreen] = useState(false);
  const [showTodosScreen, setShowTodosScreen] = useState(false);
  const [showEmptyTasksScreen, setShowEmptyTasksScreen] = useState(false);
  const [showVoiceOptionsModal, setShowVoiceOptionsModal] = useState(false);
  const [hideFloatingActionBar, setHideFloatingActionBar] = useState(false);
  const [showShareActionsOnly, setShowShareActionsOnly] = useState(false);
  const [showBottomQuickActions, setShowBottomQuickActions] = useState(false);
  const [newness, setNewness] = useState<{ photos?: boolean; todos?: boolean; docs?: boolean; notes?: boolean; chat?: boolean; payments?: boolean }>({});
  const [ackTimestamps, setAckTimestamps] = useState<{ photos?: number; docs?: number; notes?: number; todos?: number; chat?: number; payments?: number }>({});
  const prevTasksCountRef = useRef<number | null>(null);
  
  // Tasks-related state
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksRefreshing, setTasksRefreshing] = useState(false);

  // Photo feed filter state
  const [selectedPhotoFilter, setSelectedPhotoFilter] = useState('All');
  const [showTakenByFilter, setShowTakenByFilter] = useState(false);
  const [showTagsFilter, setShowTagsFilter] = useState(false);
  const [selectedTakenBy, setSelectedTakenBy] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [showActivityEmptyState, setShowActivityEmptyState] = useState(false);
  const [showHeroOptions, setShowHeroOptions] = useState(false);



  // Photo filter options
  const photographers = ['All', 'Sarah Anderson', 'Mike Johnson', 'David Martinez', 'James Wilson'];
  const photoTags = ['All', 'Exterior', 'Interior', 'Framing', 'Electrical', 'Plumbing', 'Foundation', 'Roofing', 'Landscaping'];
  
  // Bottom sheet refs
  const takenByBottomSheetRef = useRef<BottomSheet>(null);
  const tagsBottomSheetRef = useRef<BottomSheet>(null);
  
  // Sample photo data with metadata
  const DAY_MS = 24 * 60 * 60 * 1000;
  const photoData = [
    // Today
    { id: '1', source: require('../assets/images/thumb-warehouse.jpg'), takenBy: 'Sarah Anderson', tags: ['Exterior', 'Foundation'], timestamp: new Date(Date.now() - 15 * 1000) },
    { id: '2', source: require('../assets/images/thumb-family-home.jpg'), takenBy: 'Sarah Anderson', tags: ['Interior', 'Electrical'], timestamp: new Date(Date.now() - 4 * 60 * 1000) },
    { id: '3', source: require('../assets/images/thumb-beach-house.jpg'), takenBy: 'Mike Johnson', tags: ['Exterior', 'Landscaping'], timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    // Yesterday
    { id: '4', source: require('../assets/images/thumb-modern-loft.jpg'), takenBy: 'Mike Johnson', tags: ['Interior', 'Framing'], timestamp: new Date(Date.now() - 1 * DAY_MS - 3 * 60 * 60 * 1000) },
    { id: '5', source: require('../assets/images/thumb-downtown-office.jpg'), takenBy: 'David Martinez', tags: ['Exterior', 'Roofing'], timestamp: new Date(Date.now() - 1 * DAY_MS - 5 * 60 * 60 * 1000) },
    // 2 days ago
    { id: '6', source: require('../assets/images/thumb-sunset-villa.jpg'), takenBy: 'David Martinez', tags: ['Interior', 'Plumbing'], timestamp: new Date(Date.now() - 2 * DAY_MS - 2 * 60 * 60 * 1000) },
    { id: '7', source: require('../assets/images/thumb-warehouse.jpg'), takenBy: 'James Wilson', tags: ['Exterior', 'Foundation'], timestamp: new Date(Date.now() - 2 * DAY_MS - 4 * 60 * 60 * 1000) },
    { id: '8', source: require('../assets/images/thumb-beach-house.jpg'), takenBy: 'James Wilson', tags: ['Interior', 'Electrical'], timestamp: new Date(Date.now() - 2 * DAY_MS - 6 * 60 * 60 * 1000) },
    // 3 days ago
    { id: '9', source: require('../assets/images/thumb-family-home.jpg'), takenBy: 'Sarah Anderson', tags: ['Exterior', 'Framing'], timestamp: new Date(Date.now() - 3 * DAY_MS - 1 * 60 * 60 * 1000) },
    { id: '10', source: require('../assets/images/thumb-modern-loft.jpg'), takenBy: 'Sarah Anderson', tags: ['Interior', 'Plumbing'], timestamp: new Date(Date.now() - 3 * DAY_MS - 5 * 60 * 60 * 1000) },
    // 4 days ago
    { id: '11', source: require('../assets/images/thumb-sunset-villa.jpg'), takenBy: 'Mike Johnson', tags: ['Exterior', 'Roofing'], timestamp: new Date(Date.now() - 4 * DAY_MS - 2 * 60 * 60 * 1000) },
    { id: '12', source: require('../assets/images/thumb-downtown-office.jpg'), takenBy: 'David Martinez', tags: ['Interior', 'Landscaping'], timestamp: new Date(Date.now() - 4 * DAY_MS - 7 * 60 * 60 * 1000) },
  ];

  const handleCreatePress = () => {
    console.log('Create pressed');
    // TODO: Open create modal
  };

  const handleCameraPress = () => {
    setShowCamera(true);
  };

  const handleAudioPress = () => {
    setHideFloatingActionBar(true);
    setShowVoiceOptionsModal(true);
  };

  const handleVoiceOptionSelect = (option: 'conversation' | 'notes' | 'checklist') => {
    // For now, all options will open the audio modal
    // In the future, you could implement different behaviors for each option
    setShowAudioModal(true);
    setShowVoiceOptionsModal(false);
    setHideFloatingActionBar(false);
  };

  const handleSearchPress = () => {
    setShowSearchPage(true);
  };

  const handleOpenOrganizedNotesFromAudio = (data: {
    content: string;
    photos: Array<{ uri: string; timestamp?: number; aiDescription?: string; photoId?: string }>;
    tasks: Array<{ text: string; photoIds?: string[] }>;
    promptSent?: string;
  }) => {
    setOrganizedNotesDataFromAudio(data);
    setShowOrganizedNotesFromAudio(true);
  };

  const handleCloseOrganizedNotesFromAudio = () => {
    setShowOrganizedNotesFromAudio(false);
    setOrganizedNotesDataFromAudio(null);
  };

  const handleManagePress = () => {
    setShowManageScreen(true);
  };

  const handleStarPress = () => {
    setHideFloatingActionBar(!hideFloatingActionBar);
  };

  // Bottom sheet backdrop render functions
  const renderTakenByBackdrop = useCallback(
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

  const renderTagsBackdrop = useCallback(
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

  // Bottom sheet handlers
  const handleTakenByPress = () => {
    setShowTakenByFilter(true);
    takenByBottomSheetRef.current?.expand();
  };

  const handleTagsPress = () => {
    setShowTagsFilter(true);
    tagsBottomSheetRef.current?.expand();
  };

  const handleTakenByClose = () => {
    setShowTakenByFilter(false);
    takenByBottomSheetRef.current?.close();
  };

  const handleTagsClose = () => {
    setShowTagsFilter(false);
    tagsBottomSheetRef.current?.close();
  };



  // Load tasks on mount and when organized notes close
  useEffect(() => {
    loadTasks();
  }, [showOrganizedNotesFromAudio]);

  const loadTasks = async () => {
    try {
      setTasksLoading(true);
      const tasks = await getTasksByProject('oak-ridge-residence');
      // Commented out automatic trigger - now using random selection only
      // if (prevTasksCountRef.current !== null && prevTasksCountRef.current !== tasks.length) {
      //   triggerNewness('todos');
      // }
      prevTasksCountRef.current = tasks.length;
      setProjectTasks(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setTasksLoading(false);
      setTasksRefreshing(false);
    }
  };

  const triggerNewness = (key: keyof typeof newness) => {
    setNewness(prev => ({ ...prev, [key]: true }));
  };

  const acknowledgeNewness = (key: keyof typeof newness) => {
    setNewness(prev => ({ ...prev, [key]: false }));
    setAckTimestamps(prev => ({ ...prev, [key]: Date.now() }));
  };

  const handleTaskToggle = async (taskId: string) => {
    try {
      await toggleTaskComplete(taskId);
      await loadTasks(); // Reload tasks
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTaskFromStorage(taskId);
              await loadTasks(); // Reload tasks
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          }
        }
      ]
    );
  };



  // Notes functions
  const loadNotes = async () => {
    try {
      setNotesLoading(true);
      const notes = await getAllNotes();
      setSavedNotes(notes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setNotesLoading(false);
      setNotesRefreshing(false);
    }
  };

  const handleNotesRefresh = () => {
    setNotesRefreshing(true);
    loadNotes();
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(noteId);
              await loadNotes(); // Reload the list
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          }
        }
      ]
    );
  };

  const getNotePreview = (content: string): string => {
    // Strip markdown formatting and extract meaningful content
    let cleanText = content
      // Remove headers (# ## ###)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold formatting (**text**)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove italic formatting (*text*)
      .replace(/\*(.*?)\*/g, '$1')
      // Remove bullet points and task markers
      .replace(/^[-•]\s+/gm, '')
      .replace(/^- \[ \]\s+/gm, '')
      // Remove extra whitespace and newlines
      .replace(/\n+/g, ' ')
      .trim();
    
    // Find the first substantial sentence or content
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const preview = sentences.length > 0 ? sentences[0].trim() : cleanText;
    
    // Limit length and add ellipsis if needed
    const maxLength = 120;
    return preview.length > maxLength ? preview.substring(0, maxLength).trim() + '...' : preview || 'No preview available';
  };

  const handleRerunWithPrompt = async (noteId: string) => {
    setRerunNoteId(noteId);
    setShowRerunPromptSelection(true);
  };

  const reprocessNoteWithPrompt = async (selectedPrompt: SavedPrompt) => {
    if (!rerunNoteId) return;
    
    try {
      setIsReprocessing(true);
      setShowRerunPromptSelection(false);
      
      // Find the note to reprocess
      const note = savedNotes.find(n => n.id === rerunNoteId);
      if (!note || !note.rawSessionData) {
        Alert.alert('Error', 'Cannot reprocess this note - raw session data not available');
        return;
      }

      const { photos, audioTranscriptions, textNotes } = note.rawSessionData;
      
      // Convert to chronological events for block processing
      const events: Array<{
        type: 'speech' | 'photo' | 'note';
        start?: number;
        end?: number;
        time?: number;
        text?: string;
        ai_desc?: string;
      }> = [];

      // Add audio segments as speech events
      audioTranscriptions.forEach((item: any) => {
        if (item.segments && item.segments.length > 0) {
          item.segments.forEach((segment: any) => {
            events.push({
              type: 'speech',
              start: segment.start,
              end: segment.end,
              text: segment.text.trim()
            });
          });
        } else {
          // Fallback to full transcription if no segments
          events.push({
            type: 'speech',
            start: 0,
            end: item.duration,
            text: item.transcription
          });
        }
      });

      // Add photos as photo events
      photos.forEach((photo: any) => {
        events.push({
          type: 'photo',
          time: photo.timestamp || 0, // Default to 0 if no timestamp
          ai_desc: `${photo.photoId}: ${photo.aiDescription || "Still analyzing this image..."}`
        });
      });

      // Add text notes
      textNotes.forEach((note: any) => {
        events.push({
          type: 'note',
          time: 0, // Default time for notes
          text: note.text
        });
      });

      // Sort events chronologically
      events.sort((a, b) => {
        const timeA = a.start !== undefined ? a.start : (a.time || 0);
        const timeB = b.start !== undefined ? b.start : (b.time || 0);
        return timeA - timeB;
      });

      // Create blocks from events using the same logic as the original
      const { timelineToBlocks } = await import('../utils/timelineToBlocks');
      const blocks = timelineToBlocks(events);
      
      let prompt = '';
      
      // Check if this is SessionSynthesizer prompt which needs different format
      if (selectedPrompt.name === 'SessionSynthesizer' || selectedPrompt.name === 'SessionSynthesizer Pro' || selectedPrompt.prompt.includes('session_events')) {
        // Convert to flat event array format for SessionSynthesizer
        const sessionEvents: any[] = [];
        
        // Add all events in chronological order
        events.forEach(event => {
          if (event.type === 'speech' && event.text) {
            sessionEvents.push({
              type: 'speech',
              t: event.start || 0,
              text: event.text
            });
          } else if (event.type === 'photo' && event.ai_desc) {
            // Extract photo ID from the description
            const photoIdMatch = event.ai_desc.match(/^(photo_\d+):/);
            const photoId = photoIdMatch ? photoIdMatch[1] : 'photo';
            const description = event.ai_desc.replace(/^photo_\d+:\s*/, '');
            
            sessionEvents.push({
              type: 'photo',
              t: event.time || 0,
              id: photoId,
              ai_desc: description
            });
          }
        });
        
        // Build the prompt with flat event format
        prompt = selectedPrompt.prompt.replace(
          '<session_events>',
          `session_events = ${JSON.stringify(sessionEvents, null, 2)}`
        );
      } else {
        // Use the existing block format for other prompts
        const formatTime = (seconds: number) => {
          const minutes = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return `${minutes}:${secs.toString().padStart(2, '0')}`;
        };

        prompt = `You are provided with a recorded session containing audio transcriptions and photos. Here is the chronologically organized data:

<session_blocks>`;

        blocks.forEach((block: any) => {
          if (block.speech) {
            // Speech block with potential photos
            const startTime = formatTime(block.start);
            const endTime = formatTime(block.end);
            prompt += `
<speech_block>
  <timestamp_start>${startTime}</timestamp_start>
  <timestamp_end>${endTime}</timestamp_end>
  <user_speech>${block.speech}</user_speech>`;
            
            if (block.photos.length > 0) {
              prompt += `
  <photos_during_speech>`;
              block.photos.forEach((photo: any) => {
                const photoTime = formatTime(photo.time);
                prompt += `
    <photo>
      <timestamp>${photoTime}</timestamp>
      <ai_description>${photo.ai_desc}</ai_description>
    </photo>`;
              });
              prompt += `
  </photos_during_speech>`;
            }
            
            prompt += `
</speech_block>
`;
          } else {
            // Standalone photo block
            block.photos.forEach((photo: any) => {
              const photoTime = formatTime(photo.time);
              prompt += `
<photo_block>
  <timestamp>${photoTime}</timestamp>
  <ai_description>${photo.ai_desc}</ai_description>
</photo_block>
`;
            });
          }
        });

        prompt += `
</session_blocks>

${selectedPrompt.prompt}`;
      }

      // Call OpenAI API
      const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!OPENAI_API_KEY) {
        Alert.alert('API Key Missing', 'OpenAI API key is not configured. Please set it in your .env file.');
        setIsReprocessing(false);
        return;
      }
      
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI assistant specialized in organizing notes and extracting actionable insights from voice recordings and photos. You excel at understanding context, prioritizing spoken content over visual information, and creating comprehensive, well-structured documentation.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        })
      });
      
      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json();
        throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const openaiData = await openaiResponse.json();
      const fullResponse = openaiData.choices[0]?.message?.content || "Failed to generate organized notes";
      
      // Extract title from the response
      const titleMatch = fullResponse.match(/## Title\s*\n(.*?)\n/);
      const extractedTitle = titleMatch?.[1]?.trim() || "Reprocessed Session Notes";
      
      // Extract the notes section (everything after ## Notes)
      const notesMatch = fullResponse.match(/## Notes([\s\S]*?)(?=## Tasks|$)/);
      const organizedContent = notesMatch?.[1]?.trim() || fullResponse;
      
      // Extract tasks from the full response
      const taskMatches = fullResponse.match(/- \[ \] .+/g) || [];
      
      const tasks = taskMatches.map((task: string) => {
        const taskText = task.replace('- [ ] ', '').trim();
        
        // Since we're no longer including photo IDs in the output,
        // we can simplify this to just return the clean task text
        return {
          text: taskText,
          photoIds: undefined
        };
      });

      // Update the note with new results
      await updateNote(rerunNoteId, {
        title: extractedTitle,
        content: organizedContent,
        tasks: tasks,
        promptSent: prompt,
        promptId: selectedPrompt.id,
      });

      // Reload notes and update UI
      await loadNotes();
      
      // Update the currently selected note if it's the one we just reprocessed
      if (selectedNote && selectedNote.id === rerunNoteId) {
        // Get the fresh notes list after reload
        const freshNotes = await getAllNotes();
        const updatedNote = freshNotes.find(n => n.id === rerunNoteId);
        if (updatedNote) {
          setSelectedNote(updatedNote);
        }
      }

      Alert.alert(
        'Reprocessing Complete!',
        `Your note has been reprocessed with the "${selectedPrompt.name}" prompt.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error reprocessing note:', error);
      Alert.alert(
        'Error',
        'Failed to reprocess note. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsReprocessing(false);
      setRerunNoteId(null);
    }
  };

  const renderNoteItem = ({ item }: { item: SavedNote }) => (
    <TouchableOpacity 
      style={styles.noteItem}
      onPress={() => setSelectedNote(item)}
    >
      <View style={styles.noteContent}>
        <Text style={styles.noteTitle}>{item.title}</Text>
        <Text style={styles.notePreview} numberOfLines={3} ellipsizeMode="tail">
          {getNotePreview(item.content)}
        </Text>
      </View>
      
      <View style={styles.noteFooter}>
        <View style={styles.noteStats}>
          {item.photos.length > 0 && (
            <View style={styles.statItem}>
              <Camera size={14} color="#64748B" />
              <Text style={styles.statText}>{item.photos.length} photos</Text>
            </View>
          )}
          {item.tasks.length > 0 && (
            <View style={styles.statItem}>
              <CheckSquare size={14} color="#64748B" />
              <Text style={styles.statText}>{item.tasks.length} tasks</Text>
            </View>
          )}
        </View>
        <Text style={styles.noteDate}>{formatNoteTimestamp(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );



    // Keep activity components minimal for potential future use

  const getFilteredPhotos = () => {
    let filteredPhotos = [...photoData];

    // Filter by photographer
    if (selectedTakenBy !== 'All') {
      filteredPhotos = filteredPhotos.filter(photo => photo.takenBy === selectedTakenBy);
    }

    // Filter by tag
    if (selectedTag !== 'All') {
      filteredPhotos = filteredPhotos.filter(photo => photo.tags.includes(selectedTag));
    }

    return filteredPhotos;
  };

  const getDateLabel = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const photoDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((today.getTime() - photoDay.getTime()) / (24 * 60 * 60 * 1000));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const groupPhotosByDate = (photos: typeof photoData) => {
    const groups: { label: string; photos: typeof photoData }[] = [];
    const map = new Map<string, typeof photoData>();

    for (const photo of photos) {
      const key = getDateLabel(photo.timestamp);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(photo);
    }

    map.forEach((photos, label) => groups.push({ label, photos }));
    return groups;
  };

  const renderPhotoFeed = () => {
    const filteredPhotos = getFilteredPhotos();
    const groups = groupPhotosByDate(filteredPhotos);

    return (
      <View style={styles.photoFeedContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.photoGridContent}
        >
          {filteredPhotos.length === 0 ? (
            <View style={styles.emptyPhotosContainer}>
              <ImageIcon size={48} color="#CBD5E1" />
              <Text style={styles.emptyPhotosText}>No photos match your filters</Text>
            </View>
          ) : (
            groups.map((group) => (
              <View key={group.label} style={styles.photoDateGroup}>
                <View style={styles.photoDateHeader}>
                  <Text style={styles.photoDateLabel}>{group.label}</Text>
                </View>
                <View style={styles.photoGrid}>
                  {group.photos.map((photo) => (
                    <TouchableOpacity key={photo.id} style={styles.photoGridItem} activeOpacity={0.9}>
                      <Image source={photo.source} style={styles.photoGridImage} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  };
  
  // Derived counts/timestamps for Quick Actions (second row)
  const totalPhotos = sampleActivityData.reduce((acc, item) => {
    if (item.type === 'photos' && Array.isArray(item.content?.photos)) {
      return acc + item.content.photos.length;
    }
    return acc;
  }, 0);
  const latestPhotoDate = (() => {
    const photoItems = sampleActivityData.filter(i => i.type === 'photos');
    if (photoItems.length === 0) return null;
    return photoItems.reduce((latest: Date, i: any) => (i.timestamp > latest ? i.timestamp : latest), photoItems[0].timestamp);
  })();
  const docsCount = sampleActivityData.filter(i => i.type === 'document').length;
  const latestDocumentDate = (() => {
    const docItems = sampleActivityData.filter(i => i.type === 'document');
    if (docItems.length === 0) return null;
    return docItems.reduce((latest: Date, i: any) => (i.timestamp > latest ? i.timestamp : latest), docItems[0].timestamp);
  })();
  const notesCount = savedNotes.length;
  const latestNoteDate = (() => {
    if (savedNotes.length === 0) return null;
    return new Date(Math.max(...savedNotes.map(n => n.timestamp)));
  })();
  const notesDisplayCount = notesCount > 0 ? notesCount : 5;
  const notesDisplayDate = latestNoteDate ?? new Date(Date.now() - 2 * 60 * 60 * 1000);

  // Commented out automatic triggers - now using random selection only
  // useEffect(() => {
  //   if (latestPhotoDate) {
  //     const minutes = (Date.now() - latestPhotoDate.getTime()) / 60000;
  //     if (minutes < 60 && (!ackTimestamps.photos || latestPhotoDate.getTime() > ackTimestamps.photos)) {
  //       triggerNewness('photos');
  //     }
  //   }
  // }, [latestPhotoDate?.getTime(), ackTimestamps.photos]);

  // useEffect(() => {
  //   if (latestDocumentDate) {
  //     const minutes = (Date.now() - latestDocumentDate.getTime()) / 60000;
  //     if (minutes < 60 && (!ackTimestamps.docs || latestDocumentDate.getTime() > ackTimestamps.docs)) {
  //       triggerNewness('docs');
  //     }
  //   }
  // }, [latestDocumentDate?.getTime(), ackTimestamps.docs]);

  // useEffect(() => {
  //   if (latestNoteDate) {
  //     if (!ackTimestamps.notes || latestNoteDate.getTime() > ackTimestamps.notes) {
  //       triggerNewness('notes');
  //     }
  //   }
  // }, [latestNoteDate?.getTime(), ackTimestamps.notes]);

  // Randomly select one item to highlight every time screen is opened
  useFocusEffect(
    React.useCallback(() => {
      // Reset all newness states first
      setNewness({});
      
      // Then set a random one after a brief delay to ensure state update
      setTimeout(() => {
        const items: Array<keyof typeof newness> = ['photos', 'todos', 'docs', 'notes', 'chat', 'payments'];
        const randomItem = items[Math.floor(Math.random() * items.length)];
        console.log('Random item selected for highlight:', randomItem);
        
        // Directly set the newness state instead of using triggerNewness
        setNewness({ [randomItem]: true });
        
        // Log the state to verify it's being set
        console.log('Setting newness state:', { [randomItem]: true });
      }, 100);
    }, [])
  );

  // Simple shimmer overlay component
  const Shimmer: React.FC<{ active: boolean }> = ({ active }) => {
    const progress = useSharedValue(0);
    useEffect(() => {
      if (active) {
        progress.value = 0;
        progress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) });
      }
    }, [active]);
    const style = useAnimatedStyle(() => {
      return { transform: [{ translateX: (-50 + 200 * progress.value) }] };
    });
    return (
      <Animated.View pointerEvents="none" style={[styles.shimmerWrap, style]}>
        <LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.65)", "rgba(255,255,255,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.shimmerGrad} />
      </Animated.View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Header 
        onBackPress={onClose} 
        onManagePress={handleManagePress} 
        onSharePress={() => setShowShareActionsOnly(prev => !prev)}
        onChatPress={() => { acknowledgeNewness('chat'); setShowChatScreen(true); }}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Project Header - left-justified layout */}
          {/* Top tags bar removed; labels now live in header */}

          <View style={styles.projectHeaderCentered}>
            {showActivityEmptyState ? (
              <TouchableOpacity style={styles.heroPlaceholder} onPress={() => setShowHeroOptions(true)}>
                <ImagePlus size={28} color="#94A3B8" />
              </TouchableOpacity>
            ) : (
              <Image
                source={require('../assets/images/hero-project.jpg')}
                style={styles.heroImage}
              />
            )}

            {/* Title and address centered */}
            <Text style={[styles.projectTitle, { textAlign: 'center' }]}>Oakridge Residence</Text>
            <Text style={[styles.projectAddress, { textAlign: 'center' }]}>1234 Maple Avenue, Beverly Hills, CA...</Text>

            {/* Contacts centered below address */}
            {!showActivityEmptyState && (
              <View style={[styles.contactsPillsRow, { alignSelf: 'center' }]}>
                <View style={styles.metaPillContact}>
                  <User size={14} color="#475569" />
                  <Text style={styles.metaPillText}>Sarah Anderson</Text>
                </View>
                <View style={styles.metaPillContact}>
                  <User size={14} color="#475569" />
                  <Text style={styles.metaPillText}>Bob Anderson</Text>
                </View>
              </View>
            )}
          </View>

          {/* Tags below hero removed in favor of top tags bar */}

          {/* Description removed */}
          {!showActivityEmptyState ? (
            <></>
          ) : (
            <View style={styles.contactPillsContainer}>
              <TouchableOpacity style={styles.contactPill} onPress={() => console.log('Contacts pressed')}>
                <Plus size={14} color="#64748B" />
                <Text style={styles.contactName}>Customer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Actions Grid */}
          {showShareActionsOnly ? (
            <View style={styles.quickActionsGrid}>
              <View style={styles.quickActionRow}>
                {/* To-Do's (left) */}
                <TouchableOpacity 
                  style={[styles.quickActionCardThird, newness.todos ? { borderColor: '#EF4444', borderWidth: 2 } : {}]} 
                  onPress={() => { 
                    acknowledgeNewness('todos'); 
                    if (showActivityEmptyState) { setShowEmptyTasksScreen(true); } else { setShowTodosScreen(true); }
                  }}
                  activeOpacity={0.9}
                >
                  {newness.todos && <Shimmer active={true} />}
                  <TouchableOpacity 
                    style={styles.quickActionAddButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      if (showActivityEmptyState) { setShowEmptyTasksScreen(true); } else { setShowTodosScreen(true); }
                    }}
                  >
                    <Plus size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  <View style={styles.quickActionIconOnly}>
                    <View style={[styles.quickActionIcon, { backgroundColor: '#FEE2E2' }]}> 
                      <CheckSquare size={20} color="#EF4444" />
                    </View>
                  </View>
                  <Text style={styles.quickActionPrimary}>To-Do's</Text>
                  {!showActivityEmptyState && (
                    <Text style={styles.quickActionSecondary}>
                      {newness.todos ? '1 new to-do' : `${projectTasks.filter(t => !t.completed).length} to-dos`}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Docs (center) */}
                <TouchableOpacity 
                  style={[styles.quickActionCardThird, newness.docs ? { borderColor: '#1F2937', borderWidth: 2 } : {}]}
                  onPress={() => { acknowledgeNewness('docs'); setShowDocumentsScreen(true); }}
                  activeOpacity={0.9}
                > 
                  {newness.docs && <Shimmer active={true} />}
                  <TouchableOpacity 
                    style={styles.quickActionAddButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      acknowledgeNewness('docs');
                      setShowDocumentsScreen(true);
                    }}
                  >
                    <Plus size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  <View style={styles.quickActionIconOnly}>
                    <View style={[styles.quickActionIcon, { backgroundColor: '#ECEFFB' }]}> 
                      <FileText size={20} color="#1F2937" />
                    </View>
                  </View>
                  <Text style={styles.quickActionPrimary}>Docs</Text>
                  {!showActivityEmptyState && (
                    <Text style={styles.quickActionSecondary}>
                      {newness.docs ? '1 new doc' : `${docsCount} docs`}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Payments (right) */}
                <TouchableOpacity 
                  style={[styles.quickActionCardThird, newness.payments ? { borderColor: '#059669', borderWidth: 2 } : {}]}
                  onPress={() => { acknowledgeNewness('payments'); setShowPaymentsScreen(true); }}
                  activeOpacity={0.9}
                > 
                  {newness.payments && <Shimmer active={true} />}
                  <TouchableOpacity 
                    style={styles.quickActionAddButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      acknowledgeNewness('payments');
                      setShowPaymentsScreen(true);
                    }}
                  >
                    <Plus size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  <View style={styles.quickActionIconOnly}>
                    <View style={[styles.quickActionIcon, { backgroundColor: '#D1FAE5' }]}> 
                      <DollarSign size={20} color="#059669" />
                    </View>
                  </View>
                  <Text style={styles.quickActionPrimary}>Payments</Text>
                  {!showActivityEmptyState && (
                    <Text style={styles.quickActionSecondary}>
                      {newness.payments ? '1 new payment' : '0 payments'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.quickActionsGrid}>
              {/* First row: To-Do's, Docs, Payments */}
              <View style={styles.quickActionRow}>
                {/* To-Do's (left) */}
                <TouchableOpacity 
                  style={[styles.quickActionCardThird, newness.todos ? { borderColor: '#EF4444', borderWidth: 2 } : {}]} 
                  onPress={() => { 
                    acknowledgeNewness('todos');
                    if (showActivityEmptyState) { setShowEmptyTasksScreen(true); } else { setShowTodosScreen(true); }
                  }}
                  activeOpacity={0.9}
                >
                  {newness.todos && <Shimmer active={true} />}
                  <TouchableOpacity 
                    style={styles.quickActionAddButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      if (showActivityEmptyState) { setShowEmptyTasksScreen(true); } else { setShowTodosScreen(true); }
                    }}
                  >
                    <Plus size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  <View style={styles.quickActionIconOnly}>
                    <View style={[styles.quickActionIcon, { backgroundColor: '#FEE2E2' }]}> 
                      <CheckSquare size={20} color="#EF4444" />
                    </View>
                    {/* Count moved to subtitle below title */}
                  </View>
                  <Text style={styles.quickActionPrimary}>To-Do's</Text>
                  {!showActivityEmptyState && (
                    <Text style={styles.quickActionSecondary}>
                      {newness.todos ? '1 new to-do' : `${projectTasks.filter(task => !task.completed).length} to-dos`}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Docs (center) */}
                <TouchableOpacity 
                  style={[styles.quickActionCardThird, newness.docs ? { borderColor: '#1F2937', borderWidth: 2 } : {}]}
                  onPress={() => { if (!showActivityEmptyState) { acknowledgeNewness('docs'); setShowDocumentsScreen(true); }}}
                  disabled={showActivityEmptyState}
                  activeOpacity={0.9}
                >
                  {newness.docs && <Shimmer active={true} />}
                  <TouchableOpacity 
                    style={styles.quickActionAddButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      acknowledgeNewness('docs');
                      setShowDocumentsScreen(true);
                    }}
                  >
                    <Plus size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  <View style={styles.quickActionIconOnly}>
                    <View style={[styles.quickActionIcon, { backgroundColor: '#ECEFFB' }]}> 
                      <FileText size={20} color="#1F2937" />
                    </View>
                  </View>
                  <Text style={styles.quickActionPrimary}>Docs</Text>
                  {!showActivityEmptyState && (
                    <Text style={styles.quickActionSecondary}>
                      {newness.docs ? '1 new doc' : `${docsCount} docs`}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Payments (right) */}
                <TouchableOpacity 
                  style={[styles.quickActionCardThird, newness.payments ? { borderColor: '#059669', borderWidth: 2 } : {}]}
                  onPress={() => { if (!showActivityEmptyState) { acknowledgeNewness('payments'); setShowPaymentsScreen(true); }}}
                  disabled={showActivityEmptyState}
                  activeOpacity={0.9}
                >
                  {newness.payments && <Shimmer active={true} />}
                  <TouchableOpacity 
                    style={styles.quickActionAddButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      acknowledgeNewness('payments');
                      setShowPaymentsScreen(true);
                    }}
                  >
                    <Plus size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  <View style={styles.quickActionIconOnly}>
                    <View style={[styles.quickActionIcon, { backgroundColor: '#D1FAE5' }]}> 
                      <DollarSign size={20} color="#059669" />
                    </View>
                  </View>
                  <Text style={styles.quickActionPrimary}>Payments</Text>
                  {!showActivityEmptyState && (
                    <Text style={styles.quickActionSecondary}>
                      {newness.payments ? '1 new payment' : '0 payments'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Second row: Photos, Notes, Chat */}
              {showBottomQuickActions && (
              <View style={styles.quickActionRow}>
                {/* Photos (left) */}
                <TouchableOpacity
                  style={[styles.quickActionCardThird, newness.photos ? { borderColor: '#7C3AED', borderWidth: 2 } : {}]}
                  onPress={() => { if (!showActivityEmptyState) { acknowledgeNewness('photos'); setShowPhotosScreen(true); }}}
                  disabled={showActivityEmptyState}
                  activeOpacity={0.9}
                >
                  {newness.photos && <Shimmer active={true} />}
                  <TouchableOpacity
                    style={styles.quickActionAddButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      acknowledgeNewness('photos');
                      setShowPhotosScreen(true);
                    }}
                  >
                    <Plus size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  <View style={styles.quickActionIconOnly}>
                    <View style={[styles.quickActionIcon, { backgroundColor: '#F3E8FF' }]}>
                      <Camera size={20} color="#7C3AED" />
                    </View>
                  </View>
                  <Text style={styles.quickActionPrimary}>Photos</Text>
                  {!showActivityEmptyState && (
                    <Text style={styles.quickActionSecondary}>
                      {newness.photos ? '1 new photo' : `${totalPhotos} photos`}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Notes (center) */}
                <TouchableOpacity
                  style={[styles.quickActionCardThird, newness.notes ? { borderColor: '#059669', borderWidth: 2 } : {}]}
                  onPress={() => { acknowledgeNewness('notes'); setShowNotesScreen(true); }}
                  activeOpacity={0.9}
                >
                  {newness.notes && <Shimmer active={true} />}
                  <TouchableOpacity
                    style={styles.quickActionAddButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      acknowledgeNewness('notes');
                      setShowNotesScreen(true);
                    }}
                  >
                    <Plus size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  <View style={styles.quickActionIconOnly}>
                    <View style={[styles.quickActionIcon, { backgroundColor: '#ECFDF5' }]}>
                      <FileText size={20} color="#059669" />
                    </View>
                  </View>
                  <Text style={styles.quickActionPrimary}>Notes</Text>
                  {!showActivityEmptyState && (
                    <Text style={styles.quickActionSecondary}>
                      {newness.notes ? '1 new note' : `${notesCount} notes`}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Chat (right) */}
                <TouchableOpacity
                  style={[styles.quickActionCardThird, newness.chat ? { borderColor: '#0891B2', borderWidth: 2 } : {}]}
                  onPress={() => { acknowledgeNewness('chat'); setShowChatScreen(true); }}
                  activeOpacity={0.9}
                >
                  {newness.chat && <Shimmer active={true} />}
                  <TouchableOpacity
                    style={styles.quickActionAddButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      acknowledgeNewness('chat');
                      setShowChatScreen(true);
                    }}
                  >
                    <Plus size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  <View style={styles.quickActionIconOnly}>
                    <View style={[styles.quickActionIcon, { backgroundColor: '#ECFEFF' }]}>
                      <MessageCircle size={20} color="#0891B2" />
                    </View>
                  </View>
                  <Text style={styles.quickActionPrimary}>Chat</Text>
                  {!showActivityEmptyState && (
                    <Text style={styles.quickActionSecondary}>
                      {newness.chat ? '1 new message' : 'Ask questions'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              )}
            </View>
          )}

          {/* AI Chat Bar - moved below Quick Actions */}
          <View
            style={[styles.altSearchBar, { 
              position: 'relative', 
              marginTop: 32, 
              marginBottom: 4, 
              alignSelf: 'stretch', 
              height: showActivityEmptyState ? 212 : 120,
              paddingTop: showActivityEmptyState ? 16 : 12
            }]}
          >
            {showActivityEmptyState ? (
              <>
                {/* Empty State - More descriptive AI assistant */}
                <View style={styles.aiEmptyStateHeader}>
                  <View style={styles.aiEmptyStateTitleRow}>
                    <CamAIIcon size={22} glyphColor="#7C3AED" />
                    <Text style={styles.aiEmptyStateTitle}>Cam AI (your project assistant)</Text>
                  </View>
                  <Text style={styles.aiEmptyStateSubtitle}>
                    I can see things you've added to the project. And I can also create tasks, build documents, and answer your questions. Let's get this job done!
                  </Text>
                </View>
                
                {/* Input field */}
                <View style={styles.aiInputField}>
                  <Text style={styles.aiInputPlaceholder}>What can I do for you...</Text>
                  <TouchableOpacity onPress={handleAudioPress}>
                    <Mic size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                {/* Rotating suggestions carousel */}
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.aiSuggestionsScrollContainer}
                  style={{ marginBottom: 12 }}
                >
                  <TouchableOpacity style={[styles.aiSuggestion, styles.aiSuggestionEmpty]} activeOpacity={0.7}>
                    <CheckSquare size={14} color="#7C3AED" />
                    <Text style={styles.aiSuggestionTextSmall}>Create checklist</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.aiSuggestion, styles.aiSuggestionEmpty]} activeOpacity={0.7}>
                    <FileText size={14} color="#7C3AED" />
                    <Text style={styles.aiSuggestionTextSmall}>Build invoice</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.aiSuggestion, styles.aiSuggestionEmpty]} activeOpacity={0.7}>
                    <ImageIcon size={14} color="#7C3AED" />
                    <Text style={styles.aiSuggestionTextSmall}>Analyze photos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.aiSuggestion, styles.aiSuggestionEmpty]} activeOpacity={0.7}>
                    <MessageCircle size={14} color="#7C3AED" />
                    <Text style={styles.aiSuggestionTextSmall}>Draft update</Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            ) : (
              <>
                {/* Regular state - existing design */}
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
                
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 16 }}>
                  <CamAIIcon size={20} glyphColor="#7C3AED" />
                  <Text style={styles.altSearchText}>Ask AI anything...</Text>
                  <View style={{ flex: 1 }} />
                  <TouchableOpacity onPress={handleAudioPress}>
                    <Mic size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

            {/* Photo Feed Section */}
            <View style={styles.activitySection}>
            {/* Photo Feed Header Row */}
            <View style={styles.activityHeaderRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowActivityEmptyState(prev => !prev)}
              >
                <Text style={styles.activitySectionTitle}>Photos</Text>
              </TouchableOpacity>
              <View style={styles.photoHeaderActions}>
                <TouchableOpacity
                  style={[styles.photoHeaderIconBtn, selectedTakenBy !== 'All' && styles.photoHeaderIconBtnActive]}
                  onPress={handleTakenByPress}
                >
                  <Users size={16} color={selectedTakenBy !== 'All' ? '#FFFFFF' : '#64748B'} />
                  <ChevronDown size={12} color={selectedTakenBy !== 'All' ? '#FFFFFF' : '#94A3B8'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoHeaderIconBtn, selectedTag !== 'All' && styles.photoHeaderIconBtnActive]}
                  onPress={handleTagsPress}
                >
                  <Tag size={16} color={selectedTag !== 'All' ? '#FFFFFF' : '#64748B'} />
                  <ChevronDown size={12} color={selectedTag !== 'All' ? '#FFFFFF' : '#94A3B8'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.photoHeaderAddBtn}
                  onPress={() => setShowPhotoUploadOptions(true)}
                >
                  <Plus size={14} color="#1E293B" />
                  <Text style={styles.photoHeaderAddText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
              
              {showActivityEmptyState ? (
                <View style={styles.emptyPhotosContainer}>
                  <ImageIcon size={48} color="#CBD5E1" />
                  <Text style={styles.emptyPhotosTitle}>No photos yet</Text>
                  <Text style={styles.emptyPhotosText}>Add photos to document your project progress</Text>
                  <TouchableOpacity 
                    style={styles.addPhotosButton}
                    onPress={() => setShowPhotoUploadOptions(true)}
                  >
                    <Plus size={18} color="#FFFFFF" />
                    <Text style={styles.addPhotosButtonText}>Add Photos</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {/* Photo Grid */}
                  {renderPhotoFeed()}
                </>
              )}
            </View>
          </View>
      </ScrollView>
      
      {/* Floating Action Bar - Figma-inspired layout */}
      {!hideFloatingActionBar && (
        <>
          

          <View style={[styles.altActionBar, { bottom: Math.max(insets.bottom, 18) }]}>
          <View style={styles.altRow}>
            {/* Search - icon in gray circle, black icon */}
            <TouchableOpacity 
              onPress={() => console.log('Search pressed')} 
              style={[styles.altCircleButton, { 
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: [{ translateY: -circleSize / 2 }],
                width: circleSize, 
                height: circleSize, 
                borderRadius: circleSize / 2 
              }]}
            >
              <Search size={iconSize} color="#000000" />
            </TouchableOpacity>

            {/* Camera (black container, white icon, wider) - perfectly centered */}
            <TouchableOpacity 
              onPress={handleCameraPress} 
              style={[styles.altCircleButton, { 
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: [{ translateX: -(circleSize * 1.8) / 2 }, { translateY: -circleSize / 2 }],
                width: circleSize * 1.8, 
                height: circleSize, 
                borderRadius: circleSize / 2, 
                backgroundColor: '#000000' 
              }]}
            >
              <Camera size={iconSize} color="#FFFFFF" />
            </TouchableOpacity>

            
            {/* Magic AI - purple icon in gray circle */}
            <TouchableOpacity 
              onPress={handleAudioPress} 
              style={[styles.altCircleButton, { 
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: [{ translateY: -circleSize / 2 }],
                width: circleSize, 
                height: circleSize, 
                borderRadius: circleSize / 2 
              }]}
            >
              <CamAIIcon size={iconSize} glyphColor="#7C3AED" />
            </TouchableOpacity>
          </View>
          </View>
        </>
      )}

      {/* Floating Chat Button removed */}
      
      <Modal
        visible={showScanInterstitial}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <ScanInterstitialScreen 
          onContinue={() => setShowScanInterstitial(false)}
        />
      </Modal>

      {/* Hero Options Bottom Sheet */}
      <Modal
        visible={showHeroOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHeroOptions(false)}
      >
        <View style={styles.bottomSheetOverlay}>
          <TouchableOpacity 
            style={styles.bottomSheetBackdrop}
            onPress={() => setShowHeroOptions(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>{showActivityEmptyState ? 'Add project photos' : 'Change hero image'}</Text>
              <TouchableOpacity onPress={() => setShowHeroOptions(false)}>
                <Text style={styles.bottomSheetDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
              {showActivityEmptyState && (
                <>
                  <TouchableOpacity style={styles.bottomSheetOption} onPress={() => { console.log('Magic upload'); setShowHeroOptions(false); }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Sparkles size={20} color="#64748B" />
                      <Text style={styles.bottomSheetOptionText}>Magically upload from camera roll (project address)</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.bottomSheetOption} onPress={() => { console.log('Manual upload'); setShowHeroOptions(false); }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Upload size={20} color="#64748B" />
                      <Text style={styles.bottomSheetOptionText}>Manually upload photos</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.bottomSheetOption} onPress={() => { setShowCamera(true); setShowHeroOptions(false); }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Camera size={20} color="#64748B" />
                      <Text style={styles.bottomSheetOptionText}>Capture photos</Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
              {!showActivityEmptyState && (
                <TouchableOpacity style={styles.bottomSheetOption} onPress={() => { console.log('Change hero'); setShowHeroOptions(false); }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <ImagePlus size={20} color="#64748B" />
                    <Text style={styles.bottomSheetOptionText}>Change hero image</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSearchScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <SearchCreateScreen 
          onClose={() => setShowSearchScreen(false)}
        />
      </Modal>

      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <CameraScreen 
          onClose={() => setShowCamera(false)} 
        />
      </Modal>

      <Modal
        visible={showSearchPage}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <SearchPageScreen onClose={() => setShowSearchPage(false)} />
      </Modal>

      {selectedNote && (
        <Modal
          visible={!!selectedNote}
          animationType="slide"
          presentationStyle="fullScreen"
          statusBarTranslucent={true}
        >
          <OrganizedNotesScreen 
            content={selectedNote.content}
            photos={selectedNote.photos}
            tasks={selectedNote.tasks}
            title={selectedNote.title}
            promptSent={selectedNote.promptSent}
            rawTranscript={selectedNote.rawTranscript}
            noteId={selectedNote.id}
            hasRawData={!!selectedNote.rawSessionData}
            onDelete={async (noteId) => {
              try {
                await deleteNote(noteId);
                await loadNotes(); // Reload the list
                setSelectedNote(null); // Close the modal
              } catch (error) {
                console.error('Error deleting note:', error);
                Alert.alert('Error', 'Failed to delete note');
              }
            }}
            onRerunWithPrompt={handleRerunWithPrompt}
            onClose={() => setSelectedNote(null)} 
          />
        </Modal>
      )}

      <PromptSelectionModal
        visible={showRerunPromptSelection}
        onClose={() => {
          setShowRerunPromptSelection(false);
          setRerunNoteId(null);
        }}
        onSelectPrompt={reprocessNoteWithPrompt}
        title="Choose AI Prompt for Re-processing"
      />

      {isReprocessing && (
        <Modal
          visible={isReprocessing}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.processingOverlay}>
            <View style={styles.processingModal}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.processingText}>Re-processing with new prompt...</Text>
              <Text style={styles.processingSubtext}>This may take a moment</Text>
            </View>
          </View>
        </Modal>
      )}

      <Modal
        visible={showPaymentsScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <PaymentsScreen onClose={() => setShowPaymentsScreen(false)} />
      </Modal>

      {/* Organized Notes from Audio Recording - Full Screen Modal */}
      <Modal
        visible={showOrganizedNotesFromAudio}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        {organizedNotesDataFromAudio && (
          <OrganizedNotesScreen
            onClose={handleCloseOrganizedNotesFromAudio}
            content={organizedNotesDataFromAudio.content}
            photos={organizedNotesDataFromAudio.photos}
            tasks={organizedNotesDataFromAudio.tasks}
            promptSent={organizedNotesDataFromAudio.promptSent}
          />
        )}
      </Modal>

      <ProjectMagicAIBottomSheet
        visible={showVoiceOptionsModal}
        onClose={() => { setShowVoiceOptionsModal(false); setHideFloatingActionBar(false); }}
        onSelectOption={handleVoiceOptionSelect}
      />

      <PhotoUploadBottomSheet
        visible={showPhotoUploadOptions}
        onClose={() => setShowPhotoUploadOptions(false)}
        onUploadPress={() => {
          console.log('Upload photos from library');
          // TODO: Implement photo library picker
        }}
        onMagicUploadPress={() => {
          console.log('Magic upload - find photos from this job');
          // TODO: Implement AI-based photo detection from camera roll
        }}
        onCameraPress={() => {
          setShowCamera(true);
        }}
      />

      <AudioRecordingModal 
        ref={audioModalRef}
        visible={showAudioModal} 
        onClose={() => setShowAudioModal(false)}
        onOpenOrganizedNotes={handleOpenOrganizedNotesFromAudio}
        onCameraPressInFooter={() => setShowCamera(true)}
      />

      <Modal
        visible={showManageScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <ProjectManageScreen 
          onClose={() => setShowManageScreen(false)} 
          showBottomQuickActions={showBottomQuickActions}
          onToggleBottomQuickActions={setShowBottomQuickActions}
        />
      </Modal>

      <Modal
        visible={showDocumentsScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <DocumentsScreen onClose={() => setShowDocumentsScreen(false)} />
      </Modal>

      <Modal
        visible={showPhotosScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <PhotosScreen onClose={() => setShowPhotosScreen(false)} />
      </Modal>

      <Modal
        visible={showNotesScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <NotesScreen onClose={() => setShowNotesScreen(false)} />
      </Modal>

      <Modal
        visible={showChatScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <ChatScreen onClose={() => setShowChatScreen(false)} />
      </Modal>

      <Modal
        visible={showTodosScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <TodosScreen onClose={() => setShowTodosScreen(false)} />
      </Modal>

      <Modal
        visible={showEmptyTasksScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F4' }}>
          <EmptyTasksScreen
            onSpeak={() => {
              setShowEmptyTasksScreen(false);
              setShowVoiceOptionsModal(true);
              setHideFloatingActionBar(true);
            }}
            onOpenCamera={() => {
              setShowEmptyTasksScreen(false);
              setShowCamera(true);
            }}
            onOpenChat={() => {
              setShowEmptyTasksScreen(false);
              setShowChatScreen(true);
            }}
            onStartFirstTask={() => {
              setShowEmptyTasksScreen(false);
              setShowTodosScreen(true);
            }}
          />
        </SafeAreaView>
      </Modal>

      {/* Taken By Filter Bottom Sheet */}
      {showTakenByFilter && (
        <BottomSheet
          ref={takenByBottomSheetRef}
          index={0}
          snapPoints={['50%']}
          backdropComponent={renderTakenByBackdrop}
          onClose={handleTakenByClose}
          enablePanDownToClose={true}
          style={styles.gorhamBottomSheet}
          backgroundStyle={styles.gorhamBottomSheetBackground}
          handleIndicatorStyle={styles.gorhamHandleIndicator}
        >
          <BottomSheetView style={styles.gorhamContainer}>
            <View style={styles.gorhamHeader}>
              <Text style={styles.gorhamTitle}>Filter by Photographer</Text>
              <TouchableOpacity onPress={handleTakenByClose} style={styles.gorhamCloseButton}>
                <Text style={styles.gorhamDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.gorhamOptionsContainer}>
              {photographers.map((person) => (
                <TouchableOpacity
                  key={person}
                  style={styles.gorhamOptionItem}
                  onPress={() => {
                    setSelectedTakenBy(person);
                    handleTakenByClose();
                  }}
                >
                  <Text style={[
                    styles.gorhamOptionText,
                    selectedTakenBy === person && styles.gorhamOptionTextSelected
                  ]}>
                    {person}
                  </Text>
                  {selectedTakenBy === person && (
                    <Check size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </BottomSheetView>
        </BottomSheet>
      )}

      {/* Tags Filter Bottom Sheet */}
      {showTagsFilter && (
        <BottomSheet
          ref={tagsBottomSheetRef}
          index={0}
          snapPoints={['60%']}
          backdropComponent={renderTagsBackdrop}
          onClose={handleTagsClose}
          enablePanDownToClose={true}
          style={styles.gorhamBottomSheet}
          backgroundStyle={styles.gorhamBottomSheetBackground}
          handleIndicatorStyle={styles.gorhamHandleIndicator}
        >
          <BottomSheetView style={styles.gorhamContainer}>
            <View style={styles.gorhamHeader}>
              <Text style={styles.gorhamTitle}>Filter by Tags</Text>
              <TouchableOpacity onPress={handleTagsClose} style={styles.gorhamCloseButton}>
                <Text style={styles.gorhamDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.gorhamOptionsContainer}>
              {photoTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.gorhamOptionItem}
                  onPress={() => {
                    setSelectedTag(tag);
                    handleTagsClose();
                  }}
                >
                  <Text style={[
                    styles.gorhamOptionText,
                    selectedTag === tag && styles.gorhamOptionTextSelected
                  ]}>
                    {tag}
                  </Text>
                  {selectedTag === tag && (
                    <Check size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </BottomSheetView>
        </BottomSheet>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F4',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for floating action bar
  },
  content: {
    alignItems: 'center',
    paddingTop: 24,
  },
  // projectHeaderContainer removed per design
  manageButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 1,
  },
  manageButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748B',
  },
  heroImage: {
    width: 88,
    height: 88,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: '#F5F5F4',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  heroGround: {
    position: 'absolute',
    bottom: 8,
    left: 6,
    right: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  heroBuilding1: {
    position: 'absolute',
    bottom: 14,
    left: 10,
    width: 12,
    height: 28,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  heroBuilding2: {
    position: 'absolute',
    bottom: 14,
    left: 26,
    width: 10,
    height: 20,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  heroBuilding3: {
    position: 'absolute',
    bottom: 14,
    left: 40,
    width: 14,
    height: 34,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
  },
  heroCraneArm: {
    position: 'absolute',
    top: 18,
    right: 12,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    transform: [{ rotate: '-10deg' }],
  },
  heroCraneHook: {
    position: 'absolute',
    top: 20,
    right: 12,
    width: 2,
    height: 18,
    backgroundColor: '#CBD5E1',
  },
  projectInfo: {
    alignItems: 'center',
    marginTop: 12,
    width: '100%',
  },
  // top tags container removed (labels live in header)
  projectHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    paddingHorizontal: 20,
    gap: 16,
  },
  projectHeaderCentered: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 4,
  },
  heroWrapper: {
    width: 88,
  },
  projectHeaderRight: {
    flex: 1,
    paddingBottom: 0,
  },
  contactsPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 0,
    marginBottom: 16,
  },
  projectTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: '#1E293B',
    marginBottom: 4,
    marginTop: 8,
    textAlign: 'center',
  },
  projectAddress: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
  },
  // Contact Pills Styles
  contactPillsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  metaPillsScroll: {
    alignSelf: 'stretch',
    marginHorizontal: 20,
  },
  metaPillsContainer: {
    paddingVertical: 4,
    gap: 8,
  },
  metaPillContact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F5F5F4',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  metaPillLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  metaPillTight: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    gap: 4,
  },
  metaPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#475569',
  },
  projectMetaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
    gap: 24,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  contactsSection: {
    alignItems: 'center',
  },
  contactCirclesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaCaption: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
  },
  labelsSection: {
    alignItems: 'center',
  },
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F5F5F4',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  labelText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#475569',
  },
  // projectDescription removed
  // Old tags rows removed
  contactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 6,
  },
  contactAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInitials: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  contactName: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
  },
  contactsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  contactLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  contactLinkText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#64748B',
  },
  bottomNavigation: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F5F4',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 32,
    paddingTop: 16,
  },
  iconMenuButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconMenuButton: {
    width: 56,
    height: 56,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },

  tabsSection: {
    marginTop: 40,
    width: '100%',
  },
  tabsScroll: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  tabButtonActive: {
    backgroundColor: '#64748B',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContentText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  // Activity Feed Styles
  activityFeed: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 20,
    paddingTop: 0,
    position: 'relative',
  },
  timelineSegmentBelowAvatar: {
    position: 'absolute',
    left: 19, // center under the 40px avatar
    top: 40,
    width: 2,
    height: '100%',
    backgroundColor: '#E2E8F0',
    zIndex: 0,
  },
  continuousTimelineLine: {
    position: 'absolute',
    left: 35, // Center on the 40px avatars (16px padding + 19px to center on 40px avatar)
    top: 20, // Start at the center of first avatar (20px to center on 40px avatar)
    width: 2,
    height: '100%',
    backgroundColor: '#E2E8F0',
    zIndex: 0, // Behind everything
  },
  activityItem: {
    position: 'relative',
    flexDirection: 'row',
    marginBottom: 16,
  },

  avatarContainer: {
    width: 40,
    height: 40,
    marginRight: 16,
    position: 'relative',
    zIndex: 2, // Above the continuous timeline line
    backgroundColor: '#FFFFFF', // Match screen background for clean cutoff
    borderRadius: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 3,
    borderColor: '#FFFFFF', // Match screen background to create clean cutoff
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityAttribution: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  photosContent: {
    marginBottom: 8,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityPhoto: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  morePhotosText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  audioContent: {
    backgroundColor: '#F5F5F4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  audioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  audioIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  audioDuration: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  audioTranscription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  documentContent: {
    backgroundColor: '#F5F5F4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metadataEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F4',
    borderRadius: 12,
  },
  metadataEventText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  documentIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 2,
  },
  documentType: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
  },
  // AI Recap Styles
  aiRecapContent: {
    backgroundColor: '#F5F5F4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  aiRecapTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 6,
  },
  aiRecapSummary: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  aiStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  aiStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiStatCount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
  },
  // Section Headers
  sectionHeader: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionHeaderContainer: {
    marginBottom: 8,
  },
  firstSectionHeader: {
    marginTop: 0,
  },
  // Notes Tab Styles
  notesTabContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  notesHeader: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 16,
  },
  notesCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  notesScrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  emptyNotesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 300,
  },
  emptyNotesTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyNotesText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  notesList: {
    flex: 1,
  },
  notesListContent: {
    paddingBottom: 16,
  },
  noteItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  noteContent: {
    marginBottom: 12,
  },
  noteTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  noteDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  notePreview: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  noteStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  // Processing Modal Styles
  processingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 200,
  },
  processingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginTop: 16,
    textAlign: 'center',
  },
  processingSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  // To-Do Tab Styles
  todosScrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  todosContainer: {
    paddingBottom: 16,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  completedTodoItem: {
    opacity: 0.6,
  },
  todoCheckboxWrapper: {
    paddingRight: 12,
  },
  todoCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoCheckboxCompleted: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  todoContent: {
    flex: 1,
  },
  todoDeleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  todoTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 20,
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  todoSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  completedHeader: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#64748B',
    marginTop: 24,
    marginBottom: 12,
  },
  // Quick Actions Grid Styles
  quickActionsGrid: {
    marginTop: 16,
    marginHorizontal: 20,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionCardThird: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  shimmerWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -50,
    width: 120,
    opacity: 0.6,
  },
  shimmerGrad: {
    flex: 1,
    borderRadius: 16,
  },
  quickActionCardFullWidth: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 12,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    marginBottom: 12,
  },
  quickActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  quickActionIconOnly: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickActionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionCountPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  quickActionCountText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
  },
  quickActionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  quickActionPrimary: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 2,
  },
  quickActionSecondary: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  quickActionAddButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  // Section Divider
  sectionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '90%',
    alignSelf: 'center',
    marginTop: 36,
    marginBottom: 36,
  },
  // Alternate Action Bar Styles
  alternateActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 20,
    gap: 12,
  },
  alternateActionButton: {
    width: '28%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    borderWidth: 0,
    gap: 8,
  },
  captureButton: {
    backgroundColor: '#3B82F6',
  },
  alternateActionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#374151',
  },
  captureButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  // Styled Action Buttons Styles removed
  // Activity Section Styles
  activitySection: {
    marginTop: 24,
    width: '100%',
    alignSelf: 'stretch',
  },
  activitySectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: '#0F172A',
    marginBottom: 0,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 20,
    marginBottom: 16,
    gap: 8,
  },
  filtersToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F4',
    borderRadius: 999,
  },
  filtersToggleText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748B',
  },
  filterTabsContainer: {
    marginBottom: 12,
    height: 44,
  },
  filterTabsScroll: {
    paddingLeft: 16,
    paddingRight: 20,
    paddingBottom: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
  },
  filterTabActive: {
    backgroundColor: '#1E293B',
  },
  filterDropdownTab: {
    paddingHorizontal: 12,
  },
  filterTabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  // Bottom Sheet Styles
  bottomSheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetBackdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 34,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  bottomSheetTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
  },
  bottomSheetDone: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#3B82F6',
  },
  bottomSheetContent: {
    maxHeight: 400,
  },
  bottomSheetOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bottomSheetOptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#374151',
  },
  bottomSheetOptionTextActive: {
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  // Empty Activity State
  emptyActivityContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyActivityText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Photo Feed Styles
  photoFeedContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  photoHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photoHeaderIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  photoHeaderIconBtnActive: {
    backgroundColor: '#1F2937',
  },
  photoHeaderAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  photoHeaderAddText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#1E293B',
  },
  photoFilterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photoFilterTabActive: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  photoFilterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photoFilterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#000000',
  },
  photoFilterTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  photoDateGroup: {
    marginBottom: 20,
  },
  photoDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  photoDateLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#1E293B',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 4,
  },
  photoGridContent: {
    paddingBottom: 120,
    paddingHorizontal: 2,
  },
  photoGridItem: {
    width: '23.5%',
    aspectRatio: 1,
  },
  photoGridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  emptyPhotosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyPhotosTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyPhotosText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  addPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addPhotosButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  // Floating Action Bar Styles
  altActionBar: {
    position: 'absolute',
    left: '16%',
    right: '16%',
    height: 88,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 0.5,
    shadowRadius: 60,
    elevation: 25,
    zIndex: 9999,
  },
  altRow: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  altLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  altCircleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  altPrimaryButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: '#155DFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  altPrimaryText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 14,
  },
  altSearchBar: {
    height: 60,
    alignSelf: 'stretch',
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  altSearchText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
  },
  aiSuggestionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 4,
    paddingBottom: 8,
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
  aiEmptyStateHeader: {
    marginBottom: 16,
  },
  aiEmptyStateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  aiEmptyStateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: '#1E293B',
  },
  aiEmptyStateSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    lineHeight: 18,
  },
  aiSuggestionsScrollContainer: {
    paddingLeft: 2,
    paddingRight: 12,
    gap: 8,
  },
  aiSuggestionEmpty: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F3F0FF',
    marginRight: 8,
  },
  aiSuggestionTextSmall: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#7C3AED',
  },
  aiInputField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
    borderRadius: 14,
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  aiInputPlaceholder: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
    paddingTop: 4,
  },
  aiInputPrompt: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#94A3B8',
    flex: 1,
    marginRight: 12,
  },
  aiMicButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleEmoji: {
    fontSize: 18,
    lineHeight: 20,
  },
  floatingActionBar: {
    position: 'absolute',
    left: '3%',
    right: '3%',
    backgroundColor: '#3B82F6',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'visible',
  },
  floatingNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
    paddingHorizontal: 0,
    overflow: 'visible',
  },
  floatingItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  floatingCameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  floatingIconBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: '#3B82F6',
  },
  floatingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#FFFFFF',
    marginTop: 0,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  // To-Do Badge Styles
  todoNotificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#F59E0B',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  todoBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Black',
    textAlign: 'center',
    fontWeight: '900',
  },
  // To-Do Card Layout Styles
  todoCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  todoLeftSection: {
    width: '40%',
    marginRight: 8,
  },
  todoRightSection: {
    width: '60%',
    paddingTop: 8,
    paddingLeft: 4,
  },
  todoPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingRight: 8,
  },
  todoPreviewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
    marginRight: 8,
    flexShrink: 0,
  },
  todoPreviewText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  todoMoreText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    marginLeft: 14,
  },
  // Floating Chat Button Styles removed
  
  // Gorham Bottom Sheet Styles
  gorhamBottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
    zIndex: 10000,
  },
  gorhamBottomSheetBackground: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  gorhamHandleIndicator: {
    backgroundColor: '#CBD5E1',
    width: 40,
  },
  gorhamContainer: {
    flex: 1,
    paddingTop: 8,
  },
  gorhamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  gorhamTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1E293B',
  },
  gorhamCloseButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  gorhamDoneText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#3B82F6',
  },
  gorhamOptionsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  gorhamOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gorhamOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1E293B',
  },
  gorhamOptionTextSelected: {
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
});