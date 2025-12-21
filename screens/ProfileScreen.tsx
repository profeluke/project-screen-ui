import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { ChevronRight, User, FolderOpen, Users, CheckSquare, BarChart3, Settings, LogOut, Puzzle, FileText, Shield, HelpCircle, CreditCard, Megaphone, Briefcase, Star, File, Wrench, X, Edit, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SettingsScreen from './SettingsScreen';
import PrototypeOptionsScreen from './PrototypeOptionsScreen';

interface ProfileScreenProps {
  onClose: () => void;
  hideActivityFeed?: boolean;
  onToggleActivityFeed?: (value: boolean) => void;
  hideActivityTitle?: boolean;
  onToggleActivityTitle?: (value: boolean) => void;
  hideSearchBar?: boolean;
  onToggleSearchBar?: (value: boolean) => void;
  showBottomSearchBar?: boolean;
  onToggleBottomSearchBar?: (value: boolean) => void;
  condensedMyStuff?: boolean;
  onToggleCondensedMyStuff?: (value: boolean) => void;
  disablePaymentButton?: boolean;
  onToggleDisablePaymentButton?: (value: boolean) => void;
  showProjectTabs?: boolean;
  onToggleShowProjectTabs?: (value: boolean) => void;
  showFloatingActionLabels?: boolean;
  onToggleShowFloatingActionLabels?: (value: boolean) => void;
  showWidgetsAtTop?: boolean;
  onToggleShowWidgetsAtTop?: (value: boolean) => void;
  showMyStuffWidgets?: boolean;
  onToggleShowMyStuffWidgets?: (value: boolean) => void;
  showHeaderIcons?: boolean;
  onToggleShowHeaderIcons?: (value: boolean) => void;
  hideProjectSection?: boolean;
  onToggleHideProjectSection?: (value: boolean) => void;
}

export default function ProfileScreen({ 
  onClose, 
  hideActivityFeed = false, 
  onToggleActivityFeed = () => {},
  hideActivityTitle = true,
  onToggleActivityTitle = () => {},
  hideSearchBar = false,
  onToggleSearchBar = () => {},
  showBottomSearchBar = false,
  onToggleBottomSearchBar = () => {},
  condensedMyStuff = false,
  onToggleCondensedMyStuff = () => {},
  disablePaymentButton = false,
  onToggleDisablePaymentButton = () => {},
  showProjectTabs = true,
  onToggleShowProjectTabs = () => {},
  showFloatingActionLabels = true,
  onToggleShowFloatingActionLabels = () => {},
  showWidgetsAtTop = true,
  onToggleShowWidgetsAtTop = () => {},
  showMyStuffWidgets = true,
  onToggleShowMyStuffWidgets = () => {},
  showHeaderIcons = true,
  onToggleShowHeaderIcons = () => {},
  hideProjectSection = false,
  onToggleHideProjectSection = () => {}
}: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const [showSettingsScreen, setShowSettingsScreen] = useState(false);
  const [showPrototypeOptions, setShowPrototypeOptions] = useState(false);

  const handleMenuPress = (item: string) => {
    if (item === 'Settings') {
      setShowSettingsScreen(true);
    } else if (item === 'Prototype Options') {
      setShowPrototypeOptions(true);
    } else {
      console.log(`${item} pressed`);
      // TODO: Navigate to respective screens
    }
  };

  const menuItems = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'checklists', label: 'Checklists', icon: CheckSquare },
    { id: 'documents', label: 'Documents', icon: File },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  const settingsItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'integrations', label: 'Integrations', icon: Puzzle },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 16, 32) }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/women/68.jpg' }}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.userName}>Emily Chen</Text>
          <Text style={styles.userCompany}>CompanyCam</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Edit Profile')}>
            <View style={styles.actionButtonIcon}>
              <Edit size={20} color="#1E293B" />
            </View>
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Switch Account')}>
            <View style={styles.actionButtonIcon}>
              <RefreshCw size={20} color="#1E293B" />
            </View>
            <Text style={styles.actionButtonText}>Switch Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => handleMenuPress('Settings')}>
            <View style={styles.actionButtonIcon}>
              <Settings size={20} color="#1E293B" />
            </View>
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Prototype Options Section */}
        <View style={styles.prototypeSection}>
          <Text style={styles.sectionHeader}>Prototype Options</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('Prototype Options')}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Wrench size={20} color="#64748B" />
              </View>
              <Text style={styles.menuItemText}>Prototype Options</Text>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Company Menu Items */}
        <View style={styles.companySection}>
          <Text style={styles.sectionHeader}>Anderson Construction Co.</Text>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuPress(item.label)}
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

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionHeader}>Settings</Text>
          {settingsItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuPress(item.label)}
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

        {/* Sign Out Section */}
        <View style={styles.signOutSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('Sign Out')}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <LogOut size={20} color="#EF4444" />
              </View>
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showSettingsScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <SettingsScreen onClose={() => setShowSettingsScreen(false)} />
      </Modal>

      <Modal
        visible={showPrototypeOptions}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <PrototypeOptionsScreen 
          onClose={() => setShowPrototypeOptions(false)}
          hideActivityFeed={hideActivityFeed}
          onToggleActivityFeed={onToggleActivityFeed}
          hideActivityTitle={hideActivityTitle}
          onToggleActivityTitle={onToggleActivityTitle}
          hideSearchBar={hideSearchBar}
          onToggleSearchBar={onToggleSearchBar}
          showBottomSearchBar={showBottomSearchBar}
          onToggleBottomSearchBar={onToggleBottomSearchBar}
          condensedMyStuff={condensedMyStuff}
          onToggleCondensedMyStuff={onToggleCondensedMyStuff}
          disablePaymentButton={disablePaymentButton}
          onToggleDisablePaymentButton={onToggleDisablePaymentButton}
          showProjectTabs={showProjectTabs}
          onToggleShowProjectTabs={onToggleShowProjectTabs}
          showFloatingActionLabels={showFloatingActionLabels}
          onToggleShowFloatingActionLabels={onToggleShowFloatingActionLabels}
          showWidgetsAtTop={showWidgetsAtTop}
          onToggleShowWidgetsAtTop={onToggleShowWidgetsAtTop}
          showMyStuffWidgets={showMyStuffWidgets}
          onToggleShowMyStuffWidgets={onToggleShowMyStuffWidgets}
          showHeaderIcons={showHeaderIcons}
          onToggleShowHeaderIcons={onToggleShowHeaderIcons}
          hideProjectSection={hideProjectSection}
          onToggleHideProjectSection={onToggleHideProjectSection}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 20,
  },
  profileImageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    marginBottom: 2,
  },
  userCompany: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#1E293B',
    textAlign: 'center',
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  companySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  prototypeSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 8,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signOutSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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