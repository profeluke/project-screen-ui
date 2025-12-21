import { StyleSheet } from 'react-native';
import { scaleSize } from '../styles';

export { scaleSize };

export const styles = StyleSheet.create({
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  topRightContainer: {
    position: 'absolute',
    top: '7%',
    right: scaleSize(8),
    zIndex: 1,
  },
  doneButton: {
    backgroundColor: 'white',
    paddingHorizontal: scaleSize(20),
    paddingVertical: scaleSize(10),
    borderRadius: scaleSize(24),
  },
  doneText: {
    color: 'black',
    fontSize: scaleSize(12),
    fontFamily: 'Inter-Bold',
  },
  sideControlsContainer: {
    position: 'absolute',
    right: scaleSize(8),
    top: '33%',  // Moved up 4% for better positioning
    transform: [{ translateY: -100 }],
    gap: scaleSize(12),
  },
  sideControlButton: {
    width: scaleSize(36),
    height: scaleSize(36),
    borderRadius: scaleSize(18),
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    // Very subtle drop shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  sideControlButtonActive: {
    backgroundColor: 'white',
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomSliderContainer: {
    marginTop: scaleSize(12),
  },
  zoomTrack: {
    position: 'relative',
    width: scaleSize(36),
    height: scaleSize(108),
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: scaleSize(18),
    padding: scaleSize(3),
  },
  zoomIndicator: {
    position: 'absolute',
    left: scaleSize(3),
    width: scaleSize(30),
    height: scaleSize(30),
    borderRadius: scaleSize(15),
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  zoomOption: {
    width: scaleSize(30),
    height: scaleSize(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleSize(6),
  },
  zoomOptionText: {
    color: 'white',
    fontSize: scaleSize(12),
    fontFamily: 'Inter-SemiBold',
  },
  zoomOptionTextActive: {
    color: 'black',
  },
  bottomControls: {
    position: 'absolute',
    bottom: '22%',
    left: 0,
    right: 0,
    height: scaleSize(76),
    zIndex: 10,
  },
  captureButton: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -scaleSize(38), // Half of button width (76/2)
    marginTop: -scaleSize(38), // Half of button height (76/2)
    width: scaleSize(76),
    height: scaleSize(76),
    borderRadius: scaleSize(38),
    backgroundColor: 'transparent',
    borderColor: 'white',
    borderWidth: scaleSize(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
    borderColor: '#999',
  },
  captureButtonInner: {
    width: scaleSize(64),
    height: scaleSize(64),
    borderRadius: scaleSize(32),
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoModeButton: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: scaleSize(50), // Center + (capture radius + gap) = +(38 + 12)
    marginTop: -scaleSize(28), // Half of button height (56/2)
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoModeIcon: {
    width: scaleSize(56),
    height: scaleSize(56),
    borderRadius: scaleSize(28),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanModeButton: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: scaleSize(118), // Center + (capture radius + gap + video width + gap) = +(38 + 12 + 56 + 12)
    marginTop: -scaleSize(28), // Half of button height (56/2)
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanModeIcon: {
    width: scaleSize(56),
    height: scaleSize(56),
    borderRadius: scaleSize(28),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 