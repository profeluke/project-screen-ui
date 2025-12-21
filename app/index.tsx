import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, Image, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreenModule from 'expo-splash-screen';
import { Contact, Plus, Camera, MessageCircle, DollarSign, Sparkles, FileEdit, Images, ClipboardList, ScanText, AudioLines, Mic, FilePlus, Calendar, ListChecks, Search } from 'lucide-react-native';

import Header from '../components/Header';
import ScanInterstitialScreen from '../screens/ScanInterstitialScreen';
import SearchCreateScreen from '../screens/SearchCreateScreen';
import SearchPageScreen from '../screens/SearchPageScreen';
import AudioRecordingModal from '../components/AudioRecordingModal';
import CameraScreen from '../screens/CameraScreen';
import HomeScreen from '../screens/HomeScreen';

// Keep the splash screen visible until we're ready
SplashScreenModule.preventAutoHideAsync();

const photos = [
  require('../assets/images/thumb-downtown-office.jpg'),
  require('../assets/images/thumb-sunset-villa.jpg'),
  require('../assets/images/thumb-modern-loft.jpg'),
  require('../assets/images/thumb-family-home.jpg'),
  require('../assets/images/thumb-warehouse.jpg'),
  require('../assets/images/thumb-beach-house.jpg')
];

export default function ProjectScreen() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });
  
  const [showScanInterstitial, setShowScanInterstitial] = useState(false);
  const [showSearchScreen, setShowSearchScreen] = useState(false);
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showHomeScreen, setShowHomeScreen] = useState(true);

  const handleCreatePress = () => {
    console.log('Create pressed');
    // TODO: Open create modal
  };

  const handleCameraPress = () => {
    setShowCamera(true);
  };

  const handleAudioPress = () => {
    setShowAudioModal(true);
  };

  const handleSearchPress = () => {
    setShowSearchPage(true);
  };
  
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreenModule.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        {showHomeScreen ? (
          <HomeScreen />
        ) : (
          <ProjectContent 
            handleCreatePress={handleCreatePress}
            handleCameraPress={handleCameraPress}
            handleAudioPress={handleAudioPress}
            handleSearchPress={handleSearchPress}
            setShowHomeScreen={setShowHomeScreen}
            showScanInterstitial={showScanInterstitial}
            setShowScanInterstitial={setShowScanInterstitial}
            showSearchScreen={showSearchScreen}
            setShowSearchScreen={setShowSearchScreen}
            showSearchPage={showSearchPage}
            setShowSearchPage={setShowSearchPage}
            showAudioModal={showAudioModal}
            setShowAudioModal={setShowAudioModal}
            showCamera={showCamera}
            setShowCamera={setShowCamera}
          />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ProjectContent({ 
  handleCreatePress, 
  handleCameraPress, 
  handleAudioPress, 
  handleSearchPress, 
  setShowHomeScreen,
  showScanInterstitial,
  setShowScanInterstitial,
  showSearchScreen,
  setShowSearchScreen,
  showSearchPage,
  setShowSearchPage,
  showAudioModal,
  setShowAudioModal,
  showCamera,
  setShowCamera
}: {
  handleCreatePress: () => void;
  handleCameraPress: () => void;
  handleAudioPress: () => void;
  handleSearchPress: () => void;
  setShowHomeScreen: (value: boolean) => void;
  showScanInterstitial: boolean;
  setShowScanInterstitial: (value: boolean) => void;
  showSearchScreen: boolean;
  setShowSearchScreen: (value: boolean) => void;
  showSearchPage: boolean;
  setShowSearchPage: (value: boolean) => void;
  showAudioModal: boolean;
  setShowAudioModal: (value: boolean) => void;
  showCamera: boolean;
  setShowCamera: (value: boolean) => void;
}) {
  const insets = useSafeAreaInsets();
  
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Header onBackPress={() => setShowHomeScreen(true)} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Image
            source={require('../assets/images/hero-project.jpg')}
            style={styles.heroImage}
          />
          
          <View style={styles.projectInfo}>
            <Text style={styles.projectTitle}>Oakridge Residence</Text>
            <Text style={styles.projectAddress}>1234 Maple Avenue, Beverly Hills, CA 90210</Text>
            
            <View style={styles.contactsContainer}>
              <TouchableOpacity style={styles.contactLink}>
                <View style={styles.contactIconContainer}>
                  <Contact size={14} color="#64748B" />
                </View>
                <Text style={styles.contactLinkText}>Sarah Anderson</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactLink}>
                <View style={styles.contactIconContainer}>
                  <Contact size={14} color="#64748B" />
                </View>
                <Text style={styles.contactLinkText}>Bob Anderson</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.photoScrollContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoScroll}
              >
                {photos.map((photo, index) => (
                  <TouchableOpacity key={index} style={styles.photoThumbnail}>
                    <Image 
                      source={photo} 
                      style={styles.thumbnailImage}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Floating Action Bar */}
      <View style={[
        styles.floatingActionBar, 
        { 
          bottom: Math.max(insets.bottom + 16, 32)
        }
      ]}>
        <View style={styles.actionBarContainer}>
          <TouchableOpacity style={styles.iconMenuButton} onPress={handleCreatePress}>
            <Plus size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconMenuButton} onPress={() => console.log('Dollar sign pressed')}>
            <DollarSign size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraIconMenuButton} onPress={handleCameraPress}>
            <Camera size={32} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconMenuButton} onPress={handleAudioPress}>
            <AudioLines size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconMenuButton} onPress={handleSearchPress}>
            <Search size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showScanInterstitial}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <ScanInterstitialScreen 
          onContinue={() => setShowScanInterstitial(false)}
        />
      </Modal>

      <Modal
        visible={showSearchScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <SearchCreateScreen 
          onClose={() => setShowSearchScreen(false)}
        />
      </Modal>

      <Modal
        visible={showSearchPage}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <SearchPageScreen onClose={() => setShowSearchPage(false)} />
      </Modal>

      <AudioRecordingModal
        visible={showAudioModal}
        onClose={() => setShowAudioModal(false)}
        initialState="idle"
        title="Notes"
      />

      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <CameraScreen onClose={() => setShowCamera(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for floating action bar
  },
  content: {
    alignItems: 'center',
    paddingTop: 16,
  },
  heroImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  projectInfo: {
    alignItems: 'center',
    marginTop: 16,
    // paddingHorizontal: 16,
  },
  projectTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  projectAddress: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#64748B',
    marginBottom: 0,
    textAlign: 'center',
  },
  contactsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  contactLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  contactLinkText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#64748B',
  },
  floatingActionBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#3B82F6', // Blue background as requested
    borderRadius: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  actionBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  iconMenuButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Slightly transparent white for blue background
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  cameraIconMenuButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF', // White background for contrast on blue FAB
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  photoScrollContainer: {
    marginTop: 20,
    marginBottom: 20,
    height: 140,
    width: '100%',
  },
  photoScroll: {
    paddingTop: 12,
    paddingBottom: 20,
    paddingLeft: 16,
    gap: 12,
  },
  photoThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

});