import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image, Alert, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { Menu, Map, Search, Bell, Plus, Camera, ChevronRight, Sparkles, DollarSign, Trash2, Bot, WandSparkles, FileText, CheckSquare, Users, FolderOpen, BarChart3, Mic, Home, AudioLines, Image as ImageIcon, Trophy } from 'lucide-react-native';
import CamAIIcon from '../components/CamAIIcon';
import WavelengthAnimation from '../components/WavelengthAnimation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProfileScreen from './ProfileScreen';
import CameraScreen from './CameraScreen';
import AudioRecordingModal, { AudioRecordingModalHandles } from '../components/AudioRecordingModal';
import CreateModal from '../components/CreateModal';
import ProjectDetailScreen from './ProjectDetailScreen';
import MyStuffScreen from './MyStuffScreen';
import SearchPageScreen from './SearchPageScreen';
import PaymentsScreen from './PaymentsScreen';
import OrganizedNotesScreen from './OrganizedNotesScreen';
import PortfolioScreen from './PortfolioScreen';
import OnboardingScreen from './OnboardingScreen';
import UserProfileScreen from './UserProfileScreen';
import LearnThingsScreen from './LearnThingsScreen';
import LeaderboardScreen from './LeaderboardScreen';
import { getAllTasks, toggleTaskComplete, deleteTask, Task } from '../utils/taskStorage';
import { setupDeepLinkListener, DeepLinkHandlers } from '../utils/deepLinkHandler';
import MagicAIBottomSheet from '../components/MagicAIBottomSheet';
import AddWidgetBottomSheet from '../components/AddWidgetBottomSheet';
import EditCardsBottomSheet, { QuickAccessCard } from '../components/EditCardsBottomSheet';
import StateOutline from '../components/StateOutline';
import SalesRepBottomSheet from '../components/SalesRepBottomSheet';

interface Project {
  id: string;
  title: string;
  address: string;
}

interface MyStuffItem {
  id: string;
  title: string;
  subtitle: string;
  type: string;
}

