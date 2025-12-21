import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, Switch } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, User, Edit3, Plus, Trash2, Crown, Users, Settings } from 'lucide-react-native';

interface ProjectManageScreenProps {
  onClose: () => void;
  showBottomQuickActions?: boolean;
  onToggleBottomQuickActions?: (value: boolean) => void;
}

// Sample data - in a real app this would come from your backend
const projectData = {
  name: 'Oakridge Residence',
  address: '1234 Maple Avenue, Beverly Hills, CA 90210',
  description: 'Luxury residential construction project featuring modern design and sustainable materials.',
  status: 'In Progress',
  startDate: '2024-01-15',
  estimatedCompletion: '2024-06-30',
};

const projectUsers = [
  {
    id: '1',
    name: 'Sarah Anderson',
    email: 'sarah@anderson.com',
    role: 'Owner',
    avatar: require('../assets/images/activity-sarah.jpg'),
    isOwner: true,
  },
  {
    id: '2',
    name: 'Bob Anderson',
    email: 'bob@anderson.com',
    role: 'Owner',
    avatar: require('../assets/images/activity-mike.jpg'),
    isOwner: true,
  },
];

const projectCollaborators = [
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@contractor.com',
    role: 'General Contractor',
    avatar: require('../assets/images/activity-mike.jpg'),
    permissions: ['view', 'edit', 'comment'],
  },
  {
    id: '4',
    name: 'Emily Chen',
    email: 'emily@architect.com',
    role: 'Architect',
    avatar: require('../assets/images/activity-emily.jpg'),
    permissions: ['view', 'edit', 'comment'],
  },
  {
    id: '5',
    name: 'David Martinez',
    email: 'david@electrical.com',
    role: 'Electrician',
    avatar: require('../assets/images/activity-david.jpg'),
    permissions: ['view', 'comment'],
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    email: 'lisa@inspector.com',
    role: 'Inspector',
    avatar: require('../assets/images/activity-lisa.jpg'),
    permissions: ['view'],
  },
];

export default function ProjectManageScreen({ onClose, showBottomQuickActions = false, onToggleBottomQuickActions }: ProjectManageScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState('info');
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectInfo, setProjectInfo] = useState(projectData);

  const tabs = [
    { id: 'info', label: 'Project Info', icon: Settings },
    { id: 'users', label: 'Users', icon: User },
    { id: 'collaborators', label: 'Collaborators', icon: Users },
  ];

  const handleSaveProject = () => {
    setIsEditingProject(false);
    Alert.alert('Success', 'Project information updated successfully!');
  };

  const handleAddCollaborator = () => {
    Alert.alert('Add Collaborator', 'This would open an invite screen in a real app.');
  };

  const handleRemoveCollaborator = (collaboratorId: string, name: string) => {
    Alert.alert(
      'Remove Collaborator',
      `Are you sure you want to remove ${name} from this project?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => {
          Alert.alert('Success', `${name} has been removed from the project.`);
        }},
      ]
    );
  };

  const renderProjectInfoTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Project Information</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditingProject(!isEditingProject)}
        >
          <Edit3 size={20} color="#3B82F6" />
          <Text style={styles.editButtonText}>
            {isEditingProject ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Project Name</Text>
          {isEditingProject ? (
            <TextInput
              style={styles.textInput}
              value={projectInfo.name}
              onChangeText={(text) => setProjectInfo({...projectInfo, name: text})}
              placeholder="Enter project name"
            />
          ) : (
            <Text style={styles.inputValue}>{projectInfo.name}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address</Text>
          {isEditingProject ? (
            <TextInput
              style={styles.textInput}
              value={projectInfo.address}
              onChangeText={(text) => setProjectInfo({...projectInfo, address: text})}
              placeholder="Enter project address"
              multiline
            />
          ) : (
            <Text style={styles.inputValue}>{projectInfo.address}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          {isEditingProject ? (
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={projectInfo.description}
              onChangeText={(text) => setProjectInfo({...projectInfo, description: text})}
              placeholder="Enter project description"
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text style={styles.inputValue}>{projectInfo.description}</Text>
          )}
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Status</Text>
            {isEditingProject ? (
              <TextInput
                style={styles.textInput}
                value={projectInfo.status}
                onChangeText={(text) => setProjectInfo({...projectInfo, status: text})}
                placeholder="Project status"
              />
            ) : (
              <Text style={styles.inputValue}>{projectInfo.status}</Text>
            )}
          </View>
          
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Start Date</Text>
            {isEditingProject ? (
              <TextInput
                style={styles.textInput}
                value={projectInfo.startDate}
                onChangeText={(text) => setProjectInfo({...projectInfo, startDate: text})}
                placeholder="YYYY-MM-DD"
              />
            ) : (
              <Text style={styles.inputValue}>{projectInfo.startDate}</Text>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Estimated Completion</Text>
          {isEditingProject ? (
            <TextInput
              style={styles.textInput}
              value={projectInfo.estimatedCompletion}
              onChangeText={(text) => setProjectInfo({...projectInfo, estimatedCompletion: text})}
              placeholder="YYYY-MM-DD"
            />
          ) : (
            <Text style={styles.inputValue}>{projectInfo.estimatedCompletion}</Text>
          )}
        </View>

        {/* Quick Actions Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Display Settings</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Quick Actions Bottom Row</Text>
              <Text style={styles.settingDescription}>
                Display Photos, Notes, and Chat in the quick actions
              </Text>
            </View>
            <Switch
              value={showBottomQuickActions}
              onValueChange={onToggleBottomQuickActions}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={showBottomQuickActions ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {isEditingProject && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProject}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderUserItem = (user: any, isOwner: boolean = false) => (
    <View key={user.id} style={styles.userItem}>
      <Image source={user.avatar} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName}>{user.name}</Text>
          {isOwner && <Crown size={16} color="#F59E0B" />}
        </View>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userRole}>{user.role}</Text>
      </View>
    </View>
  );

  const renderCollaboratorItem = (collaborator: any) => (
    <View key={collaborator.id} style={styles.userItem}>
      <Image source={collaborator.avatar} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{collaborator.name}</Text>
        <Text style={styles.userEmail}>{collaborator.email}</Text>
        <Text style={styles.userRole}>{collaborator.role}</Text>
        <Text style={styles.permissions}>
          Permissions: {collaborator.permissions.join(', ')}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveCollaborator(collaborator.id, collaborator.name)}
      >
        <Trash2 size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  const renderUsersTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Project Owners</Text>
      </View>
      
      <View style={styles.usersList}>
        {projectUsers.map(user => renderUserItem(user, true))}
      </View>
    </View>
  );

  const renderCollaboratorsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Collaborators</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddCollaborator}>
          <Plus size={20} color="#3B82F6" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.usersList}>
        {projectCollaborators.map(collaborator => renderCollaboratorItem(collaborator))}
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'info':
        return renderProjectInfoTab();
      case 'users':
        return renderUsersTab();
      case 'collaborators':
        return renderCollaboratorsTab();
      default:
        return renderProjectInfoTab();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={styles.headerTitle}>Manage Project</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              selectedTab === tab.id && styles.activeTab
            ]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <tab.icon 
              size={20} 
              color={selectedTab === tab.id ? '#3B82F6' : '#64748B'} 
            />
            <Text style={[
              styles.tabText,
              selectedTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#3B82F6',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#3B82F6',
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#374151',
  },
  inputValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  usersList: {
    gap: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
  },
  userEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  userRole: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#3B82F6',
  },
  permissions: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  settingsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  settingsSectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
});