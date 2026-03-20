import React, { useState, useRef, useEffect } from 'react';
import { View, Text, SafeAreaView, Alert, Modal, TouchableOpacity, Image, Animated, Dimensions, LayoutChangeEvent } from 'react-native';
import { CameraView, CameraType, FlashMode, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { Zap } from 'lucide-react-native';
import AudioRecordingModal, { AudioRecordingModalHandles } from '../../components/AudioRecordingModal';
import OrganizedNotesScreen from '../OrganizedNotesScreen';
import { CameraControls } from './components/CameraControls';
import { styles, scaleSize } from './styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CameraScreen({ onClose }: { onClose: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [showAudioModal, setShowAudioModal] = useState(true);
  const [audioModalReady, setAudioModalReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('auto');
  const [cameraMode, setCameraMode] = useState<'photo' | 'video' | 'scan'>('photo');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [showOrganizedNotes, setShowOrganizedNotes] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [showDebugBorders, setShowDebugBorders] = useState(false);
  const [showGeneralNotes, setShowGeneralNotes] = useState(false);
  const [showProjectTitle, setShowProjectTitle] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState(0);
  const [previewCenterY, setPreviewCenterY] = useState<number | null>(null);
  const [micState, setMicState] = useState<'muted' | 'listening' | 'processing' | 'saved'>('muted');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isMicProcessing, setIsMicProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [organizedNotesData, setOrganizedNotesData] = useState<{
    content: string;
    photos: Array<{ uri: string; timestamp?: number; aiDescription?: string; photoId?: string }>;
    tasks: Array<{ text: string; photoIds?: string[] }>;
    promptSent?: string;
  } | null>(null);
  const [currentProject, setCurrentProject] = useState<string>('Oakridge Residence');
  const projectOptions = [
    'Oakridge Residence',
    'Downtown Office Complex',
    'Sunset Villa Renovation',
    'Modern Loft Project',
    'Family Home Addition',
  ];

  const cameraRef = useRef<any>(null);
  const audioRecordingModalRef = useRef<AudioRecordingModalHandles>(null);
  const flyAnim = useRef(new Animated.Value(0)).current;
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRecordingStartedAtRef = useRef<number | null>(null);
  const pendingCloseAfterVideoStopRef = useRef(false);
  const [flyUri, setFlyUri] = useState<string | null>(null);
  const [flyStart, setFlyStart] = useState<{x:number;y:number;width:number;height:number}|null>(null);
  const [flyEnd, setFlyEnd] = useState<{x:number;y:number;width:number;height:number}|null>(null);

  const zoomLevels = [
    { label: '3x', value: 0.375 },
    { label: '1x', value: 0.125 },
    { label: '.5x', value: 0 },
  ];

  // Track when audio modal ref is ready
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (audioRecordingModalRef.current && !audioModalReady) {
        console.log('AudioRecordingModal is now ready');
        setAudioModalReady(true);
        clearInterval(checkInterval);
      }
    }, 100);
    
    return () => clearInterval(checkInterval);
  }, [audioModalReady]);

  useEffect(() => {
    const initCamera = async () => {
      try {
        if (permission?.granted) {
          console.log('Camera permission granted, initializing...');
          // Shorter delay and don't wait for cameraReady to show the preview
          await new Promise(resolve => setTimeout(resolve, 100));
          setIsInitializing(false);
        } else if (permission) {
          console.log('Camera permission not granted');
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Camera initialization error:', error);
        setIsInitializing(false);
        Alert.alert(
          'Camera Error',
          'Failed to initialize camera. Please try again.',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    };

    initCamera();
  }, [permission?.granted]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (savedResetTimerRef.current) {
        clearTimeout(savedResetTimerRef.current);
      }
      if (cameraRef.current && isRecordingVideo) {
        Promise.resolve(cameraRef.current.stopRecording?.()).catch((error: unknown) => {
          console.error('Failed to stop recording during cleanup:', error);
        });
      }
    };
  }, [isRecordingVideo]);

  const ensureCameraCanCapture = () => {
    if (!permission?.granted) {
      console.warn('Camera permission not granted');
      Alert.alert('Permission Required', 'Camera permission is required to capture media.');
      return false;
    }

    if (!cameraReady) {
      console.warn('Camera not ready yet');
      Alert.alert('Camera Not Ready', 'Please wait for the camera to initialize.');
      return false;
    }

    if (!cameraRef.current) {
      console.warn('Camera ref not available');
      Alert.alert('Camera Error', 'Camera reference is not available. Please try again.');
      return false;
    }

    return true;
  };

  const getReadyTrayRef = () => {
    const modalRef = audioRecordingModalRef.current;

    if (!audioModalReady || !modalRef) {
      console.warn('Audio modal not ready yet, audioModalReady:', audioModalReady, 'modalRef:', !!modalRef);
      Alert.alert('Please Wait', 'The capture tray is initializing. Please try again in a moment.');
      return null;
    }

    return modalRef;
  };

  const addCapturedPhotoToTray = async (photoUri: string) => {
    const modalRef = getReadyTrayRef();
    if (!modalRef) {
      return;
    }

    setFlyUri(photoUri);
    const cameraBottomY = screenHeight * 0.81 - 80;
    setFlyStart({
      x: 0,
      y: cameraBottomY,
      width: 80,
      height: 80,
    });

    const target = await modalRef.getTemporaryPhotoTarget();
    if (target) setFlyEnd(target);

    modalRef.addPhoto(photoUri);
    modalRef.revealForUri(photoUri);

    flyAnim.setValue(0);
    Animated.timing(flyAnim, { toValue: 1, duration: 220, useNativeDriver: false }).start(() => {
      setFlyUri(null);
    });
  };

  const addCapturedVideoToTray = (videoUri: string, durationMs: number) => {
    const modalRef = getReadyTrayRef();
    if (!modalRef) {
      return;
    }

    modalRef.addVideo(videoUri, durationMs);
    modalRef.revealForUri(videoUri);
  };

  const stopVideoCapture = async () => {
    if (!cameraRef.current || !isRecordingVideo) {
      return;
    }

    setIsCapturing(true);

    try {
      await cameraRef.current.stopRecording?.();
    } catch (error) {
      console.error('Video stop error:', error);
      Alert.alert('Video Error', 'Failed to stop recording. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const startVideoCapture = async () => {
    if (isCapturing || isRecordingVideo) {
      return;
    }

    if (!ensureCameraCanCapture()) {
      return;
    }

    if (!getReadyTrayRef()) {
      return;
    }

    if (!microphonePermission?.granted) {
      const nextPermission = await requestMicrophonePermission();
      if (!nextPermission.granted) {
        Alert.alert('Microphone Required', 'Microphone permission is required to record video.');
        return;
      }
    }

    try {
      setIsCapturing(true);
      videoRecordingStartedAtRef.current = Date.now();
      setIsRecordingVideo(true);
      setIsCapturing(false);

      const video = await cameraRef.current.recordAsync({
        maxDuration: 300,
      });

      const durationMs = videoRecordingStartedAtRef.current
        ? Math.max(0, Date.now() - videoRecordingStartedAtRef.current)
        : 0;

      if (video?.uri) {
        addCapturedVideoToTray(video.uri, durationMs);
      }
    } catch (error) {
      console.error('Video capture error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Video Error', `Failed to record video: ${errorMessage}. Please try again.`);
    } finally {
      setIsRecordingVideo(false);
      setIsCapturing(false);
      videoRecordingStartedAtRef.current = null;

      if (pendingCloseAfterVideoStopRef.current) {
        pendingCloseAfterVideoStopRef.current = false;
        onClose();
      }
    }
  };

  const handleCapture = async () => {
    if (cameraMode === 'video') {
      if (isRecordingVideo) {
        await stopVideoCapture();
      } else {
        await startVideoCapture();
      }
      return;
    }

    try {
      if (isCapturing) {
        console.warn('Capture already in progress');
        return;
      }

      console.log('Starting photo capture...');
      console.log('Camera ref exists:', !!cameraRef.current);
      console.log('Camera ready state:', cameraReady);
      console.log('Permission granted:', permission?.granted);

      if (!ensureCameraCanCapture()) {
        return;
      }

      if (!getReadyTrayRef()) {
        return;
      }

      setIsCapturing(true);

      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.7,
        base64: false,
        exif: false,
      });

      console.log('Photo captured:', photo?.uri);

      if (photo && photo.uri) {
        await addCapturedPhotoToTray(photo.uri);
      } else {
        console.warn('Photo captured but no URI returned');
        Alert.alert(
          'Capture Warning',
          'Photo was taken but could not be processed. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Photo capture error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.error('Error details:', {
        message: errorMessage,
        stack: errorStack,
        cameraReady,
        permission: permission?.granted,
        isInitializing,
        isCapturing
      });

      Alert.alert(
        'Capture Error',
        `Failed to take photo: ${errorMessage}. Please try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const handleMicPress = async () => {
    const modalRef = audioRecordingModalRef.current;

    if (!audioModalReady || !modalRef) {
      Alert.alert('Please Wait', 'The notes tray is initializing. Please try again in a moment.');
      return;
    }

    if (micState === 'saved' || micState === 'processing' || isMicProcessing) {
      return;
    }

    if (savedResetTimerRef.current) {
      clearTimeout(savedResetTimerRef.current);
      savedResetTimerRef.current = null;
    }

    if (micState === 'muted') {
      const started = await modalRef.startCameraTextRecording();
      if (!started) return;

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      setRecordingSeconds(0);
      setMicState('listening');
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((current) => current + 1);
      }, 1000);
      return;
    }

    if (micState === 'listening') {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      setMicState('processing');
      setIsMicProcessing(true);
      const saved = await modalRef.stopCameraTextRecording();
      setIsMicProcessing(false);

      if (!saved) {
        setRecordingSeconds(0);
        setMicState('muted');
        return;
      }

      setMicState('saved');
      savedResetTimerRef.current = setTimeout(() => {
        setRecordingSeconds(0);
        setMicState('muted');
        savedResetTimerRef.current = null;
      }, 1000);
    }
  };

  const handleZoomSelect = (index: number) => {
    try {
      if (index >= 0 && index < zoomLevels.length) {
        setZoomLevel(index);
      }
    } catch (error) {
      console.error('Zoom error:', error);
    }
  };

  const toggleCameraFacing = () => {
    try {
      setFacing(current => (current === 'back' ? 'front' : 'back'));
    } catch (error) {
      console.error('Camera facing toggle error:', error);
    }
  }

  const toggleFlash = () => {
    try {
      setFlash(current => {
        if (current === 'off') return 'on';
        if (current === 'on') return 'auto';
        return 'off';
      });
    } catch (error) {
      console.error('Flash toggle error:', error);
    }
  }

  const getFlashIcon = () => {
    if (flash === 'on') return <Zap size={scaleSize(24)} color="white" />;
    if (flash === 'auto') return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Zap size={scaleSize(24)} color="white" />
        <Text style={{color: 'white', fontSize: scaleSize(12), fontWeight: 'bold'}}>A</Text>
      </View>
    );
    return <Zap size={scaleSize(24)} color="white" style={{opacity: 0.5}} />;
  };

  const handleCameraReady = () => {
    console.log('Camera is ready');
    setCameraReady(true);
  };

  const handlePreviewLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setPreviewCenterY(y + height / 2);
  };

  const handleClosePress = async () => {
    if (!isRecordingVideo) {
      onClose();
      return;
    }

    pendingCloseAfterVideoStopRef.current = true;
    await stopVideoCapture();
  };

  const handleCameraError = (error: any) => {
    console.error('Camera mount error:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      type: error?.type
    });
    Alert.alert(
      'Camera Error',
      `Camera failed to load: ${error?.message || 'Unknown error'}. Please check camera permissions and try again.`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const handleOpenOrganizedNotes = (data: {
    content: string;
    photos: Array<{ uri: string; timestamp?: number; aiDescription?: string; photoId?: string }>;
    tasks: Array<{ text: string; photoIds?: string[] }>;
    promptSent?: string;
  }) => {
    setOrganizedNotesData(data);
    setShowOrganizedNotes(true);
  };

  const handleCloseOrganizedNotes = () => {
    setShowOrganizedNotes(false);
    setOrganizedNotesData(null);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isInitializing) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.loadingText}>Initializing camera...</Text>
        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={[
        styles.cameraContainer,
        !isFullScreen && styles.cameraContainer4x3,
        isFullScreen && styles.cameraContainerFullScreen,
        showDebugBorders && styles.cameraContainerDebug
      ]}
      onLayout={handlePreviewLayout}
      >
        <CameraView
          style={[
            styles.camera,
            showDebugBorders && styles.cameraDebug
          ]}
          mode={cameraMode === 'video' ? 'video' : 'picture'}
          facing={facing}
          flash={flash}
          mute={false}
          zoom={Math.max(0, Math.min(1, zoomLevels[zoomLevel]?.value || 0))}
          ref={cameraRef}
          onCameraReady={handleCameraReady}
          onMountError={handleCameraError}
        />
      </View>
      
      <CameraControls
        onClose={handleClosePress}
        isFullScreen={isFullScreen}
        toggleFullScreen={() => setIsFullScreen(!isFullScreen)}
        showDebugBorders={showDebugBorders}
        toggleDebugBorders={() => setShowDebugBorders(!showDebugBorders)}
        toggleCameraFacing={toggleCameraFacing}
        toggleFlash={toggleFlash}
        zoomLevel={zoomLevel}
        zoomLevels={zoomLevels}
        handleZoomSelect={handleZoomSelect}
        isBusy={isInitializing || isCapturing}
        handleCapture={handleCapture}
        cameraReady={cameraReady}
        flash={flash}
        getFlashIcon={getFlashIcon}
        onSettingsPress={() => setShowSettingsMenu(true)}
        cameraMode={cameraMode}
        onCameraModeChange={setCameraMode}
        isRecordingVideo={isRecordingVideo}
        modalPosition={modalPosition}
        previewCenterY={previewCenterY}
        micState={micState}
        recordingSeconds={recordingSeconds}
        onMicPress={handleMicPress}
        micDisabled={isMicProcessing}
        audioLevel={audioLevel}
      />
      
      {/* Fly-down thumbnail animation */}
      {flyUri && flyStart && flyEnd && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: flyAnim.interpolate({ inputRange: [0,1], outputRange: [flyStart.x, flyEnd.x] }) as any,
            top: flyAnim.interpolate({ inputRange: [0,1], outputRange: [flyStart.y, flyEnd.y] }) as any,
            width: flyAnim.interpolate({ inputRange: [0,1], outputRange: [flyStart.width, 66] }) as any,
            height: flyAnim.interpolate({ inputRange: [0,1], outputRange: [flyStart.height, 66] }) as any,
            borderRadius: 8,
            overflow: 'hidden',
            zIndex: 2000,
            elevation: 2000,
          }}
        >
          <Image source={{ uri: flyUri }} style={{ width: '100%', height: '100%' }} />
        </Animated.View>
      )}

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, elevation: 1000 }} pointerEvents="box-none">
        <AudioRecordingModal
          ref={audioRecordingModalRef}
          visible={showAudioModal}
          onClose={() => {}} // No-op since modal should never close in camera context
          onOpenOrganizedNotes={handleOpenOrganizedNotes}
          initialState="idle"
          initialSnapIndex={0}
          showBackdrop={false}
          isInCameraContext={true}
          title="Notes"
          projectName={currentProject}
          onProjectChange={setCurrentProject}
          projectOptions={projectOptions}
          onCameraPressInFooter={() => {
            console.log("Footer Camera Pressed");
          }}
          showGeneralNotes={showGeneralNotes}
          showProjectTitle={showProjectTitle}
          showTags={showTags}
          onModalStateChange={setIsModalOpen}
          onModalPositionChange={setModalPosition}
          onMeteringUpdate={setAudioLevel}
        />
      </View>
      
      <Modal
        visible={showOrganizedNotes}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        {organizedNotesData && (
          <OrganizedNotesScreen
            onClose={handleCloseOrganizedNotes}
            content={organizedNotesData.content}
            photos={organizedNotesData.photos}
            tasks={organizedNotesData.tasks}
            promptSent={organizedNotesData.promptSent}
          />
        )}
      </Modal>

      {/* Settings Menu Modal */}
      <Modal
        visible={showSettingsMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettingsMenu(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setShowSettingsMenu(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: 16, 
              padding: 24, 
              width: '80%', 
              maxWidth: 400 
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 20, color: '#1E293B' }}>
              Camera Settings
            </Text>
            
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#E2E8F0'
              }}
              onPress={() => setShowGeneralNotes(!showGeneralNotes)}
            >
              <Text style={{ fontSize: 16, color: '#1E293B' }}>Show General Notes</Text>
              <View style={{ 
                width: 50, 
                height: 30, 
                borderRadius: 15, 
                backgroundColor: showGeneralNotes ? '#3B82F6' : '#CBD5E1',
                justifyContent: 'center',
                paddingHorizontal: 3
              }}>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: 'white',
                  alignSelf: showGeneralNotes ? 'flex-end' : 'flex-start'
                }} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#E2E8F0'
              }}
              onPress={() => setShowProjectTitle(!showProjectTitle)}
            >
              <Text style={{ fontSize: 16, color: '#1E293B' }}>Show Project Title</Text>
              <View style={{ 
                width: 50, 
                height: 30, 
                borderRadius: 15, 
                backgroundColor: showProjectTitle ? '#3B82F6' : '#CBD5E1',
                justifyContent: 'center',
                paddingHorizontal: 3
              }}>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: 'white',
                  alignSelf: showProjectTitle ? 'flex-end' : 'flex-start'
                }} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#E2E8F0'
              }}
              onPress={() => setShowTags(!showTags)}
            >
              <Text style={{ fontSize: 16, color: '#1E293B' }}>Show Tags</Text>
              <View style={{ 
                width: 50, 
                height: 30, 
                borderRadius: 15, 
                backgroundColor: showTags ? '#3B82F6' : '#CBD5E1',
                justifyContent: 'center',
                paddingHorizontal: 3
              }}>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: 'white',
                  alignSelf: showTags ? 'flex-end' : 'flex-start'
                }} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ 
                backgroundColor: '#3B82F6', 
                borderRadius: 8, 
                paddingVertical: 12, 
                marginTop: 24,
                alignItems: 'center'
              }}
              onPress={() => setShowSettingsMenu(false)}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Done</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
} 
