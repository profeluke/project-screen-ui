import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Linking,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Monitor,
  MapPin,
  Image as ImageIcon,
  Check,
  Star,
  ChevronRight,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DemoPortfolioScreen from './DemoPortfolioScreen';

const { width: screenWidth } = Dimensions.get('window');

interface PortfolioScreenProps {
  onClose: () => void;
}

export default function PortfolioScreen({ onClose }: PortfolioScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<'All' | 'Residential' | 'Commercial'>('All');
  const [showDemoPortfolio, setShowDemoPortfolio] = useState(false);
  const portfolioScrollRef = useRef<ScrollView>(null);

  const portfolioExamples = [
    {
      id: '1',
      companyName: "Reisenberg's Lawn & Landscape",
      rating: 4.9,
      showcases: 50,
      location: 'Portland, OR',
      image: require('../assets/images/project-family-home.jpg'),
      url: undefined,
    },
    {
      id: '2',
      companyName: 'Windura Construction',
      rating: 5.0,
      showcases: 39,
      location: 'Denver, CO',
      image: require('../assets/images/project-downtown-office.jpg'),
      url: undefined,
    },
    {
      id: '3',
      companyName: 'Coastal Builders & Design',
      rating: 4.8,
      showcases: 87,
      location: 'San Diego, CA',
      image: require('../assets/images/project-beach-house.jpg'),
      url: undefined,
    },
    {
      id: '4',
      companyName: 'American Home Contractors',
      rating: 4.9,
      showcases: 144,
      location: 'Fulton, MD',
      image: require('../assets/images/project-modern-loft.jpg'),
      url: 'https://trusty.app/companies/american-home-contractors',
    },
    {
      id: '5',
      companyName: 'Sunset Ridge Renovations',
      rating: 5.0,
      showcases: 62,
      location: 'Phoenix, AZ',
      image: require('../assets/images/project-sunset-villa.jpg'),
      url: undefined,
    },
    {
      id: '6',
      companyName: 'Industrial Craftworks',
      rating: 4.7,
      showcases: 103,
      location: 'Chicago, IL',
      image: require('../assets/images/project-warehouse.jpg'),
      url: undefined,
    },
    {
      id: '7',
      companyName: 'Premier Property Solutions',
      rating: 4.9,
      showcases: 78,
      location: 'Austin, TX',
      image: require('../assets/images/hero-project.jpg'),
      url: undefined,
    },
  ];

  // Scroll to center card on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (portfolioScrollRef.current) {
        const cardWidth = screenWidth * 0.6;
        const gap = 16;
        const leftPadding = 24;
        const middleCardIndex = 3; // Index of the middle card (American Home Contractors)
        
        // Calculate scroll position to center the middle card
        const scrollX = leftPadding + (cardWidth + gap) * middleCardIndex + cardWidth / 2 - screenWidth / 2;
        
        portfolioScrollRef.current.scrollTo({ x: scrollX, y: 0, animated: true });
      }
    }, 100); // Small delay to ensure layout is complete

    return () => clearTimeout(timer);
  }, []);

  const handlePortfolioPress = (url?: string) => {
    if (url) {
      Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Show your work.{'\n'}Win more jobs.</Text>
          <Text style={styles.heroSubtitle}>
            Build a portfolio of your best work using photos you already have.
          </Text>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaButtonSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => setShowDemoPortfolio(true)}
          >
            <Text style={styles.primaryButtonText}>Get My Portfolio & Map</Text>
          </TouchableOpacity>
          <Text style={styles.timeEstimate}>(Only takes a minute!)</Text>
        </View>

        {/* Real Portfolios Section - Horizontal Scroll */}
        <View style={styles.examplesSection}>
          <ScrollView 
            ref={portfolioScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.portfolioScrollContent}
          >
            {portfolioExamples.map((portfolio) => (
              <TouchableOpacity 
                key={portfolio.id} 
                style={styles.portfolioCardHorizontal}
                onPress={() => handlePortfolioPress(portfolio.url)}
                activeOpacity={portfolio.url ? 0.7 : 1}
              >
                <Image source={portfolio.image} style={styles.portfolioImageHorizontal} />
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.7)']}
                  locations={[0, 0.5, 1]}
                  style={styles.portfolioOverlay}
                >
                  <View style={styles.portfolioInfo}>
                    <View style={styles.ratingContainer}>
                      <Star size={16} color="#FCD34D" fill="#FCD34D" />
                      <Text style={styles.ratingText}>{portfolio.rating}</Text>
                    </View>
                    <Text style={styles.companyName}>{portfolio.companyName}</Text>
                    <Text style={styles.locationShowcasesText}>
                      {portfolio.location} • {portfolio.showcases} Showcases
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresCard}>
            <Text style={styles.featuresCardTitle}>What's included</Text>
            <Text style={styles.featuresCardSubtitle}>
              Everything you need to showcase your work
            </Text>

            {/* Portfolio Site */}
            <View style={styles.featureRow}>
              <View style={styles.featureIconContainer}>
                <Monitor size={24} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Portfolio Site</Text>
                <Text style={styles.featureDescription}>
                  Professional landing page to show off your work
                </Text>
              </View>
            </View>

            {/* Map Embed */}
            <View style={styles.featureRow}>
              <View style={styles.featureIconContainer}>
                <MapPin size={24} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Map Embed</Text>
                <Text style={styles.featureDescription}>
                  Interactive map to build local credibility
                </Text>
              </View>
            </View>

            {/* Gallery Embed */}
            <View style={[styles.featureRow, { marginBottom: 0 }]}>
              <View style={styles.featureIconContainer}>
                <ImageIcon size={24} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Gallery Embed</Text>
                <Text style={styles.featureDescription}>
                  Add your project gallery to any website
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaTitle}>Ready to showcase your work?</Text>
            <Text style={styles.ctaSubtitle}>
              Start building your portfolio in minutes
            </Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Get Started</Text>
              <ChevronRight size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Demo Portfolio Modal */}
      <Modal
        visible={showDemoPortfolio}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <DemoPortfolioScreen onClose={() => setShowDemoPortfolio(false)} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  ctaButtonSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 72,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  primaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  timeEstimate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 16,
  },
  featuresCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featuresCardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1E293B',
    marginBottom: 8,
  },
  featuresCardSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#64748B',
    marginBottom: 28,
    lineHeight: 22,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 24,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  featureContent: {
    flex: 1,
    paddingTop: 2,
  },
  featureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: '#1E293B',
    marginBottom: 4,
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#64748B',
    lineHeight: 21,
  },
  examplesSection: {
    paddingVertical: 24,
  },
  portfolioScrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  portfolioCardHorizontal: {
    borderRadius: 16,
    overflow: 'hidden',
    width: screenWidth * 0.6,
    height: 352,
  },
  portfolioImageHorizontal: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  portfolioOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 20,
  },
  portfolioInfo: {
    gap: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  ratingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1E293B',
  },
  companyName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  locationShowcasesText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#E2E8F0',
    marginTop: 4,
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  ctaGradient: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#8B5CF6',
  },
});
