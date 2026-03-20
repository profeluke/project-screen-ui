import { StyleSheet } from 'react-native';
import { scaleSize } from '../styles';

export { scaleSize };

const SIDE_RAIL_WIDTH = scaleSize(36);
const TOP_RAIL_RIGHT_INSET = scaleSize(8);
const TOP_RAIL_TOP_OFFSET = '7%';
const SIDE_RAIL_BUTTON_SIZE = scaleSize(30);
const SIDE_RAIL_BUTTON_GAP = scaleSize(6);
const SIDE_RAIL_CLUSTER_GAP = scaleSize(12);
const SIDE_RAIL_PADDING_Y = scaleSize(5);
const ZOOM_TRACK_HEIGHT = scaleSize(108);
const CAPTURE_BUTTON_SIZE = scaleSize(76);
const CAPTURE_BUTTON_RADIUS = CAPTURE_BUTTON_SIZE / 2;
const NOTES_BUTTON_HEIGHT = scaleSize(34);
const NOTES_BUTTON_WIDTH = scaleSize(92);
const NOTES_BUTTON_RADIUS = NOTES_BUTTON_HEIGHT / 2;
const MODE_SIDE_BUTTON_SIZE = scaleSize(50);
const MODE_SIDE_BUTTON_RADIUS = MODE_SIDE_BUTTON_SIZE / 2;
const DARK_CONTROL_BACKGROUND = 'rgba(0,0,0,0.3)';
const SIDE_CONTROL_PILL_HEIGHT =
  SIDE_RAIL_PADDING_Y * 2 +
  SIDE_RAIL_BUTTON_SIZE * 4 +
  SIDE_RAIL_BUTTON_GAP * 3;
const SIDE_RAIL_CLUSTER_HEIGHT =
  SIDE_CONTROL_PILL_HEIGHT + SIDE_RAIL_CLUSTER_GAP + ZOOM_TRACK_HEIGHT;

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
  topLeftContainer: {
    position: 'absolute',
    top: TOP_RAIL_TOP_OFFSET,
    left: TOP_RAIL_RIGHT_INSET,
    zIndex: 2,
  },
  topRightContainer: {
    position: 'absolute',
    top: TOP_RAIL_TOP_OFFSET,
    right: TOP_RAIL_RIGHT_INSET,
    zIndex: 2,
  },
  doneButton: {
    minWidth: scaleSize(58),
    height: scaleSize(36),
    paddingHorizontal: scaleSize(14),
    borderRadius: scaleSize(18),
    backgroundColor: DARK_CONTROL_BACKGROUND,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: scaleSize(13),
    fontFamily: 'Inter-SemiBold',
  },
  lensControlsContainer: {
    position: 'absolute',
    top: '50%',
    right: TOP_RAIL_RIGHT_INSET,
    transform: [{ translateY: -ZOOM_TRACK_HEIGHT / 2 }],
    alignItems: 'center',
  },
  sideControlPill: {
    height: scaleSize(36),
    backgroundColor: DARK_CONTROL_BACKGROUND,
    borderRadius: scaleSize(18),
    flexDirection: 'row',
    paddingHorizontal: scaleSize(8),
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(6),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  sideControlButton: {
    width: SIDE_RAIL_BUTTON_SIZE,
    height: SIDE_RAIL_BUTTON_SIZE,
    borderRadius: scaleSize(15),
    backgroundColor: 'transparent',
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
    marginTop: 0,
  },
  zoomTrack: {
    position: 'relative',
    width: SIDE_RAIL_WIDTH,
    height: ZOOM_TRACK_HEIGHT,
    backgroundColor: DARK_CONTROL_BACKGROUND,
    borderRadius: scaleSize(18),
    padding: scaleSize(3),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
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

  // Capture button row — centered shutter with controls around it
  bottomControls: {
    position: 'absolute',
    bottom: '21.5%',
    left: 0,
    right: 0,
    height: CAPTURE_BUTTON_SIZE,
    zIndex: 10,
  },
  captureButton: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -CAPTURE_BUTTON_RADIUS,
    marginTop: -CAPTURE_BUTTON_RADIUS,
    width: CAPTURE_BUTTON_SIZE,
    height: CAPTURE_BUTTON_SIZE,
    borderRadius: CAPTURE_BUTTON_RADIUS,
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
  captureButtonInnerVideo: {
    width: scaleSize(64),
    height: scaleSize(64),
    borderRadius: scaleSize(32),
    backgroundColor: '#FF3B30',
  },
  notesButtonWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: -(CAPTURE_BUTTON_RADIUS + NOTES_BUTTON_HEIGHT + scaleSize(12)),
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesButton: {
    width: NOTES_BUTTON_WIDTH,
    height: NOTES_BUTTON_HEIGHT,
    paddingHorizontal: scaleSize(12),
    borderRadius: NOTES_BUTTON_RADIUS,
    backgroundColor: DARK_CONTROL_BACKGROUND,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  notesButtonDisabled: {
    opacity: 0.45,
  },
  notesButtonListening: {
    width: scaleSize(94),
    paddingHorizontal: 0,
  },
  modeToggleSideWrapper: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: MODE_SIDE_BUTTON_SIZE,
    height: MODE_SIDE_BUTTON_SIZE,
    marginLeft: -MODE_SIDE_BUTTON_RADIUS,
    marginTop: -MODE_SIDE_BUTTON_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeSwapButton: {
    position: 'absolute',
    width: MODE_SIDE_BUTTON_SIZE,
    height: MODE_SIDE_BUTTON_SIZE,
    borderRadius: MODE_SIDE_BUTTON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  modeSwapButtonInactive: {
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  modeSwapButtonActiveLight: {
    backgroundColor: '#FFFFFF',
  },
  modeSwapButtonActiveVideo: {
    backgroundColor: '#FF3B30',
  },
  modeSwapButtonDisabled: {
    opacity: 0.55,
  },
  notesButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(6),
  },
  notesRecordingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(7),
    paddingHorizontal: scaleSize(6),
  },
  notesButtonText: {
    fontSize: scaleSize(12),
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  notesRecordingTime: {
    width: scaleSize(34),
    fontSize: scaleSize(12),
    fontFamily: 'Inter-SemiBold',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    color: '#FFFFFF',
  },
});
