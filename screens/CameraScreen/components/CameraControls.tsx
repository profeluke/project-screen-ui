import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Settings, SwitchCamera, Tag, Zap, Video, Scan } from 'lucide-react-native';
import { styles, scaleSize } from './styles';

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
  modalPosition?: number;
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
  modalPosition = 0
}) => {
  // Calculate opacity: 1 when closed (position 0), 0 when open (position 1)
  const doneButtonOpacity = 1 - modalPosition;

  return (
    <View style={styles.cameraOverlay}>
      <Animated.View style={[styles.topRightContainer, { opacity: doneButtonOpacity }]}>
        <TouchableOpacity style={styles.doneButton} onPress={onClose}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </Animated.View>

    <View style={styles.sideControlsContainer}>
      <TouchableOpacity style={styles.sideControlButton} onPress={onSettingsPress}>
        <View style={styles.iconContainer}>
          <Settings size={scaleSize(24)} color="rgba(0,0,0,0.4)" strokeWidth={3} />
          <View style={styles.iconOverlay}>
            <Settings size={scaleSize(24)} color="white" strokeWidth={2} />
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
          <Tag size={scaleSize(24)} color="rgba(0,0,0,0.4)" strokeWidth={3} />
          <View style={styles.iconOverlay}>
            <Tag size={scaleSize(24)} color={showDebugBorders ? "black" : "white"} strokeWidth={2} />
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sideControlButton} onPress={toggleFlash}>
        <View style={styles.iconContainer}>
          <Zap size={scaleSize(24)} color="rgba(0,0,0,0.4)" strokeWidth={3} fill={flash === 'on' ? "rgba(0,0,0,0.4)" : "none"} />
          <View style={styles.iconOverlay}>
            <Zap size={scaleSize(24)} color="white" strokeWidth={2} fill={flash === 'on' ? "white" : "none"} />
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sideControlButton} onPress={toggleCameraFacing}>
        <View style={styles.iconContainer}>
          <SwitchCamera size={scaleSize(24)} color="rgba(0,0,0,0.4)" strokeWidth={3} />
          <View style={styles.iconOverlay}>
            <SwitchCamera size={scaleSize(24)} color="white" strokeWidth={2} />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.zoomSliderContainer}>
        <View style={styles.zoomTrack}>
          <View style={[
            styles.zoomIndicator,
            { top: zoomLevel * scaleSize(36) + scaleSize(3) }
          ]} />
          {zoomLevels.map((zoom, index) => (
            <TouchableOpacity
              key={index}
              style={styles.zoomOption}
              onPress={() => handleZoomSelect(index)}
            >
              <Text style={[
                styles.zoomOptionText,
                zoomLevel === index && styles.zoomOptionTextActive
              ]}>
                {zoom.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>

    <View style={styles.bottomControls}>
      {/* Main capture button - absolutely centered */}
      <TouchableOpacity
        style={[styles.captureButton, isBusy && styles.captureButtonDisabled]}
        onPress={handleCapture}
        disabled={isBusy || !cameraReady}
      >
        <View style={styles.captureButtonInner}>
        </View>
      </TouchableOpacity>

      {/* Video button - positioned to the right of center */}
      <TouchableOpacity style={styles.videoModeButton}>
        <View style={styles.videoModeIcon}>
          <Video size={scaleSize(20)} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
      
      {/* Scan button - positioned further to the right */}
      <TouchableOpacity style={styles.scanModeButton}>
        <View style={styles.scanModeIcon}>
          <Scan size={scaleSize(18)} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  </View>
  );
}; 