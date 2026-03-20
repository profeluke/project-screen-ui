import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, useWindowDimensions, Animated, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Camera, MapPin, Users, Check, ChevronRight, ChevronLeft, Mail, Mic, FileText, Sparkles, ArrowRight, HardHat, Hammer, Wrench, Zap, Ruler, Briefcase, Search, Paintbrush, Home, Truck, Trees, Droplets, Wind, Flame, Shield, Construction, Building2, Warehouse, PaintBucket, Shovel, CircleDot, Scissors, Snowflake, Sun, Leaf, Grid3X3, Box, Columns, Fence, UserPlus, Phone, Send, ContactRound, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Contacts from 'expo-contacts';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';

interface OnboardingScreenProps {
  onClose: () => void;
}

interface ProjectData {
  id: string;
  name: string;
  address: string;
  photoCount: number;
  latitude: number;
  longitude: number;
  thumbnail: any;
}

// Dummy project data for the catch-up screen
const DUMMY_PROJECTS: ProjectData[] = [
  {
    id: '1',
    name: 'Oakridge Residence',
    address: '1234 Maple Ave, Beverly Hills, CA',
    photoCount: 47,
    latitude: 34.0736,
    longitude: -118.4004,
    thumbnail: require('../assets/images/project-family-home.jpg'),
  },
  {
    id: '2',
    name: 'Downtown Office Complex',
    address: '567 Main St, Los Angeles, CA',
    photoCount: 63,
    latitude: 34.0522,
    longitude: -118.2437,
    thumbnail: require('../assets/images/project-downtown-office.jpg'),
  },
  {
    id: '3',
    name: 'Sunset Villa Renovation',
    address: '890 Sunset Blvd, West Hollywood, CA',
    photoCount: 28,
    latitude: 34.0928,
    longitude: -118.3287,
    thumbnail: require('../assets/images/project-sunset-villa.jpg'),
  },
];

