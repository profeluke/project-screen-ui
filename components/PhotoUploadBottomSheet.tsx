import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import BottomSheet, { 
  BottomSheetView, 
  BottomSheetBackdrop,
  BottomSheetBackdropProps 
} from '@gorhom/bottom-sheet';
import { Upload, Sparkles, Camera, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PhotoUploadBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onUploadPress: () => void;
  onMagicUploadPress: () => void;
  onCameraPress: () => void;
}

const PhotoUploadBottomSheet: React.FC<PhotoUploadBottomSheetProps> = ({
  visible,
  onClose,
  onUploadPress,
  onMagicUploadPress,
  onCameraPress,
}) => {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleOptionPress = (action: () => void) => {
    action();
    onClose();
  };

  // Render backdrop
  const renderBackdrop = useCallback(
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

  // Expand when visible
  useEffect(() => {
    if (visible) {
      // Delay to ensure mount before expand
      requestAnimationFrame(() => {
        bottomSheetRef.current?.expand();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={['45%']}
      backdropComponent={renderBackdrop}
      onClose={onClose}
      enablePanDownToClose={true}
      style={styles.bottomSheet}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={[styles.container, { paddingBottom: Math.max(insets.bottom, 32) }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Photos</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleOptionPress(onUploadPress)}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#DBEAFE' }]}>
              <Upload size={24} color="#1D4ED8" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Upload Photos</Text>
              <Text style={styles.optionDescription}>
                Select photos from your library
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleOptionPress(onMagicUploadPress)}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#E9D5FF' }]}>
              <Sparkles size={24} color="#7C3AED" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Magic Upload</Text>
              <Text style={styles.optionDescription}>
                Auto-find photos from this job in your camera roll
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleOptionPress(onCameraPress)}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Camera size={24} color="#D97706" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Take Photos</Text>
              <Text style={styles.optionDescription}>
                Open camera to capture new photos
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

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
    zIndex: 10000, // Ensure it appears above FAB which has zIndex: 9999
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
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1E293B',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  optionsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  optionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});

export default PhotoUploadBottomSheet;
