import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInput,
  Modal,
  ScrollView,
  Animated as RNAnimated,
} from 'react-native';
import Animated, { Extrapolate, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet, { 
  BottomSheetView, 
  BottomSheetBackdrop, 
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {
  Mic,
  X,
  Camera,
  Plus,
  AudioLines,
  Pencil,
  Tag as TagIcon,
  Sparkles,
  CheckSquare,
  FileText,
  ChevronDown,
  MessageCircle,
  WandSparkles,
  Share,
  Trash2,
  MoreHorizontal,
  CheckCircle2
} from 'lucide-react-native';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { transcribeWithWhisper } from '../../utils/whisper';
import { getGeminiVision, analyzeSpeechIntent } from '../../utils/gemini';
import type { GeminiVisionResult, SpeechIntentSuggestion } from '../../utils/gemini';
import { saveTask } from '../../utils/taskStorage';
import * as FileSystem from 'expo-file-system/legacy';
import WavelengthAnimation from '../WavelengthAnimation';
import PhotoDetailScreen from '../../screens/PhotoDetailScreen';
import CamAIIcon from '../CamAIIcon';
// timelineToBlocks removed in favor of a simpler chronological JSON prompt

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Entry {
  id: string;
  type: 'audio' | 'image' | 'text' | 'photoText';
  content: string;
  uri?: string;
  timestamp: Date;
  isAnalyzing?: boolean;
  aiDescription?: string; // AI description for photos (also set on photoText)
  photoContext?: string; // URI of the photo this entry is associated with
  notes?: string; // User notes for photos
  aiDocumentType?: string;
  aiDocumentTitle?: string;
  aiDocumentConfidence?: number;
  aiDocumentIsDocument?: boolean;
  aiSuggestedTags?: string[];
  aiSuggestedTagsConfidence?: number;
  aiSuggestedTaskTitle?: string;
  aiSuggestedTaskDescription?: string;
  aiSuggestedTaskConfidence?: number;
}

type TimelineRow =
  | { kind: 'text'; time: number; entry: Entry }
  | { kind: 'photoText'; time: number; entry: Entry }
  | { kind: 'image'; time: number; entry: Entry };

const formatDocumentType = (docType?: string) => {
  if (!docType) return 'Document';
  return docType
    .split(/[_\s]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const parseDocumentHypothesis = (hypothesis?: GeminiVisionResult['documentHypothesis']) => {
  const docType = hypothesis?.documentType;
  const normalizedType = docType?.toLowerCase();
  const isDocumentCategory = normalizedType ? ['document', 'checklist', 'receipt', 'blueprint', 'form'].includes(normalizedType) : false;
  const isNotesType = normalizedType === 'notes';
  const isDocumentBase = typeof hypothesis?.isDocument === 'boolean' ? hypothesis.isDocument : (isDocumentCategory || isNotesType);
  const rawTitle = typeof hypothesis?.title === 'string' ? hypothesis.title.trim() : undefined;
  const documentTitle = rawTitle && rawTitle.length > 0 ? rawTitle : undefined;
  const confidence = typeof hypothesis?.confidence === 'number' ? hypothesis.confidence : undefined;
  const isDocument = documentTitle ? isDocumentBase : false;

  return {
    isDocument,
    documentType: documentTitle ? docType : undefined,
    documentTitle,
    confidence: documentTitle ? confidence : undefined,
  };
};

interface AudioRecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onCameraPressInFooter?: () => void;
  onOpenOrganizedNotes?: (data: any) => void;
  initialState?: 'recording' | 'idle';
  initialSnapIndex?: number;
  showBackdrop?: boolean;
  title?: string;
  headerPlaceholder?: string;
  isInCameraContext?: boolean;
  projectName?: string;
  onProjectChange?: (projectName: string) => void;
  projectOptions?: string[];
  showGeneralNotes?: boolean;
  showProjectTitle?: boolean;
  showTags?: boolean;
  onModalStateChange?: (isOpen: boolean) => void;
  onModalPositionChange?: (position: number) => void;
}

export interface AudioRecordingModalHandles {
  openCamera: () => void;
  addPhoto: (photoUri: string) => void;
  getTopEntryTarget: () => Promise<{ x: number; y: number; width: number; height: number } | null>;
  getTemporaryPhotoTarget: () => Promise<{ x: number; y: number; width: number; height: number } | null>;
  revealForUri: (uri: string) => void;
}

const AudioRecordingModal = forwardRef((props: AudioRecordingModalProps, ref: React.Ref<AudioRecordingModalHandles>) => {
  const {
    visible,
    onClose,
    onCameraPressInFooter,
    onOpenOrganizedNotes,
    initialState = 'idle',
    initialSnapIndex = 0,
    showBackdrop = false,
    title = 'Notes',
    headerPlaceholder,
    isInCameraContext = false,
    projectName,
    onProjectChange,
    projectOptions,
    showGeneralNotes = true,
    showProjectTitle = false,
    showTags = false,
    onModalStateChange,
    onModalPositionChange
  } = props;
  const insets = useSafeAreaInsets();
  
  // Simple state
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [isRecordingContext, setIsRecordingContext] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGlobalRecording, setIsGlobalRecording] = useState(false); // Track if it's a global recording
  const [isInputFieldRecording, setIsInputFieldRecording] = useState(false); // Track if recording from input field
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set()); // Track expanded AI descriptions
  const [temporaryPhoto, setTemporaryPhoto] = useState<string | null>(null); // Photo shown next to input temporarily
  const [photoNotes, setPhotoNotes] = useState<{[key: string]: string}>({}); // Track notes for each photo by ID
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null); // Track which entry is being edited
  const [editingText, setEditingText] = useState(''); // Store the text being edited
  const [showPhotoDetail, setShowPhotoDetail] = useState(false); // Photo detail modal
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null); // Selected photo for detail view
  const [photoDetailRecording, setPhotoDetailRecording] = useState(false); // Recording state for photo detail
  const [photoDetailProcessing, setPhotoDetailProcessing] = useState(false); // Processing state for photo detail
  const [currentSnapIndex, setCurrentSnapIndex] = useState(isInCameraContext ? 0 : initialSnapIndex); // Track current bottom sheet position
  const [recordingPhotoUri, setRecordingPhotoUri] = useState<string | null>(null); // Track which photo is being recorded for
  const [processingPhotoUri, setProcessingPhotoUri] = useState<string | null>(null); // Track which photo is being processed
  const [expandedPhotoUri, setExpandedPhotoUri] = useState<string | null>(null); // Track which photo has expanded speak button
  const expandedPhotoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'photos' | 'notes'>('timeline');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCreateType, setSelectedCreateType] = useState<string>('');
  
  // Multi-select output types for empty state preview (AI Notes is always selected)
  const [selectedOutputTypes, setSelectedOutputTypes] = useState<Set<string>>(new Set(['AI Notes']));
  
  // Output type options for the horizontal list
  const OUTPUT_TYPE_OPTIONS = [
    { id: 'Proposal', label: 'Proposal', icon: FileText },
    { id: 'Work Order', label: 'Work Order', icon: CheckSquare },
    { id: 'Punch List', label: 'Punch List', icon: CheckSquare },
    { id: 'Daily Report', label: 'Daily Report', icon: FileText },
    { id: 'Checklist', label: 'Checklist', icon: CheckSquare },
  ];
  
  const toggleOutputType = (typeId: string) => {
    // AI Notes cannot be toggled off
    if (typeId === 'AI Notes') return;
    
    setSelectedOutputTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(typeId)) {
        newSet.delete(typeId);
      } else {
        newSet.add(typeId);
      }
      return newSet;
    });
  };

  // Micro-hints state
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [showHints, setShowHints] = useState(false); // Hidden as requested
  const [hintFadeAnim] = useState(new RNAnimated.Value(0));
  const [hasUsedSpeech, setHasUsedSpeech] = useState(false);
  const [appOpenCount, setAppOpenCount] = useState(0);
  const [hintRotationTimer, setHintRotationTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  // Audio recording
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const topRowRef = useRef<View | null>(null);
  const revealUriRef = useRef<string | null>(null);
  const revealOpacity = useRef(new RNAnimated.Value(0)).current;
  const revealTranslate = useRef(new RNAnimated.Value(6)).current;
  const recordingStartTime = useRef<number | null>(null);
  const temporaryPhotoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generalNotesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const temporaryPhotoOpacity = useRef(new RNAnimated.Value(0)).current;
  const temporaryPhotoScale = useRef(new RNAnimated.Value(0.8)).current;
  const temporaryPhotoTranslateY = useRef(new RNAnimated.Value(0)).current; // For slide-down animation
  const temporaryPhotoEntry = useRef<Entry | null>(null); // Store the current temporary photo's entry

  const animatedIndex = useSharedValue(isInCameraContext ? 0 : initialSnapIndex);

  const applySpeechIntentToPhoto = (photoUri: string, suggestion: SpeechIntentSuggestion | null) => {
    if (!photoUri || !suggestion) return;

    setEntries(prev => prev.map(entry => {
      if ((entry.type === 'image' || entry.type === 'photoText') && entry.uri === photoUri) {
        const mergedTags = suggestion.suggestedTags
          ? Array.from(new Set([...(entry.aiSuggestedTags || []), ...suggestion.suggestedTags]))
          : entry.aiSuggestedTags;

        return {
          ...entry,
          aiSuggestedTaskTitle: suggestion.suggestedTaskTitle ?? entry.aiSuggestedTaskTitle,
          aiSuggestedTaskDescription: suggestion.suggestedTaskDescription ?? entry.aiSuggestedTaskDescription,
          aiSuggestedTaskConfidence: suggestion.taskConfidence ?? entry.aiSuggestedTaskConfidence,
          aiSuggestedTags: mergedTags,
          aiSuggestedTagsConfidence: suggestion.tagsConfidence ?? entry.aiSuggestedTagsConfidence,
        };
      }
      return entry;
    }));

    if (temporaryPhotoEntry.current && temporaryPhotoEntry.current.uri === photoUri) {
      const current = temporaryPhotoEntry.current;
      const mergedTags = suggestion.suggestedTags
        ? Array.from(new Set([...(current.aiSuggestedTags || []), ...suggestion.suggestedTags]))
        : current.aiSuggestedTags;

      temporaryPhotoEntry.current = {
        ...current,
        aiSuggestedTaskTitle: suggestion.suggestedTaskTitle ?? current.aiSuggestedTaskTitle,
        aiSuggestedTaskDescription: suggestion.suggestedTaskDescription ?? current.aiSuggestedTaskDescription,
        aiSuggestedTaskConfidence: suggestion.taskConfidence ?? current.aiSuggestedTaskConfidence,
        aiSuggestedTags: mergedTags,
        aiSuggestedTagsConfidence: suggestion.tagsConfidence ?? current.aiSuggestedTagsConfidence,
      };
    }
  };

  // Project switching state (camera context)
  const [projectNameInternal, setProjectNameInternal] = useState<string>('');
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);

  const availableProjects: string[] = projectOptions && projectOptions.length > 0 ? projectOptions : [
    'Oakridge Residence',
    'Downtown Office Complex',
    'Sunset Villa Renovation',
    'Modern Loft Project',
    'Family Home Addition',
  ];

  const displayProjectName = projectName && projectName.length > 0 ? projectName : (projectNameInternal || availableProjects[0]);

  // Micro-hints data
  const MICRO_HINTS = [
    { icon: '🏷️', text: 'Say: "Tag this kitchen"' },
    { icon: '🤖', text: 'Ask: "Any damage here?"' },
    { icon: '📝', text: 'Note: "Measurement is 8 ft 6 in"' },
    { icon: '✅', text: 'Say: "Create a task to replace this outlet"' },
    { icon: '🏷️', text: 'Say: "Tags: HVAC, filter"' },
    { icon: '🤖', text: 'Ask: "What material is this?"' },
    { icon: '📝', text: 'Note: "North wall needs primer"' },
    { icon: '✅', text: 'Make a task: "Order 6 sheets of ½" drywall"' },
  ];

  const HINT_STORAGE_KEY = 'speech_hints_data';
  const APP_OPEN_COUNT_KEY = 'app_open_count';

  const handleSelectProject = useCallback((name: string) => {
    if (onProjectChange) {
      onProjectChange(name);
    } else {
      setProjectNameInternal(name);
    }
    setShowProjectSwitcher(false);
  }, [onProjectChange]);

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      try {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      } catch {}
    }
  }, []);

  useEffect(() => {
    animatedIndex.value = isInCameraContext ? 0 : initialSnapIndex;
  }, [animatedIndex, initialSnapIndex, isInCameraContext]);

  // Notify parent when modal state changes (open/closed)
  useEffect(() => {
    if (onModalStateChange) {
      // Modal is considered "open" when at index 1 (85% height)
      const isOpen = currentSnapIndex === 1;
      onModalStateChange(isOpen);
    }

    if (onModalPositionChange) {
      // Pass the interpolated position (0 = closed, 1 = open)
      onModalPositionChange(currentSnapIndex);
    }
  }, [currentSnapIndex, onModalStateChange, onModalPositionChange]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (temporaryPhotoTimer.current) {
        clearTimeout(temporaryPhotoTimer.current);
      }
      if (generalNotesTimer.current) {
        clearTimeout(generalNotesTimer.current);
      }
      if (expandedPhotoTimer.current) {
        clearTimeout(expandedPhotoTimer.current);
      }
      // Also clear the temporary photo entry reference
      temporaryPhotoEntry.current = null;
    };
    }, []);

  // Load hint persistence data on mount
  useEffect(() => {
    const loadHintData = async () => {
      try {
        const [speechData, appOpens] = await Promise.all([
          AsyncStorage.getItem(HINT_STORAGE_KEY),
          AsyncStorage.getItem(APP_OPEN_COUNT_KEY)
        ]);

        if (speechData) {
          const parsed = JSON.parse(speechData);
          setHasUsedSpeech(parsed.hasUsedSpeech || false);
        }

        const openCount = appOpens ? parseInt(appOpens, 10) : 0;
        setAppOpenCount(openCount);

        // Increment app open count
        const newOpenCount = openCount + 1;
        await AsyncStorage.setItem(APP_OPEN_COUNT_KEY, newOpenCount.toString());
        setAppOpenCount(newOpenCount);

      } catch (error) {
        console.log('Error loading hint data:', error);
      }
    };

    loadHintData();
  }, []);

  // Mark speech as used when recording starts
  useEffect(() => {
    if (isInputFieldRecording || isRecording) {
      const markSpeechUsed = async () => {
        try {
          setHasUsedSpeech(true);
          await AsyncStorage.setItem(HINT_STORAGE_KEY, JSON.stringify({ hasUsedSpeech: true }));
        } catch (error) {
          console.log('Error saving speech usage:', error);
        }
      };
      markSpeechUsed();
    }
  }, [isInputFieldRecording, isRecording]);

  // Hint rotation timer
  const startHintRotation = useCallback(() => {
    if (hintRotationTimer) {
      clearInterval(hintRotationTimer);
    }

    const timer = setInterval(() => {
      setCurrentHintIndex(prev => {
        const nextIndex = (prev + 1) % MICRO_HINTS.length;

        // Fade out current hint
        RNAnimated.timing(hintFadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start(() => {
          // After fade out, change hint and fade in
          setTimeout(() => {
            RNAnimated.timing(hintFadeAnim, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }).start();
          }, 50);
        });

        return nextIndex;
      });
    }, 5000); // 5 seconds

    setHintRotationTimer(timer);
    return timer;
  }, [hintFadeAnim]);

  // Stop hint rotation
  const stopHintRotation = useCallback(() => {
    if (hintRotationTimer) {
      clearInterval(hintRotationTimer);
      setHintRotationTimer(null);
    }
  }, [hintRotationTimer]);

  // Determine if hints should be shown
  const shouldShowHints = useCallback(() => {
    // Hints are hidden as requested
    return false;
  }, []);

  const hasPhotos = useMemo(
    () => entries.some(e => e.type === 'image' || e.type === 'photoText'),
    [entries]
  );

  const animatedGenerateButtonStyle = useAnimatedStyle(() => {
    'worklet';
    const progress = animatedIndex.value;
    // Translate from 120px below to its final position
    const translateY = interpolate(progress, [0, 1], [120, 0], Extrapolate.CLAMP);
    // Fade in as it rises
    const opacity = interpolate(progress, [0, 0.3, 1], [0, 0.7, 1], Extrapolate.CLAMP);

    return {
      transform: [{ translateY }],
      opacity,
      bottom: insets.bottom + 72,
    };
  });

  const animatedTabsStyle = useAnimatedStyle(() => {
    'worklet';
    const progress = animatedIndex.value;
    // Tabs fade in from 0 to 1 as sheet opens
    const opacity = interpolate(progress, [0, 0.3, 1], [0, 0, 1], Extrapolate.CLAMP);
    // Use maxHeight to collapse - set high enough for content
    const maxHeight = interpolate(progress, [0, 1], [0, 600], Extrapolate.CLAMP);

    return {
      opacity,
      maxHeight,
      overflow: 'hidden',
    };
  });

  const animatedSpeakButtonStyle = useAnimatedStyle(() => {
    'worklet';
    const progress = animatedIndex.value;
    // Speak button fades out as modal opens (0 = visible, 1 = hidden)
    const opacity = interpolate(progress, [0, 0.3, 1], [1, 0.5, 0], Extrapolate.CLAMP);
    return { opacity };
  });

  const animatedMicIconStyle = useAnimatedStyle(() => {
    'worklet';
    const progress = animatedIndex.value;
    // Mic icon fades in as modal opens (0 = hidden, 1 = visible)
    const opacity = interpolate(progress, [0, 0.7, 1], [0, 0.5, 1], Extrapolate.CLAMP);
    return { opacity };
  });

  // Control hint visibility and rotation
  useEffect(() => {
    const shouldShow = shouldShowHints();

    if (shouldShow && !showHints) {
      // Start showing hints
      setShowHints(true);
      RNAnimated.timing(hintFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        startHintRotation();
      });
    } else if (!shouldShow && showHints) {
      // Stop showing hints
      stopHintRotation();
      RNAnimated.timing(hintFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowHints(false);
      });
    }
  }, [shouldShowHints, showHints, hintFadeAnim, startHintRotation, stopHintRotation]);

  // Cleanup hint timer on unmount
  useEffect(() => {
    return () => {
      stopHintRotation();
    };
  }, [stopHintRotation]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    openCamera: () => {
      if (onCameraPressInFooter) {
        onCameraPressInFooter();
      }
    },
    addPhoto: (photoUri: string) => {
      addImageEntry(photoUri);
    },
    getTopEntryTarget: () => {
      return new Promise(resolve => {
        if (topRowRef.current && typeof (topRowRef.current as any).measureInWindow === 'function') {
          (topRowRef.current as any).measureInWindow((x: number, y: number, width: number, height: number) => {
            resolve({ x, y, width, height });
          });
        } else {
          resolve(null);
        }
      });
    },
    getTemporaryPhotoTarget: () => {
      return new Promise(resolve => {
        // Always calculate position based on the modal being at its lowest snap point
        // In camera context: 19% of screen height from bottom
        // This ensures the animation target is consistent regardless of current modal position
        
        if (isInCameraContext) {
          // Modal at 19% means its top is at (100% - 19%) = 81% from top
          const modalHeight = screenHeight * 0.19;
          const modalTop = screenHeight - modalHeight;
          
          // The temporary photo is positioned:
          // - Handle indicator: ~20px
          // - Header with title: ~35px  
          // - Input area padding top: ~8px
          // - Total offset from modal top: ~63px
          const photoYPosition = modalTop + 63;
          
          // X position is consistent (left padding of 16px)
          resolve({ 
            x: 16, 
            y: photoYPosition, 
            width: 66, 
            height: 66 
          });
        } else {
          // For non-camera context, use default position
          resolve({ x: 16, y: 150, width: 66, height: 66 });
        }
      });
    },
    revealForUri: (uri: string) => {
      revealUriRef.current = uri;
      revealOpacity.setValue(0);
      revealTranslate.setValue(6);
      RNAnimated.parallel([
        RNAnimated.timing(revealOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        RNAnimated.timing(revealTranslate, { toValue: 0, duration: 180, useNativeDriver: true })
      ]).start();
    }
  }));

  // Add image entry with AI analysis
  const addImageEntry = async (uri: string) => {
    // Clear any existing timers
    if (temporaryPhotoTimer.current) {
      clearTimeout(temporaryPhotoTimer.current);
      temporaryPhotoTimer.current = null;
    }
    if (generalNotesTimer.current) {
      clearTimeout(generalNotesTimer.current);
      generalNotesTimer.current = null;
    }
    
    // Create the entry object for the new photo
    const entryId = Date.now().toString();
    const newEntry: Entry = {
      id: entryId,
      type: 'image',
      content: 'Analyzing image...',
      uri,
      timestamp: new Date(),
      isAnalyzing: true
    };
    
    // If general notes is hidden, add photo directly to the list
    if (!showGeneralNotes) {
      // Clear any existing expanded photo timer
      if (expandedPhotoTimer.current) {
        clearTimeout(expandedPhotoTimer.current);
        expandedPhotoTimer.current = null;
      }
      
      LayoutAnimation.configureNext({
        duration: 400,
        create: {
          type: LayoutAnimation.Types.spring,
          springDamping: 0.7,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.spring,
          springDamping: 0.8,
          property: LayoutAnimation.Properties.scaleXY,
        },
      });
      setEntries(prev => [newEntry, ...prev]);
      
      // Auto-expand the speak button for this photo after a brief delay
      setTimeout(() => {
        LayoutAnimation.configureNext({
          duration: 350,
          create: {
            type: LayoutAnimation.Types.spring,
            springDamping: 0.75,
            property: LayoutAnimation.Properties.scaleXY,
          },
          update: {
            type: LayoutAnimation.Types.spring,
            springDamping: 0.75,
            property: LayoutAnimation.Properties.scaleXY,
          },
        });
        setExpandedPhotoUri(uri);
      }, 100);
      
      // Collapse back to mic button after 3 seconds
      expandedPhotoTimer.current = setTimeout(() => {
        LayoutAnimation.configureNext({
          duration: 300,
          update: {
            type: LayoutAnimation.Types.spring,
            springDamping: 0.7,
            property: LayoutAnimation.Properties.scaleXY,
          },
        });
        setExpandedPhotoUri(null);
        expandedPhotoTimer.current = null;
      }, 3100);
      
      // Get AI description asynchronously
      try {
        console.log('Requesting AI description for image:', uri);
        const visionResult = await getGeminiVision(uri);
        console.log('Vision insights received:', visionResult);

        const description = visionResult?.description?.trim();
        const { isDocument, documentType, documentTitle, confidence } = parseDocumentHypothesis(visionResult?.documentHypothesis);
        
        // Update the entry with the AI description
        LayoutAnimation.configureNext({
          duration: 250,
          update: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
        });
        setEntries(prev => prev.map(entry => {
          if (entry.id !== entryId) return entry;
          const mergedTags = visionResult?.suggestedTags
            ? Array.from(new Set([...(entry.aiSuggestedTags || []), ...visionResult.suggestedTags]))
            : entry.aiSuggestedTags;
          return {
            ...entry,
            content: description || 'Unable to analyze image',
            aiDescription: description || undefined,
            aiDocumentIsDocument: typeof isDocument === 'boolean' ? isDocument : undefined,
            aiDocumentType: documentType,
            aiDocumentTitle: documentTitle,
            aiDocumentConfidence: confidence,
            aiSuggestedTags: mergedTags,
            isAnalyzing: false,
          };
        }));
      } catch (error) {
        console.error('Error analyzing image:', error);
        LayoutAnimation.configureNext({
          duration: 250,
          update: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
        });
        setEntries(prev => prev.map(entry => 
          entry.id === entryId 
            ? {
                ...entry,
                content: 'Error analyzing image',
                aiDescription: undefined,
                aiDocumentIsDocument: undefined,
                aiDocumentType: undefined,
                aiDocumentTitle: undefined,
                aiDocumentConfidence: undefined,
                isAnalyzing: false,
              }
            : entry
        ));
      }
      return;
    }
    
    // If a previous temporary photo is pending, immediately commit it to the timeline
    if (temporaryPhotoEntry.current) {
      const toCommit = temporaryPhotoEntry.current;
      LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
      setEntries(prev => {
        const existsById = prev.some(e => e.id === toCommit.id);
        const hasPhotoTextForUri = prev.some(e => e.type === 'photoText' && e.uri === toCommit.uri);
        return existsById || hasPhotoTextForUri ? prev : [toCommit, ...prev];
      });
      temporaryPhotoEntry.current = null;
    }

    // Do not add photo to the list immediately; delay until temp thumbnail fades
    // Track as current temporary entry and set as current photo for context recording
    temporaryPhotoEntry.current = newEntry;
    setCurrentPhoto(uri);
    
    // Show a temporary photo by the input and keep input visible
    setTemporaryPhoto(uri);
    temporaryPhotoOpacity.setValue(0);
    temporaryPhotoScale.setValue(0.85);
    temporaryPhotoTranslateY.setValue(0);
    RNAnimated.parallel([
      RNAnimated.timing(temporaryPhotoOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      RNAnimated.timing(temporaryPhotoScale, { toValue: 1, duration: 180, useNativeDriver: true })
    ]).start();
    if (temporaryPhotoTimer.current) {
      clearTimeout(temporaryPhotoTimer.current);
    }
    temporaryPhotoTimer.current = setTimeout(() => {
      // Create smooth slide-down animation
      RNAnimated.sequence([
        // First pause for a moment to show the photo in place
        RNAnimated.delay(300),
        // Then slide down and fade out simultaneously
        RNAnimated.parallel([
          RNAnimated.timing(temporaryPhotoOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
          RNAnimated.timing(temporaryPhotoScale, { toValue: 0.85, duration: 350, useNativeDriver: true }),
          RNAnimated.timing(temporaryPhotoTranslateY, { toValue: 100, duration: 350, useNativeDriver: true })
        ])
      ]).start(() => {
        setTemporaryPhoto(null);
        temporaryPhotoTranslateY.setValue(0); // Reset for next photo
        // Commit photo to entries after the animation completes with sliding effect
        if (temporaryPhotoEntry.current && temporaryPhotoEntry.current.id === entryId) {
          const toCommit = temporaryPhotoEntry.current;
          console.log('Committing photo to entries:', toCommit.uri);
          // Create smooth sliding animation for list reorganization
          LayoutAnimation.configureNext({
            duration: 400,
            create: {
              type: LayoutAnimation.Types.spring,
              springDamping: 0.7,
              property: LayoutAnimation.Properties.opacity,
            },
            update: {
              type: LayoutAnimation.Types.spring,
              springDamping: 0.8,
              property: LayoutAnimation.Properties.opacity,
            },
          });
          setEntries(prev => {
            const existsById = prev.some(e => e.id === toCommit.id);
            const hasPhotoTextForUri = prev.some(e => e.type === 'photoText' && e.uri === toCommit.uri);
            if (existsById || hasPhotoTextForUri) {
              console.log('Photo already exists in entries, skipping');
              return prev;
            }
            console.log('Adding photo to entries');
            return [toCommit, ...prev];
          });
          temporaryPhotoEntry.current = null;
        } else {
          console.log('No temporary photo entry to commit or ID mismatch');
        }
      });
    }, 2500); // Reduced from 4000ms to 2500ms
    
    // Get AI description asynchronously
    try {
      console.log('Requesting AI description for image:', uri);
      const visionResult = await getGeminiVision(uri);
      console.log('Vision insights received:', visionResult);

      const description = visionResult?.description?.trim();
      const { isDocument, documentType, documentTitle, confidence } = parseDocumentHypothesis(visionResult?.documentHypothesis);
      const mergedTagsForNewEntry = visionResult?.suggestedTags
        ? Array.from(new Set([...(newEntry.aiSuggestedTags || []), ...visionResult.suggestedTags]))
        : newEntry.aiSuggestedTags;
      
      // Update the entry with the AI description
      newEntry.content = description || 'Unable to analyze image';
      newEntry.aiDescription = description || undefined;
      newEntry.aiDocumentIsDocument = typeof isDocument === 'boolean' ? isDocument : undefined;
      newEntry.aiDocumentType = documentType;
      newEntry.aiDocumentTitle = documentTitle;
      newEntry.aiDocumentConfidence = confidence;
      newEntry.aiSuggestedTags = mergedTagsForNewEntry;
      newEntry.isAnalyzing = false;
      
      // Update the corresponding entry in the list (photoText or image)
      setEntries(prev => {
        const ptIndex = prev.findIndex(e => e.type === 'photoText' && e.uri === uri);
        if (ptIndex !== -1) {
          const updated = [...prev];
          const current = updated[ptIndex] as Entry;
          const mergedTags = visionResult?.suggestedTags
            ? Array.from(new Set([...(current.aiSuggestedTags || []), ...visionResult.suggestedTags]))
            : current.aiSuggestedTags;
          updated[ptIndex] = {
            ...current,
            aiDescription: description || undefined,
            aiDocumentIsDocument: typeof isDocument === 'boolean' ? isDocument : undefined,
            aiDocumentType: documentType,
            aiDocumentTitle: documentTitle,
            aiDocumentConfidence: confidence,
            aiSuggestedTags: mergedTags,
            isAnalyzing: false,
          } as any;
          return updated;
        }
        return prev.map(entry => {
          if (entry.id !== entryId) return entry;
          const mergedTags = visionResult?.suggestedTags
            ? Array.from(new Set([...(entry.aiSuggestedTags || []), ...visionResult.suggestedTags]))
            : entry.aiSuggestedTags;
          return {
            ...entry,
            content: description || 'Unable to analyze image',
            aiDescription: description || undefined,
            aiDocumentIsDocument: typeof isDocument === 'boolean' ? isDocument : undefined,
            aiDocumentType: documentType,
            aiDocumentTitle: documentTitle,
            aiDocumentConfidence: confidence,
            aiSuggestedTags: mergedTags,
            isAnalyzing: false,
          };
        });
      });
      // Or update the pending temporary entry if not yet committed
      if (temporaryPhotoEntry.current && temporaryPhotoEntry.current.id === entryId) {
        const existingTags = temporaryPhotoEntry.current.aiSuggestedTags || [];
        const mergedTags = visionResult?.suggestedTags
          ? Array.from(new Set([...existingTags, ...visionResult.suggestedTags]))
          : existingTags;
        temporaryPhotoEntry.current = {
          ...temporaryPhotoEntry.current,
          content: newEntry.content,
          aiDescription: newEntry.aiDescription,
          aiDocumentIsDocument: newEntry.aiDocumentIsDocument,
          aiDocumentType: newEntry.aiDocumentType,
          aiDocumentTitle: newEntry.aiDocumentTitle,
          aiDocumentConfidence: newEntry.aiDocumentConfidence,
          aiSuggestedTags: mergedTags,
          isAnalyzing: false,
        };
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      newEntry.content = 'Error analyzing image';
      newEntry.isAnalyzing = false;
      
      // Update the entry in the list if it's already there
      setEntries(prev => prev.map(entry => 
        entry.id === entryId 
          ? {
              ...entry,
              content: 'Error analyzing image',
              aiDescription: undefined,
              aiDocumentIsDocument: undefined,
              aiDocumentType: undefined,
              aiDocumentTitle: undefined,
              aiDocumentConfidence: undefined,
              isAnalyzing: false,
            }
          : entry
      ));
      // Or update the pending temporary entry if not yet committed
      if (temporaryPhotoEntry.current && temporaryPhotoEntry.current.id === entryId) {
        temporaryPhotoEntry.current = {
          ...temporaryPhotoEntry.current,
          content: newEntry.content,
          aiDescription: undefined,
          aiDocumentIsDocument: undefined,
          aiDocumentType: undefined,
          aiDocumentTitle: undefined,
          aiDocumentConfidence: undefined,
          isAnalyzing: false,
        };
      }
    }
  };

  // Text entry removed in fresh UI

  // Start recording
  const startRecording = async (forPhotoContext: boolean = false, isGlobal: boolean = false) => {
    try {
      // Ensure temporary photo stays visible while speaking
      if (temporaryPhotoTimer.current) {
        clearTimeout(temporaryPhotoTimer.current);
        temporaryPhotoTimer.current = null;
      }
      // Request permissions first
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone access to record audio.');
        return;
      }

      // Set audio mode for iOS to ensure recording works properly
      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // Use HIGH_QUALITY preset which works across platforms
      // This records in a format that's compatible with Whisper
      await recorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
      await recorder.record();
      
      recordingStartTime.current = Date.now();
      console.log('Recording started successfully at', new Date(recordingStartTime.current).toISOString());
      
      setIsRecording(true);
      setIsRecordingContext(forPhotoContext);
      setIsGlobalRecording(isGlobal);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  // Stop recording and transcribe
  const stopRecording = async () => {
    try {
      const photoUriBeingRecorded = recordingPhotoUri;
      setIsRecording(false);
      setRecordingPhotoUri(null);
      if (photoUriBeingRecorded) {
        setProcessingPhotoUri(photoUriBeingRecorded);
        setIsInputFieldRecording(false); // Clear immediately for photo recordings
      } else {
        setIsProcessing(true);
      }
      
      // Calculate actual recording duration
      const actualDuration = recordingStartTime.current ? Date.now() - recordingStartTime.current : 0;
      console.log('Actual recording duration (ms):', actualDuration);
      
      // Get the recording status before stopping
      const status = recorder.getStatus();
      console.log('Recording status before stop:', status);
      
      // Stop the recording first
      await recorder.stop();
      
      // Get the final status after stopping
      const finalStatus = recorder.getStatus();
      console.log('Final recording status:', finalStatus);
      
      const uri = recorder.uri;
      console.log('Recording stopped, URI:', uri);
      
      // Check if we have a valid recording duration
      if (actualDuration < 500) {
        Alert.alert('Recording Too Short', 'Please hold the button longer to record audio.');
        setIsProcessing(false);
        recordingStartTime.current = null;
        return;
      }
      
      if (!uri) {
        Alert.alert('Error', 'Failed to get recording URI');
        return;
      }
      
      // Get file info to verify the recording
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('Recording file info:', fileInfo);
      
      if ('size' in fileInfo && fileInfo.size < 1000) {
        Alert.alert('Recording Error', 'The recording appears to be empty. Please try again and hold the button longer.');
        setIsProcessing(false);
        return;
      }
      
      // Transcribe audio
      const transcription = await transcribeWithWhisper(uri);
      let speechIntent: SpeechIntentSuggestion | null = null;

      if (transcription) {
        try {
          speechIntent = await analyzeSpeechIntent(transcription);
        } catch (intentError) {
          console.error('Failed to analyze speech intent:', intentError);
        }
      }

      if (transcription) {
        if (isInputFieldRecording && currentPhoto) {
          // For input field recordings with a photo context, create a compound photo+text entry
          const newEntry: Entry = {
            id: Date.now().toString(),
            type: 'photoText',
            content: transcription,
            uri: currentPhoto, // Store the photo URI in this entry
            timestamp: new Date(),
            isAnalyzing: true
          };

          // Animate grid update
          LayoutAnimation.configureNext({
            duration: 500,
            create: {
              type: LayoutAnimation.Types.spring,
              springDamping: 0.6,
              property: LayoutAnimation.Properties.scaleXY,
            },
            update: {
              type: LayoutAnimation.Types.spring,
              springDamping: 0.7,
              property: LayoutAnimation.Properties.scaleXY,
            },
            delete: {
              type: LayoutAnimation.Types.spring,
              springDamping: 0.6,
              property: LayoutAnimation.Properties.opacity,
            },
          });

          // Replace any existing image entry with the same URI with the new photoText entry
          // Preserve the original position in the list
          setEntries(prev => {
            const existingImageIndex = prev.findIndex(e => e.type === 'image' && e.uri === currentPhoto);
            if (existingImageIndex !== -1) {
              const existingImage = prev[existingImageIndex] as any;
              const merged = {
                ...newEntry,
                isAnalyzing: existingImage.isAnalyzing,
                aiDescription: existingImage.aiDescription,
                aiDocumentIsDocument: existingImage.aiDocumentIsDocument,
                aiDocumentType: existingImage.aiDocumentType,
                aiDocumentTitle: existingImage.aiDocumentTitle,
                aiDocumentConfidence: existingImage.aiDocumentConfidence,
                aiSuggestedTaskTitle: existingImage.aiSuggestedTaskTitle,
                aiSuggestedTaskDescription: existingImage.aiSuggestedTaskDescription,
                aiSuggestedTaskConfidence: existingImage.aiSuggestedTaskConfidence,
                aiSuggestedTags: existingImage.aiSuggestedTags,
                aiSuggestedTagsConfidence: existingImage.aiSuggestedTagsConfidence,
                timestamp: existingImage.timestamp, // Keep original timestamp to preserve order
              };
              // Replace the image entry at its current position
              const newEntries = [...prev];
              newEntries[existingImageIndex] = merged;
              return newEntries;
            }
            // If no existing image, this shouldn't happen, but add at front as fallback
            return [newEntry, ...prev];
          });

          // If there is a pending temporary photo for this uri, preserve all its AI metadata
          if (temporaryPhotoEntry.current && temporaryPhotoEntry.current.uri === currentPhoto) {
            const tempEntry = temporaryPhotoEntry.current as any;
            setEntries(prev => prev.map(e => {
              if (e.type === 'photoText' && e.uri === currentPhoto) {
                return {
                  ...e,
                  isAnalyzing: tempEntry.isAnalyzing || e.isAnalyzing,
                  aiDescription: tempEntry.aiDescription || (e as any).aiDescription,
                  aiDocumentIsDocument: tempEntry.aiDocumentIsDocument ?? (e as any).aiDocumentIsDocument,
                  aiDocumentType: tempEntry.aiDocumentType || (e as any).aiDocumentType,
                  aiDocumentTitle: tempEntry.aiDocumentTitle || (e as any).aiDocumentTitle,
                  aiDocumentConfidence: tempEntry.aiDocumentConfidence ?? (e as any).aiDocumentConfidence,
                  aiSuggestedTaskTitle: tempEntry.aiSuggestedTaskTitle || (e as any).aiSuggestedTaskTitle,
                  aiSuggestedTaskDescription: tempEntry.aiSuggestedTaskDescription || (e as any).aiSuggestedTaskDescription,
                  aiSuggestedTaskConfidence: tempEntry.aiSuggestedTaskConfidence ?? (e as any).aiSuggestedTaskConfidence,
                  aiSuggestedTags: tempEntry.aiSuggestedTags || (e as any).aiSuggestedTags,
                  aiSuggestedTagsConfidence: tempEntry.aiSuggestedTagsConfidence ?? (e as any).aiSuggestedTagsConfidence,
                };
              }
              return e;
            }));
            temporaryPhotoEntry.current = null;
          }

          setCurrentPhoto(null); // Clear the current photo since we've created the compound entry
          setIsInputFieldRecording(false);
        } else if (isInputFieldRecording) {
          // For input field recordings without photo context, create a text entry in the grid
          const newEntry: Entry = {
            id: Date.now().toString(),
            type: 'text',
            content: transcription,
            timestamp: new Date()
          };

          // Animate grid update
          LayoutAnimation.configureNext({
            duration: 400,
            create: {
              type: LayoutAnimation.Types.spring,
              springDamping: 0.7,
              property: LayoutAnimation.Properties.scaleXY,
            },
            update: {
              type: LayoutAnimation.Types.spring,
              springDamping: 0.8,
              property: LayoutAnimation.Properties.scaleXY,
            },
          });
          setEntries(prev => [newEntry, ...prev]);
          setIsInputFieldRecording(false);
        } else {
          // For regular recordings, create audio entry
          const newEntry: Entry = {
            id: Date.now().toString(),
            type: 'audio',
            content: transcription,
            uri,
            timestamp: new Date(),
            photoContext: isRecordingContext && currentPhoto ? currentPhoto : undefined
          };

          // Animate list reflow
          LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
          setEntries(prev => [newEntry, ...prev]);
        }

        if (photoUriBeingRecorded) {
          applySpeechIntentToPhoto(photoUriBeingRecorded, speechIntent);
        }
      }
      setIsRecordingContext(false);
      setIsGlobalRecording(false);
      setIsInputFieldRecording(false); // Reset input field recording state
      setProcessingPhotoUri(null); // Clear the processing photo URI
      // Clear the temporary photo since we've processed the note
      if (temporaryPhoto) {
        setTemporaryPhoto(null);
        temporaryPhotoTranslateY.setValue(0);
        if (temporaryPhotoTimer.current) {
          clearTimeout(temporaryPhotoTimer.current);
          temporaryPhotoTimer.current = null;
        }
      }
      recordingStartTime.current = null;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to process recording');
      setIsInputFieldRecording(false); // Reset input field recording state on error
      recordingStartTime.current = null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle recording
  const toggleRecording = (forPhotoContext: boolean = false) => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording(forPhotoContext);
    }
  };

  // Toggle global recording (from header button)
  const toggleGlobalRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording(false, true);
    }
  };

  // Toggle recording from input field
  const toggleInputFieldRecording = () => {
    if (isInputFieldRecording) {
      // Stop recording and process
      stopRecording();
    } else {
      // Start recording from input field
      setIsInputFieldRecording(true);
      startRecording(false, false); // Not global, not for photo context
    }
  };

  // Start editing an entry
  const startEditing = (entryId: string, currentContent: string) => {
    setEditingEntryId(entryId);
    setEditingText(currentContent);
  };

  // Save edited text
  const saveEditedText = () => {
    if (editingEntryId && editingText.trim()) {
      setEntries(prev => prev.map(entry =>
        entry.id === editingEntryId
          ? { ...entry, content: editingText.trim() }
          : entry
      ));
    }
    cancelEditing();
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingEntryId(null);
    setEditingText('');
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Generate organized notes from captured entries
  const generateOrganizedNotes = async () => {
    if (entries.length === 0) {
      Alert.alert('No Content', 'Please add some photos or record some audio before generating notes.');
      return;
    }

    try {
      setIsProcessing(true);

      // Build a single chronological JSON prompt (speech-first, always include AI photo descriptions)
      type SessionEvent = {
        type: 'speech' | 'photo';
        time: number; // seconds since epoch
        text?: string; // user's speech/transcription
        ai_description?: string; // AI description for photos
        uri?: string;
      };

      const sessionEvents: SessionEvent[] = [];

      // Ensure every photo has an AI description before building the prompt
      const mediaEntries = entries.filter(e => e.type === 'image' || e.type === 'photoText');
      const needsDescription = mediaEntries.filter(e => {
        const hasDesc = !!(e as any).aiDescription || (e.type === 'image' && e.content && e.content !== 'Analyzing image...' && e.content !== 'Error analyzing image');
        return !hasDesc && e.uri;
      });

      const newVisionData: Record<string, GeminiVisionResult | null> = {};
      if (needsDescription.length > 0) {
        try {
          await Promise.all(needsDescription.map(async (e) => {
            try {
              const vision = await getGeminiVision(e.uri!);
              if (vision) {
                newVisionData[e.id] = vision;
              }
            } catch {}
          }));

          if (Object.keys(newVisionData).length > 0) {
            setEntries(prev => prev.map(e => {
              const vision = newVisionData[e.id];
              if (!vision) return e;

              const description = vision.description?.trim();
              const { isDocument, documentType, documentTitle, confidence } = parseDocumentHypothesis(vision.documentHypothesis);
              const resolvedIsDocument = typeof isDocument === 'boolean' ? isDocument : e.aiDocumentIsDocument;
              const resolvedTitle = resolvedIsDocument ? (documentTitle ?? e.aiDocumentTitle) : undefined;
              const resolvedType = documentType ?? e.aiDocumentType;
              const resolvedConfidence = typeof confidence === 'number' ? confidence : e.aiDocumentConfidence;
              const mergedTags = vision.suggestedTags
                ? Array.from(new Set([...(e.aiSuggestedTags || []), ...vision.suggestedTags]))
                : e.aiSuggestedTags;

              if (e.type === 'image') {
                return {
                  ...e,
                  content: description || e.content,
                  aiDescription: description || e.aiDescription,
                  aiDocumentIsDocument: resolvedIsDocument,
                  aiDocumentType: resolvedType,
                  aiDocumentTitle: resolvedTitle,
                  aiDocumentConfidence: resolvedConfidence,
                  aiSuggestedTags: mergedTags,
                  isAnalyzing: false,
                } as Entry;
              }
              return {
                ...e,
                aiDescription: description || e.aiDescription,
                aiDocumentIsDocument: resolvedIsDocument,
                aiDocumentType: resolvedType,
                aiDocumentTitle: resolvedTitle,
                aiDocumentConfidence: resolvedConfidence,
                aiSuggestedTags: mergedTags,
                isAnalyzing: false,
              } as Entry;
            }));
          }
        } catch {}
      }

      entries.forEach(entry => {
        const timeSec = entry.timestamp.getTime() / 1000;
        if (entry.type === 'audio' || entry.type === 'text') {
          if (entry.content) {
            sessionEvents.push({ type: 'speech', time: timeSec, text: entry.content });
          }
        } else if (entry.type === 'photoText') {
          const visionDescription = newVisionData[entry.id]?.description;
          sessionEvents.push({
            type: 'photo',
            time: timeSec,
            ai_description: visionDescription || entry.aiDescription || 'No description available',
            uri: entry.uri,
            // Note: the model will also see a separate speech event if a standalone speech entry exists;
            // here we embed the transcription with the photo for stronger locality
            text: entry.content
          });
        } else if (entry.type === 'image') {
          const visionDescription = newVisionData[entry.id]?.description;
          sessionEvents.push({
            type: 'photo',
            time: timeSec,
            ai_description: visionDescription || entry.aiDescription || entry.content || 'No description available',
            uri: entry.uri
          });
        }
      });

      sessionEvents.sort((a, b) => a.time - b.time);

      const sessionJson = JSON.stringify({ events: sessionEvents }, null, 2);

      const prompt = `You are given a construction site capture session as chronological JSON. Prioritize the user's speech to understand intent and meaning. Use AI photo descriptions to ground and enrich context. Always consider both when available. Produce organized notes and actionable tasks.

JSON (in order):\n${sessionJson}`;

      // Get OpenAI API key
      const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!OPENAI_API_KEY) {
        Alert.alert('Configuration Error', 'OpenAI API key is not configured.');
        return;
      }

      // Call OpenAI API
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
              content: 'You are an expert AI assistant specialized in organizing construction site notes and photos into clear, actionable documentation. You excel at understanding context and creating well-structured summaries with appropriate tasks.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000,
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
      const extractedTitle = titleMatch?.[1]?.trim() || "Organized Session Notes";

      // Extract the notes section
      const notesMatch = fullResponse.match(/## Notes([\s\S]*?)(?=## Tasks|$)/);
      const organizedContent = notesMatch?.[1]?.trim() || fullResponse;

      // Extract tasks from the response
      const taskMatches = fullResponse.match(/- \[ \] .+/g) || [];

      const tasks = taskMatches.map((task: string) => {
        const taskText = task.replace('- [ ] ', '').trim();
        return {
          text: taskText,
          photoIds: undefined
        };
      });

      // Prepare the data for the parent component
      const organizedData = {
        content: organizedContent,
        photos: entries
          .filter(e => e.type === 'image' || e.type === 'photoText')
          .map(entry => ({
            uri: entry.uri!,
            timestamp: entry.timestamp.getTime(),
            aiDescription: (entry as any).aiDescription || (entry.type === 'image' ? entry.content : undefined) || 'No description available',
            photoId: entry.id
          })),
        tasks: tasks,
        promptSent: prompt
      };

      // Call the parent's callback
      if (onOpenOrganizedNotes) {
        onOpenOrganizedNotes(organizedData);
      }

    } catch (error) {
      console.error('Error generating organized notes:', error);
      Alert.alert('Error', 'Failed to generate organized notes. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Truncate text to specified number of lines (keeping for potential future use)
  const truncateText = (text: string, maxLines: number = 3): string => {
    const lines = text.split('\n');
    if (lines.length <= maxLines) return text;
    return lines.slice(0, maxLines).join('\n') + '...';
  };

  // Build timeline groups: cluster images within 10 seconds (newest first)
  const getTimelineGroups = () => {
    const imageEntries = entries.filter(e => e.type === 'image').sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const groups: { id: string; items: Entry[]; time: number }[] = [];
    const TEN_SECONDS = 10 * 1000;

    let currentGroup: Entry[] = [];
    let lastTime: number | null = null;
    for (const img of imageEntries) {
      const t = img.timestamp.getTime();
      if (lastTime === null || (lastTime - t) <= TEN_SECONDS) {
        currentGroup.push(img);
      } else {
        groups.push({ id: currentGroup[0].id + '-grp', items: currentGroup, time: currentGroup[0].timestamp.getTime() });
        currentGroup = [img];
      }
      lastTime = t;
    }
    if (currentGroup.length > 0) {
      groups.push({ id: currentGroup[0].id + '-grp', items: currentGroup, time: currentGroup[0].timestamp.getTime() });
    }
    return groups;
  };

  // Helper: latest spoken note associated with a photo (via photoContext)
  const getLatestPhotoNote = (photoUri?: string) => {
    if (!photoUri) return undefined;
    const associatedNotes = entries
      .filter(e => e.type === 'audio' && e.photoContext === photoUri)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return associatedNotes[0];
  };

  // Unified timeline renderer: interleave text, photo+text, and photo-only entries by timestamp
  const renderTimeline = () => {
    const textRows: TimelineRow[] = entries
      .filter(e => e.type === 'text')
      .map(e => ({ kind: 'text', time: e.timestamp.getTime(), entry: e }));

    const photoTextRows: TimelineRow[] = entries
      .filter(e => e.type === 'photoText')
      .map(e => ({ kind: 'photoText', time: e.timestamp.getTime(), entry: e }));

    const imageRows: TimelineRow[] = entries
      .filter(e => e.type === 'image')
      .map(e => ({ kind: 'image', time: e.timestamp.getTime(), entry: e }));

    const allRows: TimelineRow[] = [...textRows, ...photoTextRows, ...imageRows]
      .sort((a, b) => b.time - a.time);

    // Always call hooks unconditionally (before any early returns)
    const emptyStateAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        animatedIndex.value,
        [0, 1],
        [1, 0],
        Extrapolate.CLAMP
      );
      return { opacity };
    });

    const skeletonAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        animatedIndex.value,
        [0, 1],
        [0, 1],
        Extrapolate.CLAMP
      );
      return { opacity };
    });

    const renderTimelineRow = (item: TimelineRow, index: number) => {
      const isFirst = index === 0;
      const key = item.kind === 'text'
        ? `text-${item.entry.id}`
        : item.kind === 'photoText'
          ? `photoText-${item.entry.id}`
          : `image-${item.entry.id}`;

      if (item.kind === 'photoText') {
        const entry = item.entry as Entry;
        return (
          <View
            key={key}
            ref={isFirst ? (node) => { topRowRef.current = node as any; } : undefined}
            style={styles.photoTextContainer}
          >
            <View style={styles.photoTextCard}>
              <View style={styles.photoTextLeft}>
                <TouchableOpacity onPress={() => handlePhotoTap(entry.uri!)}>
                  <Image source={{ uri: entry.uri! }} style={styles.photoTextThumbnail} />
                </TouchableOpacity>
              </View>
              <View style={styles.photoTextRight}>
                <View style={styles.photoTextContentContainer}>
                  {editingEntryId === entry.id ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.photoTextInput}
                        value={editingText}
                        onChangeText={setEditingText}
                        multiline
                        autoFocus
                        placeholder="Edit transcription..."
                      />
                      <View style={styles.editButtons}>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={cancelEditing}
                        >
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.saveButton}
                          onPress={saveEditedText}
                        >
                          <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.photoTextTouchable}
                        onPress={() => startEditing(entry.id, entry.content)}
                      >
                        <Text style={styles.photoTextContent} numberOfLines={3}>
                          {entry.content}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleSpeakForPhoto(entry.uri!)}
                        style={styles.photoTextMicButton}
                        activeOpacity={0.8}
                      >
                        <Mic size={18} color="#64748B" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>
            {renderPhotoMeta(entry)}
            {renderTaskSuggestion(entry)}
            {renderDocumentTooltip(entry)}
          </View>
        );
      }

      if (item.kind === 'text') {
        const entry = item.entry as Entry;
        return (
          <View
            key={key}
            ref={isFirst ? (node) => { topRowRef.current = node as any; } : undefined}
            style={styles.fullWidthTextContainer}
          >
            <View style={styles.fullWidthTextCard}>
              {editingEntryId === entry.id ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.fullWidthTextInput}
                    value={editingText}
                    onChangeText={setEditingText}
                    multiline
                    autoFocus
                    placeholder="Edit transcription..."
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={cancelEditing}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={saveEditedText}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.fullWidthTextTouchable}
                  onPress={() => startEditing(entry.id, entry.content)}
                >
                  <Text style={styles.fullWidthTextContent}>
                    {entry.content}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      }

      const entry = item.entry as Entry;
      return (
        <View
          key={key}
          ref={isFirst ? (node) => { topRowRef.current = node as any; } : undefined}
          style={styles.photoTextContainer}
        >
          <View style={styles.photoTextCard}>
            <View style={styles.photoTextLeft}>
              <TouchableOpacity onPress={() => handlePhotoTap(entry.uri!)}>
                <Image source={{ uri: entry.uri! }} style={styles.photoTextThumbnail} />
              </TouchableOpacity>
            </View>
            <View style={styles.photoPlaceholderRight}>
              <View style={styles.photoPlaceholderContainer}>
                {processingPhotoUri === entry.uri ? (
                  <View style={styles.photoPlaceholderFooterRow}>
                    <Text style={styles.photoPlaceholderText}>Processing...</Text>
                    <View style={styles.photoListeningPillButton}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  </View>
                ) : recordingPhotoUri === entry.uri ? (
                  <View style={styles.photoPlaceholderFooterRow}>
                    <Text style={styles.photoPlaceholderText}>Listening...</Text>
                    <TouchableOpacity 
                      onPress={() => handleSpeakForPhoto(entry.uri!)}
                      style={styles.photoListeningPillButton}
                      activeOpacity={0.8}
                    >
                      <AudioLines size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.photoPlaceholderFooterRow}>
                    <Text style={styles.photoPlaceholderText}>Add notes...</Text>
                    {isFirst ? (
                      <View style={styles.photoButtonContainer}>
                        <Animated.View style={[styles.photoButtonAbsolute, animatedSpeakButtonStyle]} pointerEvents={currentSnapIndex === 0 ? 'auto' : 'none'}>
                          <TouchableOpacity 
                            onPress={() => handleSpeakForPhoto(entry.uri!)}
                            style={styles.photoExpandedSpeakButton}
                            activeOpacity={0.8}
                          >
                            <AudioLines size={16} color="#FFFFFF" />
                            <Text style={styles.photoExpandedSpeakButtonText}>Speak</Text>
                          </TouchableOpacity>
                        </Animated.View>

                        <Animated.View style={[styles.photoButtonAbsolute, animatedMicIconStyle]} pointerEvents={currentSnapIndex === 0 ? 'none' : 'auto'}>
                          <TouchableOpacity 
                            onPress={() => handleSpeakForPhoto(entry.uri!)}
                            style={styles.photoPlaceholderMicButton}
                            activeOpacity={0.8}
                          >
                            <Mic size={18} color="#64748B" />
                          </TouchableOpacity>
                        </Animated.View>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        onPress={() => handleSpeakForPhoto(entry.uri!)}
                        style={styles.photoPlaceholderMicButton}
                        activeOpacity={0.8}
                      >
                        <Mic size={18} color="#64748B" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
          {renderPhotoMeta(entry)}
          {renderTaskSuggestion(entry)}
          {renderDocumentTooltip(entry)}
        </View>
      );
    };

    if (allRows.length === 0) {
      return (
        <View style={{ flex: 1 }}>
          {/* Empty state - fades out completely as modal opens to 85% */}
          <Animated.View style={[
            styles.emptyState,
            emptyStateAnimatedStyle,
            { pointerEvents: currentSnapIndex === 0 ? 'auto' : 'none' }
          ]}>
            <View style={styles.emptyStateTitleContainer}>
              <CamAIIcon size={24} glyphColor="#000000" />
              <Text style={styles.emptyStateTitle}>Take pictures and talk</Text>
            </View>
            <Text style={styles.emptyStateDescription}>
              Photos save to CompanyCam with AI notes. Can also generate proposals, work orders, punch lists, and more.
            </Text>
          </Animated.View>

          {/* Skeleton UI - fades in as modal opens to 85% */}
          <Animated.View style={[
            styles.skeletonContainerAbsolute,
            skeletonAnimatedStyle,
            { pointerEvents: currentSnapIndex === 1 ? 'auto' : 'none' }
          ]}>
            <View style={styles.skeletonRow}>
              <View style={styles.skeletonPhoto} />
              <View style={styles.skeletonTextContainer}>
                <View style={styles.skeletonTextLine} />
                <View style={[styles.skeletonTextLine, { width: '70%' }]} />
              </View>
            </View>
            <View style={styles.skeletonRow}>
              <View style={styles.skeletonPhoto} />
              <View style={styles.skeletonTextContainer}>
                <View style={styles.skeletonTextLine} />
                <View style={[styles.skeletonTextLine, { width: '60%' }]} />
              </View>
            </View>
            <View style={styles.skeletonRow}>
              <View style={styles.skeletonPhoto} />
              <View style={styles.skeletonTextContainer}>
                <View style={styles.skeletonTextLine} />
                <View style={[styles.skeletonTextLine, { width: '80%' }]} />
              </View>
            </View>
          </Animated.View>
        </View>
      );
    }

    return (
      <View style={styles.timelineWrapper}>
        {allRows.map((row, index) => renderTimelineRow(row, index))}
      </View>
    );
  };

  const renderPhotoDescription = (entry: Entry) => {
    const description = entry.isAnalyzing ? undefined : (entry.aiDescription || (entry.type === 'image' ? entry.content : undefined));
    if (!description) {
      return null;
    }

    return (
      <View style={styles.aiDescriptionRow}>
        <Sparkles size={16} color="#64748B" style={styles.sparkleIcon} />
        <Text style={styles.aiDescriptionTextNormal}>{description}</Text>
      </View>
    );
  };

  const [savingDocumentMap, setSavingDocumentMap] = useState<Record<string, boolean>>({});
  const [savedDocumentMap, setSavedDocumentMap] = useState<Record<string, boolean>>({});

  const handleCreateDocument = useCallback(async (entry: Entry) => {
    if (!entry.aiDocumentTitle) return;

    try {
      setSavingDocumentMap(prev => ({ ...prev, [entry.id]: true }));

      // TODO: Implement actual document saving logic
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save
      console.log('Saving document:', entry.aiDocumentTitle);

      // Mark as saved
      setSavedDocumentMap(prev => ({ ...prev, [entry.id]: true }));

    } catch (error) {
      console.error('Failed to create document:', error);
      Alert.alert('Document Save Failed', 'Something went wrong while saving the document. Please try again.');
    } finally {
      setSavingDocumentMap(prev => {
        const next = { ...prev };
        delete next[entry.id];
        return next;
      });
    }
  }, []);

  const handleViewDocument = useCallback((entry: Entry) => {
    // TODO: Navigate to documents screen
    console.log('View document:', entry.aiDocumentTitle);
    Alert.alert('View Document', `This will navigate to the saved document.`);
  }, []);

  const handleClearDocument = useCallback((entry: Entry) => {
    // Clear the saved state for this document
    setSavedDocumentMap(prev => {
      const next = { ...prev };
      delete next[entry.id];
      return next;
    });
  }, []);

  const renderDocumentTooltip = (entry: Entry) => {
    const isDocument = entry.aiDocumentIsDocument;
    const docTitle = entry.aiDocumentTitle;
    const hasDocSuggestion = Boolean(isDocument && docTitle);
    
    if (!hasDocSuggestion || !docTitle) {
      return null;
    }

    const isSaving = savingDocumentMap[entry.id];
    const isSaved = savedDocumentMap[entry.id];

    return (
      <View style={styles.documentSuggestionWrapper}>
        {/* Label outside/above card */}
        <View style={styles.documentSuggestionLabelOutside}>
          <Text style={[styles.documentSuggestionLabelText, isSaved && styles.documentSuggestionLabelSaved]}>
            {isSaved ? 'Document Saved' : 'Document Detected'}
          </Text>
        </View>

        {/* Single Row Card: Icon + Title + Actions */}
        <View style={[styles.documentSuggestionCard, isSaved && styles.documentSuggestionCardSaved]}>
          <View style={styles.documentSuggestionLeft}>
            <FileText size={18} color={isSaved ? "#3B82F6" : "#94A3B8"} />
          </View>
          <Text style={styles.documentSuggestionTitle} numberOfLines={1}>{docTitle}</Text>
          {isSaving ? (
            <ActivityIndicator size="small" color="#64748B" />
          ) : isSaved ? (
            <TouchableOpacity onPress={() => handleClearDocument(entry)}>
              <Text style={styles.documentSuggestionActionText}>Clear</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.documentSuggestionActions}>
              <TouchableOpacity onPress={() => handleCreateDocument(entry)}>
                <Text style={styles.documentSuggestionActionText}>Accept</Text>
              </TouchableOpacity>
              <Text style={styles.documentSuggestionActionDivider}>·</Text>
              <TouchableOpacity onPress={() => handleClearDocument(entry)}>
                <Text style={styles.documentSuggestionActionText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderPhotoMeta = (entry: Entry) => {
    if (!showTags) {
      return null;
    }

    const tags = entry.aiSuggestedTags;
    const hasTags = Array.isArray(tags) && tags.length > 0;

    if (!hasTags) {
      return null;
    }

    return (
      <View style={styles.tagsSuggestionWrapper}>
        <View style={[styles.actionPill, styles.actionPillTransparent]}>
          <TagIcon size={16} color="#94A3B8" />
          <Text style={[styles.actionPillText, styles.actionPillTextLight]} numberOfLines={1}>{tags!.join(', ')}</Text>
        </View>
      </View>
    );
  };

  const [creatingTaskMap, setCreatingTaskMap] = useState<Record<string, boolean>>({});
  const [savedTaskMap, setSavedTaskMap] = useState<Record<string, boolean>>({});

  const handleCreateSuggestedTask = useCallback(async (entry: Entry) => {
    if (!entry.aiSuggestedTaskTitle) return;

    try {
      setCreatingTaskMap(prev => ({ ...prev, [entry.id]: true }));

      const taskText = entry.aiSuggestedTaskDescription
        ? `${entry.aiSuggestedTaskTitle} — ${entry.aiSuggestedTaskDescription}`
        : entry.aiSuggestedTaskTitle;

      await saveTask({
        text: taskText,
        completed: false,
        projectName: displayProjectName,
        photoIds: [entry.id],
      });

      // Mark as saved instead of removing
      setSavedTaskMap(prev => ({ ...prev, [entry.id]: true }));

    } catch (error) {
      console.error('Failed to create task from suggestion:', error);
      Alert.alert('Task Creation Failed', 'Something went wrong while creating the task. Please try again.');
    } finally {
      setCreatingTaskMap(prev => {
        const next = { ...prev };
        delete next[entry.id];
        return next;
      });
    }
  }, [displayProjectName]);

  const handleViewOnProject = useCallback((entry: Entry) => {
    // TODO: Navigate to project/tasks screen
    console.log('View on project:', displayProjectName, 'Task:', entry.aiSuggestedTaskTitle);
    Alert.alert('View on Project', `This will navigate to ${displayProjectName} tasks.`);
  }, [displayProjectName]);

  const renderTaskSuggestion = (entry: Entry) => {
    if (!entry.aiSuggestedTaskTitle) {
      return null;
    }

    const isCreating = creatingTaskMap[entry.id];
    const isSaved = savedTaskMap[entry.id];

    return (
      <View style={styles.taskSuggestionWrapper}>
        {/* Label outside/above card */}
        <View style={styles.taskSuggestionLabelOutside}>
          <Text style={[styles.taskSuggestionLabelText, isSaved && styles.taskSuggestionLabelSaved]}>
            {isSaved ? 'Task Saved' : 'Suggested Task'}
          </Text>
        </View>

        {/* Single Row Card: Circle + Title + Actions */}
        <View style={[styles.taskSuggestionCard, isSaved && styles.taskSuggestionCardSaved]}>
          <View style={styles.taskSuggestionLeft}>
            <View style={[styles.taskSuggestionCircle, isSaved && styles.taskSuggestionCircleSaved]} />
          </View>
          <Text style={styles.taskSuggestionTitle}>{entry.aiSuggestedTaskTitle}</Text>
          {isCreating ? (
            <ActivityIndicator size="small" color="#64748B" />
          ) : isSaved ? (
            <TouchableOpacity onPress={() => handleClearTask(entry)}>
              <Text style={styles.taskSuggestionActionText}>Clear</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.taskSuggestionActions}>
              <TouchableOpacity onPress={() => handleCreateSuggestedTask(entry)}>
                <Text style={styles.taskSuggestionActionText}>Accept</Text>
              </TouchableOpacity>
              <Text style={styles.taskSuggestionActionDivider}>·</Text>
              <TouchableOpacity onPress={() => handleClearTask(entry)}>
                <Text style={styles.taskSuggestionActionText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const handleClearTask = useCallback((entry: Entry) => {
    // Clear the saved state for this task
    setSavedTaskMap(prev => {
      const next = { ...prev };
      delete next[entry.id];
      return next;
    });
  }, []);

  const handleSpeakForPhoto = (uri: string) => {
    // Clear any auto-collapse timer when user interacts
    if (expandedPhotoTimer.current) {
      clearTimeout(expandedPhotoTimer.current);
      expandedPhotoTimer.current = null;
    }
    
    if (recordingPhotoUri === uri) {
      // Stop recording for this specific photo
      stopRecording();
    } else {
      // Start recording for this specific photo
      setCurrentPhoto(uri);
      setRecordingPhotoUri(uri);
      setExpandedPhotoUri(null); // Clear expanded state when starting to record
      setIsInputFieldRecording(true);
      startRecording(true);
    }
  };

  const handlePhotoTap = (uri: string) => {
    setSelectedPhotoUri(uri);
    setShowPhotoDetail(true);
  };

  const handleClosePhotoDetail = () => {
    setShowPhotoDetail(false);
    setSelectedPhotoUri(null);
    setPhotoDetailRecording(false);
    setPhotoDetailProcessing(false);
  };

  const handlePillPress = (type: string) => {
    setSelectedCreateType(type);
    setShowCreateModal(true);
  };

  const handleCaptureMore = () => {
    setShowCreateModal(false);
    // Keep selectedCreateType set so the pill stays selected
    // and the generate button appears
  };

  const handleConfirmCreate = () => {
    setShowCreateModal(false);
    console.log(`Creating ${selectedCreateType}`);
    // TODO: Implement document creation logic
  };

  const handleClearSelection = () => {
    setSelectedCreateType('');
  };

  const handlePhotoDetailStartRecording = async () => {
    try {
      // Request permissions first
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone access to record audio.');
        return;
      }

      // Set audio mode for iOS to ensure recording works properly
      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // Use HIGH_QUALITY preset which works across platforms
      await recorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
      await recorder.record();
      
      recordingStartTime.current = Date.now();
      setPhotoDetailRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const handlePhotoDetailStopRecording = async (callback?: (transcription: string) => void) => {
    try {
      setPhotoDetailRecording(false);
      setPhotoDetailProcessing(true);
      
      // Calculate actual recording duration
      const actualDuration = recordingStartTime.current ? Date.now() - recordingStartTime.current : 0;
      
      if (actualDuration < 500) {
        Alert.alert('Recording Too Short', 'Please hold the button longer to record audio.');
        setPhotoDetailProcessing(false);
        recordingStartTime.current = null;
        return;
      }
      
      // Stop the recording
      await recorder.stop();
      const uri = recorder.uri;
      
      if (!uri) {
        Alert.alert('Error', 'Failed to get recording URI');
        setPhotoDetailProcessing(false);
        return;
      }
      
      // Get file info to verify the recording
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if ('size' in fileInfo && fileInfo.size < 1000) {
        Alert.alert('Recording Error', 'The recording appears to be empty. Please try again and hold the button longer.');
        setPhotoDetailProcessing(false);
        return;
      }
      
      // Transcribe audio
      const transcription = await transcribeWithWhisper(uri);
      
      if (transcription) {
        // Pass transcription back to photo detail screen
        callback?.(transcription);
      }
      
      recordingStartTime.current = null;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to process recording');
      recordingStartTime.current = null;
    } finally {
      setPhotoDetailProcessing(false);
    }
  };

  const handleSavePhotoNotes = (notes: string) => {
    if (selectedPhotoUri) {
      // Save notes for this specific photo
      setPhotoNotes(prev => ({
        ...prev,
        [selectedPhotoUri]: notes
      }));
      
      // Optionally close the photo detail after saving
      Alert.alert('Success', 'Notes saved successfully!');
    }
  };

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isInCameraContext ? 0 : initialSnapIndex}
      snapPoints={isInCameraContext ? ['19%', '85%'] : ['50%', '85%']}
      animatedIndex={animatedIndex}
      backdropComponent={showBackdrop ? renderBackdrop : undefined}
      onClose={isInCameraContext ? undefined : onClose}
      enablePanDownToClose={false}
      onChange={(index) => {
        setCurrentSnapIndex(index);
        animatedIndex.value = index;
      }}
      style={styles.bottomSheet}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enableDynamicSizing={false}
      animateOnMount={false}
    >
      <BottomSheetView style={styles.flexContainer}>
        <View style={styles.headerContainer}>
          {isInCameraContext ? (
            showProjectTitle ? (
              <View style={styles.cameraHeader}>
                <TouchableOpacity
                  onPress={() => setShowProjectSwitcher(true)}
                  style={styles.projectSwitcherButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.projectTitle} numberOfLines={1}>
                    {displayProjectName}
                  </Text>
                  <ChevronDown size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
            ) : null
          ) : (
            <View style={[styles.header, isInCameraContext && styles.headerNoDivider]}>
              <Text style={styles.title}>{title}</Text>
              {!isInCameraContext && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <BottomSheetScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 160 }]}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[styles.tabsContainer, animatedTabsStyle]}
            pointerEvents={currentSnapIndex > 0 ? 'auto' : 'none'}
          >
            <View style={styles.topSectionContainer}>
              <View style={styles.aiAssistContent}>
                <View style={styles.aiAssistTitleContainer}>
                  <Text style={styles.aiAssistTitle}>Create with Cam AI</Text>
                  <CamAIIcon size={20} glyphColor="#000000" />
                </View>

                {/* Single horizontal row with AI Notes first, then other options */}
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.aiAssistScrollView}
                  contentContainerStyle={styles.aiAssistOptionsRow}
                >
                  {/* AI Notes - always selected, first in row */}
                  <View style={styles.aiAssistAINotesWrapper}>
                    <View style={styles.aiAssistAINotesSelected}>
                      <Sparkles size={14} color="#FFFFFF" />
                      <Text style={styles.aiAssistAINotesText}>AI Notes</Text>
                      <CheckCircle2 size={14} color="#FFFFFF" />
                    </View>
                    <Text style={styles.aiAssistAlwaysOnText}>Always on</Text>
                  </View>

                  {/* Other options in the same row */}
                  {OUTPUT_TYPE_OPTIONS.map((option) => {
                    const isSelected = selectedOutputTypes.has(option.id);
                    const IconComponent = option.icon;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.aiAssistPill,
                          isSelected && styles.aiAssistPillSelected
                        ]}
                        onPress={() => toggleOutputType(option.id)}
                        activeOpacity={0.7}
                      >
                        <IconComponent size={14} color={isSelected ? '#FFFFFF' : '#64748B'} />
                        <Text style={[
                          styles.aiAssistPillText,
                          isSelected && styles.aiAssistPillTextSelected
                        ]}>
                          {option.label}
                        </Text>
                        {isSelected && <CheckCircle2 size={12} color="#FFFFFF" />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <Text style={styles.capturesHeader}>Photos & Notes</Text>

              <View style={styles.tabsActionsRow}>
                <TouchableOpacity style={styles.tabSelectTextButton} onPress={() => console.log('Select')}>
                  <CheckCircle2 size={18} color="#64748B" />
                  <Text style={styles.tabSelectButtonText}>Select</Text>
                </TouchableOpacity>
                <View style={styles.tabsActionsRight}>
                  <TouchableOpacity style={styles.tabActionButton} onPress={() => console.log('Tag')}>
                    <TagIcon size={18} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.tabActionButton} onPress={() => console.log('Share')}>
                    <Share size={18} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.tabActionButton} onPress={() => console.log('Menu')}>
                    <MoreHorizontal size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>

          {renderTimeline()}
        </BottomSheetScrollView>

      </BottomSheetView>

      {isInCameraContext && (
        <Modal
          visible={showProjectSwitcher}
          transparent
          animationType="fade"
          onRequestClose={() => setShowProjectSwitcher(false)}
        >
          <View style={styles.switcherOverlay}>
            <View style={styles.switcherCard}>
              <Text style={styles.switcherTitle}>Select Project</Text>
              <FlatList
                data={availableProjects}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.switcherItem}
                    onPress={() => handleSelectProject(item)}
                  >
                    <Text style={styles.switcherItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity onPress={() => setShowProjectSwitcher(false)} style={styles.switcherCancelButton}>
                <Text style={styles.switcherCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Photo Detail Modal */}
      {showPhotoDetail && selectedPhotoUri && (
        <Modal
          visible={showPhotoDetail}
          animationType="fade"
          presentationStyle="fullScreen"
          statusBarTranslucent={true}
        >
          <PhotoDetailScreen
            photoUri={selectedPhotoUri}
            onClose={handleClosePhotoDetail}
            onEdit={() => console.log('Edit pressed')}
            onTag={() => console.log('Tag pressed')}
            onCreateTask={() => console.log('Create task pressed')}
            onMention={() => console.log('Mention pressed')}
            onShare={() => console.log('Share pressed')}
            onAskAI={() => console.log('Ask AI pressed')}
            onStartRecording={handlePhotoDetailStartRecording}
            onStopRecording={handlePhotoDetailStopRecording}
            onSaveNotes={handleSavePhotoNotes}
            isRecording={photoDetailRecording}
            isProcessing={photoDetailProcessing}
            aiDescription={(() => {
              const entry = entries.find(e => e.uri === selectedPhotoUri);
              return (entry as any)?.aiDescription;
            })()}
            initialNotes={(() => {
              const entry = entries.find(e => e.uri === selectedPhotoUri && e.type === 'photoText');
              return entry?.content || '';
            })()}
          />
        </Modal>
      )}

      {/* Create Confirmation Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.createModalOverlay}>
          <View style={styles.createModalCard}>
            <Text style={styles.createModalTitle}>Create {selectedCreateType}?</Text>
            <Text style={styles.createModalDescription}>
              We'll use all your captured photos and notes to create your {selectedCreateType.toLowerCase()}.
            </Text>

            <View style={styles.createModalButtons}>
              <TouchableOpacity
                style={[styles.createModalButton, styles.createModalButtonPrimary]}
                onPress={handleCaptureMore}
              >
                <Text style={styles.createModalButtonTextPrimary}>Capture More</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.createModalButton, styles.createModalButtonSecondary]}
                onPress={handleConfirmCreate}
              >
                <Text style={styles.createModalButtonTextSecondary}>Get {selectedCreateType}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
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
    paddingHorizontal: 16,
  },
  flexContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  headerContainer: {
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    marginLeft: 24,
  },
  headerNoDivider: {
    borderBottomWidth: 0,
  },

  cameraHeader: {
    paddingTop: 0,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectSwitcherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  projectTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#64748B',
    maxWidth: screenWidth * 0.7,
    textAlign: 'center',
  },

  currentPhotoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    gap: 12,
  },
  currentPhotoThumbnail: {
    width: 96,
    height: 96,
    borderRadius: 10,
    resizeMode: 'cover',
    borderWidth: 0,
  },
  photoSpeakButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#667EEA',
    borderRadius: 16,
    gap: 8,
    minHeight: 60,
    shadowColor: '#667EEA',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  photoSpeakButtonActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOpacity: 0.5,
    transform: [{ scale: 0.98 }],
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  photoSpeakButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  photoSpeakButtonTextActive: {
    color: '#FFFFFF',
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  switcherOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  switcherCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  switcherTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  switcherItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  switcherItemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#334155',
  },
  switcherCancelButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  switcherCancelText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#3B82F6',
  },

  entriesList: {
    flex: 1,
    marginTop: 0,
  },
  listHeaderContainer: {
    paddingBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  timelineWrapper: {
    flex: 1,
    minHeight: 0,
  },
  entriesContent: {
    paddingVertical: 0,
    paddingBottom: 16,
  },
  entryContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 0,
  },
  audioEntryContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 0,
  },
  audioEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  audioEntryContent: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryTypeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  audioIcon: {
    backgroundColor: '#3B82F6',
  },
  imageIcon: {
    backgroundColor: '#10B981',
  },
  textIcon: {
    backgroundColor: '#64748B',
  },
  entryTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  entryThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 12,
    resizeMode: 'cover',
    borderWidth: 0,
  },
  imageContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  imageDescriptionContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    flexShrink: 1,
    paddingTop: 4,
  },
  imageDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 0,
    color: '#475569',
  },
  analyzingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyzingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
  },
  entryContent: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  photoContextIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  photoContextText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
  groupedEntryContainer: {
    marginBottom: 8,
  },
  simplifiedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginBottom: 6,
  },
  simplifiedThumb: {
    width: 88,
    height: 88,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  simplifiedRight: {
    flex: 1,
  },
  simplifiedRightRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  simplifiedRightColumn: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: 88, // Minimum height to match thumbnail
  },
  aiDescriptionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 8,
  },
  aiMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  aiMetaInset: {
    alignSelf: 'stretch',
    paddingLeft: 12,
  },
  aiMetaInsideTight: {
    alignSelf: 'stretch',
    marginTop: 0,
    marginLeft: 16,
  },
  tagsSuggestionWrapper: {
    marginTop: 6,
    marginBottom: 0,
    marginLeft: 16,
  },
  aiTaskInset: {
    alignSelf: 'stretch',
    marginTop: 6,
  },
  sparkleIcon: {
    marginTop: 2,
  },
  aiDescriptionTextNormal: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#475569',
    lineHeight: 19,
  },
  actionPillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  actionPillActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  actionPillTransparent: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  actionPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  actionPillTextActive: {
    color: '#FFFFFF',
  },
  actionPillTextLight: {
    color: '#94A3B8',
  },
  inputStub: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 999,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    height: 44, // fixed to align top edge with thumbnail
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputStubText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },

  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    height: 36, // fixed so input (44) + gap (8) + chips (36) = 88 to match thumbnail
  },

  chipButtonSubtle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  chipTextSubtle: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748B',
  },
  contextEntryContainer: {
    flexDirection: 'row',
    marginTop: -4,
    marginBottom: 8,
  },
  contextConnector: {
    width: 2,
    backgroundColor: '#E2E8F0',
    marginLeft: 59,
    marginRight: 16,
    marginTop: 4,
    marginBottom: 4,
  },
  contextContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0,
  },
  contextLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#3B82F6',
    marginLeft: 8,
  },
  aiDescriptionLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#10B981',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 40,
  },
  emptyStateTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 8,
    marginBottom: 4,
  },
  emptyStateLogo: {
    width: 28,
    height: 28,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 22,
    color: '#1E293B',
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyStateScrollView: {
    width: screenWidth,
    marginLeft: -16,
  },
  emptyStateOutputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 20,
    paddingRight: 20,
  },
  emptyStateAINotesWrapper: {
    alignItems: 'center',
  },
  emptyStateAINotesSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#3B82F6',
    borderRadius: 999,
  },
  emptyStateAINotesText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  emptyStateAlwaysOnText: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 3,
  },
  emptyStateOptionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  emptyStateOptionPillSelected: {
    backgroundColor: '#64748B',
    borderColor: '#64748B',
  },
  emptyStateOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  emptyStateOptionTextSelected: {
    color: '#FFFFFF',
  },
  skeletonContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  skeletonContainerAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  skeletonPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  skeletonTextContainer: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  skeletonTextLine: {
    height: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
  inputArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: 'white',
  },
  inputAreaTop: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16, // Reserve space for micro-hints (16px + 16px for hint height)
    backgroundColor: 'white',
  },
  inputRowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  temporaryPhotoContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  temporaryPhoto: {
    width: '100%',
    height: '100%',
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 33,
    paddingLeft: 24,
    paddingRight: 16,
    paddingVertical: 8,
    height: 66,
  },
  textInputContainerWithPhoto: {
    backgroundColor: '#F8FAFC',
    height: 66, // Match the temporary photo height (66px)
    alignItems: 'center',
    borderRadius: 33,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Inter-semibold',
    fontSize: 15,
    color: '#1E293B',
    maxHeight: 50,
    paddingVertical: 0,
    marginRight: 8,
  },
  speakInsideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#1E293B',
    borderRadius: 22,
    height: 40,
  },
  speakInsideButtonWithPhoto: {
    backgroundColor: '#1E293B',
    shadowColor: '#1E293B',
  },
  speakInsideButtonActive: {
    backgroundColor: '#000000',
  },
  speakInsideButtonProcessing: {
    backgroundColor: '#64748B',
    opacity: 0.8,
  },
  speakInsideButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  speakInsideButtonTextWithPhoto: {
    color: '#FFFFFF',
  },
  speakInsideButtonTextActive: {
    color: '#FFFFFF',
  },
  speakInsideButtonTextProcessing: {
    color: '#FFFFFF',
  },
  sendButton: {
    padding: 8,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  recordButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordButtonActive: {
    backgroundColor: '#EF4444',
  },
  recordButtonProcessing: {
    backgroundColor: '#64748B',
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  
  // Photo with AI indicator
  photoWithIndicator: {
    position: 'relative',
    width: 88,
    height: 88,
  },
  photoAIIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  // Photo Grid
  gridContainer: {
    paddingVertical: 8,
    paddingBottom: 20, // Extra padding for camera context
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
  },
  gridPhotoContainer: {
    flex: 1,
    maxWidth: '23%', // 4 photos per row with proper spacing
    marginBottom: 20,
    alignItems: 'center',
  },
  photoWithIndicatorGrid: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1, // Square photos
  },
  gridPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  popOffNote: {
    position: 'absolute',
    top: -12,
    right: -12,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  noteStem: {
    width: 12,
    height: 8,
    backgroundColor: '#F8FAFC',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 0,
    marginBottom: 2,
    transform: [{ rotate: '-45deg' }],
  },
  noteBubble: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  gridTextContainer: {
    flex: 1,
    maxWidth: '23%',
    marginBottom: 20,
    alignItems: 'center',
  },
  textNoteCard: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
  },
  textNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  textNoteContent: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
    flex: 1,
  },
  textNoteTimestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'right',
  },
  photoTextContainer: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
  },
  photoTextCard: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  photoTextLeft: {
    marginRight: 10,
  },
  photoTextRight: {
    flex: 1,
    justifyContent: 'center',
  },
  photoTextThumbnail: {
    width: 78,
    height: 78,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  photoTextContentContainer: {
    flex: 1,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 78,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  photoTextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  photoTextLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  photoTextContent: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
    paddingBottom: 0,
    includeFontPadding: false,
  },
  photoPlaceholderContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 0,
    height: 78,
  },
  photoPlaceholderRight: {
    flex: 1,
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
    flex: 1,
  },
  photoPlaceholderFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  photoPlaceholderListeningText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  photoButtonContainer: {
    position: 'relative',
    height: 40,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  photoButtonAbsolute: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  photoPlaceholderMicButton: {
    padding: 6,
    marginLeft: 8,
  },
  photoPlaceholderMicButtonActive: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 8,
  },
  photoListeningPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#000000',
    borderRadius: 24,
  },
  photoListeningButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  photoExpandedSpeakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#1E293B',
    borderRadius: 24,
  },
  photoExpandedSpeakButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Full width text entries (voice notes without photos)
  fullWidthTextContainer: {
    width: '100%',
    marginBottom: 12,
  },
  fullWidthTextCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 0,
  },
  fullWidthTextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  fullWidthTextLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fullWidthTextContent: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
    marginBottom: 0,
  },


  // Touchable and edit styles
  photoTextTouchable: {
    flex: 1,
  },
  photoTextMicButton: {
    padding: 6,
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  fullWidthTextTouchable: {
    flex: 1,
  },
  editContainer: {
    // Let content size naturally
  },
  photoTextInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
    textAlignVertical: 'top',
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 0,
  },
  fullWidthTextInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
    textAlignVertical: 'top',
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 0,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
    alignSelf: 'flex-end', // Align buttons to the right
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#475569',
  },

  // Removed old timeline styles - now using grid layout
  speakPillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#8B5CF6',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  speakPillSmallActive: {
    backgroundColor: '#EF4444',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#EF4444',
    shadowOpacity: 0.4,
    transform: [{ scale: 0.95 }],
  },
  speakPillSmallText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  speakPillSmallTextActive: {
    color: '#FFFFFF',
  },

  noteBubbleBelow: {
    maxWidth: 220,
    marginTop: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noteBubbleInline: {
    maxWidth: 180,
    marginTop: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noteBubbleText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#334155',
  },
  
  // Photo notes field (matching Write Notes style)
  photoNotesContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 33,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 8,
    height: 66,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  photoNotesInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1E293B',
    paddingVertical: 0,
    marginRight: 6,
    maxHeight: 50,
  },
  photoSpeakInsideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#E2E8F0',
    borderRadius: 24,
  },
  photoSpeakInsideButtonActive: {
    backgroundColor: '#000000',
  },
  photoSpeakInsideButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#475569',
  },
  photoSpeakInsideButtonTextActive: {
    color: '#FFFFFF',
  },

  // Photo action buttons container and styles
  photoActionButtonsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flex: 1,
    justifyContent: 'center',
  },
  photoActionButtonActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  photoActionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#475569',
  },
  photoActionButtonTextActive: {
    color: '#FFFFFF',
  },

  // Big pill button for photo entries (Speak only in camera context)
  pillButtonsScrollView: {
    flexGrow: 0,
  },
  pillButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16, // Add padding for scroll overflow
  },
  bigPillButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 999, // Full pill shape
    minWidth: 100, // Ensure buttons are wide enough
  },
  bigPillButtonActive: {
    backgroundColor: '#1E293B',
  },
  bigPillButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
  },
  bigPillButtonTextActive: {
    color: '#FFFFFF',
  },

  // Micro-hints styles
  microHintsContainer: {
    position: 'absolute',
    bottom: 8, // Position at the bottom of the reserved space
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  microHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  microHintIcon: {
    fontSize: 14,
    opacity: 0.7, // 70% opacity as required
  },
  microHintText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
    opacity: 0.7, // 70% opacity as required
    textAlign: 'center',
  },

  // Document Suggestion Styles (matches task suggestion)
  documentSuggestionWrapper: {
    marginTop: 16,
    marginBottom: 0,
    marginLeft: 0,
  },
  documentSuggestionLabelOutside: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
    marginLeft: 0,
  },
  documentSuggestionLabelText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  documentSuggestionLabelSaved: {
    color: '#3B82F6',
  },
  documentSuggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingRight: 16,
    paddingLeft: 0,
    paddingVertical: 6,
    gap: 12,
  },
  documentSuggestionCardSaved: {
    backgroundColor: 'transparent',
  },
  documentSuggestionLeft: {
    marginRight: 0,
  },
  documentSuggestionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#94A3B8',
    flex: 1,
  },
  documentSuggestionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentSuggestionActionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  documentSuggestionActionDivider: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#CBD5E1',
  },

  // Parallax Tabs
  tabsContainer: {
    flexDirection: 'column',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: 'white',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  capturesHeader: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1E293B',
    marginBottom: 12,
    marginTop: 16,
  },
  tabsActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabsActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#F1F5F9',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  tabTextActive: {
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  tabActionButton: {
    padding: 8,
  },
  tabCreateDocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  tabCreateDocText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  tabSelectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabSelectButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  tabSelectTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },

  // Top Section Container
  topSectionContainer: {
    backgroundColor: '#FFFFFF',
  },

  // AI Assist Content
  aiAssistContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  aiAssistTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  aiAssistTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1E293B',
  },
  aiAssistOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },
  aiAssistPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  aiAssistPillSelected: {
    backgroundColor: '#64748B',
    borderColor: '#64748B',
  },
  aiAssistPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#475569',
  },
  aiAssistPillTextSelected: {
    color: '#FFFFFF',
  },
  aiAssistScrollView: {
    width: screenWidth,
    marginLeft: -28,
  },
  aiAssistOptionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    paddingLeft: 16,
    paddingRight: 16,
  },
  aiAssistAINotesWrapper: {
    alignItems: 'center',
  },
  aiAssistAINotesSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#3B82F6',
    borderRadius: 999,
  },
  aiAssistAINotesText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  aiAssistAlwaysOnText: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 3,
  },
  selectedTypeContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  selectedTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  selectedTypeTextContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  selectedTypeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#1E293B',
  },
  selectedTypeSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  clearSelectionIconButton: {
    padding: 4,
  },
  focusedGenerateButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  focusedGenerateButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  aiAssistCustomInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignSelf: 'stretch',
  },
  aiAssistCustomInputText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    flex: 1,
    textAlign: 'left',
  },

  // Floating button
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  floatingGenerateButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  floatingGenerateButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#64748B',
  },

  // New timeline thumbnails row styles
  thumbnailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    marginLeft: 12, // align with photoText image inset
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnailWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },

  // Task Suggestion Card Styles
  taskSuggestionWrapper: {
    marginTop: 16,
    marginBottom: 0,
    marginLeft: 0,
  },
  taskSuggestionLabelOutside: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
    marginLeft: 0,
  },
  taskSuggestionLabelText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskSuggestionLabelSaved: {
    color: '#10B981',
  },
  taskSuggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingRight: 16,
    paddingLeft: 0,
    paddingVertical: 6,
    gap: 12,
  },
  taskSuggestionCardSaved: {
    backgroundColor: 'transparent',
  },
  taskSuggestionLeft: { 
    marginRight: 0,
  },
  taskSuggestionCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
  },
  taskSuggestionCircleSaved: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  taskSuggestionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#94A3B8',
    flex: 1,
  },
  taskSuggestionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskSuggestionActionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  taskSuggestionActionDivider: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#CBD5E1',
  },

  // Create Confirmation Modal
  createModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  createModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  createModalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  createModalDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  createModalButtons: {
    gap: 12,
  },
  createModalButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  createModalButtonPrimary: {
    backgroundColor: '#000000',
  },
  createModalButtonSecondary: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  createModalButtonTextPrimary: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  createModalButtonTextSecondary: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
  },
});

export default AudioRecordingModal; 