export default function OnboardingScreen({ onClose }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // Flow State
  const [onboardingFlow, setOnboardingFlow] = useState<'magic' | 'contextual' | 'valueFirst' | null>(null);
  
  // Value-First Flow State (optimized conversion flow)
  const [valueFirstStep, setValueFirstStep] = useState(0);
  const [vfHasLocationPermission, setVfHasLocationPermission] = useState(false);
  const [vfHasCameraPermission, setVfHasCameraPermission] = useState(false);
  const [vfCapturedPhoto, setVfCapturedPhoto] = useState(false);
  const [vfRecordedNote, setVfRecordedNote] = useState(false);
  const [vfSelectedTrades, setVfSelectedTrades] = useState<string[]>([]);
  const [vfPhoneNumber, setVfPhoneNumber] = useState('');
  const [vfCompanyName, setVfCompanyName] = useState('');
  const [vfCompanySize, setVfCompanySize] = useState<string | null>(null);
  const [vfSelectedRole, setVfSelectedRole] = useState<string | null>(null);
  const [vfInvitedMembers, setVfInvitedMembers] = useState<string[]>([]);
  const [vfIsRecording, setVfIsRecording] = useState(false);
  const [vfRecordingTimer, setVfRecordingTimer] = useState(0);
  const [vfShowAiProcessing, setVfShowAiProcessing] = useState(false);
  
  // Magic Flow State
  const [currentStep, setCurrentStep] = useState(0);
  const [syncedProjects, setSyncedProjects] = useState<Set<string>>(new Set());
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showPermissionInstruction, setShowPermissionInstruction] = useState(false);
  
  // Contextual Flow State
  const [contextualStep, setContextualStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [tradeSearchQuery, setTradeSearchQuery] = useState('');
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [integrationSearchQuery, setIntegrationSearchQuery] = useState('');
  const [integrationTradeFilter, setIntegrationTradeFilter] = useState<string | null>(null);
  const [showAllIntegrations, setShowAllIntegrations] = useState(false);
  const [companyName, setCompanyName] = useState('');
  
  // Trade-specific integrations mapping
  const tradeIntegrations: Record<string, string[]> = {
    'roofing': ['AccuLynx', 'JobNimbus', 'Roofr', 'HOVER', 'One Click Contractor'],
    'gc': ['Procore', 'Builder Prime', 'Contractor Foreman', 'JobTread', 'QuickBooks Online'],
    'hvac': ['ServiceTitan', 'Housecall Pro', 'Jobber', 'FieldPulse', 'QuickBooks Online'],
    'plumbing': ['ServiceTitan', 'Housecall Pro', 'Jobber', 'FieldPulse', 'QuickBooks Online'],
    'electrical': ['ServiceTitan', 'Housecall Pro', 'Jobber', 'FieldPulse', 'QuickBooks Online'],
    'landscaping': ['Jobber', 'Housecall Pro', 'FieldPulse', 'QuickBooks Online', 'Google Calendar'],
    'carpentry': ['JobTread', 'Contractor Foreman', 'monday.com', 'QuickBooks Online', 'Google Drive'],
    'framing': ['Procore', 'Contractor Foreman', 'Builder Prime', 'SharePoint', 'QuickBooks Online'],
    'drywall': ['Procore', 'Contractor Foreman', 'monday.com', 'Google Drive', 'QuickBooks Online'],
    'concrete': ['Procore', 'Contractor Foreman', 'Knowify', 'SharePoint', 'QuickBooks Online'],
    'masonry': ['Contractor Foreman', 'JobTread', 'monday.com', 'Google Drive', 'QuickBooks Online'],
    'siding': ['JobNimbus', 'Builder Prime', 'Leap', 'QuickBooks Online', 'NiceJob'],
    'insulation': ['Jobber', 'Housecall Pro', 'FieldPulse', 'QuickBooks Online', 'Google Drive'],
    'demolition': ['Procore', 'Contractor Foreman', 'monday.com', 'SharePoint', 'QuickBooks Online'],
    'painting': ['Estimate Rocket', 'Jobber', 'Housecall Pro', 'QuickBooks Online', 'NiceJob'],
    'flooring': ['JobTread', 'Contractor Foreman', 'monday.com', 'QuickBooks Online', 'Google Drive'],
    'tile': ['JobTread', 'Contractor Foreman', 'monday.com', 'QuickBooks Online', 'Google Drive'],
    'cabinetry': ['JobTread', 'Contractor Foreman', 'monday.com', 'SharePoint', 'QuickBooks Online'],
    'countertops': ['JobTread', 'Contractor Foreman', 'monday.com', 'QuickBooks Online', 'Google Drive'],
    'trim': ['Contractor Foreman', 'monday.com', 'JobTread', 'Google Drive', 'QuickBooks Online'],
    'fire-protection': ['ServiceTitan', 'FieldPulse', 'QuickBooks Online', 'Google Calendar', 'SharePoint'],
    'solar': ['ServiceTitan', 'Salesforce', 'HubSpot', 'QuickBooks Online', 'Google Drive'],
    'security': ['ServiceTitan', 'HubSpot', 'monday.com', 'QuickBooks Online', 'Google Calendar'],
    'low-voltage': ['ServiceTitan', 'Housecall Pro', 'HubSpot', 'QuickBooks Online', 'Google Drive'],
    'windows-doors': ['Builder Prime', 'JobNimbus', 'Leap', 'QuickBooks Online', 'NiceJob'],
    'gutters': ['JobNimbus', 'Jobber', 'Housecall Pro', 'QuickBooks Online', 'NiceJob'],
    'fencing': ['Jobber', 'Housecall Pro', 'FieldPulse', 'QuickBooks Online', 'NiceJob'],
    'decks': ['JobTread', 'Contractor Foreman', 'monday.com', 'QuickBooks Online', 'Google Drive'],
    'pools': ['ServiceTitan', 'Housecall Pro', 'Jobber', 'QuickBooks Online', 'Google Calendar'],
    'irrigation': ['Jobber', 'Housecall Pro', 'FieldPulse', 'QuickBooks Online', 'Google Calendar'],
    'hardscaping': ['JobTread', 'Contractor Foreman', 'monday.com', 'QuickBooks Online', 'Google Drive'],
    'lawn-care': ['Jobber', 'Housecall Pro', 'Workiz', 'QuickBooks Online', 'Google Calendar'],
    'tree-service': ['Jobber', 'Housecall Pro', 'FieldPulse', 'QuickBooks Online', 'Google Calendar'],
    'snow-removal': ['Jobber', 'Housecall Pro', 'Workiz', 'QuickBooks Online', 'Google Calendar'],
    'restoration': ['Xcelerate', 'iRestore', 'Dash (Cotality)', 'IssueID', 'QuickBooks Online'],
    'remodeling': ['JobTread', 'Contractor Foreman', 'monday.com', 'QuickBooks Online', 'Google Drive'],
    'new-construction': ['Procore', 'Builder Prime', 'Contractor Foreman', 'SharePoint', 'QuickBooks Online'],
    'commercial': ['Procore', 'Salesforce', 'monday.com', 'SharePoint', 'QuickBooks Online'],
    'industrial': ['Procore', 'Salesforce', 'SharePoint', 'monday.com', 'QuickBooks Online'],
    'property-maintenance': ['Jobber', 'Housecall Pro', 'ServiceTitan', 'QuickBooks Online', 'NiceJob'],
    'handyman': ['Jobber', 'Housecall Pro', 'Workiz', 'QuickBooks Online', 'NiceJob'],
    'home-inspection': ['Spectora', 'Google Drive', 'Dropbox', 'monday.com', 'HubSpot'],
    'pest-control': ['FieldPulse', 'Workiz', 'HubSpot', 'QuickBooks Online', 'NiceJob'],
    'cleaning': ['Jobber', 'Housecall Pro', 'Workiz', 'QuickBooks Online', 'NiceJob'],
    'moving': ['Workiz', 'HubSpot', 'Google Calendar', 'QuickBooks Online', 'Google Drive'],
    'other': ['Zapier', 'CompanyCam API', 'QuickBooks Online', 'Google Drive', 'HubSpot'],
  };
  const [companySize, setCompanySize] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [invitedMembers, setInvitedMembers] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [showAiProcessing, setShowAiProcessing] = useState(false);
  
  // Animations
  const cardAnimations = useRef(
    DUMMY_PROJECTS.map(() => ({
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;
  
  const leftArrowAnim = useRef(new Animated.Value(0)).current;
  const rightArrowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // --- Effects ---
  
  // Value-First recording timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (vfIsRecording) {
      interval = setInterval(() => {
        setVfRecordingTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [vfIsRecording]);

  // --- Shared Handlers ---
  
  const handleFinishOnboarding = () => {
    onClose();
  };

  // --- Magic Flow Handlers ---

  const handleGoogleLogin = () => {
    setCurrentStep(1);
  };

  const handleAllowPhotoAccess = () => {
    setShowPermissionInstruction(true);
    startArrowAnimations();
  };

  const startArrowAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(leftArrowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(leftArrowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(rightArrowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(rightArrowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };
  
  const handleContinueFromInstruction = () => {
    setShowPermissionInstruction(false);
    setCurrentStep(2);
  };

  const animateCardOut = (index: number, isSynced: boolean) => {
    const direction = isSynced ? screenWidth : -screenWidth;
    Animated.parallel([
      Animated.timing(cardAnimations[index].translateX, {
        toValue: direction,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnimations[index].opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentCardIndex(prev => prev + 1);
    });
  };

  const handleSyncProject = (projectId: string) => {
    const index = DUMMY_PROJECTS.findIndex(p => p.id === projectId);
    setSyncedProjects(prev => new Set(prev).add(projectId));
    animateCardOut(index, true);
  };

  const handleSkipProject = (projectId: string) => {
    const index = DUMMY_PROJECTS.findIndex(p => p.id === projectId);
    animateCardOut(index, false);
  };

  const handleContinueToMap = () => {
    setCurrentStep(3);
  };

  const handleInviteCoworkers = () => {
    Alert.alert('Invite Sent', 'Your co-workers will receive an invitation.');
  };

  // --- Contextual Flow Handlers ---
  
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTimer(0);
    const interval = setInterval(() => {
      setRecordingTimer(prev => prev + 1);
    }, 1000);
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
    
    // Store interval to clear later if needed (simplified for this example)
    return () => clearInterval(interval);
  };

  const stopRecording = () => {
    setIsRecording(false);
    pulseAnim.stopAnimation();
    setShowAiProcessing(true);
    setTimeout(() => {
      setShowAiProcessing(false);
      setContextualStep(17); // Go to AI Result
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- Renderers ---

  const renderBackButton = (customOnPress?: () => void) => (
    <TouchableOpacity 
      style={styles.backButton} 
      onPress={customOnPress || (() => setContextualStep(prev => Math.max(0, prev - 1)))}
    >
      <ChevronLeft size={24} color="#1E293B" />
    </TouchableOpacity>
  );

  const renderFlowSelection = () => (
    <View style={styles.contentContainer}>
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>CompanyCam</Text>
        </View>
      </View>

      <Text style={styles.welcomeTitle}>Choose your path</Text>
      <Text style={styles.welcomeSubtitle}>How would you like to start?</Text>

      <View style={[styles.buttonContainer, { marginTop: 32, gap: 16 }]}>
        <TouchableOpacity 
          style={styles.googleButton}
          onPress={() => setOnboardingFlow('magic')}
        >
          <View style={styles.iconCircle}>
            <Sparkles size={20} color="#3B82F6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.flowButtonTitle}>Magic Uploader</Text>
            <Text style={styles.flowButtonSubtitle}>Scan my library for projects</Text>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.googleButton}
          onPress={() => setOnboardingFlow('contextual')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
            <MapPin size={20} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.flowButtonTitle}>Contextual Onboarding</Text>
            <Text style={styles.flowButtonSubtitle}>Learn as I work</Text>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.googleButton, { borderColor: '#7C3AED', borderWidth: 2 }]}
          onPress={() => setOnboardingFlow('valueFirst')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
            <Zap size={20} color="#7C3AED" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.flowButtonTitle}>Value-First Flow</Text>
            <Text style={styles.flowButtonSubtitle}>See magic, then set up</Text>
          </View>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // --- Existing Magic Flow Screens ---
  
  const renderLoginScreen = () => (
    <View style={styles.contentContainer}>
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>CompanyCam</Text>
        </View>
      </View>

      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Welcome</Text>
        <Text style={styles.welcomeSubtitle}>
          Sign in to start documenting your projects
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.googleButton}
          onPress={handleGoogleLogin}
        >
          <View style={styles.googleIconContainer}>
            <Text style={styles.googleIcon}>G</Text>
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={styles.emailButton}
          onPress={() => {}}
        >
          <Mail size={20} color="#1E293B" style={styles.emailIcon} />
          <Text style={styles.emailButtonText}>Continue with Email</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms and Privacy Policy
        </Text>
      </View>
    </View>
  );

  // ... (Re-using existing render functions for Magic flow: PermissionInstruction, PermissionPrimer, CatchUp, PortfolioMap)
  // I will keep them defined below or inline them if they were small, but they are large.
  // For brevity in this specific "write" call, I'll assume the original file structure is preserved where possible 
  // but since I'm rewriting the file I must include them.

  const renderPermissionInstruction = () => {
    const leftArrowTranslate = leftArrowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 10],
    });
    const rightArrowTranslate = rightArrowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -10],
    });
    
    return (
      <View style={styles.permissionInstructionContainer}>
        <View style={styles.permissionInstructionContent}>
          <Text style={styles.permissionInstructionTitle}>Tap "Allow Access to All Photos"</Text>
          <Text style={styles.permissionInstructionSubtitle}>
            This lets us find all your project photos and build your portfolio
          </Text>
          <View style={styles.permissionImageContainer}>
            <Animated.View style={[styles.arrowContainer, styles.leftArrow, { transform: [{ translateX: leftArrowTranslate }] }]}>
              <ChevronRight size={32} color="#3B82F6" />
            </Animated.View>
            <TouchableOpacity style={styles.permissionDialogImage} onPress={handleContinueFromInstruction} activeOpacity={0.9}>
              <Image source={require('../assets/images/photo access.png')} style={styles.permissionImage} resizeMode="contain" />
            </TouchableOpacity>
            <Animated.View style={[styles.arrowContainer, styles.rightArrow, { transform: [{ translateX: rightArrowTranslate }] }]}>
              <ChevronRight size={32} color="#3B82F6" style={{ transform: [{ rotate: '180deg' }] }} />
            </Animated.View>
          </View>
        </View>
        <View style={styles.bottomButtonContainer}>
          <Text style={styles.tapInstructionText}>Tap "Allow Access to All Photos" when the dialog appears</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinueFromInstruction}>
            <Text style={styles.primaryButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPermissionPrimer = () => (
    <View style={styles.contentContainer}>
      <View style={styles.primerContent}>
        <View style={styles.primerIconContainer}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.primerIconGradient}>
            <Camera size={48} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <Text style={styles.primerTitle}>Build Your Portfolio Instantly</Text>
        <Text style={styles.primerSubtitle}>We'll analyze your camera roll to understand the kind of work you do, find your project photos, and create a stunning portfolio—automatically.</Text>
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}><Text style={styles.benefitEmoji}>🎯</Text></View>
            <View style={styles.benefitText}><Text style={styles.benefitTitle}>Smart Organization</Text><Text style={styles.benefitDescription}>We group photos by location to create projects automatically</Text></View>
          </View>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}><Text style={styles.benefitEmoji}>✨</Text></View>
            <View style={styles.benefitText}><Text style={styles.benefitTitle}>Beautiful Portfolio</Text><Text style={styles.benefitDescription}>Showcase your best work with a professional portfolio</Text></View>
          </View>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}><Text style={styles.benefitEmoji}>🔒</Text></View>
            <View style={styles.benefitText}><Text style={styles.benefitTitle}>You're in Control</Text><Text style={styles.benefitDescription}>You decide what gets added—we never touch personal photos</Text></View>
          </View>
        </View>
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>When prompted, select <Text style={styles.instructionBold}>"Allow Access to All Photos"</Text> so we can find all your project photos and build your portfolio.</Text>
        </View>
      </View>
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleAllowPhotoAccess}>
          <Text style={styles.primaryButtonText}>Build My Portfolio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCatchUpScreen = () => {
    const cardHeight = screenHeight * 0.65;
    const cardWidth = screenWidth * 0.85;
    const allCardsHandled = currentCardIndex >= DUMMY_PROJECTS.length;
    const remainingProjects = DUMMY_PROJECTS.length - currentCardIndex;
    const stackRotations = [0, -3, 2, -4, 3, -2, 4];
    
    return (
      <View style={styles.catchUpContainer}>
        <View style={styles.catchUpHeader}>
          <Text style={styles.catchUpTitle}>{!allCardsHandled ? `We found ${remainingProjects} ${remainingProjects === 1 ? 'project' : 'projects'}` : 'All done!'}</Text>
          <Text style={styles.catchUpSubtitle}>Based on photo locations, we've organized photos into projects. Review and sync the ones you want.</Text>
        </View>
        <View style={styles.cardStackContainer}>
          {DUMMY_PROJECTS.map((project, index) => {
            if (index < currentCardIndex) return null;
            const positionInStack = index - currentCardIndex;
            if (positionInStack > 2) return null;
            const scale = 1 - (positionInStack * 0.04);
            const translateY = positionInStack * -12;
            const zIndex = DUMMY_PROJECTS.length - index;
            const rotateZ = `${stackRotations[positionInStack % stackRotations.length]}deg`;
            
            return (
              <Animated.View key={project.id} style={[styles.projectCard, styles.stackedCard, { width: cardWidth, height: cardHeight, backgroundColor: ['#000000', '#374151', '#6B7280'][positionInStack] || '#6B7280', zIndex }, { transform: [{ translateX: cardAnimations[index].translateX }, { scale }, { translateY }, { rotate: rotateZ }], opacity: cardAnimations[index].opacity }]}>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Image source={project.thumbnail} style={{width: '100%', height: '100%', position: 'absolute', opacity: 0.5}} resizeMode="cover" /><Camera size={48} color="#FFF" opacity={0.5} /></View>
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.cardInfoOverlay}>
                  <View style={styles.projectCardContent}>
                    <Text style={styles.projectCardName}>{project.name}</Text>
                    <Text style={styles.projectCardAddress}>{project.address}</Text>
                    {positionInStack === 0 && (
                      <View style={styles.projectCardActions}>
                        <TouchableOpacity style={styles.skipButton} onPress={() => handleSkipProject(project.id)}><Text style={styles.skipButtonText}>Skip</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.syncButton} onPress={() => handleSyncProject(project.id)}><Text style={styles.syncButtonText}>Sync Project</Text></TouchableOpacity>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </Animated.View>
            );
          })}
        </View>
        {(syncedProjects.size > 0 && allCardsHandled) && (
          <View style={[styles.bottomButtonContainer, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleContinueToMap}><Text style={styles.primaryButtonText}>Continue ({syncedProjects.size} projects)</Text></TouchableOpacity>
          </View>
        )}
        {(syncedProjects.size === 0 && !allCardsHandled && currentCardIndex > 0) && (
          <View style={[styles.bottomButtonContainer, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleContinueToMap}><Text style={styles.secondaryButtonText}>Skip All</Text></TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderPortfolioMapScreen = () => (
    <View style={styles.contentContainer}>
      <View style={styles.mapContainer}>
        <Image source={require('../assets/images/mapwithpic.png')} style={styles.mapImage} resizeMode="cover" />
        <View style={styles.mapOverlay}>
          <View style={styles.mapOverlayContent}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.successIconGradient}><Check size={40} color="#FFFFFF" /></LinearGradient>
            <Text style={styles.mapOverlayTitle}>Your Portfolio is Ready!</Text>
            <Text style={styles.mapOverlaySubtitle}>{syncedProjects.size} projects added to your portfolio</Text>
          </View>
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleFinishOnboarding}><Text style={styles.primaryButtonText}>Start Using CompanyCam</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  // --- Contextual Flow Renderers ---

  const renderContextualWelcome = () => (
    <View style={styles.onboardingWelcomeContainer}>
      <View style={styles.screenHeader}>
        {renderBackButton(() => setOnboardingFlow(null))}
      </View>
      
      <View style={styles.welcomeContent}>
        <View style={styles.welcomeLogoSection}>
          <Image 
            source={require('../assets/images/cc-logo.png')} 
            style={styles.welcomeAppLogo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.welcomeTextSection}>
          <Text style={styles.welcomeHeadline}>Do good work.{'\n'}Capture it.{'\n'}Grow your business.</Text>
          <Text style={styles.welcomeTagline}>The #1 most used app for contractors</Text>
        </View>
      </View>
      
      <View style={styles.welcomeAuthSection}>
        <TouchableOpacity 
          style={styles.googleSignInButton}
          onPress={() => setContextualStep(2)}
        >
          <View style={styles.googleLogoContainer}>
            <Text style={styles.googleLogoText}>G</Text>
          </View>
          <Text style={styles.googleSignInText}>Continue with Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.emailSignInButton}
          onPress={() => setContextualStep(2)}
        >
          <Mail size={20} color="#1E293B" />
          <Text style={styles.emailSignInText}>Continue with Email</Text>
        </TouchableOpacity>
        
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );

  const renderCustomSetupIntro = () => (
    <View style={styles.contentContainer}>
      <View style={styles.screenHeader}>
        {renderBackButton()}
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={[styles.welcomeTitle, { marginBottom: 32 }]}>60-second account setup</Text>
        
        <View style={{ width: '100%', gap: 16, marginBottom: 40 }}>
          <View style={[styles.setupBenefitRow, { alignItems: 'center' }]}>
            <View style={[styles.setupBenefitIcon, { backgroundColor: '#ECFDF5' }]}>
              <Check size={20} color="#10B981" />
            </View>
            <Text style={styles.setupBenefitTitle}>Personalized for your trade</Text>
          </View>
          
          <View style={[styles.setupBenefitRow, { alignItems: 'center' }]}>
            <View style={[styles.setupBenefitIcon, { backgroundColor: '#FEF3C7' }]}>
              <Zap size={20} color="#F59E0B" />
            </View>
            <Text style={styles.setupBenefitTitle}>Ready to go in minutes</Text>
          </View>
          
          <View style={[styles.setupBenefitRow, { alignItems: 'center' }]}>
            <View style={[styles.setupBenefitIcon, { backgroundColor: '#F3E8FF' }]}>
              <Users size={20} color="#7C3AED" />
            </View>
            <Text style={styles.setupBenefitTitle}>Built for your team</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.primaryButton} onPress={() => setContextualStep(2)}>
          <Text style={styles.primaryButtonText}>Let's Go</Text>
        </TouchableOpacity>
        <Text style={[styles.tinyText, { marginTop: 16 }]}>Takes about 60 seconds</Text>
      </View>
    </View>
  );

  const renderNamePhone = () => {
    const isValid = phoneNumber.trim().length >= 10;
    
    return (
      <KeyboardAvoidingView 
        style={styles.contentContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.screenHeader}>
          {renderBackButton()}
        </View>
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingTop: 20, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.welcomeSubtitle, { textAlign: 'left', marginBottom: 8, fontSize: 13, color: '#3B82F6' }]}>
            60-second setup • Personalized for your trade
          </Text>
          <Text style={[styles.welcomeTitle, { textAlign: 'left', marginBottom: 12 }]}>
            What's your phone number?
          </Text>
          <Text style={[styles.welcomeSubtitle, { textAlign: 'left', marginBottom: 32 }]}>
            We'll send you easy login links—no passwords to remember.
          </Text>
          
          <View>
            <Text style={styles.inputLabel}>Phone number</Text>
            <TextInput
              style={styles.onboardingInput}
              placeholder="(555) 123-4567"
              placeholderTextColor="#94A3B8"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoComplete="tel"
              autoFocus={true}
            />
          </View>
        </ScrollView>
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={[styles.primaryButton, !isValid && styles.primaryButtonDisabled]} 
            onPress={() => setContextualStep(3)}
            disabled={!isValid}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };

  const renderTradeSelector = () => {
    const trades = [
      // Popular trades
      { id: 'roofing', label: 'Roofing', icon: <HardHat size={24} color="#3B82F6" /> },
      { id: 'gc', label: 'General Contractor', icon: <Briefcase size={24} color="#F59E0B" /> },
      { id: 'hvac', label: 'HVAC', icon: <Wind size={24} color="#EF4444" /> },
      { id: 'plumbing', label: 'Plumbing', icon: <Droplets size={24} color="#6366F1" /> },
      { id: 'electrical', label: 'Electrical', icon: <Zap size={24} color="#EAB308" /> },
      { id: 'landscaping', label: 'Landscaping', icon: <Trees size={24} color="#10B981" /> },
      
      // Construction trades
      { id: 'carpentry', label: 'Carpentry', icon: <Hammer size={24} color="#92400E" /> },
      { id: 'framing', label: 'Framing', icon: <Grid3X3 size={24} color="#78716C" /> },
      { id: 'drywall', label: 'Drywall', icon: <Columns size={24} color="#A3A3A3" /> },
      { id: 'concrete', label: 'Concrete', icon: <Box size={24} color="#57534E" /> },
      { id: 'masonry', label: 'Masonry', icon: <Building2 size={24} color="#DC2626" /> },
      { id: 'siding', label: 'Siding', icon: <Home size={24} color="#0EA5E9" /> },
      { id: 'insulation', label: 'Insulation', icon: <Shield size={24} color="#F472B6" /> },
      { id: 'demolition', label: 'Demolition', icon: <Construction size={24} color="#1E293B" /> },
      
      // Finishing trades
      { id: 'painting', label: 'Painting', icon: <Paintbrush size={24} color="#A855F7" /> },
      { id: 'flooring', label: 'Flooring', icon: <CircleDot size={24} color="#CA8A04" /> },
      { id: 'tile', label: 'Tile & Stone', icon: <Grid3X3 size={24} color="#0D9488" /> },
      { id: 'cabinetry', label: 'Cabinetry', icon: <Warehouse size={24} color="#B45309" /> },
      { id: 'countertops', label: 'Countertops', icon: <Ruler size={24} color="#4338CA" /> },
      { id: 'trim', label: 'Trim & Molding', icon: <Scissors size={24} color="#7C3AED" /> },
      
      // Systems & utilities
      { id: 'fire-protection', label: 'Fire Protection', icon: <Flame size={24} color="#DC2626" /> },
      { id: 'solar', label: 'Solar', icon: <Sun size={24} color="#FACC15" /> },
      { id: 'security', label: 'Security Systems', icon: <Shield size={24} color="#1E40AF" /> },
      { id: 'low-voltage', label: 'Low Voltage', icon: <Zap size={24} color="#06B6D4" /> },
      
      // Exterior trades
      { id: 'windows-doors', label: 'Windows & Doors', icon: <Home size={24} color="#0284C7" /> },
      { id: 'gutters', label: 'Gutters', icon: <Droplets size={24} color="#475569" /> },
      { id: 'fencing', label: 'Fencing', icon: <Fence size={24} color="#65A30D" /> },
      { id: 'decks', label: 'Decks & Patios', icon: <Home size={24} color="#D97706" /> },
      { id: 'pools', label: 'Pools & Spas', icon: <Droplets size={24} color="#0EA5E9" /> },
      { id: 'irrigation', label: 'Irrigation', icon: <Droplets size={24} color="#16A34A" /> },
      { id: 'hardscaping', label: 'Hardscaping', icon: <Shovel size={24} color="#78716C" /> },
      { id: 'lawn-care', label: 'Lawn Care', icon: <Leaf size={24} color="#22C55E" /> },
      { id: 'tree-service', label: 'Tree Service', icon: <Trees size={24} color="#15803D" /> },
      { id: 'snow-removal', label: 'Snow Removal', icon: <Snowflake size={24} color="#38BDF8" /> },
      
      // Specialty trades
      { id: 'restoration', label: 'Restoration', icon: <Wrench size={24} color="#9333EA" /> },
      { id: 'remodeling', label: 'Remodeling', icon: <Home size={24} color="#EA580C" /> },
      { id: 'new-construction', label: 'New Construction', icon: <Building2 size={24} color="#2563EB" /> },
      { id: 'commercial', label: 'Commercial', icon: <Building2 size={24} color="#4F46E5" /> },
      { id: 'industrial', label: 'Industrial', icon: <Warehouse size={24} color="#64748B" /> },
      { id: 'property-maintenance', label: 'Property Maintenance', icon: <Wrench size={24} color="#0891B2" /> },
      { id: 'handyman', label: 'Handyman', icon: <Hammer size={24} color="#F97316" /> },
      { id: 'home-inspection', label: 'Home Inspection', icon: <Search size={24} color="#6366F1" /> },
      { id: 'pest-control', label: 'Pest Control', icon: <Shield size={24} color="#84CC16" /> },
      { id: 'cleaning', label: 'Cleaning Services', icon: <Droplets size={24} color="#14B8A6" /> },
      { id: 'moving', label: 'Moving', icon: <Truck size={24} color="#F59E0B" /> },
      
      // Other
      { id: 'other', label: 'Other', icon: <Users size={24} color="#64748B" /> },
    ];

    const filteredTrades = trades.filter(trade => 
      trade.label.toLowerCase().includes(tradeSearchQuery.toLowerCase())
    );

    return (
      <KeyboardAvoidingView 
        style={[styles.container, { paddingHorizontal: 20 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.screenHeader}>
          {renderBackButton()}
        </View>
        <View style={{ paddingBottom: 12 }}>
          <Text style={styles.sectionTitle}>What trades do you do?</Text>
          <Text style={styles.sectionSubtitle}>This helps us tailor the app to your work.</Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.tradeSearchContainer}>
          <Search size={20} color="#94A3B8" />
          <TextInput
            style={styles.tradeSearchInput}
            placeholder="Search trades..."
            placeholderTextColor="#94A3B8"
            value={tradeSearchQuery}
            onChangeText={setTradeSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {tradeSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setTradeSearchQuery('')}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 12, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
          {filteredTrades.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No trades found for "{tradeSearchQuery}"</Text>
              <TouchableOpacity
                style={[styles.tradeCard, { marginTop: 16 }, selectedTrades.includes('other') && styles.tradeCardSelected]}
                onPress={() => {
                  setSelectedTrades(prev => 
                    prev.includes('other') 
                      ? prev.filter(t => t !== 'other')
                      : [...prev, 'other']
                  );
                }}
              >
                <View style={styles.tradeIconContainer}><Users size={24} color="#64748B" /></View>
                <Text style={[styles.tradeLabel, selectedTrades.includes('other') && styles.tradeLabelSelected]}>Other</Text>
                {selectedTrades.includes('other') && <Check size={20} color="#3B82F6" />}
              </TouchableOpacity>
            </View>
          ) : (
            filteredTrades.map(trade => {
              const isSelected = selectedTrades.includes(trade.id);
              return (
                <TouchableOpacity
                  key={trade.id}
                  style={[styles.tradeCard, isSelected && styles.tradeCardSelected]}
                  onPress={() => {
                    setSelectedTrades(prev => 
                      prev.includes(trade.id) 
                        ? prev.filter(t => t !== trade.id)
                        : [...prev, trade.id]
                    );
                  }}
                >
                  <View style={styles.tradeIconContainer}>{trade.icon}</View>
                  <Text style={[styles.tradeLabel, isSelected && styles.tradeLabelSelected]}>{trade.label}</Text>
                  {isSelected && <Check size={20} color="#3B82F6" />}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
        
        {/* Continue Button */}
        {selectedTrades.length > 0 && (
          <View style={styles.floatingButtonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => setContextualStep(5)}
            >
              <Text style={styles.primaryButtonText}>
                Continue{selectedTrades.length > 1 ? ` (${selectedTrades.length} selected)` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    );
  };

  const getTradeLabel = () => {
    const tradeLabels: Record<string, string> = {
      'roofing': 'roofing',
      'gc': 'contracting',
      'hvac': 'HVAC',
      'plumbing': 'plumbing',
      'electrical': 'electrical',
      'landscaping': 'landscaping',
      'carpentry': 'carpentry',
      'framing': 'framing',
      'drywall': 'drywall',
      'concrete': 'concrete',
      'masonry': 'masonry',
      'siding': 'siding',
      'insulation': 'insulation',
      'demolition': 'demolition',
      'painting': 'painting',
      'flooring': 'flooring',
      'tile': 'tile',
      'cabinetry': 'cabinetry',
      'countertops': 'countertop',
      'trim': 'trim',
      'fire-protection': 'fire protection',
      'solar': 'solar',
      'security': 'security',
      'low-voltage': 'low voltage',
      'windows-doors': 'window & door',
      'gutters': 'gutter',
      'fencing': 'fencing',
      'decks': 'deck',
      'pools': 'pool',
      'irrigation': 'irrigation',
      'hardscaping': 'hardscaping',
      'lawn-care': 'lawn care',
      'tree-service': 'tree service',
      'snow-removal': 'snow removal',
      'restoration': 'restoration',
      'remodeling': 'remodeling',
      'new-construction': 'construction',
      'commercial': 'commercial',
      'industrial': 'industrial',
      'property-maintenance': 'property maintenance',
      'handyman': 'handyman',
      'home-inspection': 'home inspection',
      'pest-control': 'pest control',
      'cleaning': 'cleaning',
      'moving': 'moving',
      'other': '',
    };
    
    if (selectedTrades.length === 0) return '';
    if (selectedTrades.length === 1) {
      return tradeLabels[selectedTrades[0]] || '';
    }
    // For multiple trades, just return empty to use generic question
    return '';
  };

  const renderTradeIntegrations = () => {
    // Get integrations for the first selected trade, with fallback to 'other'
    const tradeId = selectedTrades[0] || 'other';
    const integrations = tradeIntegrations[tradeId] || tradeIntegrations['other'];

    // Integrations with OAuth available (can connect instantly)
    const oauthIntegrations = new Set([
      'QuickBooks Online', 'Google Calendar', 'Google Drive', 'Dropbox',
      'Salesforce', 'HubSpot', 'monday.com', 'Zapier', 'SharePoint',
      'Jobber', 'Housecall Pro', 'ServiceTitan', 'Procore'
    ]);

    const hasOAuth = (name: string) => oauthIntegrations.has(name);
    const isConnected = (name: string) => selectedIntegrations.includes(name);

    const handleConnect = (name: string) => {
      // In reality, this would open OAuth web view
      // For now, just mark as connected
      if (!selectedIntegrations.includes(name)) {
        setSelectedIntegrations(prev => [...prev, name]);
      }
    };

    const handleLearnMore = (name: string) => {
      // In reality, this would open setup guide
      // For now, just mark as "pending"
      Alert.alert(
        `Connect ${name}`,
        `We'll send setup instructions to your email after you finish onboarding.`,
        [{ text: 'Got it', onPress: () => {
          if (!selectedIntegrations.includes(name)) {
            setSelectedIntegrations(prev => [...prev, name]);
          }
        }}]
      );
    };

    const connectedCount = selectedIntegrations.length;

    // Trade filter options for "All Integrations" view
    const tradeFilters = [
      { id: null, label: 'All' },
      { id: 'roofing', label: 'Roofing' },
      { id: 'gc', label: 'General' },
      { id: 'hvac', label: 'HVAC' },
      { id: 'plumbing', label: 'Plumbing' },
      { id: 'electrical', label: 'Electrical' },
      { id: 'landscaping', label: 'Landscaping' },
      { id: 'painting', label: 'Painting' },
      { id: 'restoration', label: 'Restoration' },
    ];

    // Get all unique integrations across all trades
    const getAllIntegrations = () => {
      const allSet = new Set<string>();
      Object.values(tradeIntegrations).forEach(arr => arr.forEach(i => allSet.add(i)));
      return Array.from(allSet).sort();
    };

    // Filter integrations based on search and trade filter
    const getFilteredIntegrations = () => {
      let result: string[];
      
      if (integrationTradeFilter) {
        result = tradeIntegrations[integrationTradeFilter] || [];
      } else {
        result = getAllIntegrations();
      }
      
      if (integrationSearchQuery.trim()) {
        const query = integrationSearchQuery.toLowerCase();
        result = result.filter(i => i.toLowerCase().includes(query));
      }
      
      return result;
    };

    // All Integrations View
    if (showAllIntegrations) {
      const filteredIntegrations = getFilteredIntegrations();
      
      return (
        <View style={styles.contentContainer}>
          <View style={styles.screenHeader}>
            {renderBackButton(() => {
              setShowAllIntegrations(false);
              setIntegrationSearchQuery('');
              setIntegrationTradeFilter(null);
            })}
          </View>
          <View style={{ flex: 1, paddingTop: 12 }}>
            <Text style={[styles.welcomeTitle, { textAlign: 'left', marginBottom: 16, fontSize: 20 }]}>
              All Integrations
            </Text>
            
            {/* Search bar */}
            <View style={styles.integrationSearchContainer}>
              <Search size={18} color="#94A3B8" />
              <TextInput
                style={styles.integrationSearchInput}
                placeholder="Search integrations..."
                placeholderTextColor="#94A3B8"
                value={integrationSearchQuery}
                onChangeText={setIntegrationSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {integrationSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setIntegrationSearchQuery('')}>
                  <X size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Trade filter pills */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0, marginBottom: 16 }}
              contentContainerStyle={{ gap: 8, paddingRight: 20 }}
            >
              {tradeFilters.map(filter => (
                <TouchableOpacity
                  key={filter.id || 'all'}
                  style={[
                    styles.tradeFilterPill,
                    integrationTradeFilter === filter.id && styles.tradeFilterPillSelected
                  ]}
                  onPress={() => setIntegrationTradeFilter(filter.id)}
                >
                  <Text style={[
                    styles.tradeFilterPillText,
                    integrationTradeFilter === filter.id && styles.tradeFilterPillTextSelected
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Integrations list */}
            <ScrollView 
              style={{ flex: 1 }} 
              contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {filteredIntegrations.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 40 }}>
                  No integrations found
                </Text>
              ) : (
                filteredIntegrations.map((integration) => {
                  const canOAuth = hasOAuth(integration);
                  const connected = isConnected(integration);
                  
                  return (
                    <View
                      key={integration}
                      style={[
                        styles.integrationCard,
                        connected && styles.integrationCardConnected
                      ]}
                    >
                      <View style={styles.integrationInfo}>
                        <Text style={[
                          styles.integrationName,
                          connected && styles.integrationNameConnected
                        ]}>
                          {integration}
                        </Text>
                        {connected && (
                          <Text style={styles.integrationConnectedLabel}>Connected</Text>
                        )}
                      </View>
                      {!connected ? (
                        canOAuth ? (
                          <TouchableOpacity 
                            style={styles.connectNowButton}
                            onPress={() => handleConnect(integration)}
                          >
                            <Text style={styles.connectNowButtonText}>Connect</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity 
                            style={styles.connectLaterButton}
                            onPress={() => handleLearnMore(integration)}
                          >
                            <Text style={styles.connectLaterButtonText}>How to Connect</Text>
                          </TouchableOpacity>
                        )
                      ) : (
                        <View style={styles.connectedCheckmark}>
                          <Check size={18} color="#10B981" />
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
          
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => {
                setShowAllIntegrations(false);
                handleFinishOnboarding();
              }}
            >
              <Text style={styles.primaryButtonText}>
                {connectedCount > 0 
                  ? `Done — ${connectedCount} Connected`
                  : 'Done'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Default trade-specific view
    return (
      <View style={styles.contentContainer}>
        <View style={styles.screenHeader}>
          {renderBackButton(() => setContextualStep(9))}
        </View>
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.welcomeTitle, { textAlign: 'left', marginBottom: 8 }]}>
            Connect your software
          </Text>
          <Text style={[styles.welcomeSubtitle, { textAlign: 'left', marginBottom: 16 }]}>
            Popular integrations for {getTradeLabel() || 'your trade'}. Connect now or come back later.
          </Text>
          
          <TouchableOpacity 
            style={styles.viewAllLink}
            onPress={() => setShowAllIntegrations(true)}
          >
            <Text style={styles.viewAllLinkText}>View all integrations</Text>
            <ChevronRight size={16} color="#3B82F6" />
          </TouchableOpacity>
          
          <View style={{ gap: 12 }}>
            {integrations.map((integration) => {
              const canOAuth = hasOAuth(integration);
              const connected = isConnected(integration);
              
              return (
                <View
                  key={integration}
                  style={[
                    styles.integrationCard,
                    connected && styles.integrationCardConnected
                  ]}
                >
                  <View style={styles.integrationInfo}>
                    <Text style={[
                      styles.integrationName,
                      connected && styles.integrationNameConnected
                    ]}>
                      {integration}
                    </Text>
                    {connected && (
                      <Text style={styles.integrationConnectedLabel}>Connected</Text>
                    )}
                  </View>
                  {!connected ? (
                    canOAuth ? (
                      <TouchableOpacity 
                        style={styles.connectNowButton}
                        onPress={() => handleConnect(integration)}
                      >
                        <Text style={styles.connectNowButtonText}>Connect</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={styles.connectLaterButton}
                        onPress={() => handleLearnMore(integration)}
                      >
                        <Text style={styles.connectLaterButtonText}>How to Connect</Text>
                      </TouchableOpacity>
                    )
                  ) : (
                    <View style={styles.connectedCheckmark}>
                      <Check size={18} color="#10B981" />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
        
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleFinishOnboarding}
          >
            <Text style={styles.primaryButtonText}>
              {connectedCount > 0 
                ? `Done — ${connectedCount} Connected`
                : 'Skip for Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderIntegrations = () => {
    // Trade-specific integrations
    const integrationsByTrade: Record<string, Array<{ id: string; name: string; logo: string; description: string }>> = {
      'roofing': [
        { id: 'jobber', name: 'Jobber', logo: '📋', description: 'Scheduling & invoicing' },
        { id: 'eagleview', name: 'EagleView', logo: '🦅', description: 'Roof measurements' },
        { id: 'acculynx', name: 'AccuLynx', logo: '🏠', description: 'Roofing CRM' },
        { id: 'roofsnap', name: 'RoofSnap', logo: '📐', description: 'Roof estimating' },
      ],
      'hvac': [
        { id: 'servicetitan', name: 'ServiceTitan', logo: '⚡', description: 'Field service management' },
        { id: 'housecall', name: 'Housecall Pro', logo: '🏠', description: 'Scheduling & dispatch' },
        { id: 'jobber', name: 'Jobber', logo: '📋', description: 'Scheduling & invoicing' },
        { id: 'successware', name: 'SuccessWare', logo: '✅', description: 'Business management' },
      ],
      'plumbing': [
        { id: 'servicetitan', name: 'ServiceTitan', logo: '⚡', description: 'Field service management' },
        { id: 'housecall', name: 'Housecall Pro', logo: '🏠', description: 'Scheduling & dispatch' },
        { id: 'jobber', name: 'Jobber', logo: '📋', description: 'Scheduling & invoicing' },
        { id: 'fieldedge', name: 'FieldEdge', logo: '🔧', description: 'Service software' },
      ],
      'electrical': [
        { id: 'servicetitan', name: 'ServiceTitan', logo: '⚡', description: 'Field service management' },
        { id: 'jobber', name: 'Jobber', logo: '📋', description: 'Scheduling & invoicing' },
        { id: 'housecall', name: 'Housecall Pro', logo: '🏠', description: 'Scheduling & dispatch' },
        { id: 'accubid', name: 'Accubid', logo: '📊', description: 'Electrical estimating' },
      ],
      'landscaping': [
        { id: 'jobber', name: 'Jobber', logo: '📋', description: 'Scheduling & invoicing' },
        { id: 'aspire', name: 'Aspire', logo: '🌿', description: 'Landscape management' },
        { id: 'lmn', name: 'LMN', logo: '📈', description: 'Estimating & scheduling' },
        { id: 'singleops', name: 'SingleOps', logo: '🌳', description: 'Business software' },
      ],
      'gc': [
        { id: 'procore', name: 'Procore', logo: '🏗️', description: 'Construction management' },
        { id: 'buildertrend', name: 'Buildertrend', logo: '🔨', description: 'Project management' },
        { id: 'coconstruct', name: 'CoConstruct', logo: '📐', description: 'Builder software' },
        { id: 'quickbooks', name: 'QuickBooks', logo: '📒', description: 'Accounting' },
      ],
    };

    // Get integrations for selected trades, with fallback
    const defaultIntegrations = [
      { id: 'jobber', name: 'Jobber', logo: '📋', description: 'Scheduling & invoicing' },
      { id: 'quickbooks', name: 'QuickBooks', logo: '📒', description: 'Accounting' },
      { id: 'housecall', name: 'Housecall Pro', logo: '🏠', description: 'Scheduling & dispatch' },
      { id: 'servicetitan', name: 'ServiceTitan', logo: '⚡', description: 'Field service management' },
    ];

    let integrations = defaultIntegrations;
    if (selectedTrades.length > 0) {
      const firstTrade = selectedTrades[0];
      integrations = integrationsByTrade[firstTrade] || defaultIntegrations;
    }

    return (
      <View style={styles.contentContainer}>
        <View style={styles.screenHeader}>
          {renderBackButton()}
        </View>
        <View style={{ flex: 1, paddingTop: 20 }}>
          <Text style={[styles.welcomeTitle, { textAlign: 'left', marginBottom: 12 }]}>
            Connect your tools
          </Text>
          <Text style={[styles.welcomeSubtitle, { textAlign: 'left', marginBottom: 32 }]}>
            CompanyCam integrates with the software you already use. Get a seamless experience across your workflow.
          </Text>
          
          <View style={styles.integrationsGrid}>
            {integrations.map(integration => (
              <View key={integration.id} style={styles.integrationCard}>
                <Text style={styles.integrationLogo}>{integration.logo}</Text>
                <View style={styles.integrationInfo}>
                  <Text style={styles.integrationName}>{integration.name}</Text>
                  <Text style={styles.integrationDescription}>{integration.description}</Text>
                </View>
              </View>
            ))}
          </View>
          
          <Text style={styles.integrationNote}>
            + 50 more integrations available
          </Text>
        </View>
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => setContextualStep(10)}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCompanyName = () => {
    const tradeLabel = getTradeLabel();
    const questionText = tradeLabel 
      ? `What's the name of your ${tradeLabel} company?`
      : "What's the name of your company?";

    return (
      <KeyboardAvoidingView 
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.screenHeader}>
          {renderBackButton()}
        </View>
        <View style={{ flex: 1, paddingTop: 20 }}>
          <Text style={[styles.welcomeTitle, { marginBottom: 32, textAlign: 'left' }]}>{questionText}</Text>
          
          <TextInput
            style={styles.companyNameInput}
            placeholder="Enter company name"
            placeholderTextColor="#94A3B8"
            value={companyName}
            onChangeText={setCompanyName}
            autoFocus={true}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={() => {
              if (companyName.trim()) {
                setContextualStep(6);
              }
            }}
          />
        </View>
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={[styles.primaryButton, !companyName.trim() && styles.primaryButtonDisabled]} 
            onPress={() => setContextualStep(6)}
            disabled={!companyName.trim()}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };

  const renderCompanySize = () => {
    const sizes = [
      { id: 'solo', label: 'Just me' },
      { id: '2-5', label: '2–5' },
      { id: '6-10', label: '6–10' },
      { id: '11-25', label: '11–25' },
      { id: '26-50', label: '26–50' },
      { id: '51-100', label: '51–100' },
      { id: '101-500', label: '101–500' },
      { id: '500+', label: '500+' },
    ];

    const handleSizeSelect = (sizeId: string) => {
      setCompanySize(sizeId);
      if (sizeId === 'solo') {
        // Solo users skip role selection and team invites, go straight to pathways
        setTimeout(() => setContextualStep(9), 300);
      } else {
        // Teams go to role selection
        setTimeout(() => setContextualStep(7), 300);
      }
    };

    return (
      <View style={styles.contentContainer}>
        <View style={styles.screenHeader}>
          {renderBackButton()}
        </View>
        <View style={{ flex: 1, paddingTop: 20 }}>
          <Text style={[styles.welcomeTitle, { textAlign: 'left', marginBottom: 12 }]}>How many people work at {companyName || 'your company'}?</Text>
          <Text style={[styles.welcomeSubtitle, { textAlign: 'left', marginBottom: 32 }]}>
            A 3-person crew and a 300-person company work very differently. We'll set things up to match how you operate.
          </Text>
          
          <View style={styles.companySizeGrid}>
            {sizes.map(size => (
              <TouchableOpacity
                key={size.id}
                style={[
                  styles.companySizePill,
                  companySize === size.id && styles.companySizePillSelected
                ]}
                onPress={() => handleSizeSelect(size.id)}
              >
                <Text style={[
                  styles.companySizePillText,
                  companySize === size.id && styles.companySizePillTextSelected
                ]}>
                  {size.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  // State for role-based invites - stores contact info and optional display name
  const [roleInvites, setRoleInvites] = useState<Record<string, { contactInfo: string; displayName?: string }>>();
  const [activeRoleInput, setActiveRoleInput] = useState<string | null>(null);
  const [inviteSheetRole, setInviteSheetRole] = useState<{ id: string; label: string } | null>(null);
  const inviteSheetRef = useRef<BottomSheet>(null);
  const inviteSnapPoints = React.useMemo(() => ['55%'], []);
  
  const renderInviteBackdrop = React.useCallback(
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

  // State for adding custom roles to invite
  const [customInviteRoles, setCustomInviteRoles] = useState<Array<{ id: string; label: string }>>([]);
  const [showAddRoleInput, setShowAddRoleInput] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const renderInviteByRole = () => {
    // Get suggested roles based on user's role - show fewer, more relevant options
    const getSuggestedRoles = () => {
      const roleDescriptions: Record<string, string> = {
        'owner': 'See every job photo in real-time — no more chasing updates',
        'field-crew': 'Capture work on-site so the office always knows what\'s happening',
        'operations': 'Track progress across all jobs without leaving their desk',
        'sales': 'Fresh job photos to share with customers and close more deals',
        'admin': 'All the photos needed for billing and documentation, already organized',
      };

      const roleConfig: Record<string, Array<{ id: string; label: string; icon: JSX.Element; description: string }>> = {
        'owner': [
          { id: 'field-crew', label: 'Field / Crew', icon: <HardHat size={20} color="#EF4444" />, description: roleDescriptions['field-crew'] },
          { id: 'operations', label: 'Operations Manager', icon: <Construction size={20} color="#0EA5E9" />, description: roleDescriptions['operations'] },
        ],
        'operations': [
          { id: 'field-crew', label: 'Field / Crew', icon: <HardHat size={20} color="#EF4444" />, description: roleDescriptions['field-crew'] },
          { id: 'owner', label: 'Owner / Boss', icon: <Briefcase size={20} color="#3B82F6" />, description: roleDescriptions['owner'] },
        ],
        'field-crew': [
          { id: 'owner', label: 'Owner / Boss', icon: <Briefcase size={20} color="#3B82F6" />, description: roleDescriptions['owner'] },
          { id: 'operations', label: 'Operations Manager', icon: <Construction size={20} color="#0EA5E9" />, description: roleDescriptions['operations'] },
        ],
        'sales': [
          { id: 'field-crew', label: 'Field / Crew', icon: <HardHat size={20} color="#EF4444" />, description: roleDescriptions['field-crew'] },
          { id: 'owner', label: 'Owner / Boss', icon: <Briefcase size={20} color="#3B82F6" />, description: roleDescriptions['owner'] },
        ],
        'admin': [
          { id: 'field-crew', label: 'Field / Crew', icon: <HardHat size={20} color="#EF4444" />, description: roleDescriptions['field-crew'] },
          { id: 'owner', label: 'Owner / Boss', icon: <Briefcase size={20} color="#3B82F6" />, description: roleDescriptions['owner'] },
        ],
      };
      
      // Get user's role config or default
      const userRoleIcon = selectedRole === 'owner' ? <Briefcase size={18} color="#3B82F6" /> 
        : selectedRole === 'operations' ? <Construction size={18} color="#0EA5E9" />
        : selectedRole === 'field-crew' ? <HardHat size={18} color="#EF4444" />
        : selectedRole === 'sales' ? <Users size={18} color="#10B981" />
        : selectedRole === 'admin' ? <FileText size={18} color="#F59E0B" />
        : <Users size={18} color="#3B82F6" />;
      
      const userRoleLabel = selectedRole === 'owner' ? 'Owner / Boss'
        : selectedRole === 'operations' ? 'Operations Manager'
        : selectedRole === 'field-crew' ? 'Field / Crew'
        : selectedRole === 'sales' ? 'Sales Rep'
        : selectedRole === 'admin' ? 'Office Admin'
        : 'Your Role';
      
      const userRoleObj = { id: selectedRole || 'you', label: userRoleLabel, icon: userRoleIcon, description: '' };
      const suggested = roleConfig[selectedRole || ''] || [
        { id: 'field-crew', label: 'Field / Crew', icon: <HardHat size={20} color="#EF4444" />, description: roleDescriptions['field-crew'] },
        { id: 'owner', label: 'Owner / Boss', icon: <Briefcase size={20} color="#3B82F6" />, description: roleDescriptions['owner'] },
      ];
      
      // Add any custom roles the user has added
      const customRoleObjects = customInviteRoles.map(r => ({
        ...r,
        icon: <UserPlus size={20} color="#8B5CF6" />,
        description: 'They\'ll see and share project photos with the whole team',
      }));
      
      return [userRoleObj, ...suggested, ...customRoleObjects];
    };

    const allRoles = getSuggestedRoles();
    const isUserRole = (roleId: string) => roleId === selectedRole;
    
    const handleAddCustomRole = () => {
      if (newRoleName.trim()) {
        const newRole = {
          id: `custom-${Date.now()}`,
          label: newRoleName.trim(),
        };
        setCustomInviteRoles(prev => [...prev, newRole]);
        setNewRoleName('');
        setShowAddRoleInput(false);
        // Immediately open the invite sheet for this new role
        setTimeout(() => {
          setInviteSheetRole({ id: newRole.id, label: newRole.label });
          setActiveRoleInput(newRole.id);
          inviteSheetRef.current?.expand();
        }, 100);
      }
    };
    const filledInvites = Object.values(roleInvites || {}).filter(v => v.contactInfo?.trim()).length;

    const handleRoleInviteChange = (roleId: string, value: string, displayName?: string) => {
      setRoleInvites(prev => ({ ...prev, [roleId]: { contactInfo: value, displayName } }));
    };

    const handleRoleTap = (roleId: string) => {
      const role = allRoles.find(r => r.id === roleId);
      if (role) {
        setInviteSheetRole({ id: role.id, label: role.label });
        setActiveRoleInput(roleId);
        inviteSheetRef.current?.expand();
      }
    };

    const handleAddInvite = () => {
      // Close sheet after adding
      if (inviteSheetRole && roleInvites?.[inviteSheetRole.id]?.contactInfo?.trim()) {
        inviteSheetRef.current?.close();
        setInviteSheetRole(null);
        setActiveRoleInput(null);
      }
    };

    const handleCloseInviteSheet = () => {
      inviteSheetRef.current?.close();
      setInviteSheetRole(null);
      setActiveRoleInput(null);
    };

    const handlePickContact = async (roleId: string) => {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Please allow access to contacts to add team members.',
            [{ text: 'OK' }]
          );
          return;
        }

        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });

        if (data.length > 0) {
          // For now, we'll use presentContactPickerAsync if available, otherwise show first contact
          // expo-contacts doesn't have a built-in picker, so we'll use a simpler approach
          const contact = await Contacts.presentContactPickerAsync();
          
          if (contact) {
            // Prefer email, fall back to phone
            let contactInfo = '';
            if (contact.emails && contact.emails.length > 0) {
              contactInfo = contact.emails[0].email || '';
            } else if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
              contactInfo = contact.phoneNumbers[0].number || '';
            }
            
            // Get display name from contact
            const displayName = contact.name || contact.firstName 
              ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim() 
              : undefined;
            
            if (contactInfo) {
              handleRoleInviteChange(roleId, contactInfo, displayName);
              // Close the sheet after picking a contact
              inviteSheetRef.current?.close();
              setInviteSheetRole(null);
              setActiveRoleInput(null);
            }
          }
        }
      } catch (error) {
        console.log('Contact picker error:', error);
        // Fallback: just let them type manually
      }
    };

    const getValueMessage = () => {
      if (selectedRole === 'owner') {
        return "See photos from every job site in real-time—no more wondering what's happening.";
      } else if (selectedRole === 'field-crew') {
        return "Your boss sees your work without you having to text photos all day.";
      } else if (selectedRole === 'operations') {
        return "See every job update the moment it happens. Catch problems before they get expensive.";
      } else if (selectedRole === 'sales') {
        return "Fresh job photos to share with customers and close more deals.";
      } else if (selectedRole === 'admin') {
        return "All the photos you need for billing and documentation, already organized.";
      }
      return "Everyone stays on the same page—fewer mistakes, less rework.";
    };

    return (
      <KeyboardAvoidingView 
        style={[styles.contentContainer, { paddingHorizontal: 20 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.screenHeader}>
          {renderBackButton()}
        </View>
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingTop: 8, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.welcomeTitle, { textAlign: 'center', marginBottom: 12, fontSize: 22 }]}>
            Last Step: Invite two more people
          </Text>

          {/* Value hint */}
          <View style={[styles.freeSeatsHint, { marginTop: 0, marginBottom: 16 }]}>
            <Text style={styles.freeSeatsHintText}>
              <Text style={{ fontFamily: 'Inter-SemiBold', color: '#3B82F6' }}>Your first 3 users are included at no extra cost.</Text>
            </Text>
          </View>

          {/* Role list */}
          <View style={[styles.roleInviteList, { marginTop: 16 }]}>
            {allRoles.map((role, index) => {
              const isThisUserRole = isUserRole(role.id);
              const isActive = activeRoleInput === role.id;
              const invite = roleInvites?.[role.id];
              const hasInvite = invite?.contactInfo?.trim();
              const inviteDisplay = invite?.displayName || invite?.contactInfo;
              
              return (
                <View key={role.id}>
                  <TouchableOpacity 
                    style={[
                      styles.roleInviteRow,
                      isThisUserRole && styles.roleInviteRowYou,
                      isActive && styles.roleInviteRowActive,
                      hasInvite && !isThisUserRole && styles.roleInviteRowFilled,
                    ]}
                    onPress={() => !isThisUserRole && handleRoleTap(role.id)}
                    activeOpacity={isThisUserRole ? 1 : 0.7}
                  >
                    <View style={[
                      styles.roleInviteIconSmall,
                      isThisUserRole && { backgroundColor: '#EEF2F7' },
                      hasInvite && !isThisUserRole && { backgroundColor: '#DCFCE7' }
                    ]}>
                      {isThisUserRole ? <Check size={16} color="#64748B" /> : (hasInvite ? <Check size={16} color="#16A34A" /> : role.icon)}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[
                        styles.roleInviteRowLabel,
                        isThisUserRole && { color: '#64748B' },
                        hasInvite && !isThisUserRole && { color: '#16A34A' }
                      ]}>
                        {role.label}
                      </Text>
                      {!isThisUserRole && !hasInvite && role.description ? (
                        <Text style={styles.roleInviteRowDescription} numberOfLines={2}>
                          {role.description}
                        </Text>
                      ) : null}
                      {hasInvite && !isThisUserRole && (
                        <Text style={styles.roleInviteRowEmail} numberOfLines={1}>
                          {inviteDisplay}
                        </Text>
                      )}
                    </View>
                    {isThisUserRole && (
                      <View style={styles.roleInviteYouBadge}>
                        <Text style={styles.roleInviteYouText}>You</Text>
                      </View>
                    )}
                    {!isThisUserRole && !hasInvite && (
                      <View style={styles.roleInviteAddButton}>
                        <Text style={styles.roleInviteAddButtonText}>Invite</Text>
                      </View>
                    )}
                    {!isThisUserRole && hasInvite && (
                      <TouchableOpacity 
                        style={styles.roleInviteEditButton}
                        onPress={() => handleRoleTap(role.id)}
                      >
                        <Text style={styles.roleInviteEditText}>Edit</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
            
            {/* Someone else */}
            {!showAddRoleInput ? (
              <View style={styles.addRoleButton}>
                <View style={styles.roleInviteIconSmall}>
                  <UserPlus size={18} color="#64748B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addRoleButtonLabel}>Someone else?</Text>
                  <Text style={styles.roleInviteRowDescription}>Add anyone on your team who should see or share photos</Text>
                </View>
                <TouchableOpacity 
                  style={styles.roleInviteAddButton}
                  onPress={() => setShowAddRoleInput(true)}
                >
                  <Text style={styles.roleInviteAddButtonText}>Invite</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.addRoleInputContainer}>
                <TextInput
                  style={styles.addRoleInput}
                  placeholder="Role name (e.g. Estimator)"
                  placeholderTextColor="#94A3B8"
                  value={newRoleName}
                  onChangeText={setNewRoleName}
                  onSubmitEditing={handleAddCustomRole}
                  autoFocus
                  returnKeyType="done"
                />
                <TouchableOpacity 
                  style={[
                    styles.addRoleConfirmButton,
                    !newRoleName.trim() && { opacity: 0.5 }
                  ]}
                  onPress={handleAddCustomRole}
                  disabled={!newRoleName.trim()}
                >
                  <Check size={18} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.addRoleCancelButton}
                  onPress={() => {
                    setShowAddRoleInput(false);
                    setNewRoleName('');
                  }}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
            )}
          </View>

        </ScrollView>

        <View style={styles.bottomButtonContainer}>
          <Text numberOfLines={1} style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: '#7C3AED', textAlign: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Inter-SemiBold' }}>3+ million</Text> photos captured daily by teams like yours
          </Text>
          <TouchableOpacity 
            style={[
              styles.primaryButton,
              filledInvites === 0 && { backgroundColor: '#E2E8F0' }
            ]} 
            onPress={() => setContextualStep(9)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.primaryButtonText,
              filledInvites === 0 && { color: '#64748B' }
            ]}>
              {filledInvites > 0 
                ? `Send ${filledInvites} Invite${filledInvites > 1 ? 's' : ''} & Continue`
                : 'Continue'}
            </Text>
          </TouchableOpacity>
          
          {/* Skip option */}
          {filledInvites === 0 && (
            <TouchableOpacity 
              style={styles.skipInviteButton}
              onPress={() => setContextualStep(9)}
            >
              <Text style={styles.skipInviteText}>Skip for now — I'll invite them later</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Invite Bottom Sheet */}
        <BottomSheet
          ref={inviteSheetRef}
          index={-1}
          snapPoints={inviteSnapPoints}
          enablePanDownToClose
          backdropComponent={renderInviteBackdrop}
          onClose={() => {
            setInviteSheetRole(null);
            setActiveRoleInput(null);
          }}
          backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
          handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
        >
          <BottomSheetView style={styles.inviteSheetContent}>
            {inviteSheetRole && (
              <>
                <Text style={styles.inviteSheetTitle}>
                  Add {inviteSheetRole.label}
                </Text>
                <Text style={styles.inviteSheetSubtitle}>
                  {inviteSheetRole.id === 'owner' && "They'll see every job photo in real-time—no more chasing updates."}
                  {inviteSheetRole.id === 'operations' && "They'll track progress across all jobs without leaving their desk."}
                  {inviteSheetRole.id === 'sales' && "They'll have fresh job photos to share with customers instantly."}
                  {inviteSheetRole.id === 'admin' && "They'll get organized photos for billing and documentation automatically."}
                  {inviteSheetRole.id === 'field-crew' && "They'll capture work on-site so the office always knows what's happening."}
                  {inviteSheetRole.id === 'estimator' && "They'll see job conditions and details without driving to the site."}
                  {inviteSheetRole.id === 'project-manager' && "They'll monitor progress and catch issues before they become problems."}
                </Text>

                {/* From Contacts option */}
                <TouchableOpacity 
                  style={styles.inviteSheetOption}
                  onPress={() => handlePickContact(inviteSheetRole.id)}
                >
                  <View style={styles.inviteSheetOptionIcon}>
                    <ContactRound size={24} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inviteSheetOptionTitle}>Choose from Contacts</Text>
                    <Text style={styles.inviteSheetOptionSubtitle}>Pick someone from your phone</Text>
                  </View>
                  <ChevronRight size={20} color="#94A3B8" />
                </TouchableOpacity>

                {/* Manual entry */}
                <View style={styles.inviteSheetDivider}>
                  <View style={styles.inviteSheetDividerLine} />
                  <Text style={styles.inviteSheetDividerText}>or enter manually</Text>
                  <View style={styles.inviteSheetDividerLine} />
                </View>

                <View style={styles.inviteSheetInputRow}>
                  <BottomSheetTextInput
                    style={styles.inviteSheetInput}
                    placeholder="Email or phone number"
                    placeholderTextColor="#94A3B8"
                    value={roleInvites?.[inviteSheetRole.id]?.contactInfo || ''}
                    onChangeText={(text) => handleRoleInviteChange(inviteSheetRole.id, text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleAddInvite}
                  />
                </View>

                <TouchableOpacity 
                  style={[
                    styles.inviteSheetButton,
                    !roleInvites?.[inviteSheetRole.id]?.contactInfo?.trim() && styles.inviteSheetButtonDisabled
                  ]}
                  onPress={handleAddInvite}
                  disabled={!roleInvites?.[inviteSheetRole.id]?.contactInfo?.trim()}
                >
                  <Text style={[
                    styles.inviteSheetButtonText,
                    !roleInvites?.[inviteSheetRole.id]?.contactInfo?.trim() && styles.inviteSheetButtonTextDisabled
                  ]}>
                    Add to Team
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </BottomSheetView>
        </BottomSheet>
      </KeyboardAvoidingView>
    );
  };

  const renderRoleSelector = () => {
    const roles = [
      { id: 'owner', label: 'Owner', icon: <Briefcase size={24} color="#3B82F6" /> },
      { id: 'sales', label: 'Sales', icon: <Users size={24} color="#10B981" /> },
      { id: 'marketing', label: 'Marketing', icon: <Sparkles size={24} color="#A855F7" /> },
      { id: 'admin', label: 'Admin', icon: <FileText size={24} color="#F59E0B" /> },
      { id: 'operations', label: 'Operations', icon: <Construction size={24} color="#0EA5E9" /> },
      { id: 'field-crew', label: 'Field / Crew', icon: <HardHat size={24} color="#EF4444" /> },
    ];

    const handleRoleSelect = (roleId: string) => {
      setSelectedRole(roleId);
      // Go to invite by role screen (step 8)
      setTimeout(() => setContextualStep(8), 300);
    };

    const handleCustomRoleSubmit = () => {
      if (customRole.trim()) {
        setSelectedRole('custom');
        // Go to invite by role screen
        setTimeout(() => setContextualStep(8), 300);
      }
    };

    return (
      <KeyboardAvoidingView 
        style={[styles.container, { paddingHorizontal: 20 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.screenHeader}>
          {renderBackButton()}
        </View>
        <View style={{ paddingBottom: 20 }}>
          <Text style={styles.sectionTitle}>What's your role?</Text>
          <Text style={styles.sectionSubtitle}>This helps us personalize your experience.</Text>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 12, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {roles.map(role => (
            <TouchableOpacity
              key={role.id}
              style={[styles.tradeCard, selectedRole === role.id && styles.tradeCardSelected]}
              onPress={() => handleRoleSelect(role.id)}
            >
              <View style={styles.tradeIconContainer}>{role.icon}</View>
              <Text style={[styles.tradeLabel, selectedRole === role.id && styles.tradeLabelSelected]}>{role.label}</Text>
              {selectedRole === role.id && <Check size={20} color="#3B82F6" />}
            </TouchableOpacity>
          ))}
          
          {/* Custom role input */}
          <View style={styles.customRoleContainer}>
            <Text style={styles.customRoleLabel}>Or enter your own:</Text>
            <View style={styles.customRoleInputRow}>
              <TextInput
                style={styles.customRoleInput}
                placeholder="e.g. Project Manager, Estimator..."
                placeholderTextColor="#94A3B8"
                value={customRole}
                onChangeText={setCustomRole}
                onSubmitEditing={handleCustomRoleSubmit}
                returnKeyType="done"
              />
              {customRole.trim().length > 0 && (
                <TouchableOpacity 
                  style={styles.customRoleSubmitButton}
                  onPress={handleCustomRoleSubmit}
                >
                  <ArrowRight size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  const getRoleLabel = () => {
    const roleLabels: Record<string, string> = {
      'owner': 'business owner',
      'sales': 'sales professional',
      'marketing': 'marketing pro',
      'admin': 'admin',
      'operations': 'operations manager',
      'field-crew': 'field team member',
      'custom': customRole || 'team member',
    };
    return roleLabels[selectedRole || ''] || 'team member';
  };

  const getPathwaysForRole = () => {
    const tradeLabel = getTradeLabel();
    const companyLabel = companyName || 'your company';
    
    // Base pathways that vary by role (3 options each, value-oriented)
    const pathwaysByRole: Record<string, Array<{ id: string; title: string; description: string; icon: React.ReactNode; priority: 'high' | 'medium' }>> = {
      'owner': [
        { id: 'magic-sync', title: 'Import your camera roll', description: 'We\'ll magically organize your existing photos into projects', icon: <Sparkles size={24} color="#7C3AED" />, priority: 'high' },
        { id: 'connect-software', title: 'Connect your software', description: 'Sync with your CRM, invoicing, or scheduling tools', icon: <Zap size={24} color="#F59E0B" />, priority: 'high' },
        { id: 'ai-walkthrough', title: 'AI Capture Notes', description: 'Snap photos and let AI write the documentation', icon: <Camera size={24} color="#3B82F6" />, priority: 'medium' },
      ],
      'sales': [
        { id: 'magic-sync', title: 'Import your camera roll', description: 'Instantly organize job photos you\'ve already taken', icon: <Sparkles size={24} color="#7C3AED" />, priority: 'high' },
        { id: 'connect-software', title: 'Connect your software', description: 'Sync with your sales tools automatically', icon: <Zap size={24} color="#F59E0B" />, priority: 'high' },
        { id: 'ai-walkthrough', title: 'AI Capture Notes', description: 'Take photos and AI writes the notes for you', icon: <Camera size={24} color="#3B82F6" />, priority: 'medium' },
      ],
      'marketing': [
        { id: 'magic-sync', title: 'Import your camera roll', description: 'Pull in your best project photos automatically', icon: <Sparkles size={24} color="#7C3AED" />, priority: 'high' },
        { id: 'ai-checklists', title: 'Turn docs into checklists', description: 'Snap a photo of any form—AI builds it for you', icon: <FileText size={24} color="#10B981" />, priority: 'high' },
        { id: 'connect-software', title: 'Connect your software', description: 'Sync with your marketing tools', icon: <Zap size={24} color="#F59E0B" />, priority: 'medium' },
      ],
      'admin': [
        { id: 'ai-checklists', title: 'Turn docs into checklists', description: 'Photograph your forms—AI converts them instantly', icon: <FileText size={24} color="#10B981" />, priority: 'high' },
        { id: 'connect-software', title: 'Connect your software', description: 'Sync with accounting, scheduling, and more', icon: <Zap size={24} color="#F59E0B" />, priority: 'high' },
        { id: 'magic-sync', title: 'Import your camera roll', description: 'Organize existing photos into projects automatically', icon: <Sparkles size={24} color="#7C3AED" />, priority: 'medium' },
      ],
      'operations': [
        { id: 'ai-checklists', title: 'Turn docs into checklists', description: 'Snap your inspection forms—AI builds templates', icon: <FileText size={24} color="#10B981" />, priority: 'high' },
        { id: 'ai-walkthrough', title: 'AI Capture Notes', description: 'Photograph the job and AI documents it for you', icon: <Camera size={24} color="#3B82F6" />, priority: 'high' },
        { id: 'connect-software', title: 'Connect your software', description: 'Sync with your management software', icon: <Zap size={24} color="#F59E0B" />, priority: 'medium' },
      ],
      'field-crew': [
        { id: 'magic-sync', title: 'Import your camera roll', description: 'We\'ll sort your existing job photos automatically', icon: <Sparkles size={24} color="#7C3AED" />, priority: 'high' },
        { id: 'ai-walkthrough', title: 'AI Capture Notes', description: 'Snap a photo and AI writes the notes', icon: <Camera size={24} color="#3B82F6" />, priority: 'high' },
        { id: 'ai-checklists', title: 'Turn docs into checklists', description: 'Photograph a form and start using it instantly', icon: <FileText size={24} color="#10B981" />, priority: 'medium' },
      ],
    };

    return pathwaysByRole[selectedRole || ''] || pathwaysByRole['field-crew'];
  };

  const handlePathwaySelect = (pathwayId: string) => {
    switch (pathwayId) {
      case 'connect-software':
        // Show trade-specific integrations
        setContextualStep(4); // trade integrations step
        break;
      case 'ai-walkthrough':
        // Jump to voice note demo
        setContextualStep(16); // voice note step
        break;
      case 'magic-sync':
        // Magic camera roll sync - would open photo picker with AI organization
        Alert.alert(
          'Import Camera Roll',
          'We\'ll scan your photos and automatically organize them into projects based on location and date. This usually takes about 30 seconds.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Start Import', onPress: handleFinishOnboarding }
          ]
        );
        break;
      case 'ai-checklists':
        // AI checklists from docs - would open camera to photograph forms
        Alert.alert(
          'Create Checklist from Photo',
          'Take a photo of any form, inspection sheet, or checklist—our AI will convert it into a reusable template in seconds.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Camera', onPress: handleFinishOnboarding }
          ]
        );
        break;
      case 'portfolio':
        // Finish and open portfolio
        handleFinishOnboarding();
        break;
      case 'checklists':
        // Finish and would open checklists
        handleFinishOnboarding();
        break;
      case 'share-reports':
      case 'before-after':
      case 'permissions':
        // Finish onboarding, these would open respective features
        handleFinishOnboarding();
        break;
      case 'location':
        setContextualStep(10);
        break;
      case 'explore':
      default:
        handleFinishOnboarding();
        break;
    }
  };

  const renderPersonalizedPathways = () => {
    const roleLabel = getRoleLabel();
    const tradeLabel = getTradeLabel();
    const pathways = getPathwaysForRole();

    return (
      <View style={styles.contentContainer}>
        <View style={styles.screenHeader}>
          {renderBackButton()}
        </View>
        <View style={{ flex: 1, paddingTop: 8 }}>
          <Text style={[styles.pathwaysHeadline, { marginBottom: 8 }]}>
            Great! Your account is set up.
          </Text>
          <Text style={[styles.welcomeSubtitle, { textAlign: 'left', marginBottom: 24 }]}>
            Here are three ways to get started. Pick one—you can always explore the others later.
          </Text>
          
          <ScrollView 
            style={{ flex: 1, overflow: 'visible' }} 
            contentContainerStyle={{ gap: 12, paddingBottom: 32, paddingTop: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {pathways.map((pathway, index) => (
              <TouchableOpacity
                key={pathway.id}
                style={styles.pathwayCard}
                onPress={() => handlePathwaySelect(pathway.id)}
              >
                {index === 0 && (
                  <View style={styles.recommendedBadgeTop}>
                    <Text style={styles.recommendedBadgeText}>Recommended</Text>
                  </View>
                )}
                <View style={styles.pathwayIconContainer}>
                  {pathway.icon}
                </View>
                <View style={styles.pathwayContent}>
                  <Text style={styles.pathwayTitle}>
                    {pathway.title}
                  </Text>
                  <Text style={styles.pathwayDescription}>{pathway.description}</Text>
                </View>
                <ChevronRight size={20} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={[styles.bottomButtonContainer, { paddingTop: 8 }]}>
          <TouchableOpacity 
            style={styles.skipPathwaysButton} 
            onPress={handleFinishOnboarding}
          >
            <Text style={styles.skipPathwaysText}>Skip for now — I'll explore on my own</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderLocationPermission = () => (
    <View style={styles.contentContainer}>
      <View style={styles.screenHeader}>
        {renderBackButton(() => {
          // Go back to personalized pathways (step 9)
          setContextualStep(9);
        })}
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={[styles.iconCircleBig, { backgroundColor: '#ECFDF5' }]}>
          <MapPin size={48} color="#10B981" />
        </View>
        <Text style={styles.centerTitle}>CompanyCam organizes your jobs by where you're working.</Text>
        <Text style={styles.centerSubtitle}>We use your location to automatically group photos, notes, and videos by job address — no folders, no setup, no sorting.</Text>
        
        <View style={{ marginTop: 32, width: '100%', gap: 16 }}>
          <View style={styles.bulletRow}>
            <Check size={20} color="#10B981" />
            <Text style={styles.bulletText}>Create jobs automatically</Text>
          </View>
          <View style={styles.bulletRow}>
            <Check size={20} color="#10B981" />
            <Text style={styles.bulletText}>Keep everyone shooting to the right job</Text>
          </View>
          <View style={styles.bulletRow}>
            <Check size={20} color="#10B981" />
            <Text style={styles.bulletText}>See your work on a map</Text>
          </View>
        </View>
      </View>
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setContextualStep(11)}>
          <Text style={styles.primaryButtonText}>Enable Location</Text>
        </TouchableOpacity>
        <Text style={styles.tinyText}>We'll never track you outside of work. You're always in control.</Text>
      </View>
    </View>
  );

  const renderLocationSuccess = () => (
    <View style={styles.contentContainer}>
      <View style={styles.screenHeader}>
        {renderBackButton()}
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={[styles.iconCircleBig, { backgroundColor: '#ECFDF5' }]}>
          <Check size={48} color="#10B981" />
        </View>
        <Text style={styles.centerTitle}>Perfect — you're set up for automatic job organization.</Text>
        <Text style={styles.centerSubtitle}>Now let's capture your first piece of field info.</Text>
      </View>
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setContextualStep(12)}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCameraPermission = () => (
    <View style={styles.contentContainer}>
      <View style={styles.screenHeader}>
        {renderBackButton()}
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={[styles.iconCircleBig, { backgroundColor: '#EFF6FF' }]}>
          <Camera size={48} color="#3B82F6" />
        </View>
        <Text style={styles.centerTitle}>Capture what's happening on every job.</Text>
        <Text style={styles.centerSubtitle}>Take photos and videos, talk instead of typing — we'll handle the rest.</Text>
      </View>
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setContextualStep(13)}>
          <Text style={styles.primaryButtonText}>Enable Camera</Text>
        </TouchableOpacity>
        <Text style={styles.tinyText}>This is how you and your team document work every day.</Text>
      </View>
    </View>
  );

  const renderFirstCapture = () => (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <Image 
        source={require('../assets/images/project-modern-loft.jpg')} 
        style={{ width: '100%', height: '100%', opacity: 0.6 }} 
        resizeMode="cover" 
      />
      <View style={{ position: 'absolute', top: insets.top + 16, left: 16 }}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]} 
          onPress={() => setContextualStep(prev => prev - 1)}
        >
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={{ position: 'absolute', top: insets.top + 20, left: 0, right: 0, alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>Take a photo — we'll show you how it works.</Text>
        <Text style={{ color: 'white', opacity: 0.8 }}>This is how your crews will document every job.</Text>
      </View>
      
      <View style={{ position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' }}>
        <TouchableOpacity 
          onPress={() => setContextualStep(14)}
          style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 6, borderColor: 'white', backgroundColor: 'transparent' }}
        />
      </View>
    </View>
  );

  const renderAutoOrganizedJob = () => (
    <View style={styles.contentContainer}>
      <View style={styles.screenHeader}>
        {renderBackButton()}
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ marginBottom: 32, width: '100%', alignItems: 'center' }}>
          <View style={styles.mockJobCard}>
            <View style={styles.mockJobHeader}>
              <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' }}>
                <MapPin size={20} color="white" />
              </View>
              <View>
                <Text style={styles.mockJobTitle}>New Job at 123 Main St</Text>
                <Text style={styles.mockJobSubtitle}>Just created • 1m ago</Text>
              </View>
            </View>
            <Image source={require('../assets/images/project-modern-loft.jpg')} style={{ width: '100%', height: 200, borderRadius: 12, marginTop: 16 }} />
          </View>
        </View>

        <Text style={styles.centerTitle}>Nice — we grouped that to a job based on where you're standing.</Text>
        <Text style={styles.centerSubtitle}>CompanyCam organizes everything by location so you don't have to.</Text>
      </View>
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setContextualStep(15)}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVoiceNote = () => (
    <View style={styles.contentContainer}>
      <View style={styles.screenHeader}>
        {renderBackButton()}
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.centerTitle}>Talk about what's happening here.</Text>
        <Text style={styles.centerSubtitle}>Just speak naturally — we'll turn it into clean notes.</Text>
        
        <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
          {showAiProcessing ? (
            <View style={{ alignItems: 'center' }}>
              <Sparkles size={64} color="#3B82F6" />
              <Text style={{ marginTop: 16, fontFamily: 'Inter-Medium', color: '#3B82F6' }}>AI Processing...</Text>
            </View>
          ) : isRecording ? (
            <TouchableOpacity onPress={stopRecording} style={{ alignItems: 'center' }}>
              <Animated.View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', transform: [{ scale: pulseAnim }] }}>
                <View style={{ width: 40, height: 40, borderRadius: 4, backgroundColor: 'white' }} />
              </Animated.View>
              <Text style={{ marginTop: 20, fontSize: 24, fontFamily: 'Inter-Bold' }}>{formatTime(recordingTimer)}</Text>
              <Text style={{ marginTop: 8, color: '#64748B' }}>Tap to stop</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={startRecording} style={{ alignItems: 'center' }}>
              <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' }}>
                <Mic size={48} color="white" />
              </View>
              <Text style={{ marginTop: 16, color: '#64748B' }}>Tap to record</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {!isRecording && !showAiProcessing && (
        <View style={styles.bottomButtonContainer}>
          <Text style={styles.tinyText}>Contractors use this instead of typing.</Text>
        </View>
      )}
    </View>
  );

  const renderAiNoteResult = () => (
    <View style={styles.contentContainer}>
      <View style={styles.screenHeader}>
        {renderBackButton()}
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.centerTitle}>Here's your note — already cleaned up.</Text>
        <Text style={styles.centerSubtitle}>Ready to share with customers or assign to your team.</Text>
        
        <View style={styles.aiNoteCard}>
          <View style={styles.aiNoteHeader}>
            <Sparkles size={20} color="#3B82F6" />
            <Text style={styles.aiNoteLabel}>AI Summary</Text>
          </View>
          <View style={styles.aiNoteRow}>
            <Text style={styles.aiNoteKey}>Issue:</Text>
            <Text style={styles.aiNoteValue}>Ceiling damage observed in master bedroom due to leak.</Text>
          </View>
          <View style={styles.aiNoteRow}>
            <Text style={styles.aiNoteKey}>Action:</Text>
            <Text style={styles.aiNoteValue}>Inspect roof flashing and replace damaged drywall.</Text>
          </View>
          <View style={styles.aiNoteRow}>
            <Text style={styles.aiNoteKey}>Priority:</Text>
            <View style={styles.priorityBadge}><Text style={styles.priorityText}>Normal</Text></View>
          </View>
        </View>
      </View>
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setContextualStep(17)}>
          <Text style={styles.primaryButtonText}>Looks Good</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReportPreview = () => (
    <View style={styles.contentContainer}>
      <View style={styles.screenHeader}>
        {renderBackButton()}
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.centerTitle}>Your first job report is ready.</Text>
        <Text style={styles.centerSubtitle}>Look how quickly you can show customers what's going on.</Text>
        
        <View style={styles.reportPreview}>
          <View style={styles.reportHeader}>
            <View style={{ width: 40, height: 40, backgroundColor: '#CBD5E1', borderRadius: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 12 }}>Your Company Name</Text>
          </View>
          <Image source={require('../assets/images/project-modern-loft.jpg')} style={{ width: '100%', height: 150, borderRadius: 8, marginVertical: 16 }} />
          <Text style={{ fontSize: 14, color: '#334155', lineHeight: 20 }}>
            <Text style={{ fontWeight: 'bold' }}>Notes: </Text>
            Ceiling damage observed in master bedroom. Inspect roof flashing and replace damaged drywall.
          </Text>
        </View>
      </View>
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setContextualStep(18)}>
          <Text style={styles.primaryButtonText}>Share with Someone</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setContextualStep(18)}>
          <Text style={styles.secondaryButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAccountCreation = () => (
    <KeyboardAvoidingView 
      style={styles.contentContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.screenHeader}>
        {renderBackButton()}
      </View>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.welcomeTitle}>Let's save your work.</Text>
        <Text style={styles.welcomeSubtitle}>Create an account so your photos and jobs are backed up automatically.</Text>
        
        <View style={{ marginTop: 32, gap: 16 }}>
          <TextInput style={styles.input} placeholder="Work Email" placeholderTextColor="#94A3B8" keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry placeholderTextColor="#94A3B8" />
          <TextInput style={styles.input} placeholder="Company Name" placeholderTextColor="#94A3B8" />
        </View>
      </ScrollView>
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setContextualStep(19)}>
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderFirstRealJobChoice = () => (
    <View style={styles.contentContainer}>
      <View style={styles.screenHeader}>
        {renderBackButton()}
      </View>
      <Text style={[styles.welcomeTitle, { marginTop: 20 }]}>Where do you want to start?</Text>
      
      <ScrollView style={{ flex: 1, marginTop: 32 }} contentContainerStyle={{ gap: 16 }}>
        <TouchableOpacity style={styles.choiceCard} onPress={handleFinishOnboarding}>
          <View style={styles.choiceIcon}><MapPin size={24} color="#3B82F6" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.choiceTitle}>Start a new job here</Text>
            <Text style={styles.choiceSubtitle}>Use where you are right now.</Text>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.choiceCard} onPress={handleFinishOnboarding}>
          <View style={styles.choiceIcon}><Users size={24} color="#10B981" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.choiceTitle}>Add from customer list</Text>
            <Text style={styles.choiceSubtitle}>Search or add a customer.</Text>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.choiceCard} onPress={handleFinishOnboarding}>
          <View style={styles.choiceIcon}><FileText size={24} color="#F59E0B" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.choiceTitle}>Create job manually</Text>
            <Text style={styles.choiceSubtitle}>Enter an address or name.</Text>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.choiceCard} onPress={handleFinishOnboarding}>
          <View style={styles.choiceIcon}><Sparkles size={24} color="#6366F1" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.choiceTitle}>Explore the app</Text>
            <Text style={styles.choiceSubtitle}>Look around first.</Text>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // ========================================
  // VALUE-FIRST FLOW SCREENS
  // Optimized for conversion: Show value before asking for profile info
  // Flow: Welcome → Value Demo → First Capture → AI Magic → Profile Setup → Activation
  // ========================================

  const vfPulseAnim = useRef(new Animated.Value(1)).current;
  const vfProgressAnim = useRef(new Animated.Value(0)).current;

  // Value-First Step 0: Welcome with value proposition
  const renderVfWelcome = () => (
    <View style={styles.vfContainer}>
      <View style={styles.vfContent}>
        <View style={styles.vfLogoContainer}>
          <Image 
            source={require('../assets/images/cc-logo.png')} 
            style={styles.vfLogo}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.vfHeroTitle}>
          See it in action{'\n'}before you sign up
        </Text>
        <Text style={styles.vfHeroSubtitle}>
          Experience the magic of AI-powered job documentation in 60 seconds
        </Text>

        <View style={styles.vfValueProps}>
          <View style={styles.vfValueProp}>
            <View style={[styles.vfValueIcon, { backgroundColor: '#DCFCE7' }]}>
              <Camera size={20} color="#16A34A" />
            </View>
            <Text style={styles.vfValueText}>Take a photo</Text>
          </View>
          <View style={styles.vfValueArrow}>
            <ArrowRight size={16} color="#94A3B8" />
          </View>
          <View style={styles.vfValueProp}>
            <View style={[styles.vfValueIcon, { backgroundColor: '#DBEAFE' }]}>
              <Sparkles size={20} color="#2563EB" />
            </View>
            <Text style={styles.vfValueText}>AI documents it</Text>
          </View>
          <View style={styles.vfValueArrow}>
            <ArrowRight size={16} color="#94A3B8" />
          </View>
          <View style={styles.vfValueProp}>
            <View style={[styles.vfValueIcon, { backgroundColor: '#FEF3C7' }]}>
              <FileText size={20} color="#D97706" />
            </View>
            <Text style={styles.vfValueText}>Share reports</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.vfBottomSection}>
        <TouchableOpacity 
          style={styles.vfPrimaryButton}
          onPress={() => setValueFirstStep(1)}
        >
          <Text style={styles.vfPrimaryButtonText}>Show Me The Magic</Text>
          <Sparkles size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
        
        <Text style={styles.vfSubtext}>No account required to try</Text>
      </View>
    </View>
  );

  // Value-First Step 1: Quick intro to what's about to happen
  const renderVfValueIntro = () => (
    <View style={styles.vfContainer}>
      <View style={styles.screenHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => setValueFirstStep(0)}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.vfContent}>
        <View style={[styles.vfIconCircleLarge, { backgroundColor: '#EFF6FF' }]}>
          <MapPin size={48} color="#3B82F6" />
        </View>
        
        <Text style={styles.vfSectionTitle}>First, let's turn on location</Text>
        <Text style={styles.vfSectionSubtitle}>
          This is the secret sauce. We'll auto-organize every photo by job site—no folders, no tagging, no hassle.
        </Text>

        <View style={styles.vfFeatureList}>
          <View style={styles.vfFeatureItem}>
            <Check size={20} color="#10B981" />
            <Text style={styles.vfFeatureText}>Photos auto-sort by address</Text>
          </View>
          <View style={styles.vfFeatureItem}>
            <Check size={20} color="#10B981" />
            <Text style={styles.vfFeatureText}>Your crew's photos appear in the same job</Text>
          </View>
          <View style={styles.vfFeatureItem}>
            <Check size={20} color="#10B981" />
            <Text style={styles.vfFeatureText}>See all your work on a map</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.vfBottomSection}>
        <TouchableOpacity 
          style={styles.vfPrimaryButton}
          onPress={() => {
            setVfHasLocationPermission(true);
            setValueFirstStep(2);
          }}
        >
          <Text style={styles.vfPrimaryButtonText}>Enable Location</Text>
        </TouchableOpacity>
        <Text style={styles.vfPrivacyText}>
          🔒 We only use location while you're taking job photos
        </Text>
      </View>
    </View>
  );

  // Value-First Step 2: Camera permission + first capture
  const renderVfFirstCapture = () => (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Image 
        source={require('../assets/images/project-sunset-villa.jpg')} 
        style={{ width: '100%', height: '100%', opacity: 0.7 }} 
        resizeMode="cover" 
      />
      
      <View style={styles.vfCameraOverlay}>
        <View style={styles.vfCameraHeader}>
          <TouchableOpacity 
            style={styles.vfCameraBackButton} 
            onPress={() => setValueFirstStep(1)}
          >
            <ChevronLeft size={28} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.vfCameraJobTag}>
            <MapPin size={14} color="#FFFFFF" />
            <Text style={styles.vfCameraJobText}>Demo Job Site</Text>
          </View>
        </View>
        
        <View style={styles.vfCameraInstructions}>
          <Text style={styles.vfCameraTitle}>Take your first photo</Text>
          <Text style={styles.vfCameraSubtitle}>
            Pretend you're on a job site. Snap anything—we'll show you the magic.
          </Text>
        </View>
        
        <View style={styles.vfCameraControls}>
          <TouchableOpacity 
            style={styles.vfShutterButton}
            onPress={() => {
              setVfCapturedPhoto(true);
              setValueFirstStep(3);
            }}
          >
            <View style={styles.vfShutterInner} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Value-First Step 3: Show the auto-organized job (aha moment #1)
  const renderVfAutoOrganized = () => (
    <View style={styles.vfContainer}>
      <View style={styles.screenHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => setValueFirstStep(2)}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.vfContent}>
        <View style={styles.vfSuccessBadge}>
          <Check size={16} color="#FFFFFF" />
          <Text style={styles.vfSuccessBadgeText}>Auto-organized!</Text>
        </View>
        
        <View style={styles.vfMockJobCard}>
          <View style={styles.vfMockJobHeader}>
            <View style={styles.vfMockJobIcon}>
              <MapPin size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vfMockJobTitle}>123 Main Street</Text>
              <Text style={styles.vfMockJobMeta}>Demo City, CA • Just now</Text>
            </View>
          </View>
          <Image 
            source={require('../assets/images/project-sunset-villa.jpg')} 
            style={styles.vfMockJobImage} 
            resizeMode="cover"
          />
          <View style={styles.vfMockJobFooter}>
            <Text style={styles.vfMockJobFooterText}>1 photo</Text>
          </View>
        </View>
        
        <Text style={styles.vfAhaTitle}>
          ✨ We created a job based on where you're standing
        </Text>
        <Text style={styles.vfAhaSubtitle}>
          Every photo from this location goes here automatically. Your crew's photos too.
        </Text>
      </View>
      
      <View style={styles.vfBottomSection}>
        <TouchableOpacity 
          style={styles.vfPrimaryButton}
          onPress={() => setValueFirstStep(4)}
        >
          <Text style={styles.vfPrimaryButtonText}>Now Watch This...</Text>
          <ArrowRight size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Value-First Step 4: Voice note recording
  const renderVfVoiceNote = () => {
    const startVfRecording = () => {
      setVfIsRecording(true);
      setVfRecordingTimer(0);
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(vfPulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(vfPulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    };

    const stopVfRecording = () => {
      setVfIsRecording(false);
      vfPulseAnim.stopAnimation();
      setVfShowAiProcessing(true);
      
      setTimeout(() => {
        setVfShowAiProcessing(false);
        setVfRecordedNote(true);
        setValueFirstStep(5);
      }, 2500);
    };

    return (
      <View style={styles.vfContainer}>
        <View style={styles.screenHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => setValueFirstStep(3)}>
            <ChevronLeft size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.vfContent}>
          {vfShowAiProcessing ? (
            <View style={styles.vfAiProcessing}>
              <Animated.View style={[styles.vfAiProcessingIcon, { transform: [{ scale: vfPulseAnim }] }]}>
                <Sparkles size={48} color="#7C3AED" />
              </Animated.View>
              <Text style={styles.vfAiProcessingTitle}>AI is listening...</Text>
              <Text style={styles.vfAiProcessingSubtitle}>Converting your words into structured notes</Text>
            </View>
          ) : (
            <>
              <Text style={styles.vfSectionTitle}>
                {vfIsRecording ? 'Recording...' : 'Talk about what you see'}
              </Text>
              <Text style={styles.vfSectionSubtitle}>
                {vfIsRecording 
                  ? "Describe the work, issues, or anything you'd normally text or type"
                  : "Instead of typing, just talk. AI will turn it into clean documentation."}
              </Text>
              
              <View style={styles.vfRecordingArea}>
                {vfIsRecording ? (
                  <TouchableOpacity onPress={stopVfRecording} style={{ alignItems: 'center' }}>
                    <Animated.View style={[styles.vfRecordingButton, styles.vfRecordingActive, { transform: [{ scale: vfPulseAnim }] }]}>
                      <View style={styles.vfRecordingStop} />
                    </Animated.View>
                    <Text style={styles.vfRecordingTime}>{formatTime(vfRecordingTimer)}</Text>
                    <Text style={styles.vfRecordingHint}>Tap to stop</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={startVfRecording} style={{ alignItems: 'center' }}>
                    <View style={styles.vfRecordingButton}>
                      <Mic size={40} color="#FFFFFF" />
                    </View>
                    <Text style={styles.vfRecordingHint}>Tap to record</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {!vfIsRecording && (
                <View style={styles.vfExamplePrompt}>
                  <Text style={styles.vfExampleLabel}>Try saying:</Text>
                  <Text style={styles.vfExampleText}>
                    "Found some water damage in the ceiling near the vent. Going to need to replace about 4 square feet of drywall. Medium priority."
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  // Value-First Step 5: AI Result (aha moment #2)
  const renderVfAiResult = () => (
    <View style={styles.vfContainer}>
      <View style={styles.screenHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => setValueFirstStep(4)}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.vfContent}>
        <View style={styles.vfSuccessBadge}>
          <Sparkles size={16} color="#FFFFFF" />
          <Text style={styles.vfSuccessBadgeText}>AI Processed!</Text>
        </View>
        
        <View style={styles.vfAiResultCard}>
          <View style={styles.vfAiResultHeader}>
            <View style={styles.vfAiResultHeaderIcon}>
              <Sparkles size={18} color="#7C3AED" />
            </View>
            <Text style={styles.vfAiResultHeaderText}>AI-Generated Note</Text>
          </View>
          
          <View style={styles.vfAiResultRow}>
            <Text style={styles.vfAiResultLabel}>Issue</Text>
            <Text style={styles.vfAiResultValue}>Water damage on ceiling near HVAC vent</Text>
          </View>
          
          <View style={styles.vfAiResultRow}>
            <Text style={styles.vfAiResultLabel}>Action</Text>
            <Text style={styles.vfAiResultValue}>Replace ~4 sq ft of drywall</Text>
          </View>
          
          <View style={styles.vfAiResultRow}>
            <Text style={styles.vfAiResultLabel}>Priority</Text>
            <View style={styles.vfPriorityBadge}>
              <Text style={styles.vfPriorityText}>Medium</Text>
            </View>
          </View>
          
          <View style={styles.vfAiResultRow}>
            <Text style={styles.vfAiResultLabel}>Location</Text>
            <Text style={styles.vfAiResultValue}>123 Main Street</Text>
          </View>
        </View>
        
        <Text style={styles.vfAhaTitle}>🎤 → 📝 No typing required</Text>
        <Text style={styles.vfAhaSubtitle}>
          Your crew can document jobs in seconds. Notes are searchable, organized, and ready to share.
        </Text>
      </View>
      
      <View style={styles.vfBottomSection}>
        <TouchableOpacity 
          style={styles.vfPrimaryButton}
          onPress={() => setValueFirstStep(6)}
        >
          <Text style={styles.vfPrimaryButtonText}>See The Report</Text>
          <ArrowRight size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Value-First Step 6: Shareable report preview (aha moment #3)
  const renderVfReportPreview = () => (
    <View style={styles.vfContainer}>
      <View style={styles.screenHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => setValueFirstStep(5)}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.vfContent}>
        <Text style={styles.vfSectionTitle}>Share with customers in 1 tap</Text>
        <Text style={styles.vfSectionSubtitle}>
          Professional reports your customers can view on any device
        </Text>
        
        <View style={styles.vfReportCard}>
          <View style={styles.vfReportHeader}>
            <View style={styles.vfReportLogo}>
              <Text style={styles.vfReportLogoText}>YC</Text>
            </View>
            <Text style={styles.vfReportCompany}>Your Company</Text>
          </View>
          
          <Image 
            source={require('../assets/images/project-sunset-villa.jpg')} 
            style={styles.vfReportImage} 
            resizeMode="cover"
          />
          
          <View style={styles.vfReportBody}>
            <Text style={styles.vfReportAddress}>123 Main Street</Text>
            <Text style={styles.vfReportDate}>January 10, 2026</Text>
            
            <View style={styles.vfReportDivider} />
            
            <Text style={styles.vfReportNoteLabel}>Notes</Text>
            <Text style={styles.vfReportNoteText}>
              Water damage on ceiling near HVAC vent. Plan to replace approximately 4 square feet of drywall. Medium priority.
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.vfBottomSection}>
        <TouchableOpacity 
          style={styles.vfPrimaryButton}
          onPress={() => setValueFirstStep(7)}
        >
          <Text style={styles.vfPrimaryButtonText}>I'm Convinced — Set Up My Account</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.vfSecondaryButton}
          onPress={() => setValueFirstStep(0)}
        >
          <Text style={styles.vfSecondaryButtonText}>Replay the demo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Value-First Step 7: Quick profile setup (trade + phone + company combined)
  const renderVfQuickSetup = () => {
    const popularTrades = [
      { id: 'roofing', label: 'Roofing', icon: <HardHat size={20} color="#3B82F6" /> },
      { id: 'gc', label: 'General Contractor', icon: <Briefcase size={20} color="#F59E0B" /> },
      { id: 'hvac', label: 'HVAC', icon: <Wind size={20} color="#EF4444" /> },
      { id: 'plumbing', label: 'Plumbing', icon: <Droplets size={20} color="#6366F1" /> },
      { id: 'electrical', label: 'Electrical', icon: <Zap size={20} color="#EAB308" /> },
      { id: 'landscaping', label: 'Landscaping', icon: <Trees size={20} color="#10B981" /> },
    ];

    const isValid = vfSelectedTrades.length > 0 && vfPhoneNumber.length >= 10;

    return (
      <KeyboardAvoidingView 
        style={styles.vfContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.screenHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => setValueFirstStep(6)}>
            <ChevronLeft size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.vfSetupProgress}>
            <View style={[styles.vfSetupDot, styles.vfSetupDotActive]} />
            <View style={styles.vfSetupLine} />
            <View style={styles.vfSetupDot} />
            <View style={styles.vfSetupLine} />
            <View style={styles.vfSetupDot} />
          </View>
          
          <Text style={styles.vfSetupTitle}>Quick setup</Text>
          <Text style={styles.vfSetupSubtitle}>Just 3 quick questions to personalize your experience</Text>
          
          <Text style={styles.vfInputLabel}>What's your trade?</Text>
          <View style={styles.vfTradeGrid}>
            {popularTrades.map(trade => (
              <TouchableOpacity
                key={trade.id}
                style={[
                  styles.vfTradePill,
                  vfSelectedTrades.includes(trade.id) && styles.vfTradePillSelected
                ]}
                onPress={() => {
                  setVfSelectedTrades(prev => 
                    prev.includes(trade.id) 
                      ? prev.filter(t => t !== trade.id)
                      : [...prev, trade.id]
                  );
                }}
              >
                {trade.icon}
                <Text style={[
                  styles.vfTradePillText,
                  vfSelectedTrades.includes(trade.id) && styles.vfTradePillTextSelected
                ]}>
                  {trade.label}
                </Text>
                {vfSelectedTrades.includes(trade.id) && (
                  <Check size={16} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.vfSeeMoreTrades}>
            <Text style={styles.vfSeeMoreTradesText}>See all trades</Text>
            <ChevronRight size={16} color="#3B82F6" />
          </TouchableOpacity>
          
          <Text style={[styles.vfInputLabel, { marginTop: 24 }]}>Phone number</Text>
          <Text style={styles.vfInputHint}>We'll text you login links—no password needed</Text>
          <TextInput
            style={styles.vfTextInput}
            placeholder="(555) 123-4567"
            placeholderTextColor="#94A3B8"
            value={vfPhoneNumber}
            onChangeText={setVfPhoneNumber}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
        </ScrollView>
        
        <View style={styles.vfFloatingButton}>
          <TouchableOpacity 
            style={[styles.vfPrimaryButton, !isValid && styles.vfPrimaryButtonDisabled]}
            onPress={() => isValid && setValueFirstStep(8)}
            disabled={!isValid}
          >
            <Text style={styles.vfPrimaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };

  // Value-First Step 8: Company info (combined name + size)
  const renderVfCompanySetup = () => {
    const sizes = [
      { id: 'solo', label: 'Just me' },
      { id: '2-5', label: '2-5' },
      { id: '6-10', label: '6-10' },
      { id: '11-25', label: '11-25' },
      { id: '26+', label: '26+' },
    ];

    const isValid = vfCompanyName.trim().length > 0 && vfCompanySize !== null;

    return (
      <KeyboardAvoidingView 
        style={styles.vfContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.screenHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => setValueFirstStep(7)}>
            <ChevronLeft size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.vfSetupProgress}>
            <View style={[styles.vfSetupDot, styles.vfSetupDotComplete]}>
              <Check size={12} color="#FFFFFF" />
            </View>
            <View style={[styles.vfSetupLine, styles.vfSetupLineComplete]} />
            <View style={[styles.vfSetupDot, styles.vfSetupDotActive]} />
            <View style={styles.vfSetupLine} />
            <View style={styles.vfSetupDot} />
          </View>
          
          <Text style={styles.vfSetupTitle}>Your company</Text>
          
          <Text style={styles.vfInputLabel}>Company name</Text>
          <TextInput
            style={styles.vfTextInput}
            placeholder="Acme Roofing"
            placeholderTextColor="#94A3B8"
            value={vfCompanyName}
            onChangeText={setVfCompanyName}
            autoCapitalize="words"
          />
          
          <Text style={[styles.vfInputLabel, { marginTop: 24 }]}>Team size</Text>
          <View style={styles.vfSizeGrid}>
            {sizes.map(size => (
              <TouchableOpacity
                key={size.id}
                style={[
                  styles.vfSizePill,
                  vfCompanySize === size.id && styles.vfSizePillSelected
                ]}
                onPress={() => setVfCompanySize(size.id)}
              >
                <Text style={[
                  styles.vfSizePillText,
                  vfCompanySize === size.id && styles.vfSizePillTextSelected
                ]}>
                  {size.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        <View style={styles.vfFloatingButton}>
          <TouchableOpacity 
            style={[styles.vfPrimaryButton, !isValid && styles.vfPrimaryButtonDisabled]}
            onPress={() => {
              if (isValid) {
                if (vfCompanySize === 'solo') {
                  setValueFirstStep(10); // Skip team invite for solo
                } else {
                  setValueFirstStep(9);
                }
              }
            }}
            disabled={!isValid}
          >
            <Text style={styles.vfPrimaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };

  // Value-First Step 9: Optional team invite
  const renderVfTeamInvite = () => (
    <View style={styles.vfContainer}>
      <View style={styles.screenHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => setValueFirstStep(8)}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.vfContent}>
        <View style={styles.vfSetupProgress}>
          <View style={[styles.vfSetupDot, styles.vfSetupDotComplete]}>
            <Check size={12} color="#FFFFFF" />
          </View>
          <View style={[styles.vfSetupLine, styles.vfSetupLineComplete]} />
          <View style={[styles.vfSetupDot, styles.vfSetupDotComplete]}>
            <Check size={12} color="#FFFFFF" />
          </View>
          <View style={[styles.vfSetupLine, styles.vfSetupLineComplete]} />
          <View style={[styles.vfSetupDot, styles.vfSetupDotActive]} />
        </View>
        
        <View style={[styles.vfIconCircleLarge, { backgroundColor: '#EFF6FF', marginTop: 24 }]}>
          <Users size={48} color="#3B82F6" />
        </View>
        
        <Text style={styles.vfSetupTitle}>Invite your first teammate</Text>
        <Text style={styles.vfSectionSubtitle}>
          CompanyCam works best when your whole team is connected. We'll send them an invite.
        </Text>
        
        <View style={styles.vfInviteInputRow}>
          <TextInput
            style={[styles.vfTextInput, { flex: 1 }]}
            placeholder="Email or phone"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.vfInviteAddBtn}>
            <UserPlus size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.vfInviteValueProp}>
          <Sparkles size={20} color="#7C3AED" />
          <Text style={styles.vfInviteValueText}>
            Teams using CompanyCam together see 3x faster documentation and fewer miscommunications
          </Text>
        </View>
      </View>
      
      <View style={styles.vfBottomSection}>
        <TouchableOpacity 
          style={styles.vfPrimaryButton}
          onPress={() => setValueFirstStep(10)}
        >
          <Text style={styles.vfPrimaryButtonText}>Send Invite & Finish</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.vfSecondaryButton}
          onPress={() => setValueFirstStep(10)}
        >
          <Text style={styles.vfSecondaryButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Value-First Step 10: Success + what's next
  const renderVfSuccess = () => (
    <View style={styles.vfContainer}>
      <View style={styles.vfContent}>
        <View style={styles.vfSuccessAnimation}>
          <LinearGradient 
            colors={['#10B981', '#059669']} 
            style={styles.vfSuccessCircle}
          >
            <Check size={64} color="#FFFFFF" />
          </LinearGradient>
        </View>
        
        <Text style={styles.vfSuccessTitle}>You're all set! 🎉</Text>
        <Text style={styles.vfSuccessSubtitle}>
          {vfCompanyName || 'Your company'} is ready to start documenting jobs like a pro.
        </Text>
        
        <View style={styles.vfNextSteps}>
          <Text style={styles.vfNextStepsTitle}>What's next?</Text>
          
          <TouchableOpacity style={styles.vfNextStepCard} onPress={handleFinishOnboarding}>
            <View style={[styles.vfNextStepIcon, { backgroundColor: '#DCFCE7' }]}>
              <Camera size={24} color="#16A34A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vfNextStepTitle}>Capture your first real job</Text>
              <Text style={styles.vfNextStepSubtitle}>Take photos at a job site</Text>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.vfNextStepCard} onPress={handleFinishOnboarding}>
            <View style={[styles.vfNextStepIcon, { backgroundColor: '#FEF3C7' }]}>
              <Zap size={24} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vfNextStepTitle}>Connect your software</Text>
              <Text style={styles.vfNextStepSubtitle}>Sync with your CRM, scheduling tools</Text>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.vfNextStepCard} onPress={handleFinishOnboarding}>
            <View style={[styles.vfNextStepIcon, { backgroundColor: '#F3E8FF' }]}>
              <Sparkles size={24} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vfNextStepTitle}>Import existing photos</Text>
              <Text style={styles.vfNextStepSubtitle}>Bring in photos from your camera roll</Text>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.vfBottomSection}>
        <TouchableOpacity 
          style={styles.vfPrimaryButton}
          onPress={handleFinishOnboarding}
        >
          <Text style={styles.vfPrimaryButtonText}>Start Using CompanyCam</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Value-First Flow Router
  const renderValueFirstFlow = () => {
    switch (valueFirstStep) {
      case 0: return renderVfWelcome();
      case 1: return renderVfValueIntro();
      case 2: return renderVfFirstCapture();
      case 3: return renderVfAutoOrganized();
      case 4: return renderVfVoiceNote();
      case 5: return renderVfAiResult();
      case 6: return renderVfReportPreview();
      case 7: return renderVfQuickSetup();
      case 8: return renderVfCompanySetup();
      case 9: return renderVfTeamInvite();
      case 10: return renderVfSuccess();
      default: return renderVfWelcome();
    }
  };

  // Value-First Progress Bar
  const renderVfProgressBar = () => {
    if (valueFirstStep < 1 || valueFirstStep > 9) return null;
    
    // Steps 1-6 are value demo (50% of progress)
    // Steps 7-9 are profile setup (remaining 50%)
    let progress = 0;
    if (valueFirstStep <= 6) {
      progress = (valueFirstStep / 6) * 50;
    } else {
      progress = 50 + ((valueFirstStep - 6) / 3) * 50;
    }
    
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: '#7C3AED' }]} />
        </View>
      </View>
    );
  };

  const renderContextualFlow = () => {
    switch (contextualStep) {
      case 0: return renderContextualWelcome();
      case 1: return renderCustomSetupIntro();
      case 2: return renderNamePhone();
      case 3: return renderTradeSelector();
      case 4: return renderTradeIntegrations();
      case 5: return renderCompanyName();
      case 6: return renderCompanySize();
      case 7: return renderRoleSelector();
      case 8: return renderInviteByRole();
      case 9: return renderPersonalizedPathways();
      case 10: return renderIntegrations();
      case 10: return renderLocationPermission();
      case 11: return renderLocationSuccess();
      case 12: return renderCameraPermission();
      case 13: return renderFirstCapture();
      case 14: return renderAutoOrganizedJob();
      case 15: return renderVoiceNote();
      case 16: return renderAiNoteResult();
      case 17: return renderReportPreview();
      case 18: return renderAccountCreation();
      case 19: return renderFirstRealJobChoice();
      default: return renderContextualWelcome();
    }
  };

  // Calculate progress percentage for the progress bar
  // Progress bar appears from step 3 (trades) onwards, starting at ~55%
  // Completes at step 8 (personalized pathways)
  const getProgressPercentage = () => {
    if (contextualStep < 3) return 0;
    if (contextualStep >= 8) return 100;
    
    // Map steps 3-8 to progress 55%-100%
    const startStep = 3;
    const endStep = 8;
    const startProgress = 55;
    const endProgress = 100;
    
    const stepRange = endStep - startStep;
    const progressRange = endProgress - startProgress;
    const currentProgress = startProgress + ((contextualStep - startStep) / stepRange) * progressRange;
    
    return Math.min(currentProgress, 100);
  };

  const renderProgressBar = () => {
    // Only show progress bar from step 3 onwards in contextual flow
    if (!onboardingFlow || onboardingFlow !== 'contextual' || contextualStep < 3) {
      return null;
    }

    const progress = getProgressPercentage();

    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View 
            style={[
              styles.progressBarFill,
              { width: `${progress}%` }
            ]} 
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Progress Bar - Shows from trades screen onwards */}
      {renderProgressBar()}

      {/* Close Button - Only show on first screen of flow selection */}
      {!onboardingFlow && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
      )}

      {!onboardingFlow ? renderFlowSelection() : (
        onboardingFlow === 'magic' ? (
          showPermissionInstruction ? renderPermissionInstruction() : (
            <>
              {currentStep === 0 && renderLoginScreen()}
              {currentStep === 1 && renderPermissionPrimer()}
              {currentStep === 2 && renderCatchUpScreen()}
              {currentStep === 3 && renderPortfolioMapScreen()}
            </>
          )
        ) : onboardingFlow === 'valueFirst' ? (
          <>
            {renderVfProgressBar()}
            {renderValueFirstFlow()}
          </>
        ) : renderContextualFlow()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  welcomeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
  },
  // Shared Button Styles
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#64748B',
  },
  bottomButtonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    gap: 12,
  },
  // Flow Selection Styles
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  flowButtonTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  flowButtonSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  // Magic Flow Specific Styles
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIcon: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#3B82F6',
  },
  googleButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emailIcon: {
    marginRight: 12,
  },
  emailButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Permission Primer Styles
  primerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  primerIconContainer: { marginBottom: 32 },
  primerIconGradient: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  primerTitle: { fontFamily: 'Inter-Bold', fontSize: 28, color: '#1E293B', marginBottom: 16, textAlign: 'center' },
  primerSubtitle: { fontFamily: 'Inter-Regular', fontSize: 16, color: '#64748B', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  benefitsContainer: { width: '100%', gap: 20, marginBottom: 24 },
  benefitItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  benefitIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  benefitEmoji: { fontSize: 20 },
  benefitText: { flex: 1 },
  benefitTitle: { fontFamily: 'Inter-SemiBold', fontSize: 16, color: '#1E293B', marginBottom: 4 },
  benefitDescription: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#64748B', lineHeight: 20 },
  instructionBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, width: '100%', borderWidth: 1, borderColor: '#E2E8F0' },
  instructionText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#64748B', lineHeight: 20, textAlign: 'center' },
  instructionBold: { fontFamily: 'Inter-Bold' },
  // Permission Instruction Styles
  permissionInstructionContainer: { flex: 1, justifyContent: 'space-between' },
  permissionInstructionContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  permissionInstructionTitle: { fontFamily: 'Inter-Bold', fontSize: 24, color: '#1E293B', textAlign: 'center', marginBottom: 12 },
  permissionInstructionSubtitle: { fontFamily: 'Inter-Regular', fontSize: 16, color: '#64748B', textAlign: 'center', lineHeight: 24, marginBottom: 48 },
  permissionImageContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' },
  arrowContainer: { padding: 0, marginTop: 160 },
  leftArrow: { marginRight: 8 },
  rightArrow: { marginLeft: 8 },
  permissionDialogImage: { justifyContent: 'center', alignItems: 'center' },
  permissionImage: { width: 300, height: 300 },
  tapInstructionText: { fontFamily: 'Inter-Medium', fontSize: 16, color: '#64748B', textAlign: 'center', lineHeight: 24 },
  // Catch-up Styles
  catchUpContainer: { flex: 1 },
  catchUpHeader: { paddingHorizontal: 32, paddingTop: 24, paddingBottom: 24, alignItems: 'center' },
  catchUpTitle: { fontFamily: 'Inter-Bold', fontSize: 28, color: '#1E293B', marginBottom: 8, textAlign: 'center' },
  catchUpSubtitle: { fontFamily: 'Inter-Regular', fontSize: 16, color: '#64748B', lineHeight: 24, textAlign: 'center' },
  cardStackContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  projectCard: { borderRadius: 24, overflow: 'hidden', backgroundColor: '#000000', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  stackedCard: { position: 'absolute' },
  cardInfoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 80 },
  projectCardContent: { padding: 24 },
  projectCardName: { fontFamily: 'Inter-Bold', fontSize: 24, color: '#FFFFFF', marginBottom: 8 },
  projectCardAddress: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#E2E8F0', marginBottom: 20 },
  projectCardActions: { flexDirection: 'row', gap: 12 },
  skipButton: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  skipButtonText: { fontFamily: 'Inter-SemiBold', fontSize: 16, color: '#FFFFFF' },
  syncButton: { flex: 1, backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  syncButtonText: { fontFamily: 'Inter-SemiBold', fontSize: 16, color: '#FFFFFF' },
  // Map Styles
  mapContainer: { flex: 1 },
  mapImage: { flex: 1, width: '100%', height: '100%' },
  mapOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 32 },
  mapOverlayContent: { paddingHorizontal: 32, alignItems: 'center' },
  successIconGradient: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  mapOverlayTitle: { fontFamily: 'Inter-Bold', fontSize: 28, color: '#1E293B', marginBottom: 8, textAlign: 'center' },
  mapOverlaySubtitle: { fontFamily: 'Inter-Regular', fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 32 },

  // --- New Contextual Flow Styles ---
  sectionTitle: { fontSize: 24, fontFamily: 'Inter-Bold', color: '#1E293B', marginBottom: 8 },
  sectionSubtitle: { fontSize: 16, fontFamily: 'Inter-Regular', color: '#64748B' },
  tradeCard: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  tradeCardSelected: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  tradeIconContainer: { marginRight: 16 },
  tradeLabel: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#1E293B', flex: 1 },
  tradeLabelSelected: { color: '#3B82F6' },
  tradeSearchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, gap: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  tradeSearchInput: { flex: 1, fontSize: 16, fontFamily: 'Inter-Regular', color: '#1E293B' },
  noResultsContainer: { alignItems: 'center', paddingTop: 32 },
  noResultsText: { fontSize: 16, fontFamily: 'Inter-Regular', color: '#64748B', textAlign: 'center' },
  customRoleContainer: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  customRoleLabel: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#64748B', marginBottom: 12 },
  customRoleInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  customRoleInput: { flex: 1, height: 56, backgroundColor: '#F8FAFC', borderRadius: 16, paddingHorizontal: 20, fontSize: 16, fontFamily: 'Inter-Regular', color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  customRoleSubmitButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  companyNameInput: { width: '100%', height: 60, backgroundColor: '#F8FAFC', borderRadius: 16, paddingHorizontal: 20, fontSize: 18, fontFamily: 'Inter-Regular', color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  primaryButtonDisabled: { backgroundColor: '#CBD5E1' },
  floatingButtonContainer: { position: 'absolute', bottom: 32, left: 20, right: 20 },
  setupBenefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  setupBenefitIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  setupBenefitTitle: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#1E293B', marginBottom: 4 },
  setupBenefitDescription: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#64748B', lineHeight: 20 },
  companySizeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  companySizePill: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  companySizePillSelected: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  companySizePillText: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#1E293B' },
  companySizePillTextSelected: { color: '#3B82F6' },
  
  // Integrations Screen Styles
  integrationsGrid: { gap: 12 },
  integrationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 16 },
  integrationCardSelected: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6', borderWidth: 2 },
  integrationLogo: { fontSize: 28 },
  integrationInfo: { flex: 1 },
  integrationName: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#1E293B', marginBottom: 2 },
  integrationNameSelected: { color: '#1E40AF' },
  integrationDescription: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#64748B' },
  integrationNote: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#3B82F6', textAlign: 'center', marginTop: 24 },
  integrationCheckbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  integrationCheckboxSelected: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  integrationCardConnected: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  integrationNameConnected: { color: '#166534' },
  integrationConnectedLabel: { fontSize: 12, fontFamily: 'Inter-Medium', color: '#16A34A', marginTop: 2 },
  connectNowButton: { backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  connectNowButtonText: { fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#FFFFFF' },
  connectLaterButton: { paddingHorizontal: 12, paddingVertical: 8 },
  connectLaterButtonText: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#3B82F6' },
  connectedCheckmark: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' },
  viewAllLink: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 4 },
  viewAllLinkText: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#3B82F6' },
  integrationSearchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, gap: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  integrationSearchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter-Regular', color: '#1E293B', padding: 0 },
  tradeFilterPill: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
  tradeFilterPillSelected: { backgroundColor: '#3B82F6' },
  tradeFilterPillText: { fontSize: 13, fontFamily: 'Inter-Medium', color: '#64748B' },
  tradeFilterPillTextSelected: { color: '#FFFFFF' },
  
  // Name/Phone Screen Styles
  inputRow: { flexDirection: 'row', gap: 12 },
  inputLabel: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#64748B', marginBottom: 8 },
  onboardingInput: { height: 56, backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, fontFamily: 'Inter-Regular', color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  
  // Modern Welcome Screen Styles
  onboardingWelcomeContainer: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 24 },
  welcomeContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcomeLogoSection: { alignItems: 'center', marginBottom: 48 },
  welcomeAppLogo: { width: 80, height: 80, borderRadius: 20, marginBottom: 16 },
  welcomeAppName: { fontSize: 24, fontFamily: 'Inter-Bold', color: '#1E293B', letterSpacing: -0.5 },
  welcomeTextSection: { alignItems: 'center' },
  welcomeHeadline: { fontSize: 32, fontFamily: 'Inter-Bold', color: '#1E293B', textAlign: 'center', lineHeight: 40, letterSpacing: -0.5, marginBottom: 12 },
  welcomeTagline: { fontSize: 16, fontFamily: 'Inter-Regular', color: '#64748B', textAlign: 'center' },
  welcomeAuthSection: { paddingBottom: 60, gap: 12 },
  googleSignInButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 24, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  googleLogoContainer: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#4285F4', justifyContent: 'center', alignItems: 'center' },
  googleLogoText: { fontSize: 14, fontFamily: 'Inter-Bold', color: '#FFFFFF' },
  googleSignInText: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#1E293B' },
  emailSignInButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 24, gap: 12 },
  emailSignInText: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#1E293B' },
  termsText: { fontSize: 12, fontFamily: 'Inter-Regular', color: '#94A3B8', textAlign: 'center', lineHeight: 18, marginTop: 8 },
  termsLink: { color: '#3B82F6' },
  
  iconCircleBig: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  centerTitle: { fontSize: 24, fontFamily: 'Inter-Bold', color: '#1E293B', textAlign: 'center', marginBottom: 12 },
  centerSubtitle: { fontSize: 16, fontFamily: 'Inter-Regular', color: '#64748B', textAlign: 'center', lineHeight: 24 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bulletText: { fontSize: 16, fontFamily: 'Inter-Medium', color: '#1E293B' },
  tinyText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 12 },
  
  mockJobCard: { width: '100%', backgroundColor: 'white', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  mockJobHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mockJobTitle: { fontSize: 16, fontFamily: 'Inter-Bold', color: '#1E293B' },
  mockJobSubtitle: { fontSize: 14, color: '#64748B' },
  
  aiNoteCard: { width: '100%', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, marginTop: 32 },
  aiNoteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  aiNoteLabel: { fontSize: 14, fontFamily: 'Inter-Bold', color: '#3B82F6' },
  aiNoteRow: { flexDirection: 'row', marginBottom: 12 },
  aiNoteKey: { width: 80, fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#64748B' },
  aiNoteValue: { flex: 1, fontSize: 14, fontFamily: 'Inter-Regular', color: '#1E293B', lineHeight: 20 },
  priorityBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  priorityText: { fontSize: 12, fontFamily: 'Inter-Medium', color: '#475569' },
  
  reportPreview: { width: '100%', backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 20, marginTop: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  reportHeader: { flexDirection: 'row', alignItems: 'center' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  
  choiceCard: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  choiceIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  choiceTitle: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#1E293B', marginBottom: 4 },
  choiceSubtitle: { fontSize: 14, color: '#64748B' },
  
  // Personalized Pathways Styles
  pathwaysHeadline: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    lineHeight: 30,
    textAlign: 'left',
  },
  pathwayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    overflow: 'visible',
    position: 'relative',
  },
  pathwayCardHighlight: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  pathwayIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pathwayIconHighlight: {
    backgroundColor: '#DBEAFE',
  },
  pathwayContent: {
    flex: 1,
  },
  pathwayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  pathwayTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  pathwayTitleHighlight: {
    color: '#1E40AF',
  },
  pathwayDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
  },
  recommendedBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recommendedBadgeTop: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 1,
  },
  recommendedBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skipPathwaysButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipPathwaysText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  // Invite Team Styles
  inviteIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  inviteValueProps: {
    marginBottom: 24,
    gap: 12,
  },
  inviteValueProp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  inviteValuePropText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#334155',
    flex: 1,
  },
  inviteInputContainer: {
    gap: 12,
    marginBottom: 16,
  },
  inviteInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inviteInput: {
    flex: 1,
    height: 52,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  inviteAddButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteAddButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  importContactsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  importContactsText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  invitedMembersList: {
    marginTop: 8,
    gap: 8,
  },
  invitedMembersLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 4,
  },
  invitedMemberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  invitedMemberText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
  },
  
  // Free seats hint (compact, below roles)
  freeSeatsHint: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  freeSeatsHintText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
  },
  
  // Visual: Field ↔ Office connection
  inviteVisualContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 8,
  },
  inviteVisualSide: {
    alignItems: 'center',
    gap: 8,
  },
  inviteVisualIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteVisualLabel: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  inviteVisualArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    gap: 0,
  },
  inviteVisualArrowLine: {
    width: 24,
    height: 2,
    backgroundColor: '#E2E8F0',
  },
  inviteVisualArrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  
  // Social proof banner
  socialProofBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  purpleSocialProof: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  purpleSocialProofText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#7C3AED',
    textAlign: 'center',
    lineHeight: 18,
  },
  socialProofIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  socialProofDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  socialProofText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#166534',
    flex: 1,
    lineHeight: 18,
  },
  
  // Add role button & input
  addRoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed' as any,
  },
  addRoleButtonLabel: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  addRoleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderStyle: 'dashed',
  },
  addRoleButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  addRoleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  addRoleInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addRoleConfirmButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addRoleCancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Skip invite button
  skipInviteButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipInviteText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  
  // Role-based invite styles
  roleInviteList: {
    gap: 10,
  },
  roleInviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  roleInviteRowActive: {
    backgroundColor: '#F8FAFC',
  },
  roleInviteRowFilled: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  roleInviteRowYou: {
    backgroundColor: '#F8FAFC',
    borderWidth: 0,
  },
  roleInviteYouBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleInviteYouText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  roleInviteIconSmall: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleInviteRowLabel: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  roleInviteRowDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 3,
    lineHeight: 17,
  },
  roleInviteRowEmail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#16A34A',
    marginTop: 2,
  },
  roleInviteAddButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
  },
  roleInviteAddButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  roleInviteEditButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleInviteEditText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  roleInviteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 4,
    gap: 8,
    backgroundColor: '#F8FAFC',
  },
  roleInviteInputCompact: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleInviteContactButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  roleInviteConfirmButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Legacy styles kept for compatibility
  roleInviteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleInviteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  roleInviteIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleInviteLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  roleInviteHint: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 18,
  },
  roleInviteInput: {
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inviteSocialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
  },
  inviteSocialProofIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteSocialProofText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#166534',
    lineHeight: 18,
  },
  // Invite Bottom Sheet Styles
  inviteSheetContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  inviteSheetTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  inviteSheetSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 24,
  },
  inviteSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inviteSheetOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteSheetOptionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  inviteSheetOptionSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  inviteSheetDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  inviteSheetDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  inviteSheetDividerText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  inviteSheetInputRow: {
    marginBottom: 16,
  },
  inviteSheetInput: {
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inviteSheetButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  inviteSheetButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  inviteSheetButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  inviteSheetButtonTextDisabled: {
    color: '#94A3B8',
  },
  
  // ========================================
  // VALUE-FIRST FLOW STYLES
  // ========================================
  
  // Flow selection badge
  newBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  
  // Container & Layout
  vfContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  vfContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vfBottomSection: {
    paddingBottom: 40,
    gap: 12,
  },
  
  // Logo & Branding
  vfLogoContainer: {
    marginBottom: 32,
  },
  vfLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  
  // Hero Typography
  vfHeroTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 12,
  },
  vfHeroSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  
  // Value Props Row
  vfValueProps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  vfValueProp: {
    alignItems: 'center',
    gap: 8,
  },
  vfValueIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vfValueText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
  },
  vfValueArrow: {
    paddingHorizontal: 4,
  },
  
  // Buttons
  vfPrimaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vfPrimaryButtonText: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  vfPrimaryButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  vfSecondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  vfSecondaryButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  vfSubtext: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
  
  // Section Typography
  vfSectionTitle: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  vfSectionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  
  // Icon Circles
  vfIconCircleLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  // Feature List
  vfFeatureList: {
    marginTop: 32,
    gap: 16,
    width: '100%',
  },
  vfFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  vfFeatureText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
  },
  vfPrivacyText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
  },
  
  // Camera Screen
  vfCameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  vfCameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  vfCameraBackButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vfCameraJobTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  vfCameraJobText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  vfCameraInstructions: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  vfCameraTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  vfCameraSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  vfCameraControls: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  vfShutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  vfShutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  
  // Success Badge
  vfSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  vfSuccessBadgeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  
  // Mock Job Card
  vfMockJobCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 24,
  },
  vfMockJobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  vfMockJobIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vfMockJobTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  vfMockJobMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  vfMockJobImage: {
    width: '100%',
    height: 180,
  },
  vfMockJobFooter: {
    padding: 12,
    backgroundColor: '#F8FAFC',
  },
  vfMockJobFooterText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  
  // Aha Moment Typography
  vfAhaTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  vfAhaSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  
  // Recording UI
  vfRecordingArea: {
    marginTop: 48,
    marginBottom: 32,
    alignItems: 'center',
  },
  vfRecordingButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vfRecordingActive: {
    backgroundColor: '#EF4444',
  },
  vfRecordingStop: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  vfRecordingTime: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginTop: 20,
  },
  vfRecordingHint: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 8,
  },
  vfExamplePrompt: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vfExampleLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vfExampleText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#334155',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  
  // AI Processing
  vfAiProcessing: {
    alignItems: 'center',
  },
  vfAiProcessingIcon: {
    marginBottom: 24,
  },
  vfAiProcessingTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#7C3AED',
    marginBottom: 8,
  },
  vfAiProcessingSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  
  // AI Result Card
  vfAiResultCard: {
    width: '100%',
    backgroundColor: '#FAFBFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  vfAiResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
  },
  vfAiResultHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vfAiResultHeaderText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#7C3AED',
  },
  vfAiResultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  vfAiResultLabel: {
    width: 70,
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  vfAiResultValue: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    lineHeight: 22,
  },
  vfPriorityBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vfPriorityText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#B45309',
  },
  
  // Report Card
  vfReportCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 24,
  },
  vfReportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  vfReportLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vfReportLogoText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  vfReportCompany: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  vfReportImage: {
    width: '100%',
    height: 160,
  },
  vfReportBody: {
    padding: 16,
  },
  vfReportAddress: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  vfReportDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 4,
  },
  vfReportDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  vfReportNoteLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  vfReportNoteText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#334155',
    lineHeight: 22,
  },
  
  // Setup Progress Indicator
  vfSetupProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  vfSetupDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vfSetupDotActive: {
    backgroundColor: '#7C3AED',
  },
  vfSetupDotComplete: {
    backgroundColor: '#10B981',
  },
  vfSetupLine: {
    width: 40,
    height: 3,
    backgroundColor: '#E2E8F0',
  },
  vfSetupLineComplete: {
    backgroundColor: '#10B981',
  },
  
  // Setup Typography
  vfSetupTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  vfSetupSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  // Form Inputs
  vfInputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  vfInputHint: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 12,
  },
  vfTextInput: {
    height: 56,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  
  // Trade Selection Grid
  vfTradeGrid: {
    gap: 10,
  },
  vfTradePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vfTradePillSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  vfTradePillText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
  },
  vfTradePillTextSelected: {
    color: '#1E40AF',
  },
  vfSeeMoreTrades: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
  },
  vfSeeMoreTradesText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  
  // Size Selection Grid
  vfSizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vfSizePill: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vfSizePillSelected: {
    backgroundColor: '#F3E8FF',
    borderColor: '#7C3AED',
  },
  vfSizePillText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  vfSizePillTextSelected: {
    color: '#7C3AED',
  },
  
  // Floating Button
  vfFloatingButton: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  },
  
  // Team Invite
  vfInviteInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  vfInviteAddBtn: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  vfInviteValueProp: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 24,
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  vfInviteValueText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B21A8',
    lineHeight: 20,
  },
  
  // Success Screen
  vfSuccessAnimation: {
    marginBottom: 32,
  },
  vfSuccessCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vfSuccessTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  vfSuccessSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  vfNextSteps: {
    width: '100%',
    marginTop: 32,
  },
  vfNextStepsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  vfNextStepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  vfNextStepIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vfNextStepTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  vfNextStepSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 2,
  },
});
