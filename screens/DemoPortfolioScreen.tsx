import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheet, { BottomSheetView, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import {
  X,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  MessageSquare,
  Bot,
  Star,
  Share,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import KitchenProjectsScreen from './KitchenProjectsScreen';
import CamAIIcon from '../components/CamAIIcon';

const { width: screenWidth } = Dimensions.get('window');

interface DemoPortfolioScreenProps {
  onClose: () => void;
}

type TabType = 'Our Work' | 'Our Team' | 'Reviews' | 'Service Areas' | 'Certifications';

export default function DemoPortfolioScreen({ onClose }: DemoPortfolioScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<TabType>('Our Work');
  const [showKitchenProjects, setShowKitchenProjects] = useState(false);
  const contactBottomSheetRef = useRef<BottomSheet>(null);

  const handleCategoryPress = (categoryId: string) => {
    console.log('Category pressed:', categoryId);
    if (categoryId === '1') {
      setShowKitchenProjects(true);
    }
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
    />
  );

  const tabs: TabType[] = ['Our Work', 'Our Team', 'Reviews', 'Service Areas', 'Certifications'];

  const repInfo = {
    name: 'Sarah Williams',
    role: 'Your Contact',
    image: { uri: 'https://randomuser.me/api/portraits/women/44.jpg' },
  };

  const companyInfo = {
    name: 'White Castle Roofing',
    logo: require('../assets/images/wcr-favicon.webp'),
    address: '5851 Saltillo Road, Lincoln, NE 68516',
    phone: '(555) 123-4567',
    email: 'info@whitecastleroofing.com',
    website: 'whitecastleroofing.com',
  };

  const teamMembers = [
    { id: '1', name: 'David Chen', role: 'Owner', image: { uri: 'https://randomuser.me/api/portraits/men/32.jpg' }, height: 280 },
    { id: '2', name: 'Sarah Williams', role: 'Project Manager', image: { uri: 'https://randomuser.me/api/portraits/women/44.jpg' }, height: 240 },
    { id: '3', name: 'Mike Johnson', role: 'Lead Contractor', image: { uri: 'https://randomuser.me/api/portraits/men/54.jpg' }, height: 300 },
    { id: '4', name: 'Emily Davis', role: 'Designer', image: { uri: 'https://randomuser.me/api/portraits/women/68.jpg' }, height: 260 },
    { id: '5', name: 'James Wilson', role: 'Foreman', image: { uri: 'https://randomuser.me/api/portraits/men/86.jpg' }, height: 220 },
    { id: '6', name: 'Lisa Martinez', role: 'Estimator', image: { uri: 'https://randomuser.me/api/portraits/women/22.jpg' }, height: 290 },
  ];

  const portfolioCategories = [
    {
      id: 'map',
      name: 'Project Map',
      count: 88,
      image: require('../assets/images/mapwithpiczoomedout.png'),
      isMap: true,
    },
    {
      id: '1',
      name: 'Kitchen Remodels',
      count: 24,
      image: require('../assets/images/project-family-home.jpg'),
      rating: 5,
    },
    {
      id: '2',
      name: 'Bathroom Renovations',
      count: 18,
      image: require('../assets/images/project-modern-loft.jpg'),
      rating: 5,
    },
    {
      id: '3',
      name: 'Exterior Work',
      count: 31,
      image: require('../assets/images/project-beach-house.jpg'),
      rating: 5,
    },
    {
      id: '4',
      name: 'Commercial Projects',
      count: 15,
      image: require('../assets/images/project-downtown-office.jpg'),
      rating: 5,
    },
  ];

  const certifications = [
    {
      id: '1',
      title: 'Licensed General Contractor',
      issuer: 'State of Nebraska',
      license: 'GC-45821',
      issued: '2010',
    },
    {
      id: '2',
      title: 'Certified Remodeling Professional',
      issuer: 'National Association of Home Builders',
      license: 'CRP-9342',
      issued: '2015',
    },
    {
      id: '3',
      title: 'EPA Lead-Safe Certified',
      issuer: 'Environmental Protection Agency',
      license: 'NAT-F159824-1',
      issued: '2018',
    },
    {
      id: '4',
      title: 'OSHA 30-Hour Construction Safety',
      issuer: 'Occupational Safety & Health Admin',
      license: 'Certified',
      issued: '2019',
    },
    {
      id: '5',
      title: 'Energy Star Certified Contractor',
      issuer: 'U.S. Department of Energy',
      license: 'ES-2024-1158',
      issued: '2020',
    },
    {
      id: '6',
      title: 'Master Roofer Certification',
      issuer: 'National Roofing Contractors Association',
      license: 'MRC-8412',
      issued: '2012',
    },
  ];


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.shareButton}>
            <Share size={20} color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => contactBottomSheetRef.current?.snapToIndex(0)}
          >
            <Text style={styles.contactButtonText}>Call or Text</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Company Logo and Info */}
        <View style={styles.topSection}>
          {/* Floating Company Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image source={companyInfo.logo} style={styles.logo} />
            </View>
          </View>

          {/* Company Info - Centered */}
          <View style={styles.companyInfoSection}>
            <Text style={styles.companyName}>{companyInfo.name}</Text>
            
            {/* Address */}
            <View style={styles.addressContainer}>
              <MapPin size={16} color="#64748B" />
              <Text style={styles.addressText}>{companyInfo.address}</Text>
            </View>
          </View>
        </View>

        {/* AI Search Bar - Full Width */}
        <View style={styles.searchBarContainer}>
          <TouchableOpacity style={styles.aiSearchBarFull}>
            <CamAIIcon size={20} glyphColor="#7C3AED" />
            <Text style={styles.aiSearchText}>Search or Ask AI Anything...</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabPill,
                  selectedTab === tab && styles.tabPillActive,
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[
                  styles.tabPillText,
                  selectedTab === tab && styles.tabPillTextActive,
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Our Work Section */}
        {selectedTab === 'Our Work' && (
          <View style={styles.portfolioContent}>
            <View style={styles.masonryGrid}>
              <View style={styles.masonryGridColumn}>
                {portfolioCategories.filter((_, index) => index % 2 === 0).map((category) => (
                  <TouchableOpacity 
                    key={category.id} 
                    style={styles.categoryCardMasonry}
                    onPress={() => handleCategoryPress(category.id)}
                    activeOpacity={0.8}
                  >
                    <Image source={category.image} style={styles.categoryImageMasonry} />
                    <LinearGradient
                      colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.4)']}
                      style={styles.categoryOverlay}
                    >
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <View style={styles.categoryMetadata}>
                        {category.rating && (
                          <View style={styles.categoryRating}>
                            <Text style={styles.categoryRatingNumber}>{category.rating}</Text>
                            <Star size={10} color="#FCD34D" fill="#FCD34D" />
                          </View>
                        )}
                        <Text style={styles.categoryCount}>{category.count} Projects</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.masonryGridColumn}>
                {portfolioCategories.filter((_, index) => index % 2 === 1).map((category) => (
                  <TouchableOpacity 
                    key={category.id} 
                    style={styles.categoryCardMasonry}
                    onPress={() => handleCategoryPress(category.id)}
                    activeOpacity={0.8}
                  >
                    <Image source={category.image} style={styles.categoryImageMasonry} />
                    <LinearGradient
                      colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.4)']}
                      style={styles.categoryOverlay}
                    >
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <View style={styles.categoryMetadata}>
                        {category.rating && (
                          <View style={styles.categoryRating}>
                            <Text style={styles.categoryRatingNumber}>{category.rating}</Text>
                            <Star size={10} color="#FCD34D" fill="#FCD34D" />
                          </View>
                        )}
                        <Text style={styles.categoryCount}>{category.count} Projects</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Our Team Section */}
        {selectedTab === 'Our Team' && (
          <View style={styles.peopleSection}>
            <Text style={styles.sectionTitlePadded}>Meet Our Team</Text>
            <View style={styles.teamMasonryGrid}>
              <View style={styles.teamMasonryColumn}>
                {teamMembers.filter((_, index) => index % 2 === 0).map((member) => (
                  <TouchableOpacity 
                    key={member.id} 
                    style={[styles.teamCard, { height: member.height }]}
                    activeOpacity={0.8}
                  >
                    <Image source={member.image} style={styles.teamCardImage} />
                    <LinearGradient
                      colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.6)']}
                      style={styles.teamCardOverlay}
                    >
                      <Text style={styles.teamCardName}>{member.name}</Text>
                      <Text style={styles.teamCardRole}>{member.role}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.teamMasonryColumn}>
                {teamMembers.filter((_, index) => index % 2 === 1).map((member) => (
                  <TouchableOpacity 
                    key={member.id} 
                    style={[styles.teamCard, { height: member.height }]}
                    activeOpacity={0.8}
                  >
                    <Image source={member.image} style={styles.teamCardImage} />
                    <LinearGradient
                      colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.6)']}
                      style={styles.teamCardOverlay}
                    >
                      <Text style={styles.teamCardName}>{member.name}</Text>
                      <Text style={styles.teamCardRole}>{member.role}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Reviews Section */}
        {selectedTab === 'Reviews' && (
          <View style={styles.reviewsTabSection}>
            <Text style={styles.sectionTitle}>What Our Clients Say</Text>
            <Text style={styles.aboutText}>
              We are a family-owned business dedicated to bringing your vision to life. With over 15 years of experience in residential and commercial construction, we take pride in delivering exceptional quality and customer service.
            </Text>
            <Text style={styles.aboutText}>
              Our team of skilled craftsmen and designers work closely with you from concept to completion, ensuring every detail exceeds your expectations.
            </Text>
          </View>
        )}

        {/* Service Areas Section */}
        {selectedTab === 'Service Areas' && (
          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Our Services</Text>
            <View style={styles.servicesList}>
              {[
                'Kitchen & Bathroom Remodeling',
                'Home Additions & Extensions',
                'Exterior Renovations',
                'Commercial Build-Outs',
                'Custom Carpentry',
                'Painting & Finishing',
              ].map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <View style={styles.serviceBullet} />
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Certifications Section */}
        {selectedTab === 'Certifications' && (
          <View style={styles.certificationsSection}>
            <Text style={styles.sectionTitle}>Industry Qualifications & Licenses</Text>
            <View style={styles.certificationsList}>
              {certifications.map((cert) => (
                <View key={cert.id} style={styles.certificationCard}>
                  <View style={styles.certificationHeader}>
                    <Text style={styles.certificationTitle}>{cert.title}</Text>
                    <Text style={styles.certificationYear}>{cert.issued}</Text>
                  </View>
                  <Text style={styles.certificationIssuer}>{cert.issuer}</Text>
                  <View style={styles.certificationLicenseContainer}>
                    <Text style={styles.certificationLicenseLabel}>License #:</Text>
                    <Text style={styles.certificationLicenseNumber}>{cert.license}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Contact Bottom Sheet */}
      <BottomSheet
        ref={contactBottomSheetRef}
        index={-1}
        snapPoints={['60%', '85%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetScrollView style={styles.bottomSheetContent}>
          {/* Rep Section */}
          <View style={styles.bottomSheetSection}>
            <Text style={styles.bottomSheetLabel}>Your Rep</Text>
            <View style={styles.repCardWrapper}>
              <View style={styles.bottomSheetRepCard}>
                <Image source={repInfo.image} style={styles.bottomSheetRepImage} />
                <View style={styles.bottomSheetRepInfo}>
                  <Text style={styles.bottomSheetRepName}>{repInfo.name}</Text>
                  <Text style={styles.bottomSheetRepRole}>{repInfo.role}</Text>
                </View>
              </View>
              <View style={styles.contactOptionsRow}>
                <TouchableOpacity style={styles.contactOptionButton}>
                  <Phone size={20} color="#3B82F6" />
                  <Text style={styles.contactOptionText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactOptionButton}>
                  <MessageSquare size={20} color="#3B82F6" />
                  <Text style={styles.contactOptionText}>Text</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactOptionButton}>
                  <Mail size={20} color="#3B82F6" />
                  <Text style={styles.contactOptionText}>Email</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Company Info Section */}
          <View style={styles.bottomSheetSection}>
            <Text style={styles.bottomSheetLabel}>Company Info</Text>
            <View style={styles.companyContactOptions}>
              <TouchableOpacity style={styles.companyContactRow}>
                <View style={styles.companyContactLeft}>
                  <Phone size={20} color="#64748B" />
                  <Text style={styles.companyContactText}>{companyInfo.phone}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.companyContactRow}>
                <View style={styles.companyContactLeft}>
                  <MessageSquare size={20} color="#64748B" />
                  <Text style={styles.companyContactText}>Text Company</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.companyContactRow}>
                <View style={styles.companyContactLeft}>
                  <Mail size={20} color="#64748B" />
                  <Text style={styles.companyContactText}>{companyInfo.email}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 40 }} />
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Kitchen Projects Modal */}
      <Modal
        visible={showKitchenProjects}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <KitchenProjectsScreen onClose={() => setShowKitchenProjects(false)} />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButton: {
    backgroundColor: '#404040',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  contactButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  topSection: {
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  companyInfoSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  companyName: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addressText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
  searchBarContainer: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 24,
  },
  aiSearchBarFull: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiSearchText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#64748B',
  },
  tabsContainer: {
    paddingVertical: 16,
  },
  tabsContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  tabPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabPillActive: {
    backgroundColor: '#404040',
  },
  tabPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#64748B',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#1E293B',
    marginBottom: 20,
  },
  sectionTitlePadded: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#1E293B',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  portfolioContent: {
    paddingTop: 8,
  },
  masonryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  masonryGridColumn: {
    flex: 1,
    gap: 12,
  },
  categoryCardMasonry: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 224,
    marginBottom: 0,
  },
  categoryImageMasonry: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 20,
  },
  categoryName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categoryCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#E2E8F0',
  },
  categoryMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  categoryRatingNumber: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  aboutSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 4,
  },
  reviewsTabSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  aboutText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#475569',
    lineHeight: 26,
    marginBottom: 16,
  },
  peopleSection: {
    paddingTop: 32,
    paddingBottom: 16,
  },
  teamMasonryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  teamMasonryColumn: {
    flex: 1,
    gap: 12,
  },
  teamCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 0,
  },
  teamCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  teamCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
  },
  teamCardName: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  teamCardRole: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  servicesSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  servicesList: {
    gap: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  serviceBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginTop: 8,
  },
  serviceText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#CBD5E1',
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
  },
  bottomSheetSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  bottomSheetLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  repCardWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bottomSheetRepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  bottomSheetRepImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  bottomSheetRepInfo: {
    flex: 1,
  },
  bottomSheetRepName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 2,
  },
  bottomSheetRepRole: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  contactOptionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  contactOptionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 12,
  },
  contactOptionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#3B82F6',
  },
  companyContactOptions: {
    gap: 12,
  },
  companyContactRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  companyContactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  companyContactText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#1E293B',
  },
  certificationsSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  certificationsList: {
    gap: 16,
  },
  certificationCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  certificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  certificationTitle: {
    flex: 1,
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: '#1E293B',
    lineHeight: 24,
  },
  certificationYear: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  certificationIssuer: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 22,
  },
  certificationLicenseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  certificationLicenseLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  certificationLicenseNumber: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1E293B',
  },
});
