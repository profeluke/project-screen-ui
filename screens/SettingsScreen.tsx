import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronRight, Shield, Camera, HardDrive, RefreshCw, Wifi, User, HelpCircle, Info, MessageSquare } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingsScreenProps {
  onClose: () => void;
}

export default function SettingsScreen({ onClose }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();

  const handleSettingPress = (item: string) => {
    console.log(`${item} pressed`);
    // TODO: Navigate to respective settings screens
  };

  const personalSettings = [
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'account', label: 'Account', icon: User },
    { id: 'camera', label: 'Camera Settings', icon: Camera },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'sync', label: 'Sync Settings', icon: RefreshCw },
    { id: 'offline', label: 'Offline Mode', icon: Wifi },
  ];

  const supportSettings = [
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'feedback', label: 'Send Feedback', icon: MessageSquare },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 16, 32) }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <ChevronRight size={24} color="#1E293B" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Personal Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Personal</Text>
          {personalSettings.map((item) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleSettingPress(item.label)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <IconComponent size={20} color="#64748B" />
                  </View>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </View>
                <ChevronRight size={20} color="#94A3B8" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Support & Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Support & Legal</Text>
          {supportSettings.map((item) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleSettingPress(item.label)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <IconComponent size={20} color="#64748B" />
                  </View>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </View>
                <ChevronRight size={20} color="#94A3B8" />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
  },
  placeholder: {
    width: 44,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1E293B',
  },
}); 