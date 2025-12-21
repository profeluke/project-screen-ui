import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const scale = screenWidth / 375;
export const scaleSize = (size: number) => Math.round(size * scale);

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  cameraContainer4x3: {
    aspectRatio: 3/4,
    bottom: 'auto',
    marginTop: '6%',
    marginHorizontal: 0,
    borderRadius: 22,
  },
  cameraContainerFullScreen: {
    marginTop: '6%',
    marginHorizontal: 0,
    marginBottom: '50.5%',
    borderRadius: 22,
  },
  cameraContainerDebug: {
    backgroundColor: '#1a1a1a',
    borderColor: 'red',
    borderWidth: 2,
  },
  camera: {
    flex: 1,
  },
  cameraDebug: {
    backgroundColor: '#2a2a2a',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: scaleSize(20),
    paddingVertical: scaleSize(12),
    borderRadius: scaleSize(8),
  },
  permissionButtonText: {
    color: 'white',
    fontSize: scaleSize(16),
    fontFamily: 'Inter-SemiBold',
  },
  loadingText: {
    color: 'white',
    fontSize: scaleSize(16),
    fontFamily: 'Inter-SemiBold',
  },
  cancelButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: scaleSize(20),
    paddingVertical: scaleSize(12),
    borderRadius: scaleSize(8),
  },
  cancelButtonText: {
    color: 'white',
    fontSize: scaleSize(16),
    fontFamily: 'Inter-SemiBold',
  },
  permissionText: {
    color: 'white',
    fontSize: scaleSize(16),
    fontFamily: 'Inter-SemiBold',
    marginBottom: scaleSize(16),
  },
}); 