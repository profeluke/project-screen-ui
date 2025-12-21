import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { 
  Zap, 
  FileText, 
  Edit3, 
  X,
  ChevronUp
} from 'lucide-react-native';

interface PaymentCreationBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onQuickInvoice: () => void;
  onFromTemplate: () => void;
  onCustomRequest: () => void;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = 400;

export default function PaymentCreationBottomSheet({
  visible,
  onClose,
  onQuickInvoice,
  onFromTemplate,
  onCustomRequest,
}: PaymentCreationBottomSheetProps) {
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: BOTTOM_SHEET_HEIGHT,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleOptionPress = (action: () => void) => {
    onClose();
    setTimeout(action, 100); // Small delay for smooth animation
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={styles.backdropTouch} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <ChevronUp size={24} color="#3B82F6" />
              <Text style={styles.title}>Create Payment Request</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View style={styles.options}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleOptionPress(onQuickInvoice)}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Zap size={24} color="#F59E0B" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Quick Invoice</Text>
                <Text style={styles.optionDescription}>
                  Generate a simple invoice with basic details and send immediately
                </Text>
              </View>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleOptionPress(onFromTemplate)}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                <FileText size={24} color="#3B82F6" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>From Template</Text>
                <Text style={styles.optionDescription}>
                  Use a pre-built template with common payment terms and details
                </Text>
              </View>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleOptionPress(onCustomRequest)}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#F3E8FF' }]}>
                <Edit3 size={24} color="#8B5CF6" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Custom Request</Text>
                <Text style={styles.optionDescription}>
                  Create a completely customized payment request with detailed terms
                </Text>
              </View>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 34, // Safe area bottom
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1E293B',
    marginLeft: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  options: {
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
  arrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
}); 