import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Alert, ActivityIndicator } from 'react-native';
import { X, Calendar, UserPlus, Clock, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as Contacts from 'expo-contacts';

interface SalesRepBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  hasAssignedRep?: boolean; // Whether a rep has been assigned yet
  onRepStateChange?: (hasRep: boolean) => void; // Callback for prototype state toggling
}

// Rep data - Anna
const rep = {
  name: 'Anna',
  fullName: 'Anna Wyatt',
  title: '',
  email: 'anna@companycam.com',
  phone: '+1 (402) 555-0123',
  calendlyUrl: 'https://calendly.com/anna-companycam',
  bio: "Hey there! 👋 I'm Anna, and I'm here to help you get set up and answer any questions you have. I can also show you tips on how the best companies are using CompanyCam to find great customers, do amazing work, and grow their business. Let's chat!",
};

// Generic demo booking URL for when no rep is assigned yet
const genericCalendlyUrl = 'https://calendly.com/companycam-sales';

export default function SalesRepBottomSheet({ visible, onClose, hasAssignedRep = true, onRepStateChange }: SalesRepBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const [contactSaved, setContactSaved] = React.useState(false);
  
  const snapPoints = React.useMemo(() => [hasAssignedRep ? '85%' : '70%'], [hasAssignedRep]);
  
  // Helper to toggle state and notify parent
  const handleToggleRepState = (newState: boolean) => {
    if (onRepStateChange) {
      onRepStateChange(newState);
    }
  };

  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleSaveContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to contacts to save Anna\'s info.',
          [{ text: 'OK' }]
        );
        return;
      }

      const contact: Contacts.Contact = {
        contactType: Contacts.ContactTypes.Person,
        name: rep.fullName,
        firstName: 'Anna',
        lastName: 'Wyatt',
        jobTitle: rep.title,
        company: 'CompanyCam',
        phoneNumbers: [
          {
            label: 'work',
            number: rep.phone,
          },
        ],
        emails: [
          {
            label: 'work',
            email: rep.email,
          },
        ],
      };

      await Contacts.addContactAsync(contact);
      setContactSaved(true);
      Alert.alert(
        'Contact Saved! 🎉',
        'Anna\'s contact info has been added to your phone.',
        [{ text: 'Great!' }]
      );
    } catch (error) {
      console.error('Error saving contact:', error);
      Alert.alert(
        'Oops!',
        'There was an issue saving the contact. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBookTime = () => {
    Linking.openURL(hasAssignedRep ? rep.calendlyUrl : genericCalendlyUrl);
  };

  const renderBackdrop = React.useCallback(
    (props: any) => (
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

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={20} color="#64748B" />
        </TouchableOpacity>

        {hasAssignedRep ? (
          <>
            {/* Profile Section - Assigned Rep */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Image 
                  source={require('../assets/images/McKynzie.png')} 
                  style={styles.avatar}
                />
                <View style={styles.onlineIndicator} />
              </View>
              <Text style={styles.name}>{rep.fullName}</Text>
              
              {/* Badge - Tappable for prototype to toggle back to unassigned */}
              <TouchableOpacity 
                style={styles.trialBadge}
                onPress={() => handleToggleRepState(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.trialBadgeText}>Your CompanyCam Rep</Text>
              </TouchableOpacity>
            </View>

            {/* Bio Section */}
            <View style={styles.bioSection}>
              <Text style={styles.bioText}>{rep.bio}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsSection}>
              {/* Primary CTA - Save Contact */}
              <TouchableOpacity 
                style={[styles.primaryButton, contactSaved && styles.primaryButtonSaved]} 
                onPress={handleSaveContact}
                disabled={contactSaved}
              >
                <UserPlus size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>
                  {contactSaved ? 'Contact Saved ✓' : 'Save Contact'}
                </Text>
              </TouchableOpacity>

              {/* Book Time - Secondary prominent */}
              <TouchableOpacity style={styles.bookTimeButton} onPress={handleBookTime}>
                <Calendar size={20} color="#7C3AED" />
                <Text style={styles.bookTimeButtonText}>Book a Time</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Profile Section - Unassigned Rep */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <View style={styles.pendingAvatar}>
                  <Users size={40} color="#94A3B8" />
                </View>
                <View style={styles.pendingIndicator}>
                  <ActivityIndicator size="small" color="#7C3AED" />
                </View>
              </View>
              <Text style={styles.name}>Finding Your Rep...</Text>
              
              {/* Pending Badge - Tappable for prototype */}
              <TouchableOpacity 
                style={styles.pendingBadge}
                onPress={() => handleToggleRepState(true)}
                activeOpacity={0.7}
              >
                <Clock size={14} color="#64748B" />
                <Text style={styles.pendingBadgeText}>Usually takes a few minutes</Text>
              </TouchableOpacity>
            </View>

            {/* Info Section */}
            <View style={styles.bioSection}>
              <Text style={styles.bioText}>
                We're assigning a dedicated CompanyCam rep to help you get the most out of your account. In the meantime, feel free to book a demo and we'll make sure the right person is there to help!
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsSection}>
              {/* Primary CTA - Book Training */}
              <TouchableOpacity style={styles.primaryButton} onPress={handleBookTime}>
                <Calendar size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Book 20 Min Training</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#E2E8F0',
    width: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#7C3AED',
  },
  pendingAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  pendingIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1E293B',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
  },
  trialBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trialBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#7C3AED',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pendingBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  bioSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  bioText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  actionsSection: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
  },
  primaryButtonSaved: {
    backgroundColor: '#22C55E',
  },
  primaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  bookTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  bookTimeButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#7C3AED',
  },
  });
