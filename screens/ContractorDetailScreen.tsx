import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Modal,
  Linking,
  Alert,
  ActionSheetIOS,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  Heart, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Camera, 
  Clock, 
  Shield, 
  Users, 
  Upload,
  Handshake,
  Check,
  Building2,
  Wrench,
  MessageSquare,
  ExternalLink,
  Image as ImageIcon,
  ChevronRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CollaborateProjectScreen from './CollaborateProjectScreen';

interface ContractorData {
  id: string;
  name: string;
  image: any;
  logo?: string;
  rating: number;
  reviewCount: number;
  yearsInBusiness: number;
  location: string;
  trade: string;
  verified: boolean;
  projectCount: number;
  phone?: string;
  email?: string;
  website?: string;
  about?: string;
  services?: string[];
  teamSize?: number;
  hasTrustyProfile?: boolean;
}

interface ContractorDetailScreenProps {
  contractor: ContractorData;
  onClose: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  onCollaborate?: () => void;
}

export default function ContractorDetailScreen({ 
  contractor, 
  onClose,
  isFavorited: externalIsFavorited,
  onToggleFavorite,
  onCollaborate,
}: ContractorDetailScreenProps) {
  const insets = useSafeAreaInsets();
  // Use external state if provided, otherwise use local state
  const [localIsFavorited, setLocalIsFavorited] = useState(false);
  const isFavorited = externalIsFavorited !== undefined ? externalIsFavorited : localIsFavorited;
  const [showCollaborateModal, setShowCollaborateModal] = useState(false);

  // Portfolio images for Trusty section
  const portfolioImages = [
    require('../assets/images/project-family-home.jpg'),
    require('../assets/images/project-downtown-office.jpg'),
    require('../assets/images/project-sunset-villa.jpg'),
    require('../assets/images/project-modern-loft.jpg'),
    require('../assets/images/project-beach-house.jpg'),
  ];

  // Check if contractor has Trusty profile
  const hasTrustyProfile = contractor.hasTrustyProfile !== false; // Default to true for backwards compatibility
  
  // Get initials for placeholder
  const initials = contractor.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();

  // Default values for demo
  const contractorData = {
    ...contractor,
    phone: contractor.phone || (hasTrustyProfile ? '(402) 555-0123' : undefined),
    email: contractor.email || (hasTrustyProfile ? `info@${contractor.name.toLowerCase().replace(/[^a-z]/g, '')}.com` : undefined),
    website: contractor.website || (hasTrustyProfile ? `www.${contractor.name.toLowerCase().replace(/[^a-z]/g, '')}.com` : undefined),
    about: contractor.about || (hasTrustyProfile 
      ? `${contractor.name} has been serving the Lincoln area for over ${contractor.yearsInBusiness} years. We pride ourselves on quality workmanship, transparent communication, and exceptional customer service. Our team of skilled professionals is dedicated to delivering outstanding results on every project.`
      : undefined),
    services: contractor.services || (hasTrustyProfile ? getDefaultServices(contractor.trade) : undefined),
    teamSize: contractor.teamSize || (hasTrustyProfile ? Math.floor(Math.random() * 15) + 5 : undefined),
    showcaseCount: hasTrustyProfile ? 47 : 0,
    trustyUrl: `https://trusty.app/companies/${contractor.name.toLowerCase().replace(/[^a-z]/g, '-')}`,
  };

  function getDefaultServices(trade: string): string[] {
    const serviceMap: Record<string, string[]> = {
      'Roofing': ['Roof Installation', 'Roof Repair', 'Roof Inspection', 'Gutter Installation', 'Storm Damage Repair'],
      'Landscaping': ['Lawn Care', 'Landscape Design', 'Irrigation Systems', 'Hardscaping', 'Tree Services'],
      'HVAC': ['AC Installation', 'Heating Repair', 'Duct Cleaning', 'Thermostat Installation', 'Maintenance Plans'],
      'Electrical': ['Wiring & Rewiring', 'Panel Upgrades', 'Lighting Installation', 'Generator Installation', 'EV Charger Install'],
      'Plumbing': ['Pipe Repair', 'Water Heater Install', 'Drain Cleaning', 'Fixture Installation', 'Leak Detection'],
      'General Contractor': ['New Construction', 'Remodeling', 'Additions', 'Kitchen & Bath', 'Commercial Build-outs'],
      'Siding': ['Vinyl Siding', 'Fiber Cement', 'Wood Siding', 'Siding Repair', 'Exterior Trim'],
      'Decking': ['Deck Building', 'Deck Repair', 'Composite Decking', 'Pergolas', 'Outdoor Living'],
      'Concrete': ['Driveways', 'Patios', 'Foundations', 'Stamped Concrete', 'Concrete Repair'],
    };
    return serviceMap[trade] || ['General Services', 'Consultations', 'Project Management'];
  }

  const handleCall = () => {
    Linking.openURL(`tel:${contractorData.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${contractorData.email}`);
  };

  const handleMessage = () => {
    Alert.alert('Message', `Start a conversation with ${contractor.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Message', onPress: () => console.log('Message sent') }
    ]);
  };

  const handleContact = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Call', 'Email', 'Message'],
          cancelButtonIndex: 0,
          title: `Contact ${contractor.name}`,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleCall();
          else if (buttonIndex === 2) handleEmail();
          else if (buttonIndex === 3) handleMessage();
        }
      );
    } else {
      Alert.alert(
        `Contact ${contractor.name}`,
        'Choose a contact method',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: handleCall },
          { text: 'Email', onPress: handleEmail },
          { text: 'Message', onPress: handleMessage },
        ]
      );
    }
  };

  const handleShare = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Copy Link', 'Share Profile'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            Alert.alert('Copied!', 'Profile link copied to clipboard');
          } else if (buttonIndex === 2) {
            console.log('Share profile');
          }
        }
      );
    } else {
      Alert.alert('Share', `Share ${contractor.name}'s profile?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => console.log('Shared') }
      ]);
    }
  };

  const toggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite();
    } else {
      setLocalIsFavorited(!localIsFavorited);
    }
  };

  const handleViewTrustyPortfolio = () => {
    Linking.openURL(contractorData.trustyUrl);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {contractor.image ? (
            <Image source={contractor.image} style={styles.heroImage} />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroInitials}>{initials}</Text>
            </View>
          )}
          <LinearGradient
            colors={hasTrustyProfile 
              ? ['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.8)']
              : ['rgba(100,116,139,0.5)', 'rgba(100,116,139,0.2)', 'rgba(100,116,139,0.9)']
            }
            locations={[0, 0.35, 1]}
            style={styles.heroOverlay}
          />
          
          {/* Top Nav */}
          <View style={[styles.topNav, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.navButton} onPress={onClose}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.navRight}>
              <TouchableOpacity style={styles.navButton} onPress={handleShare}>
                <Upload size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.navButton, isFavorited && styles.navButtonFavorited]} 
                onPress={toggleFavorite}
              >
                <Heart 
                  size={20} 
                  color={isFavorited ? '#EF4444' : '#FFFFFF'} 
                  fill={isFavorited ? '#EF4444' : 'transparent'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                <Text style={styles.contactButtonText}>Contact</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Company Info Overlay */}
          <View style={styles.heroInfo}>
            <View style={styles.companyNameRow}>
              <Text style={styles.companyName}>{contractor.name}</Text>
              {contractor.verified && hasTrustyProfile && (
                <View style={styles.verifiedBadge}>
                  <Shield size={16} color="#FFFFFF" />
                </View>
              )}
              {!hasTrustyProfile && (
                <View style={styles.companyUserBadge}>
                  <Text style={styles.companyUserBadgeText}>CompanyCam User</Text>
                </View>
              )}
            </View>
            <View style={styles.metaRow}>
              <View style={styles.tradeBadge}>
                <Wrench size={12} color="#FFFFFF" />
                <Text style={styles.tradeBadgeText}>{contractor.trade}</Text>
              </View>
              <View style={styles.locationBadge}>
                <MapPin size={12} color="#FFFFFF" />
                <Text style={styles.locationText}>{contractor.location}</Text>
              </View>
            </View>
            
            {/* Inline Stats - Show full stats for Trusty, limited for non-Trusty */}
            <View style={styles.inlineStats}>
              {hasTrustyProfile && contractor.rating > 0 && (
                <>
                  <View style={styles.inlineStat}>
                    <Star size={12} color="#FCD34D" fill="#FCD34D" />
                    <Text style={styles.inlineStatValue}>{contractor.rating}</Text>
                    <Text style={styles.inlineStatLabel}>({contractor.reviewCount})</Text>
                  </View>
                  <View style={styles.inlineStatDot} />
                </>
              )}
              <View style={styles.inlineStat}>
                <Camera size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.inlineStatValue}>{contractor.projectCount.toLocaleString()}</Text>
                <Text style={styles.inlineStatLabel}>photos</Text>
              </View>
              {hasTrustyProfile && contractor.yearsInBusiness > 0 && (
                <>
                  <View style={styles.inlineStatDot} />
                  <View style={styles.inlineStat}>
                    <Clock size={12} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.inlineStatValue}>{contractor.yearsInBusiness}</Text>
                    <Text style={styles.inlineStatLabel}>yrs</Text>
                  </View>
                </>
              )}
              {hasTrustyProfile && contractorData.teamSize && (
                <>
                  <View style={styles.inlineStatDot} />
                  <View style={styles.inlineStat}>
                    <Users size={12} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.inlineStatValue}>{contractorData.teamSize}</Text>
                    <Text style={styles.inlineStatLabel}>team</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Collaborate CTA */}
        <TouchableOpacity 
          style={styles.collaborateCTA}
          onPress={() => setShowCollaborateModal(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#DC2626', '#B91C1C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.collaborateGradient}
          >
            <View style={styles.collaborateContent}>
              <View style={styles.collaborateIcon}>
                <Handshake size={24} color="#FFFFFF" />
              </View>
              <View style={styles.collaborateText}>
                <Text style={styles.collaborateTitle}>Collaborate in CompanyCam</Text>
                <Text style={styles.collaborateSubtitle}>Invite to a project for seamless photo sharing</Text>
              </View>
            </View>
            <ChevronLeft size={20} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Trusty Portfolio Section - Only show for Trusty contractors */}
        {hasTrustyProfile ? (
          <View style={styles.portfolioSection}>
            <View style={styles.portfolioHeader}>
              <View style={styles.portfolioTitleRow}>
                <View style={styles.trustyBadge}>
                  <Text style={styles.trustyBadgeText}>trusty</Text>
                </View>
                <Text style={styles.portfolioTitle}>Portfolio</Text>
              </View>
              <View style={styles.portfolioStats}>
                <ImageIcon size={14} color="#8B5CF6" />
                <Text style={styles.portfolioStatsText}>{contractorData.showcaseCount} Showcases</Text>
              </View>
            </View>
            
            {/* Portfolio Preview Images */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.portfolioScroll}
            >
              {portfolioImages.map((image, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.portfolioImageContainer}
                  onPress={handleViewTrustyPortfolio}
                  activeOpacity={0.9}
                >
                  <Image source={image} style={styles.portfolioImage} />
                  {index === portfolioImages.length - 1 && (
                    <View style={styles.portfolioImageOverlay}>
                      <Text style={styles.portfolioMoreText}>+{contractorData.showcaseCount - portfolioImages.length}</Text>
                      <Text style={styles.portfolioMoreLabel}>more</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* View on Trusty Button */}
            <TouchableOpacity 
              style={styles.viewTrustyButton}
              onPress={handleViewTrustyPortfolio}
              activeOpacity={0.8}
            >
              <View style={styles.viewTrustyContent}>
                <View style={styles.viewTrustyIcon}>
                  <ExternalLink size={18} color="#8B5CF6" />
                </View>
                <View>
                  <Text style={styles.viewTrustyTitle}>View Full Portfolio on Trusty</Text>
                  <Text style={styles.viewTrustySubtitle}>See all their showcased work and reviews</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        ) : (
          /* Incomplete Profile Notice - For non-Trusty contractors */
          <View style={styles.incompleteProfileSection}>
            <View style={styles.incompleteProfileCard}>
              <View style={styles.incompleteIconContainer}>
                <Shield size={24} color="#94A3B8" />
              </View>
              <Text style={styles.incompleteTitle}>Incomplete Profile</Text>
              <Text style={styles.incompleteDescription}>
                This contractor uses CompanyCam but hasn't completed their Trusty profile. We have limited information available.
              </Text>
              <View style={styles.incompleteDivider} />
              <Text style={styles.incompleteNote}>
                You can still collaborate with them on projects, but detailed business information like ratings, reviews, and portfolio showcases are not available.
              </Text>
            </View>
          </View>
        )}

        {/* About Section - Only show if there's content */}
        {contractorData.about ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>{contractorData.about}</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.noDataCard}>
              <Text style={styles.noDataText}>No description available</Text>
              <Text style={styles.noDataSubtext}>This contractor hasn't added their business description yet.</Text>
            </View>
          </View>
        )}

        {/* Services Section - Only show if there's content */}
        {contractorData.services && contractorData.services.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.servicesGrid}>
              {contractorData.services.map((service, index) => (
                <View key={index} style={styles.serviceTag}>
                  <Check size={14} color="#10B981" />
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.noDataCard}>
              <Text style={styles.noDataText}>No services listed</Text>
              <Text style={styles.noDataSubtext}>This contractor hasn't specified their services yet.</Text>
            </View>
          </View>
        )}

        {/* Contact Info Section - Only show available info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {(contractorData.phone || contractorData.email || contractorData.website) ? (
            <View style={styles.contactCard}>
              {contractorData.phone && (
                <>
                  <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
                    <Phone size={18} color="#64748B" />
                    <Text style={styles.contactText}>{contractorData.phone}</Text>
                  </TouchableOpacity>
                  {(contractorData.email || contractorData.website) && <View style={styles.contactDivider} />}
                </>
              )}
              {contractorData.email && (
                <>
                  <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
                    <Mail size={18} color="#64748B" />
                    <Text style={styles.contactText}>{contractorData.email}</Text>
                  </TouchableOpacity>
                  {contractorData.website && <View style={styles.contactDivider} />}
                </>
              )}
              {contractorData.website && (
                <View style={styles.contactRow}>
                  <Building2 size={18} color="#64748B" />
                  <Text style={styles.contactText}>{contractorData.website}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noDataCard}>
              <Text style={styles.noDataText}>No contact information available</Text>
              <Text style={styles.noDataSubtext}>Contact details haven't been added yet.</Text>
            </View>
          )}
        </View>

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>

      {/* Collaborate Modal */}
      <Modal
        visible={showCollaborateModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <CollaborateProjectScreen 
          contractor={contractor}
          onClose={() => setShowCollaborateModal(false)}
          onCollaborationStarted={() => {
            // Auto-favorite when collaborating
            if (onCollaborate) {
              onCollaborate();
            }
          }}
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
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: 360,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInitials: {
    fontFamily: 'Inter-Bold',
    fontSize: 72,
    color: '#94A3B8',
    letterSpacing: 2,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonFavorited: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
  },
  contactButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  heroInfo: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  companyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  companyName: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  companyUserBadge: {
    backgroundColor: 'rgba(100, 116, 139, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  companyUserBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tradeBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#FFFFFF',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  inlineStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  inlineStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineStatValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  inlineStatLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inlineStatDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 8,
  },
  collaborateCTA: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  collaborateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  collaborateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  collaborateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collaborateText: {
    flex: 1,
  },
  collaborateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  collaborateSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Trusty Portfolio Section
  portfolioSection: {
    marginBottom: 24,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  portfolioTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trustyBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trustyBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  portfolioTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
  },
  portfolioStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  portfolioStatsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#8B5CF6',
  },
  portfolioScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  portfolioImageContainer: {
    width: 140,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  portfolioImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioMoreText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  portfolioMoreLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  viewTrustyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F3FF',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  viewTrustyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  viewTrustyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewTrustyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#5B21B6',
    marginBottom: 2,
  },
  viewTrustySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#7C3AED',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 12,
  },
  aboutText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  serviceText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#166534',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  contactText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#1E293B',
  },
  contactDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  // Incomplete Profile Section (for non-Trusty contractors)
  incompleteProfileSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  incompleteProfileCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  incompleteIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  incompleteTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: '#64748B',
    marginBottom: 8,
  },
  incompleteDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  incompleteDivider: {
    width: 40,
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  incompleteNote: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    fontStyle: 'italic',
  },
  // No Data Card (for missing sections)
  noDataCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  noDataText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  noDataSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#CBD5E1',
  },
});