type ProjectCategory = 'Nearby' | 'Recent' | 'Starred';
type MyStuffCategory = 'To-dos' | 'Photos' | 'Projects' | 'Notes' | 'Documents';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const barWidth = Math.round(screenWidth * 0.84);
  const circleSize = Math.max(56, Math.round(screenWidth * 0.14));
  const iconSize = Math.round(circleSize * 0.44);
  const camAiLabelSize = Math.max(14, Math.min(18, Math.round(circleSize * 0.32)));
  const cameraPillWidth = Math.round(circleSize * 1.8);
  // Calculate widget width to show 3.2 widgets on screen
  const widgetWidth = Math.floor((screenWidth - 32 - 36) / 3.2); // 32 for padding, 36 for gaps (3 gaps * 12px)
  // Calculate project card width as 80% of screen width
  const projectCardWidth = Math.floor(screenWidth * 0.80);
  const projectCardHeight = Math.floor(projectCardWidth * 0.75); // 4:3 aspect ratio
  const audioModalRef = useRef<AudioRecordingModalHandles>(null);
  const [showProfileScreen, setShowProfileScreen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  const [hideActivityFeed, setHideActivityFeed] = useState(false);
  const [hideActivityTitle, setHideActivityTitle] = useState(false);
  const [hideSearchBar, setHideSearchBar] = useState(true);
  const [showFloatingActionBar, setShowFloatingActionBar] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProjectScreen, setShowProjectScreen] = useState(false);
  const [condensedMyStuff, setCondensedMyStuff] = useState(true);
  const [showMyStuffScreen, setShowMyStuffScreen] = useState(false);
  const [disablePaymentButton, setDisablePaymentButton] = useState(false);
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [showPaymentsScreen, setShowPaymentsScreen] = useState(false);
  const [showOrganizedNotes, setShowOrganizedNotes] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showPortfolioScreen, setShowPortfolioScreen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showLearnThings, setShowLearnThings] = useState(false);
  const [hideProjectSection, setHideProjectSection] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSalesRepSheet, setShowSalesRepSheet] = useState(false);


  const [hasNewMyStuffItems, setHasNewMyStuffItems] = useState(true); // Badge indicator for My Stuff
  const [organizedNotesData, setOrganizedNotesData] = useState<{
    content: string;
    photos: Array<{ uri: string; timestamp?: number; aiDescription?: string; photoId?: string }>;
    tasks: Array<{ text: string; photoIds?: string[] }>;
    promptSent?: string;
  } | null>(null);

  const [addedWidgets, setAddedWidgets] = useState<{id: string, label: string, description: string}[]>([]);
  const [realTasks, setRealTasks] = useState<Task[]>([]);
  const [showWidgetsAtTop, setShowWidgetsAtTop] = useState(true);
  const [showMyStuffWidgets, setShowMyStuffWidgets] = useState(false);
  const [showHeaderIcons, setShowHeaderIcons] = useState(true);
  const [useFloatingActionBar, setUseFloatingActionBar] = useState(true); // Default to true to show floating action bar
  const [showMagicAIBottomSheet, setShowMagicAIBottomSheet] = useState(false);
  const [showEditCardsModal, setShowEditCardsModal] = useState(false);
  
  // Quick Access Cards State
  const [quickAccessCards, setQuickAccessCards] = useState<QuickAccessCard[]>([
    { id: 'my-stuff', label: 'My Stuff', icon: 'FolderOpen', color: '#F59E0B', backgroundColor: '#FEF3C7', visible: true, order: 0 },
    { id: 'sales-rep', label: 'McKynzie', icon: 'SalesRepPhoto', color: '#7C3AED', backgroundColor: '#F3E8FF', visible: true, order: 1 },
    { id: 'leaderboard', label: 'Lincoln, NE', icon: 'StateOutline:NE', color: '#FFFFFF', backgroundColor: '#DC2626', visible: true, order: 2 },
    { id: 'project-map', label: 'Map', icon: 'Map', color: '#64748B', backgroundColor: '#F1F5F9', visible: true, order: 3 },
    { id: 'portfolio', label: 'Portfolio', icon: 'ImageIcon', color: '#8B5CF6', backgroundColor: '#F3E8FF', visible: true, order: 4 },
    { id: 'payments', label: 'Payments', icon: 'DollarSign', color: '#10B981', backgroundColor: '#ECFDF5', visible: false, order: 5 },
    { id: 'onboarding', label: 'Onboarding', icon: 'Sparkles', color: '#F97316', backgroundColor: '#FED7AA', visible: true, order: 6 },
    { id: 'to-dos', label: 'To-Dos', icon: 'CheckSquare', color: '#3B82F6', backgroundColor: '#DBEAFE', visible: false, order: 7 },
    { id: 'documents', label: 'Documents', icon: 'FileText', color: '#A855F7', backgroundColor: '#F3E8FF', visible: false, order: 8 },
    { id: 'users-groups', label: 'Users & Groups', icon: 'Users', color: '#EC4899', backgroundColor: '#FDF2F8', visible: false, order: 9 },
    { id: 'ai-updates', label: 'AI Updates', icon: 'CamAIIcon', color: '#7C3AED', backgroundColor: '#F3E8FF', visible: false, order: 10 },
    { id: 'getting-started', label: 'Features', icon: 'CCLogo', color: '#10B981', backgroundColor: '#D1FAE5', visible: false, order: 11 },
  ]);

  // Load tasks on mount and when organized notes close
  useEffect(() => {
    loadTasks();
  }, [showOrganizedNotes]);

  // Set up deep link handling
  useEffect(() => {
    const deepLinkHandlers: DeepLinkHandlers = {
      onShowTasks: () => {
        // Navigate to My Stuff screen with To-dos tab selected
        setShowMyStuffScreen(true);
      },
      onShowCamera: () => {
        setShowCamera(true);
      },
      onShowAudioModal: () => {
        setShowAudioModal(true);
      },
      onShowCreateModal: () => {
        setShowCreateModal(true);
      },
      onShowHome: () => {
        // Already on home, close any open modals
        setShowMyStuffScreen(false);
        setShowProjectScreen(false);
        setShowProfileScreen(false);
      }
    };

    const cleanup = setupDeepLinkListener(deepLinkHandlers);
    return cleanup;
  }, []);

  // Check for new tasks and show badge
  useEffect(() => {
    if (realTasks.length > 0) {
      setHasNewMyStuffItems(true);
    }
  }, [realTasks.length]);

  const loadTasks = async () => {
    try {
      const tasks = await getAllTasks();
      setRealTasks(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleTaskToggle = async (taskId: string) => {
    try {
      await toggleTaskComplete(taskId);
      await loadTasks(); // Reload tasks
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId);
              await loadTasks(); // Reload tasks
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          }
        }
      ]
    );
  };

  const handleAccountPress = () => {
    setShowProfileScreen(true);
  };

  const handleSearchPress = () => {
    setShowSearchPage(true);
  };

  const handleMapPress = () => {
    // TODO: Open map
    console.log('Map pressed');
  };

  const handleNotificationsPress = () => {
    // TODO: Open notifications
    console.log('Notifications pressed');
  };



  const handleAudioWavePress = () => {
    // TODO: Open audio wave functionality
    console.log('Audio wave pressed');
  };

  const handleCreatePress = () => {
    setShowCreateModal(true);
  };

  const handleCameraPress = () => {
    setShowCamera(true);
    // Don't show audio modal when camera opens - camera has its own modal
  };

  const handleAudioPress = () => {
    setShowAudioModal(true);
  };

  const handleMagicAIPress = () => {
    setShowMagicAIBottomSheet(true);
  };

  const handleWalkthroughNote = () => {
    setShowMagicAIBottomSheet(false);
    setShowAudioModal(true);
  };

  const handleProgressRecap = () => {
    setShowMagicAIBottomSheet(false);
    // TODO: Implement progress recap functionality
    console.log('Progress Recap selected');
  };

  const handleMagicUploader = () => {
    setShowMagicAIBottomSheet(false);
    // TODO: Implement magic uploader functionality
    console.log('Magic Uploader selected');
  };

  const handleCreateProject = () => {
    setShowMagicAIBottomSheet(false);
    // TODO: Implement create project functionality
    console.log('Create Project selected');
  };

  // Helper function to get icon component
  const getQuickAccessIcon = (iconName: string) => {
    // Handle sales rep photo - returns a circular image
    if (iconName === 'SalesRepPhoto') {
      return () => (
        <Image 
          source={require('../assets/images/McKynzie.png')}
          style={{ 
            width: 32, 
            height: 32, 
            borderRadius: 16,
            borderWidth: 2,
            borderColor: '#7C3AED',
          }}
        />
      );
    }
    
    // Handle state outlines (e.g., "StateOutline:NE")
    // Use larger size for state outlines since they need more detail to be recognizable
    if (iconName.startsWith('StateOutline:')) {
      const stateCode = iconName.split(':')[1];
      return (props: any) => (
        <StateOutline state={stateCode} size={24} color={props.color} />
      );
    }
    
    // Legacy support for state initials
    if (iconName.startsWith('StateInitials:')) {
      const initials = iconName.split(':')[1];
      return (props: any) => (
        <Text style={{ 
          fontFamily: 'Inter-Bold', 
          fontSize: 14, 
          color: props.color,
          letterSpacing: -0.5,
        }}>
          {initials}
        </Text>
      );
    }
    
    switch (iconName) {
      case 'FolderOpen': return FolderOpen;
      case 'Map': return Map;
      case 'CheckSquare': return CheckSquare;
      case 'FileText': return FileText;
      case 'DollarSign': return DollarSign;
      case 'Users': return Users;
      case 'BarChart3': return BarChart3;
      case 'ImageIcon': return ImageIcon;
      case 'Sparkles': return Sparkles;
      case 'CamAIIcon': return (props: any) => <CamAIIcon size={props.size} glyphColor={props.color} />;
      case 'CCLogo': return () => null; // Handled separately in render
      case 'Trophy': return Trophy;
      default: return FolderOpen;
    }
  };

  // Helper function to get card handler
  const getQuickAccessHandler = (cardId: string) => {
    switch (cardId) {
      case 'my-stuff': return () => {
        setShowMyStuffScreen(true);
        setHasNewMyStuffItems(false);
      };
      case 'sales-rep': return () => setShowSalesRepSheet(true);
      case 'getting-started': return () => setShowLearnThings(true);
      case 'project-map': return handleMapPress;
      case 'to-dos': return () => console.log('To-Dos pressed');
      case 'documents': return () => console.log('Documents pressed');
      case 'payments': return () => setShowPaymentsScreen(true);
      case 'users-groups': return () => console.log('Users & Groups pressed');
      case 'portfolio': return () => setShowPortfolioScreen(true);
      case 'onboarding': return () => setShowOnboarding(true);
      case 'ai-updates': return () => console.log('AI Updates pressed');
      case 'leaderboard': return () => setShowLeaderboard(true);
      default: return () => {};
    }
  };

  const handleSelectWidget = (widget: { id: string; label: string; description: string }) => {
    console.log(`Adding ${widget.label} widget`);
    setShowAddWidgetModal(false);
    setAddedWidgets(prev => [...prev, widget]);
  };

  const handleOpenOrganizedNotes = (data: {
    content: string;
    photos: Array<{ uri: string; timestamp?: number; aiDescription?: string; photoId?: string }>;
    tasks: Array<{ text: string; photoIds?: string[] }>;
    promptSent?: string;
  }) => {
    setOrganizedNotesData(data);
    setShowOrganizedNotes(true);
    // Show badge when new content is created
    setHasNewMyStuffItems(true);
  };

  const handleCloseOrganizedNotes = () => {
    setShowOrganizedNotes(false);
    setOrganizedNotesData(null);
  };

  const handleProjectPress = (projectId: string) => {
    // For now, we'll show the project screen for any project
    // Later you could customize this based on projectId
    setShowProjectScreen(true);
  };

  const handleUserPress = (user: any) => {
    setSelectedUser({
      id: user.id,
      name: user.label,
      avatarUrl: user.avatarUrl,
      email: user.email,
      phone: user.phone,
      location: user.location,
      role: user.role,
    });
    setShowUserProfile(true);
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    // Show header search icon when main search bar scrolls off screen (approximately 100px)
    setShowHeaderSearch(scrollY > 100);
  };

  // Project background images from the project screen photo gallery
  const projectBackgroundImages: Record<string, any> = {
    'Oakridge Residence': require('../assets/images/hero-project.jpg'),
    'Downtown Office Complex': require('../assets/images/project-downtown-office.jpg'),
    'Sunset Villa Renovation': require('../assets/images/project-sunset-villa.jpg'),
    'Modern Loft Project': require('../assets/images/project-modern-loft.jpg'),
    'Family Home Addition': require('../assets/images/project-family-home.jpg'),
    'Commercial Warehouse': require('../assets/images/project-warehouse.jpg'),
    'Luxury Beach House': require('../assets/images/project-beach-house.jpg'),
    'Historic Building Restore': require('../assets/images/project-downtown-office.jpg'),
  };

  // Photos for the rotating photo feed - cycle through individual photos
  const allActivityPhotos = [
    require('../assets/images/activity-sarah.jpg'),
    require('../assets/images/activity-mike.jpg'),
    require('../assets/images/activity-emily.jpg'),
    require('../assets/images/activity-david.jpg'),
    require('../assets/images/activity-lisa.jpg'),
    require('../assets/images/activity-james.jpg'),
  ];
  
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Rotate through photos every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % allActivityPhotos.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Get current photo for the feed
  const currentFeedPhoto = allActivityPhotos[currentPhotoIndex];

  const activityItems = [
    { 
      id: '1', 
      label: 'Sarah Anderson', 
      imageUrl: require('../assets/images/activity-sarah.jpg'), 
      avatarUrl: { uri: 'https://randomuser.me/api/portraits/women/44.jpg' }, 
      timeAgo: '5m',
      email: 'sarah.anderson@example.com',
      phone: '(555) 123-4567',
      location: 'Portland, OR',
      role: 'Project Manager',
    },
    { 
      id: '2', 
      label: 'Mike Johnson', 
      imageUrl: require('../assets/images/activity-mike.jpg'), 
      avatarUrl: { uri: 'https://randomuser.me/api/portraits/men/54.jpg' }, 
      timeAgo: '1h',
      email: 'mike.johnson@example.com',
      phone: '(555) 234-5678',
      location: 'Denver, CO',
      role: 'Lead Contractor',
    },
    { 
      id: '3', 
      label: 'Emily Chen', 
      imageUrl: require('../assets/images/activity-emily.jpg'), 
      avatarUrl: { uri: 'https://randomuser.me/api/portraits/women/68.jpg' }, 
      timeAgo: '3h',
      email: 'emily.chen@example.com',
      phone: '(555) 345-6789',
      location: 'San Francisco, CA',
      role: 'Designer',
    },
    { 
      id: '4', 
      label: 'David Wilson', 
      imageUrl: require('../assets/images/activity-david.jpg'), 
      avatarUrl: { uri: 'https://randomuser.me/api/portraits/men/32.jpg' }, 
      timeAgo: '1d',
      email: 'david.wilson@example.com',
      phone: '(555) 456-7890',
      location: 'Seattle, WA',
      role: 'Site Supervisor',
    },
    { 
      id: '5', 
      label: 'Lisa Thompson', 
      imageUrl: require('../assets/images/activity-lisa.jpg'), 
      avatarUrl: { uri: 'https://randomuser.me/api/portraits/women/22.jpg' }, 
      timeAgo: '2d',
      email: 'lisa.thompson@example.com',
      phone: '(555) 567-8901',
      location: 'Austin, TX',
      role: 'Estimator',
    },
    { 
      id: '6', 
      label: 'James Rodriguez', 
      imageUrl: require('../assets/images/activity-james.jpg'), 
      avatarUrl: { uri: 'https://randomuser.me/api/portraits/men/86.jpg' }, 
      timeAgo: '1w',
      email: 'james.rodriguez@example.com',
      phone: '(555) 678-9012',
      location: 'Phoenix, AZ',
      role: 'Foreman',
    },
  ];

  const projectCategories: ProjectCategory[] = ['Nearby', 'Recent', 'Starred'];
  const [selectedProjectCategory, setSelectedProjectCategory] = useState<ProjectCategory>('Nearby');

  const projectsData: Record<ProjectCategory, Project[]> = {
    Nearby: [
      { id: '1', title: 'Oakridge Residence', address: '1234 Maple Ave, Beverly Hills, CA' },
      { id: '2', title: 'Downtown Office Complex', address: '567 Main St, Los Angeles, CA' },
      { id: '3', title: 'Sunset Villa Renovation', address: '890 Sunset Blvd, West Hollywood, CA' },
    ],
    Recent: [
      { id: '4', title: 'Modern Loft Project', address: '123 Industrial Way, Santa Monica, CA' },
      { id: '5', title: 'Family Home Addition', address: '456 Oak Street, Pasadena, CA' },
      { id: '6', title: 'Commercial Warehouse', address: '789 Commerce Dr, Long Beach, CA' },
    ],
    Starred: [
      { id: '7', title: 'Luxury Beach House', address: '321 Ocean View Dr, Malibu, CA' },
      { id: '8', title: 'Historic Building Restore', address: '654 Heritage Ave, Pasadena, CA' },
    ],
  };

  const myStuffCategories: MyStuffCategory[] = ['To-dos', 'Photos', 'Projects', 'Notes', 'Documents'];
  const [selectedMyStuffCategory, setSelectedMyStuffCategory] = useState<MyStuffCategory>('To-dos');

  // Widget visuals to match Project screen action rows
  const getWidgetVisuals = (
    id: string
  ): { bg: string; color: string; Icon: React.ComponentType<{ size?: number; color?: string }>; } => {
    switch (id) {
      case 'map':
        return { bg: '#DBEAFE', color: '#1D4ED8', Icon: Map };
      case 'users':
        return { bg: '#E9D5FF', color: '#7C3AED', Icon: Users };
      case 'projects':
        return { bg: '#DBEAFE', color: '#1D4ED8', Icon: FolderOpen };
      case 'groups':
        return { bg: '#E9D5FF', color: '#7C3AED', Icon: Users };
      case 'checklists':
        return { bg: '#FEF3C7', color: '#D97706', Icon: CheckSquare };
      case 'documents':
        return { bg: '#EEF2FF', color: '#4F46E5', Icon: FileText };
      case 'reports':
        return { bg: '#DCFCE7', color: '#059669', Icon: BarChart3 };
      case 'templates':
        return { bg: '#FDE68A', color: '#B45309', Icon: FileText };
      case 'payments':
        return { bg: '#DCFCE7', color: '#059669', Icon: DollarSign };
      default:
        return { bg: '#F1F5F9', color: '#64748B', Icon: FolderOpen };
    }
  };

  const myStuffData: Record<MyStuffCategory, MyStuffItem[]> = {
    'To-dos': [
      { id: '1', title: 'Review electrical plans', subtitle: 'Due tomorrow', type: 'task' },
      { id: '2', title: 'Schedule inspection', subtitle: 'Oakridge Residence', type: 'task' },
      { id: '3', title: 'Safety checklist', subtitle: '8/12 items complete', type: 'checklist' },
      { id: '4', title: 'Order materials', subtitle: 'Downtown Office Complex', type: 'task' },
      { id: '5', title: 'Final walkthrough checklist', subtitle: '3/15 items complete', type: 'checklist' },
      { id: '6', title: 'Client meeting prep', subtitle: 'Friday 2:00 PM', type: 'task' },
    ],
    Photos: [
      { id: '5', title: 'Foundation progress', subtitle: 'Oakridge Residence • 2 hours ago', type: 'photo' },
      { id: '6', title: 'Electrical rough-in', subtitle: 'Downtown Office • Yesterday', type: 'photo' },
      { id: '7', title: 'Framing complete', subtitle: 'Sunset Villa • 3 days ago', type: 'photo' },
      { id: '8', title: 'Site preparation', subtitle: 'Modern Loft • 1 week ago', type: 'photo' },
      { id: '9', title: 'Roofing progress', subtitle: 'Oakridge • 2 days ago', type: 'photo' },
      { id: '10', title: 'Interior walls', subtitle: 'Downtown Office • 3 days ago', type: 'photo' },
      { id: '11', title: 'Plumbing rough-in', subtitle: 'Sunset Villa • 4 days ago', type: 'photo' },
      { id: '12', title: 'HVAC installation', subtitle: 'Modern Loft • 5 days ago', type: 'photo' },
    ],
    Projects: [
      { id: '9', title: 'Oakridge Residence', subtitle: '85% complete • 12 photos', type: 'project' },
      { id: '10', title: 'Downtown Office Complex', subtitle: '60% complete • 28 photos', type: 'project' },
      { id: '11', title: 'Sunset Villa Renovation', subtitle: '40% complete • 15 photos', type: 'project' },
      { id: '13', title: 'Modern Loft Project', subtitle: '25% complete • 8 photos', type: 'project' },
      { id: '14', title: 'Family Home Addition', subtitle: '90% complete • 35 photos', type: 'project' },
    ],
    Notes: [
      { id: '15', title: 'Project Notes', subtitle: 'Oakridge Residence', type: 'note' },
      { id: '16', title: 'Construction Updates', subtitle: 'Downtown Office', type: 'note' },
      { id: '17', title: 'Site Inspection Report', subtitle: 'Sunset Villa', type: 'note' },
    ],
    Documents: [
      { id: '12', title: 'Building Permit #2024-001', subtitle: 'Oakridge Residence • Approved', type: 'document' },
      { id: '13', title: 'Contract Amendment', subtitle: 'Downtown Office • Signed', type: 'document' },
      { id: '14', title: 'Material Invoice #INV-456', subtitle: 'Sunset Villa • $12,450', type: 'document' },
      { id: '15', title: 'Safety Inspection Report', subtitle: 'Modern Loft • Passed', type: 'document' },
      { id: '16', title: 'Change Order #CO-789', subtitle: 'Family Home • Pending', type: 'document' },
      { id: '17', title: 'Final Certificate', subtitle: 'Historic Building • Issued', type: 'document' },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <TouchableOpacity 
        style={[styles.header, { paddingTop: Math.max(insets.top + 16, 32) }]}
        onPress={() => {}}
        onLongPress={() => {
          // Toggle floating action bar on long press for prototype testing
          setUseFloatingActionBar(!useFloatingActionBar);
        }}
        activeOpacity={1}
      >
        {/* Top Row: Profile Button, Map Button, and Notifications Button */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.profileMenuContainer} onPress={handleAccountPress}>
            <View style={styles.headerAvatar}>
              <Image 
                source={{ uri: 'https://randomuser.me/api/portraits/women/68.jpg' }}
                style={styles.headerAvatarImage}
              />
            </View>
            <Menu size={20} color="#1E293B" />
          </TouchableOpacity>

          {showHeaderIcons ? (
            <View style={styles.rightButtons}>
              {showHeaderSearch && (
                <TouchableOpacity style={styles.iconButton} onPress={handleSearchPress}>
                  <Search size={20} color="#1E293B" />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.iconButton} onPress={handleNotificationsPress}>
                <Bell size={20} color="#1E293B" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>1</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            // Show search bar in header when icons are hidden
            !hideSearchBar && (
              <TouchableOpacity style={styles.headerSearchBar} onPress={handleSearchPress}>
                <Search size={16} color="#64748B" />
                <Text style={styles.headerSearchText}>Search CompanyCam...</Text>
                <Mic size={16} color="#64748B" />
              </TouchableOpacity>
            )
          )}
        </View>
      </TouchableOpacity>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeHeader}>
            <Text style={styles.welcomeText}>Welcome, Alex</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setShowEditCardsModal(true)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Access Grid - Dynamic Layout */}
        <View style={styles.quickAccessGrid}>
          {quickAccessCards
            .filter(card => card.visible)
            .sort((a, b) => a.order - b.order)
            .reduce((rows: QuickAccessCard[][], card, index) => {
              const rowIndex = Math.floor(index / 2);
              if (!rows[rowIndex]) rows[rowIndex] = [];
              rows[rowIndex].push(card);
              return rows;
            }, [])
            .map((row, rowIndex) => (
              <View key={rowIndex} style={styles.quickAccessRow}>
                {row.map((card) => {
                  const IconComponent = getQuickAccessIcon(card.icon);
                  const handlePress = getQuickAccessHandler(card.id);
                  
                  return (
                    <TouchableOpacity 
                      key={card.id}
                      style={styles.quickAccessCard}
                      onPress={handlePress}
                    >
                      {card.icon === 'CCLogo' ? (
                        <Image 
                          source={require('../assets/images/cc-logo.png')} 
                          style={styles.quickAccessLogoIcon}
                          resizeMode="cover"
                        />
                      ) : card.icon === 'SalesRepPhoto' ? (
                        <IconComponent />
                      ) : (
                        <View style={[styles.quickAccessIcon, { backgroundColor: card.backgroundColor }]}>
                          <IconComponent size={16} color={card.color} />
                        </View>
                      )}
                      <Text style={styles.quickAccessText} numberOfLines={1}>{card.label}</Text>
                      {card.id === 'getting-started' && (
                        <View style={styles.quickAccessBadgeCentered}>
                          <Text style={styles.quickAccessBadgeText}>3</Text>
                        </View>
                      )}
                      {card.id === 'sales-rep' && (
                        <View style={styles.salesRepBadge}>
                          <Text style={styles.salesRepBadgeText}>Rep</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
                {/* Add empty card if row has only one item */}
                {row.length === 1 && <View style={[styles.quickAccessCard, { opacity: 0 }]} />}
              </View>
            ))}
        </View>
        {/* Search Bar - Full Width (AI chat style) */}
        {!hideSearchBar && showHeaderIcons && (
          <TouchableOpacity style={styles.searchBar} onPress={handleSearchPress}>
            <Search size={18} color="#94A3B8" />
            <Text style={styles.searchText}>Search CompanyCam...</Text>
            <Mic size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}

        {/* Widgets at top (toggle) */}
        {showMyStuffWidgets && showWidgetsAtTop && (condensedMyStuff ? (
          <View style={styles.condensedMyStuffSection}>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.widgetScrollContent}
              scrollEventThrottle={16}
            >
              {/* My Stuff Widget */}
              <TouchableOpacity
                style={[styles.widgetCard, { width: widgetWidth }]}
                onPress={() => {
                  setShowMyStuffScreen(true);
                  setHasNewMyStuffItems(false);
                }}
              >
                <View style={styles.widgetIconOnly}>
                  <View style={[styles.widgetIconContainer, { backgroundColor: '#DBEAFE' }]}>
                    <FolderOpen size={20} color={'#1D4ED8'} />
                  </View>
                </View>
                <Text style={styles.widgetPrimaryTitle} numberOfLines={1}>My Stuff</Text>
                <Text style={styles.widgetSecondaryText} numberOfLines={2}>To-dos, Photos & More</Text>
              </TouchableOpacity>

              {/* Added Widgets */}
              {addedWidgets.map((widget, index) => (
                <TouchableOpacity
                  key={`top-widget-${widget.id}-${index}`}
                  style={[styles.widgetCard, { width: widgetWidth }]}
                  onPress={() => {
                    if (widget.id === 'payments') setShowPaymentsScreen(true);
                    if (widget.id === 'map') setShowMapModal(true);
                  }}
                  onLongPress={() => setAddedWidgets(prev => prev.filter((_, idx) => idx !== index))}
                >
                  {(() => { const v = getWidgetVisuals(widget.id); const Icon = v.Icon; return (
                    <>
                      <View style={styles.widgetIconOnly}>
                        <View style={[styles.widgetIconContainer, { backgroundColor: v.bg }]}>
                          <Icon size={20} color={v.color} />
                        </View>
                      </View>
                      <Text style={styles.widgetPrimaryTitle} numberOfLines={1}>{widget.label}</Text>
                      <Text style={styles.widgetSecondaryText} numberOfLines={2}>{widget.description}</Text>
                    </>
                  ); })()}
                </TouchableOpacity>
              ))}

              {/* Add Shortcut - Always at end */}
              <TouchableOpacity
                style={[styles.addWidgetCard, { width: widgetWidth }]}
                onPress={() => setShowAddWidgetModal(true)}
              >
                <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <View style={styles.shortcutIconCircle}>
                    <Plus size={20} color="#CBD5E1" />
                  </View>
                  <Text style={styles.addWidgetPlaceholderText} numberOfLines={1}>Shortcut</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        ) : (
          // Full My Stuff shown at top when not condensed
          <View style={styles.myStuffSection}>
            <Text style={styles.sectionTitle}>My Stuff</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {myStuffCategories.map((category) => (
                <TouchableOpacity key={category} style={[styles.categoryButton, selectedMyStuffCategory === category && styles.categoryButtonActive]} onPress={() => setSelectedMyStuffCategory(category)}>
                  <Text style={[styles.categoryText, selectedMyStuffCategory === category && styles.categoryTextActive]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.myStuffContent}>
              {selectedMyStuffCategory === 'To-dos' && (
                <View style={styles.todosContainer}>
                  {realTasks.filter(task => !task.completed).map((task) => (
                    <TouchableOpacity key={task.id} style={styles.todoItem} onPress={() => handleTaskToggle(task.id)} onLongPress={() => handleTaskDelete(task.id)}>
                      <TouchableOpacity style={[styles.todoCheckbox, task.completed && styles.todoCheckboxCompleted]} onPress={() => handleTaskToggle(task.id)}>
                        {task.completed && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                      <View style={styles.todoContent}>
                        <Text style={[styles.todoTitle, task.completed && styles.todoTitleCompleted]} numberOfLines={1}>{task.text}</Text>
                        <Text style={styles.todoSubtitle} numberOfLines={1}>{task.projectName || 'Oak Ridge Residence'}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {realTasks.filter(task => !task.completed).length === 0 && myStuffData[selectedMyStuffCategory].map((item) => (
                    <TouchableOpacity key={item.id} style={styles.todoItem}>
                      <View style={styles.todoCheckbox}>
                        <Text style={styles.todoCheckboxText}>
                          {item.type === 'checklist' ? '📋' : ''}
                        </Text>
                      </View>
                      <View style={styles.todoContent}>
                        <Text style={styles.todoTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.todoSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                      </View>
                      {item.type === 'checklist' && (
                        <View style={styles.progressIndicator}>
                          <Text style={styles.progressText}>→</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {selectedMyStuffCategory === 'Photos' && (
                <View style={styles.photosGrid}>
                  {myStuffData[selectedMyStuffCategory].map((item) => (
                    <TouchableOpacity key={item.id} style={styles.photoGridItem}>
                      <View style={styles.photoPlaceholder} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {(selectedMyStuffCategory === 'Projects' || selectedMyStuffCategory === 'Documents' || selectedMyStuffCategory === 'Notes') && (
                <View style={styles.listContainer}>
                  {myStuffData[selectedMyStuffCategory].map((item) => (
                    <TouchableOpacity key={item.id} style={styles.listItem}>
                      <View style={styles.listIcon}>
                        <Text style={styles.listIconText}>
                          {item.type === 'project' ? '🏗️' : item.type === 'note' ? '📝' : '📄'}
                        </Text>
                      </View>
                      <View style={styles.listContent}>
                        <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.listSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Activity Section */}
        {!hideActivityFeed && (
          <View style={styles.activitySection}>
            {!hideActivityTitle && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Photos</Text>
                <TouchableOpacity 
                  style={styles.seeAllButton}
                  onPress={() => {
                    // TODO: Navigate to all photos screen
                    console.log('See All Photos pressed');
                  }}
                >
                  <Text style={styles.seeAllButtonText}>See All</Text>
                </TouchableOpacity>
              </View>
            )}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activityScroll}
            >
              {activityItems.map((item, index) => {
                // Split name into first and last
                const nameParts = item.label.split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.slice(1).join(' ');
                
                return (
                  <View key={item.id} style={styles.activityItemContainer}>
                    <TouchableOpacity style={styles.activityItem}>
                      <View style={styles.activityImageContainer}>
                        <Image 
                          source={typeof item.imageUrl === 'string' ? { uri: item.imageUrl } : item.imageUrl}
                          style={styles.activityImage}
                        />
                        {item.timeAgo && (
                          <View style={styles.timeBadge}>
                            <Text style={styles.timeBadgeText}>{item.timeAgo}</Text>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity 
                        style={styles.activityUserInfo}
                        onPress={() => handleUserPress(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.activityAvatar}>
                          <Image 
                            source={typeof item.avatarUrl === 'string' ? { uri: item.avatarUrl } : item.avatarUrl}
                            style={styles.activityAvatarImage}
                          />
                        </View>
                        <View style={styles.activityNameContainer}>
                          <Text style={styles.activityFirstName} numberOfLines={1}>
                            {firstName}
                          </Text>
                          <Text style={styles.activityLastName} numberOfLines={1}>
                            {lastName}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Projects Section */}
        {!hideProjectSection && (
        <View style={styles.projectsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Projects</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => {
                // TODO: Navigate to all projects screen
                console.log('See All Projects pressed');
              }}
            >
              <Text style={styles.seeAllButtonText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Project Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {projectCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedProjectCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedProjectCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedProjectCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Project Cards */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.projectScroll}
          >
            {projectsData[selectedProjectCategory].map((project) => (
              <TouchableOpacity 
                key={project.id} 
                style={[styles.projectCard, { width: projectCardWidth }]}
                onPress={() => handleProjectPress(project.id)}
              >
                <View style={[styles.projectImage, { height: projectCardHeight }]}>
                  {projectBackgroundImages[project.title] && (
                    <Image
                      source={projectBackgroundImages[project.title]}
                      style={styles.projectBackgroundImage}
                      resizeMode="cover"
                      fadeDuration={0}
                    />
                  )}
                  <LinearGradient
                    colors={['transparent', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 1)']}
                    style={styles.projectTextOverlay}
                  >
                    <View style={styles.projectInfoContainer}>
                      <View style={styles.projectTextContent}>
                        <Text style={styles.projectTitle} numberOfLines={1}>
                          {project.title}
                        </Text>
                        <Text style={styles.projectAddress} numberOfLines={1}>
                          {project.address}
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.projectCameraButton}>
                        <Camera size={24} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        )}

        {/* My Stuff Section (bottom) - shown only when widgets are at bottom */}
        {showMyStuffWidgets && !showWidgetsAtTop && (condensedMyStuff ? (
          !showWidgetsAtTop ? (
          // Horizontal scrolling widget section
          <View style={styles.condensedMyStuffSection}>
            <ScrollView 
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.widgetScrollContent}
              scrollEventThrottle={16}
            >
              {/* My Stuff Widget */}
              <TouchableOpacity 
                style={[styles.widgetCard, { width: widgetWidth }]}
                onPress={() => {
                  setShowMyStuffScreen(true);
                  setHasNewMyStuffItems(false); // Clear badge when user opens My Stuff
                }}
              >
                <View style={styles.widgetIconOnly}>
                  <View style={[styles.widgetIconContainer, { backgroundColor: '#DBEAFE' }]}>
                    <FolderOpen size={20} color={'#1D4ED8'} />
                  </View>
                </View>
                <Text style={styles.widgetPrimaryTitle} numberOfLines={1}>My Stuff</Text>
                <Text style={styles.widgetSecondaryText} numberOfLines={2}>To-dos, Photos & More</Text>
              </TouchableOpacity>
              
              {/* Added Widgets */}
              {addedWidgets.map((widget, index) => (
                <TouchableOpacity 
                  key={`widget-${widget.id}-${index}`}
                  style={[styles.widgetCard, { width: widgetWidth }]}
                  onPress={() => {
                    if (widget.id === 'payments') setShowPaymentsScreen(true);
                    if (widget.id === 'map') setShowMapModal(true);
                  }}
                  onLongPress={() => setAddedWidgets(prev => prev.filter((_, idx) => idx !== index))}
                >
                  {(() => { const v = getWidgetVisuals(widget.id); const Icon = v.Icon; return (
                    <>
                      <View style={styles.widgetIconOnly}>
                        <View style={[styles.widgetIconContainer, { backgroundColor: v.bg }]}>
                          <Icon size={20} color={v.color} />
                        </View>
                      </View>
                      <Text style={styles.widgetPrimaryTitle} numberOfLines={1}>{widget.label}</Text>
                      <Text style={styles.widgetSecondaryText} numberOfLines={2}>{widget.description}</Text>
                    </>
                  ); })()}
                </TouchableOpacity>
              ))}
              
              {/* Add Shortcut Button - Always at the end */}
              <TouchableOpacity 
                style={[styles.addWidgetCard, { width: widgetWidth }]}
                onPress={() => setShowAddWidgetModal(true)}
              >
                <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <View style={styles.shortcutIconCircle}>
                    <Plus size={20} color="#CBD5E1" />
                  </View>
                  <Text style={styles.addWidgetPlaceholderText} numberOfLines={1}>Shortcut</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
          ) : null
        ) : (
          // Full My Stuff Section
          !showWidgetsAtTop ? (
          <View style={styles.myStuffSection}>
            <Text style={styles.sectionTitle}>My Stuff</Text>
            
            {/* My Stuff Categories */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {myStuffCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedMyStuffCategory === category && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedMyStuffCategory(category)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedMyStuffCategory === category && styles.categoryTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* My Stuff Items */}
            <View style={styles.myStuffContent}>
              {selectedMyStuffCategory === 'To-dos' && (
                <View style={styles.todosContainer}>
                  {/* Show real tasks first */}
                  {realTasks.filter(task => !task.completed).map((task) => (
                    <TouchableOpacity 
                      key={task.id} 
                      style={styles.todoItem}
                      onPress={() => handleTaskToggle(task.id)}
                      onLongPress={() => handleTaskDelete(task.id)}
                    >
                      <TouchableOpacity
                        style={[styles.todoCheckbox, task.completed && styles.todoCheckboxCompleted]}
                        onPress={() => handleTaskToggle(task.id)}
                      >
                        {task.completed && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                      <View style={styles.todoContent}>
                        <Text style={[styles.todoTitle, task.completed && styles.todoTitleCompleted]} numberOfLines={1}>
                          {task.text}
                        </Text>
                        <Text style={styles.todoSubtitle} numberOfLines={1}>
                          {task.projectName || 'Oak Ridge Residence'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  
                  {/* Show hardcoded items if no real tasks */}
                  {realTasks.filter(task => !task.completed).length === 0 && myStuffData[selectedMyStuffCategory].map((item) => (
                    <TouchableOpacity key={item.id} style={styles.todoItem}>
                      <View style={styles.todoCheckbox}>
                        <Text style={styles.todoCheckboxText}>
                          {item.type === 'checklist' ? '📋' : ''}
                        </Text>
                      </View>
                      <View style={styles.todoContent}>
                        <Text style={styles.todoTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.todoSubtitle} numberOfLines={1}>
                          {item.subtitle}
                        </Text>
                      </View>
                      {item.type === 'checklist' && (
                        <View style={styles.progressIndicator}>
                          <Text style={styles.progressText}>→</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {selectedMyStuffCategory === 'Photos' && (
                <View style={styles.photosGrid}>
                  {myStuffData[selectedMyStuffCategory].map((item) => (
                    <TouchableOpacity key={item.id} style={styles.photoGridItem}>
                      <View style={styles.photoPlaceholder} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {(selectedMyStuffCategory === 'Projects' || selectedMyStuffCategory === 'Documents' || selectedMyStuffCategory === 'Notes') && (
                <View style={styles.listContainer}>
                  {myStuffData[selectedMyStuffCategory].map((item) => (
                    <TouchableOpacity key={item.id} style={styles.listItem}>
                      <View style={styles.listIcon}>
                        <Text style={styles.listIconText}>
                          {item.type === 'project' ? '🏗️' : item.type === 'note' ? '📝' : '📄'}
                        </Text>
                      </View>
                      <View style={styles.listContent}>
                        <Text style={styles.listTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.listSubtitle} numberOfLines={1}>
                          {item.subtitle}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
          ) : null
        ))}

        {/* Extra padding for FAB */}
        <View style={styles.fabPadding} />
      </ScrollView>



      {/* Bottom Navigation Bar */}
      {!useFloatingActionBar && (
        <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={styles.bottomNavRow}>
          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
            <Home size={24} color="#64748B" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={handleMapPress}>
            <Map size={24} color="#64748B" />
            <Text style={styles.navText}>Map</Text>
          </TouchableOpacity>

          <View style={styles.centerSlot}>
            <TouchableOpacity onPress={handleCameraPress}>
              <View style={styles.cameraContainer}>
                <Camera size={28} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.navItem} onPress={handleNotificationsPress}>
            <Bell size={24} color="#64748B" />
            <Text style={styles.navText}>Inbox</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => {
            setShowMyStuffScreen(true);
            setHasNewMyStuffItems(false);
          }}>
            <FolderOpen size={24} color="#64748B" />
            <Text style={styles.navText}>My Stuff</Text>
          </TouchableOpacity>
        </View>
        </View>
      )}

      {/* Floating Action Bar - From ProjectDetailScreen */}
      {useFloatingActionBar && !showSalesRepSheet && (
        <View style={[styles.altActionBar, { bottom: Math.max(insets.bottom, 18) }]}>
          <View style={styles.altRow}>
            {/* Search - icon in gray circle, black icon */}
            <TouchableOpacity 
              onPress={handleSearchPress} 
              style={[styles.altCircleButton, { 
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: [{ translateY: -circleSize / 2 }],
                width: circleSize, 
                height: circleSize, 
                borderRadius: circleSize / 2 
              }]}
            >
              <Search size={iconSize} color="#000000" />
            </TouchableOpacity>

            {/* Camera (black container, white icon, wider) - perfectly centered */}
            <TouchableOpacity 
              onPress={handleCameraPress} 
              style={[styles.altCircleButton, { 
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: [{ translateX: -(circleSize * 1.8) / 2 }, { translateY: -circleSize / 2 }],
                width: circleSize * 1.8, 
                height: circleSize, 
                borderRadius: circleSize / 2, 
                backgroundColor: '#000000' 
              }]}
            >
              <Camera size={iconSize} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Magic AI - purple icon in gray circle */}
            <TouchableOpacity 
              onPress={handleMagicAIPress} 
              style={[styles.altCircleButton, { 
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: [{ translateY: -circleSize / 2 }],
                width: circleSize, 
                height: circleSize, 
                borderRadius: circleSize / 2 
              }]}
            >
              <CamAIIcon size={iconSize} glyphColor="#7C3AED" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={showProfileScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <ProfileScreen 
          onClose={() => setShowProfileScreen(false)}
          hideActivityFeed={hideActivityFeed}
          onToggleActivityFeed={setHideActivityFeed}
          hideActivityTitle={hideActivityTitle}
          onToggleActivityTitle={setHideActivityTitle}
          hideSearchBar={hideSearchBar}
          onToggleSearchBar={setHideSearchBar}
          showBottomSearchBar={false}
          onToggleBottomSearchBar={() => setShowFloatingActionBar(!showFloatingActionBar)}
          condensedMyStuff={condensedMyStuff}
          onToggleCondensedMyStuff={setCondensedMyStuff}
          disablePaymentButton={disablePaymentButton}
          onToggleDisablePaymentButton={setDisablePaymentButton}
          showFloatingActionLabels={false}
          onToggleShowFloatingActionLabels={() => {}}
          showWidgetsAtTop={showWidgetsAtTop}
          onToggleShowWidgetsAtTop={setShowWidgetsAtTop}
          showMyStuffWidgets={showMyStuffWidgets}
          onToggleShowMyStuffWidgets={setShowMyStuffWidgets}
          showHeaderIcons={showHeaderIcons}
          onToggleShowHeaderIcons={setShowHeaderIcons}
          hideProjectSection={hideProjectSection}
          onToggleHideProjectSection={setHideProjectSection}
          // useFloatingActionBar={useFloatingActionBar}
          // onToggleUseFloatingActionBar={setUseFloatingActionBar}
        />
      </Modal>

      <CreateModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <Modal
        visible={showProjectScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <ProjectDetailScreen 
          onClose={() => setShowProjectScreen(false)}
        />
      </Modal>

      <Modal
        visible={showMyStuffScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <MyStuffScreen onClose={() => setShowMyStuffScreen(false)} />
      </Modal>

      <AddWidgetBottomSheet
        visible={showAddWidgetModal}
        onClose={() => setShowAddWidgetModal(false)}
        onSelectWidget={handleSelectWidget}
      />

      {/* Map Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={{ paddingTop: Math.max(insets.top + 8, 24), paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#E5E7EB' }}>
            <TouchableOpacity onPress={() => setShowMapModal(false)} style={[styles.iconButton, { width: 44, height: 44 }]}>
              <ChevronRight size={20} color="#1E293B" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 18, color: '#1E293B' }}>Map</Text>
            <View style={{ width: 44 }} />
          </View>
          <WebView source={{ uri: 'https://www.openstreetmap.org' }} style={{ flex: 1 }} />
        </View>
      </Modal>

      <Modal
        visible={showSearchPage}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <SearchPageScreen onClose={() => setShowSearchPage(false)} />
      </Modal>

      <Modal
        visible={showPaymentsScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <PaymentsScreen onClose={() => setShowPaymentsScreen(false)} />
      </Modal>

      <Modal
        visible={showPortfolioScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <PortfolioScreen onClose={() => setShowPortfolioScreen(false)} />
      </Modal>

      <Modal
        visible={showOnboarding}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <OnboardingScreen onClose={() => setShowOnboarding(false)} />
      </Modal>

      {/* Organized Notes Screen - Full Screen Modal */}
      <Modal
        visible={showOrganizedNotes}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        {organizedNotesData && (
          <OrganizedNotesScreen
            onClose={handleCloseOrganizedNotes}
            content={organizedNotesData.content}
            photos={organizedNotesData.photos}
            tasks={organizedNotesData.tasks}
            promptSent={organizedNotesData.promptSent}
          />
        )}
      </Modal>

      {/* Camera Modal - Must be rendered BEFORE Audio Modal for proper stacking */}
      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <View style={{ flex: 1 }}>
          <CameraScreen 
            onClose={() => {
              setShowCamera(false);
            }} 
          />
        </View>
      </Modal>

      {/* Audio Recording Modal - Render AFTER Camera Modal so it appears on top */}
      <Modal
        visible={showAudioModal}
        animationType="none"
        transparent={true}
        presentationStyle="overFullScreen"
        statusBarTranslucent={true}
      >
        <AudioRecordingModal
          ref={audioModalRef}
          visible={showAudioModal}
          onClose={() => setShowAudioModal(false)}
          onCameraPressInFooter={() => setShowCamera(true)}
          onOpenOrganizedNotes={handleOpenOrganizedNotes}
          initialState="idle"
          initialSnapIndex={0}
          headerPlaceholder="Jot anything down..."
          isInCameraContext={showCamera}
        />
      </Modal>

      <MagicAIBottomSheet
        visible={showMagicAIBottomSheet}
        onClose={() => setShowMagicAIBottomSheet(false)}
        onWalkthroughNote={handleWalkthroughNote}
        onProgressRecap={handleProgressRecap}
        onMagicUploader={handleMagicUploader}
        onCreateProject={handleCreateProject}
      />

      <EditCardsBottomSheet
        visible={showEditCardsModal}
        onClose={() => setShowEditCardsModal(false)}
        cards={quickAccessCards}
        onUpdateCards={setQuickAccessCards}
      />

      <SalesRepBottomSheet
        visible={showSalesRepSheet}
        onClose={() => setShowSalesRepSheet(false)}
      />

      {/* User Profile Modal */}
      <Modal
        visible={showUserProfile}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        {selectedUser && (
          <UserProfileScreen 
            onClose={() => setShowUserProfile(false)}
            user={selectedUser}
          />
        )}
      </Modal>

      {/* Learn Things Modal */}
      <Modal
        visible={showLearnThings}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <LearnThingsScreen onClose={() => setShowLearnThings(false)} />
      </Modal>

      {/* Leaderboard Modal */}
      <Modal
        visible={showLeaderboard}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <LeaderboardScreen onClose={() => setShowLeaderboard(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom navigation bar
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: '#1E293B',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
  },
  editButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  seeAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
  },
  seeAllButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  quickAccessGrid: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  quickAccessRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  quickAccessIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAccessLogoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
  },
  quickAccessText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
    paddingLeft: 4,
  },
  quickAccessBadge: {
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 12,
    right: 12,
  },
  quickAccessBadgeCentered: {
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  quickAccessBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  salesRepBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  salesRepBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchBar: {
    marginTop: 4,
    marginBottom: 4,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
    flex: 1,
  },
  headerSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 44,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerSearchText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },

  fabPadding: {
    height: 80,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileMenuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: 22,
    height: 44,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  headerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    backgroundColor: '#F1F5F9',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  activitySection: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: '#1E293B',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  newProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 20,
  },
  newProjectButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  activityScroll: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  activityItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  activityItem: {
    alignItems: 'center',
    width: 110,
  },
  activityImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  activityImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
  },
  aiUpdateThumbnail: {
    width: 110,
    height: 110,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  timeBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  activityLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    width: 110,
  },
  activityUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 110,
    marginTop: 0,
  },
  activityAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  activityAvatarImage: {
    width: '100%',
    height: '100%',
  },
  activityNameContainer: {
    flex: 1,
  },
  activityFirstName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 15,
  },
  activityLastName: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 15,
  },
  projectsSection: {
    paddingTop: 36,
    paddingBottom: 24,
  },
  categoryScroll: {
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  categoryButtonActive: {
    backgroundColor: '#64748B',
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  projectScroll: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  projectCard: {
    marginRight: 16,
  },
  projectImage: {
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  projectBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  projectTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  projectInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  projectTextContent: {
    flex: 1,
  },
  projectTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  projectAddress: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#F1F5F9',
  },
  projectCameraButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  myStuffSection: {
    paddingTop: 36,
    paddingBottom: 24,
  },
  myStuffScroll: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  myStuffCard: {
    width: 200,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  myStuffIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  myStuffIconText: {
    fontSize: 18,
  },
  myStuffContent: {
    paddingHorizontal: 20,
  },
  todosContainer: {
    gap: 4,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  todoCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoCheckboxCompleted: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  todoCheckboxText: {
    fontSize: 16,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 2,
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  todoSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  progressIndicator: {
    marginLeft: 8,
  },
  progressText: {
    fontSize: 16,
    color: '#64748B',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoGridItem: {
    width: '23%',
    aspectRatio: 1,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listIconText: {
    fontSize: 18,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 2,
  },
  listSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  placeholder: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },


  condensedMyStuffSection: {
    paddingTop: 36,
    paddingBottom: 24,
  },
  widgetScrollContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  widgetCard: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 68,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginRight: 12,
    position: 'relative',
  },
  addWidgetCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    minHeight: 68,
    marginRight: 16,
  },
  // Card style matching ProjectDetail quickActionCardThird
  widgetCardThird: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  widgetIconOnly: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  widgetIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetPrimaryTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 2,
  },
  widgetSecondaryText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
  },


  widgetRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  widgetIcon: {
    fontSize: 20,
  },
  widgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  condensedMyStuffContent: {
    flex: 1,
  },
  condensedMyStuffTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1E293B',
    marginLeft: 6,
  },
  condensedMyStuffSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  addedWidgetContent: {
    flex: 1,
  },
  addedWidgetTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1E293B',
    marginLeft: 6,
  },
  addedWidgetSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  addMoreWidgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginTop: 12,
    gap: 6,
  },
  addMoreWidgetText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
  },
  addWidgetPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    gap: 8,
  },

  addWidgetPlaceholderText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#CBD5E1',
  },
  shortcutIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactFloatingButton: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: '#3A8DFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  myStuffBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myStuffBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  // New Floating Action Bar Styles (matching ProjectDetailScreen)
  altActionBar: {
    position: 'absolute',
    left: '16%',
    right: '16%',
    height: 88,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 0.5,
    shadowRadius: 60,
    elevation: 25,
    zIndex: 9999,
  },
  altRow: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  altSideGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  altLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  altCircleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  altPrimaryButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: '#155DFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  altPrimaryText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 14,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bottomNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
    width: 60,
  },
  navText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  centerSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  cameraContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 