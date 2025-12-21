import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, useWindowDimensions, Animated, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Camera, MapPin, Users, Check, ChevronRight, ChevronLeft, Mail, Mic, FileText, Sparkles, ArrowRight, HardHat, Hammer, Wrench, Zap, Ruler, Briefcase, Search, Paintbrush, Home, Truck, Trees, Droplets, Wind, Flame, Shield, Construction, Building2, Warehouse, PaintBucket, Shovel, CircleDot, Scissors, Snowflake, Sun, Leaf, Grid3X3, Box, Columns, Fence } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [onboardingFlow, setOnboardingFlow] = useState<'magic' | 'contextual' | null>(null);
  
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
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState('');
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
      setContextualStep(16); // Go to AI Result
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
          <Text style={styles.welcomeAppName}>CompanyCam</Text>
        </View>
        
        <View style={styles.welcomeTextSection}>
          <Text style={styles.welcomeHeadline}>Do good work.{'\n'}Capture it.{'\n'}Grow your business.</Text>
          <Text style={styles.welcomeTagline}>The #1 most used app for contractors</Text>
        </View>
      </View>
      
      <View style={styles.welcomeAuthSection}>
        <TouchableOpacity 
          style={styles.googleSignInButton}
          onPress={() => setContextualStep(1)}
        >
          <View style={styles.googleLogoContainer}>
            <Text style={styles.googleLogoText}>G</Text>
          </View>
          <Text style={styles.googleSignInText}>Continue with Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.emailSignInButton}
          onPress={() => setContextualStep(1)}
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
        <Text style={[styles.welcomeTitle, { marginBottom: 32 }]}>Let's get this set up just for you</Text>
        
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
    const isValid = firstName.trim() && lastName.trim() && phoneNumber.trim();
    
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
          <Text style={[styles.welcomeTitle, { textAlign: 'left', marginBottom: 12 }]}>
            First, let's get your info
          </Text>
          <Text style={[styles.welcomeSubtitle, { textAlign: 'left', marginBottom: 32 }]}>
            We'll use this to verify your account and keep it secure.
          </Text>
          
          <View style={{ gap: 16 }}>
            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>First name</Text>
                <TextInput
                  style={styles.onboardingInput}
                  placeholder="John"
                  placeholderTextColor="#94A3B8"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoComplete="given-name"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Last name</Text>
                <TextInput
                  style={styles.onboardingInput}
                  placeholder="Smith"
                  placeholderTextColor="#94A3B8"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoComplete="family-name"
                />
              </View>
            </View>
            
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
              />
            </View>
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
              onPress={() => setContextualStep(4)}
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
            onPress={() => setContextualStep(9)}
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
                setContextualStep(5);
              }
            }}
          />
        </View>
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={[styles.primaryButton, !companyName.trim() && styles.primaryButtonDisabled]} 
            onPress={() => setContextualStep(5)}
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
      setTimeout(() => setContextualStep(6), 300);
    };

    return (
      <View style={styles.contentContainer}>
        <View style={styles.screenHeader}>
          {renderBackButton()}
        </View>
        <View style={{ flex: 1, paddingTop: 20 }}>
          <Text style={[styles.welcomeTitle, { textAlign: 'left', marginBottom: 12 }]}>How many people work at {companyName || 'your company'}?</Text>
          <Text style={[styles.welcomeSubtitle, { textAlign: 'left', marginBottom: 32 }]}>
            A 5-person crew and a 500-person company work very differently. We'll set things up to match how you operate.
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
      // All roles now go to personalized pathways screen (step 7)
      setTimeout(() => setContextualStep(7), 300);
    };

    const handleCustomRoleSubmit = () => {
      if (customRole.trim()) {
        setSelectedRole('custom');
        // All roles go to personalized pathways
        setTimeout(() => setContextualStep(7), 300);
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
    
    // Base pathways that vary by role
    const pathwaysByRole: Record<string, Array<{ id: string; title: string; description: string; icon: React.ReactNode; priority: 'high' | 'medium' }>> = {
      'owner': [
        { id: 'add-team', title: 'Add your team', description: 'Get your crew on CompanyCam so everyone can document work', icon: <Users size={24} color="#10B981" />, priority: 'high' },
        { id: 'connect-software', title: 'Connect your software', description: 'Sync with your CRM, invoicing, or scheduling tools', icon: <Zap size={24} color="#F59E0B" />, priority: 'high' },
        { id: 'ai-walkthrough', title: 'Try AI Walkthrough', description: 'Turn voice notes into organized documentation instantly', icon: <Sparkles size={24} color="#7C3AED" />, priority: 'medium' },
        { id: 'first-project', title: 'Create your first project', description: 'Set up a job and take your first photos', icon: <Camera size={24} color="#3B82F6" />, priority: 'medium' },
      ],
      'sales': [
        { id: 'portfolio', title: 'Build your portfolio', description: 'Showcase your best work to win more jobs', icon: <Camera size={24} color="#3B82F6" />, priority: 'high' },
        { id: 'share-reports', title: 'Learn to share reports', description: 'Send professional updates to customers in seconds', icon: <FileText size={24} color="#10B981" />, priority: 'high' },
        { id: 'connect-software', title: 'Connect your CRM', description: 'Sync with your sales tools automatically', icon: <Zap size={24} color="#F59E0B" />, priority: 'medium' },
        { id: 'first-project', title: 'Document a job site', description: 'Take photos that help close the deal', icon: <MapPin size={24} color="#EF4444" />, priority: 'medium' },
      ],
      'marketing': [
        { id: 'portfolio', title: 'Build your portfolio', description: 'Create a stunning showcase of your company\'s work', icon: <Camera size={24} color="#3B82F6" />, priority: 'high' },
        { id: 'before-after', title: 'Capture before & afters', description: 'Document transformations for social media and ads', icon: <Sparkles size={24} color="#A855F7" />, priority: 'high' },
        { id: 'share-reports', title: 'Create shareable reports', description: 'Generate content your customers will love', icon: <FileText size={24} color="#10B981" />, priority: 'medium' },
        { id: 'first-project', title: 'Start documenting', description: 'Capture content for your next campaign', icon: <Camera size={24} color="#F59E0B" />, priority: 'medium' },
      ],
      'admin': [
        { id: 'add-team', title: 'Set up your team', description: 'Add users and organize them into groups', icon: <Users size={24} color="#10B981" />, priority: 'high' },
        { id: 'connect-software', title: 'Connect your tools', description: 'Sync with accounting, scheduling, and more', icon: <Zap size={24} color="#F59E0B" />, priority: 'high' },
        { id: 'checklists', title: 'Set up checklists', description: 'Create templates for consistent documentation', icon: <FileText size={24} color="#3B82F6" />, priority: 'medium' },
        { id: 'permissions', title: 'Configure permissions', description: 'Control who can see and do what', icon: <Shield size={24} color="#7C3AED" />, priority: 'medium' },
      ],
      'operations': [
        { id: 'checklists', title: 'Create checklists', description: 'Build inspection and quality templates', icon: <FileText size={24} color="#3B82F6" />, priority: 'high' },
        { id: 'add-team', title: 'Add your crews', description: 'Get everyone documenting from day one', icon: <Users size={24} color="#10B981" />, priority: 'high' },
        { id: 'ai-walkthrough', title: 'Try AI Walkthrough', description: 'Voice-to-notes for faster site documentation', icon: <Sparkles size={24} color="#7C3AED" />, priority: 'medium' },
        { id: 'connect-software', title: 'Connect project tools', description: 'Sync with your management software', icon: <Zap size={24} color="#F59E0B" />, priority: 'medium' },
      ],
      'field-crew': [
        { id: 'first-photo', title: 'Take your first photo', description: 'Learn how CompanyCam organizes your work', icon: <Camera size={24} color="#3B82F6" />, priority: 'high' },
        { id: 'ai-walkthrough', title: 'Try voice notes', description: 'Talk instead of typing — AI handles the rest', icon: <Mic size={24} color="#7C3AED" />, priority: 'high' },
        { id: 'location', title: 'Enable location', description: 'Auto-organize photos by job site', icon: <MapPin size={24} color="#10B981" />, priority: 'medium' },
        { id: 'explore', title: 'Explore the app', description: 'See what you can do with CompanyCam', icon: <Sparkles size={24} color="#F59E0B" />, priority: 'medium' },
      ],
    };

    return pathwaysByRole[selectedRole || ''] || pathwaysByRole['field-crew'];
  };

  const handlePathwaySelect = (pathwayId: string) => {
    switch (pathwayId) {
      case 'add-team':
        // Go to a simplified team invite flow or finish onboarding
        handleFinishOnboarding();
        break;
      case 'connect-software':
        // Show simplified integrations then finish
        setContextualStep(8); // integrations step
        break;
      case 'ai-walkthrough':
        // Jump to voice note demo
        setContextualStep(15); // voice note step
        break;
      case 'first-project':
      case 'first-photo':
        // Jump to camera/location flow
        setContextualStep(9); // location permission
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
        setContextualStep(9);
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
    
    // Build personalized headline
    let headline = `Great! As a ${roleLabel}`;
    if (tradeLabel && tradeLabel !== '') {
      headline += ` in ${tradeLabel}`;
    }
    headline += `, here's how to get the most out of CompanyCam.`;

    return (
      <View style={styles.contentContainer}>
        <View style={styles.screenHeader}>
          {renderBackButton()}
        </View>
        <View style={{ flex: 1, paddingTop: 8 }}>
          <Text style={[styles.pathwaysHeadline, { marginBottom: 8 }]}>
            {headline}
          </Text>
          <Text style={[styles.welcomeSubtitle, { textAlign: 'left', marginBottom: 24 }]}>
            Pick one to get started — you can always explore the rest later.
          </Text>
          
          <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {pathways.map((pathway, index) => (
              <TouchableOpacity
                key={pathway.id}
                style={[
                  styles.pathwayCard,
                  index === 0 && styles.pathwayCardHighlight
                ]}
                onPress={() => handlePathwaySelect(pathway.id)}
              >
                <View style={[
                  styles.pathwayIconContainer,
                  index === 0 && styles.pathwayIconHighlight
                ]}>
                  {pathway.icon}
                </View>
                <View style={styles.pathwayContent}>
                  <View style={styles.pathwayTitleRow}>
                    <Text style={[
                      styles.pathwayTitle,
                      index === 0 && styles.pathwayTitleHighlight
                    ]}>
                      {pathway.title}
                    </Text>
                    {index === 0 && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedBadgeText}>Recommended</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.pathwayDescription}>{pathway.description}</Text>
                </View>
                <ChevronRight size={20} color={index === 0 ? '#3B82F6' : '#94A3B8'} />
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
          // Go back to personalized pathways (step 7)
          setContextualStep(7);
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
        <TouchableOpacity style={styles.primaryButton} onPress={() => setContextualStep(10)}>
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
        <TouchableOpacity style={styles.primaryButton} onPress={() => setContextualStep(11)}>
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
        <TouchableOpacity style={styles.primaryButton} onPress={() => setContextualStep(12)}>
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
          onPress={() => setContextualStep(13)}
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
        <TouchableOpacity style={styles.primaryButton} onPress={() => setContextualStep(14)}>
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
        <TouchableOpacity style={styles.primaryButton} onPress={() => setContextualStep(16)}>
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
        <TouchableOpacity style={styles.primaryButton} onPress={() => setContextualStep(17)}>
          <Text style={styles.primaryButtonText}>Share with Someone</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setContextualStep(17)}>
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
        <TouchableOpacity style={styles.primaryButton} onPress={() => setContextualStep(18)}>
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

  const renderContextualFlow = () => {
    switch (contextualStep) {
      case 0: return renderContextualWelcome();
      case 1: return renderCustomSetupIntro();
      case 2: return renderNamePhone();
      case 3: return renderTradeSelector();
      case 4: return renderCompanyName();
      case 5: return renderCompanySize();
      case 6: return renderRoleSelector();
      case 7: return renderPersonalizedPathways();
      case 8: return renderIntegrations();
      case 9: return renderLocationPermission();
      case 10: return renderLocationSuccess();
      case 11: return renderCameraPermission();
      case 12: return renderFirstCapture();
      case 13: return renderAutoOrganizedJob();
      case 14: return renderVoiceNote();
      case 15: return renderAiNoteResult();
      case 16: return renderReportPreview();
      case 17: return renderAccountCreation();
      case 18: return renderFirstRealJobChoice();
      default: return renderContextualWelcome();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
  integrationLogo: { fontSize: 28 },
  integrationInfo: { flex: 1 },
  integrationName: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#1E293B', marginBottom: 2 },
  integrationDescription: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#64748B' },
  integrationNote: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#3B82F6', textAlign: 'center', marginTop: 24 },
  
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
});
