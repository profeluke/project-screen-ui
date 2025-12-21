import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Mail, Phone, MapPin, MessageSquare, Copy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

interface UserProfileScreenProps {
  onClose: () => void;
  user: {
    id: string;
    name: string;
    avatarUrl: any;
    email?: string;
    phone?: string;
    location?: string;
    role?: string;
  };
}

export default function UserProfileScreen({ onClose, user }: UserProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const contactBottomSheetRef = useRef<BottomSheet>(null);
  
  // Generate dummy photo grid
  const photoCount = 24;
  const photos = Array.from({ length: photoCount }, (_, i) => ({ id: `${i}` }));

  const handleContactPress = () => {
    contactBottomSheetRef.current?.expand();
  };

  const handleCall = () => {
    if (user.phone) {
      const phoneNumber = user.phone.replace(/[^0-9]/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    }
    contactBottomSheetRef.current?.close();
  };

  const handleText = () => {
    if (user.phone) {
      const phoneNumber = user.phone.replace(/[^0-9]/g, '');
      Linking.openURL(`sms:${phoneNumber}`);
    }
    contactBottomSheetRef.current?.close();
  };

  const handleEmail = () => {
    if (user.email) {
      Linking.openURL(`mailto:${user.email}`);
    }
    contactBottomSheetRef.current?.close();
  };

  const handleCopyPhone = async () => {
    if (user.phone) {
      await Clipboard.setStringAsync(user.phone);
      Alert.alert('Copied', 'Phone number copied to clipboard');
    }
  };

  const handleCopyEmail = async () => {
    if (user.email) {
      await Clipboard.setStringAsync(user.email);
      Alert.alert('Copied', 'Email address copied to clipboard');
    }
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <X size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={user.avatarUrl}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          {user.role && (
            <Text style={styles.userRole}>{user.role}</Text>
          )}
        </View>

        {/* Contact Button */}
        <View style={styles.contactSection}>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={handleContactPress}
          >
            <MessageSquare size={20} color="#3B82F6" />
            <Text style={styles.contactButtonText}>Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>47</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        {/* Photos Section */}
        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <View style={styles.photoGrid}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoPlaceholder} />
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Contact Bottom Sheet */}
      <BottomSheet
        ref={contactBottomSheetRef}
        index={-1}
        snapPoints={['45%']}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Contact {user.name.split(' ')[0]}</Text>
          </View>

          <View style={styles.contactOptions}>
            <View style={styles.contactOptionWrapper}>
              <TouchableOpacity 
                style={styles.contactOption}
                onPress={handleCall}
              >
                <View style={styles.contactOptionIcon}>
                  <Phone size={24} color="#3B82F6" />
                </View>
                <View style={styles.contactOptionText}>
                  <Text style={styles.contactOptionTitle}>Call</Text>
                  <Text style={styles.contactOptionSubtitle}>{user.phone}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={handleCopyPhone}
              >
                <Copy size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.contactOptionWrapper}>
              <TouchableOpacity 
                style={styles.contactOption}
                onPress={handleText}
              >
                <View style={styles.contactOptionIcon}>
                  <MessageSquare size={24} color="#10B981" />
                </View>
                <View style={styles.contactOptionText}>
                  <Text style={styles.contactOptionTitle}>Text</Text>
                  <Text style={styles.contactOptionSubtitle}>{user.phone}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={handleCopyPhone}
              >
                <Copy size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.contactOptionWrapper}>
              <TouchableOpacity 
                style={styles.contactOption}
                onPress={handleEmail}
              >
                <View style={styles.contactOptionIcon}>
                  <Mail size={24} color="#8B5CF6" />
                </View>
                <View style={styles.contactOptionText}>
                  <Text style={styles.contactOptionTitle}>Email</Text>
                  <Text style={styles.contactOptionSubtitle}>{user.email}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={handleCopyEmail}
              >
                <Copy size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 32,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E2E8F0',
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#1E293B',
    marginBottom: 4,
  },
  userRole: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#64748B',
  },
  contactSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DBEAFE',
    paddingVertical: 14,
    borderRadius: 12,
  },
  contactButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#3B82F6',
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  photosSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1E293B',
    marginBottom: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  photoPlaceholder: {
    width: '32.5%',
    aspectRatio: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#CBD5E1',
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  bottomSheetHeader: {
    paddingBottom: 20,
  },
  bottomSheetTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1E293B',
  },
  contactOptions: {
    gap: 16,
  },
  contactOptionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingRight: 12,
  },
  contactOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
  },
  contactOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactOptionText: {
    flex: 1,
  },
  contactOptionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: '#1E293B',
    marginBottom: 2,
  },
  contactOptionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#64748B',
  },
});

