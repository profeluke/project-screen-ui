import React, { useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { Settings, SwitchCamera, Tag, Zap, MicOff, Check, Camera, Video, Clock3, Square, ScanText } from 'lucide-react-native';
import { styles, scaleSize } from './styles';
import { AudioWaveform } from './AudioWaveform';

type CameraMicState = 'muted' | 'listening' | 'processing' | 'saved';
type CameraMode = 'photo' | 'video' | 'scan';
const MODE_SEQUENCE: CameraMode[] = ['photo', 'video', 'scan'];
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface CameraControlsProps {
  onClose: () => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  showDebugBorders: boolean;
  toggleDebugBorders: () => void;
  toggleCameraFacing: () => void;
  toggleFlash: () => void;
  zoomLevel: number;
  zoomLevels: { label: string; value: number }[];
  handleZoomSelect: (index: number) => void;
  isBusy: boolean;
  handleCapture: () => void;
  cameraReady: boolean;
  flash: string;
  getFlashIcon: () => React.ReactNode;
  onSettingsPress: () => void;
  cameraMode: CameraMode;
  onCameraModeChange: (mode: CameraMode) => void;
  isRecordingVideo: boolean;
  modalPosition?: number;
  previewCenterY?: number | null;
  micState: CameraMicState;
  recordingSeconds: number;
  onMicPress: () => void;
  micDisabled?: boolean;
  audioLevel?: number;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  onClose,
  isFullScreen,
  toggleFullScreen,
  showDebugBorders,
  toggleDebugBorders,
  toggleCameraFacing,
  toggleFlash,
  zoomLevel,
  zoomLevels,
  handleZoomSelect,
  isBusy,
  handleCapture,
  cameraReady,
  flash,
  getFlashIcon,
  onSettingsPress,
  cameraMode,
  onCameraModeChange,
  isRecordingVideo,
  modalPosition = 0,
  previewCenterY = null,
  micState,
  recordingSeconds,
  onMicPress,
  micDisabled = false,
  audioLevel = 0,
}) => {
  const timerIconScale = useRef(new Animated.Value(1)).current;
  const savedScale = useRef(new Animated.Value(1)).current;
  const modeIndexAnimation = useRef(new Animated.Value(MODE_SEQUENCE.indexOf(cameraMode))).current;
  const sideIconSize = scaleSize(20);
  const passiveIconColor = 'rgba(17,17,17,0.4)';
  const activeModeIndex = MODE_SEQUENCE.indexOf(cameraMode);
  const captureContainerSize = scaleSize(76);
  const activeModeSize = scaleSize(64);
  const sideModeButtonSize = scaleSize(50);
  const activeModeScale = activeModeSize / sideModeButtonSize;
  const modeButtonGap = scaleSize(14);
  const adjacentModeOffset = captureContainerSize / 2 + sideModeButtonSize / 2 + modeButtonGap;
  const farModeOffset = adjacentModeOffset + sideModeButtonSize + modeButtonGap;

  const handleModePress = useCallback((mode: CameraMode) => {
    if (mode !== cameraMode) {
      onCameraModeChange(mode);
    }
  }, [cameraMode, onCameraModeChange]);

  useEffect(() => {
    if (micState === 'listening') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(timerIconScale, {
            toValue: 1.08,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(timerIconScale, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );

      pulse.start();

      return () => {
        pulse.stop();
        timerIconScale.setValue(1);
      };
    }
  }, [micState, timerIconScale]);

  useEffect(() => {
    if (micState === 'saved') {
      savedScale.setValue(0.82);
      Animated.spring(savedScale, {
        toValue: 1,
        speed: 18,
        bounciness: 10,
        useNativeDriver: true,
      }).start();
    } else {
      savedScale.setValue(1);
    }
  }, [micState, savedScale]);

  useEffect(() => {
    Animated.spring(modeIndexAnimation, {
      toValue: activeModeIndex,
      tension: 110,
      friction: 11,
      useNativeDriver: true,
    }).start();
  }, [activeModeIndex, modeIndexAnimation]);

  const formatRecordingTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Calculate opacity: 1 when closed (position 0), 0 when open (position 1)
  const doneButtonOpacity = 1 - modalPosition;
  const recordingLabel = formatRecordingTime(recordingSeconds);

  const renderModeIcon = useCallback((mode: CameraMode) => {
    const isActive = cameraMode === mode;

    if (mode === 'photo') {
      return (
        <Camera
          size={scaleSize(21)}
          color={isActive ? '#111111' : passiveIconColor}
          strokeWidth={2.2}
        />
      );
    }

    if (mode === 'video') {
      return (
        <Video
          size={scaleSize(21)}
          color={isActive ? '#FFFFFF' : passiveIconColor}
          strokeWidth={2.2}
        />
      );
    }

    return (
      <ScanText
        size={scaleSize(20)}
        color={isActive ? '#111111' : passiveIconColor}
        strokeWidth={2.1}
      />
    );
  }, [cameraMode, passiveIconColor]);

  return (
    <View style={styles.cameraOverlay}>
      <Animated.View style={[styles.topLeftContainer, { opacity: doneButtonOpacity }]}>
        <TouchableOpacity style={styles.doneButton} onPress={onClose} accessibilityLabel="Done">
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.topRightContainer}>
        <View style={styles.sideControlPill}>
          <TouchableOpacity style={styles.sideControlButton} onPress={toggleCameraFacing}>
            <View style={styles.iconContainer}>
              <SwitchCamera size={sideIconSize} color="rgba(0,0,0,0.4)" strokeWidth={3} />
              <View style={styles.iconOverlay}>
                <SwitchCamera size={sideIconSize} color="white" strokeWidth={2} />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideControlButton} onPress={toggleFlash}>
            <View style={styles.iconContainer}>
              <Zap size={sideIconSize} color="rgba(0,0,0,0.4)" strokeWidth={3} fill={flash === 'on' ? 'rgba(0,0,0,0.4)' : 'none'} />
              <View style={styles.iconOverlay}>
                <Zap size={sideIconSize} color="white" strokeWidth={2} fill={flash === 'on' ? 'white' : 'none'} />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sideControlButton,
              showDebugBorders && styles.sideControlButtonActive
            ]}
            onPress={toggleDebugBorders}
          >
            <View style={styles.iconContainer}>
              <Tag size={sideIconSize} color="rgba(0,0,0,0.4)" strokeWidth={3} />
              <View style={styles.iconOverlay}>
                <Tag size={sideIconSize} color={showDebugBorders ? 'black' : 'white'} strokeWidth={2} />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideControlButton} onPress={onSettingsPress}>
            <View style={styles.iconContainer}>
              <Settings size={sideIconSize} color="rgba(0,0,0,0.4)" strokeWidth={3} />
              <View style={styles.iconOverlay}>
                <Settings size={sideIconSize} color="white" strokeWidth={2} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.lensControlsContainer,
          previewCenterY != null ? { top: previewCenterY } : null,
        ]}
      >
        <View style={styles.zoomSliderContainer}>
          <View style={styles.zoomTrack}>
            <View
              style={[
                styles.zoomIndicator,
                { top: zoomLevel * scaleSize(36) + scaleSize(3) }
              ]}
            />
            {zoomLevels.map((zoom, index) => (
              <TouchableOpacity
                key={index}
                style={styles.zoomOption}
                onPress={() => handleZoomSelect(index)}
              >
                <Text
                  style={[
                    styles.zoomOptionText,
                    zoomLevel === index && styles.zoomOptionTextActive
                  ]}
                >
                  {zoom.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Bottom controls with notes above the shutter and mode toggle on the right */}
      <View style={styles.bottomControls}>
        <View style={styles.notesButtonWrapper}>
          <TouchableOpacity
            style={[
              styles.notesButton,
              micDisabled && styles.notesButtonDisabled,
              micState === 'listening' && styles.notesButtonListening,
            ]}
            onPress={onMicPress}
            activeOpacity={0.8}
            disabled={micDisabled}
            accessibilityRole="button"
            accessibilityLabel={
              micState === 'listening' ? 'Stop recording note and save' : 'Start recording note'
            }
          >
            {micState === 'saved' ? (
              <Animated.View
                style={[
                  styles.notesButtonContent,
                  { transform: [{ scale: savedScale }] },
                ]}
              >
                <Check size={scaleSize(15)} color="#34C759" strokeWidth={2.5} />
                <Text style={styles.notesButtonText}>Saved</Text>
              </Animated.View>
            ) : micState === 'processing' ? (
              <View style={styles.notesButtonContent}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.notesButtonText}>Saving</Text>
              </View>
            ) : micState === 'listening' ? (
              <View style={styles.notesRecordingContent}>
                <AudioWaveform level={audioLevel} color="#FFFFFF" />
                <Text style={styles.notesRecordingTime}>{recordingLabel}</Text>
              </View>
            ) : (
              <View style={styles.notesButtonContent}>
                <MicOff size={scaleSize(15)} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.notesButtonText}>AI notes</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.modeToggleSideWrapper} pointerEvents="box-none">
          {MODE_SEQUENCE.map((mode, index) => {
            const animatedOffset = Animated.subtract(index, modeIndexAnimation);
            const translateX = animatedOffset.interpolate({
              inputRange: [-2, -1, 0, 1, 2],
              outputRange: [-farModeOffset, -adjacentModeOffset, 0, adjacentModeOffset, farModeOffset],
              extrapolate: 'clamp',
            });
            const scale = animatedOffset.interpolate({
              inputRange: [-2, -1, 0, 1, 2],
              outputRange: [0.94, 1, activeModeScale, 1, 0.94],
              extrapolate: 'clamp',
            });
            const opacity = animatedOffset.interpolate({
              inputRange: [-2, -1, 0, 1, 2],
              outputRange: [0.72, 0.9, 1, 0.9, 0.72],
              extrapolate: 'clamp',
            });
            const isActive = cameraMode === mode;
            const backgroundStyle =
              mode === 'video'
                ? (isActive ? styles.modeSwapButtonActiveVideo : styles.modeSwapButtonInactive)
                : (isActive ? styles.modeSwapButtonActiveLight : styles.modeSwapButtonInactive);

            return (
              <AnimatedTouchableOpacity
                key={mode}
                style={[
                  styles.modeSwapButton,
                  backgroundStyle,
                  {
                    transform: [{ translateX }, { scale }],
                    opacity,
                  },
                  isRecordingVideo && styles.modeSwapButtonDisabled,
                ]}
                onPress={() => handleModePress(mode)}
                activeOpacity={0.85}
                disabled={isRecordingVideo || isActive}
                accessibilityRole="button"
                accessibilityLabel={
                  isActive
                    ? `${mode} mode selected`
                    : `Switch to ${mode} mode`
                }
              >
                {renderModeIcon(mode)}
              </AnimatedTouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.captureButton, isBusy && styles.captureButtonDisabled]}
          onPress={handleCapture}
          disabled={isBusy || !cameraReady}
        />
        </View>
      </View>
  );
};
