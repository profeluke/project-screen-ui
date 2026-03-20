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
  hideWelcomeSection?: boolean;
  onToggleHideWelcomeSection?: (value: boolean) => void;
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
  onToggleHideProjectSection = () => {},
  hideWelcomeSection = true,
  onToggleHideWelcomeSection = () => {}
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
          <View style={styles.profileRow}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/women/68.jpg' }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>Emily Chen</Text>
              <Text style={styles.userCompany}>CompanyCam</Text>
            </View>
          </View>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Edit Profile')}>
              <Edit size={16} color="#1E293B" />
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Switch Account')}>
              <RefreshCw size={16} color="#1E293B" />
              <Text style={styles.actionButtonText}>Switch</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleMenuPress('Settings')}>
              <Settings size={16} color="#1E293B" />
              <Text style={styles.actionButtonText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Prototype Options Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Prototype Options</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('Prototype Options')}
            >
              <View style={styles.menuItemLeft}>
                <Wrench size={18} color="#64748B" />
                <Text style={styles.menuItemText}>Prototype Options</Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Company Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Anderson Construction Co.</Text>
          <View style={styles.sectionCard}>
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <React.Fragment key={item.id}>
                  {index > 0 && <View style={styles.separator} />}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleMenuPress(item.label)}
                  >
                    <View style={styles.menuItemLeft}>
                      <IconComponent size={18} color="#64748B" />
                      <Text style={styles.menuItemText}>{item.label}</Text>
                    </View>
                    <ChevronRight size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Settings</Text>
          <View style={styles.sectionCard}>
            {settingsItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <React.Fragment key={item.id}>
                  {index > 0 && <View style={styles.separator} />}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleMenuPress(item.label)}
                  >
                    <View style={styles.menuItemLeft}>
                      <IconComponent size={18} color="#64748B" />
                      <Text style={styles.menuItemText}>{item.label}</Text>
                    </View>
                    <ChevronRight size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </View>

        {/* Sign Out Section */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('Sign Out')}>
              <View style={styles.menuItemLeft}>
                <LogOut size={18} color="#EF4444" />
                <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          </View>
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
          hideWelcomeSection={hideWelcomeSection}
          onToggleHideWelcomeSection={onToggleHideWelcomeSection}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: '#F1F5F9',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1E293B',
    marginBottom: 2,
  },
  userCompany: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 6,
  },
  actionButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#1E293B',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 6,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
    marginLeft: 44,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#1E293B',
  },
}); 