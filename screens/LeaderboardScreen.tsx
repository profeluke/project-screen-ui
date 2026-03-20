import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Animated, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown, MapPin, Briefcase, X, Star, Camera, Shield, Clock, Search, Users, FolderOpen, LayoutGrid, List, Heart } from 'lucide-react-native';
import { TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheet, { 
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView 
} from '@gorhom/bottom-sheet';
import ContractorDetailScreen from './ContractorDetailScreen';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 48 - 12) / 2; // 2 columns with padding and gap

// Header animation constants - base heights (safe area added dynamically)
const HEADER_BASE_HEIGHT = 280;
const SCROLL_THRESHOLD = 200;

interface LeaderboardScreenProps {
  onClose: () => void;
}

interface ProData {
  id: string;
  name: string;
  image: any;
  rating: number;
  reviewCount: number;
  yearsInBusiness: number;
  location: string;
  trade: string;
  verified: boolean;
  projectCount: number;
  hasTrustyProfile: boolean; // Whether they have a completed Trusty profile
}

// Local area configuration
const LOCAL_AREA = {
  city: 'Lincoln',
  state: 'NE',
  tagline: 'Work with great contractors who use CompanyCam in Lincoln, Nebraska.',
};

// Fake data for local pros with project images
// Contractors with hasTrustyProfile: true have complete Trusty profiles with ratings, reviews, etc.
// Contractors with hasTrustyProfile: false only have basic CompanyCam data (name, trade, photos)
const PROS_DATA: ProData[] = [
  // === TRUSTEE CONTRACTORS (Complete Profiles) ===
  {
    id: '1',
    name: 'Cornhusker Roofing',
    image: require('../assets/images/project-family-home.jpg'),
    rating: 4.9,
    reviewCount: 127,
    yearsInBusiness: 15,
    location: 'Lincoln, NE',
    trade: 'Roofing',
    verified: true,
    projectCount: 342,
    hasTrustyProfile: true,
  },
  {
    id: '2',
    name: 'Prairie Landscaping',
    image: require('../assets/images/project-sunset-villa.jpg'),
    rating: 5.0,
    reviewCount: 89,
    yearsInBusiness: 8,
    location: 'Waverly, NE',
    trade: 'Landscaping',
    verified: true,
    projectCount: 256,
    hasTrustyProfile: true,
  },
  {
    id: '3',
    name: 'Heartland HVAC',
    image: require('../assets/images/project-modern-loft.jpg'),
    rating: 4.8,
    reviewCount: 203,
    yearsInBusiness: 22,
    location: 'Lincoln, NE',
    trade: 'HVAC',
    verified: true,
    projectCount: 891,
    hasTrustyProfile: true,
  },
  {
    id: '4',
    name: 'Capital City Electric',
    image: require('../assets/images/project-downtown-office.jpg'),
    rating: 4.9,
    reviewCount: 156,
    yearsInBusiness: 12,
    location: 'Lincoln, NE',
    trade: 'Electrical',
    verified: true,
    projectCount: 445,
    hasTrustyProfile: true,
  },
  {
    id: '5',
    name: 'Salt Creek Plumbing',
    image: require('../assets/images/project-beach-house.jpg'),
    rating: 4.7,
    reviewCount: 94,
    yearsInBusiness: 18,
    location: 'Hickman, NE',
    trade: 'Plumbing',
    verified: true,
    projectCount: 623,
    hasTrustyProfile: true,
  },
  {
    id: '6',
    name: 'Nebraska Builders',
    image: require('../assets/images/hero-project.jpg'),
    rating: 5.0,
    reviewCount: 312,
    yearsInBusiness: 25,
    location: 'Lincoln, NE',
    trade: 'General Contractor',
    verified: true,
    projectCount: 1247,
    hasTrustyProfile: true,
  },
  {
    id: '7',
    name: 'Good Life Builders',
    image: require('../assets/images/project-warehouse.jpg'),
    rating: 4.8,
    reviewCount: 78,
    yearsInBusiness: 6,
    location: 'Seward, NE',
    trade: 'General Contractor',
    verified: false,
    projectCount: 189,
    hasTrustyProfile: true,
  },
  {
    id: '8',
    name: 'Haymarket Siding',
    image: require('../assets/images/project-family-home.jpg'),
    rating: 4.6,
    reviewCount: 67,
    yearsInBusiness: 9,
    location: 'Lincoln, NE',
    trade: 'Siding',
    verified: true,
    projectCount: 234,
    hasTrustyProfile: true,
  },
  {
    id: '9',
    name: 'Star City Decks',
    image: require('../assets/images/project-sunset-villa.jpg'),
    rating: 4.9,
    reviewCount: 145,
    yearsInBusiness: 11,
    location: 'Crete, NE',
    trade: 'Decking',
    verified: true,
    projectCount: 378,
    hasTrustyProfile: true,
  },
  {
    id: '10',
    name: 'Lancaster Concrete',
    image: require('../assets/images/project-downtown-office.jpg'),
    rating: 4.8,
    reviewCount: 112,
    yearsInBusiness: 14,
    location: 'Lincoln, NE',
    trade: 'Concrete',
    verified: true,
    projectCount: 567,
    hasTrustyProfile: true,
  },
  // === NON-TRUSTEE CONTRACTORS (No Trusty Profile - Minimal Data) ===
  // These contractors use CompanyCam but haven't set up their Trusty profile
  // They only have: name, rough trade, photo count from last year, location
  // No: profile image, ratings, reviews, years in business, verification
  {
    id: '11',
    name: 'J & M Construction',
    image: null, // No profile image
    rating: 0,
    reviewCount: 0,
    yearsInBusiness: 0,
    location: 'Lincoln, NE',
    trade: 'General Contractor',
    verified: false,
    projectCount: 89,
    hasTrustyProfile: false,
  },
  {
    id: '12',
    name: 'Dave\'s Roofing',
    image: null,
    rating: 0,
    reviewCount: 0,
    yearsInBusiness: 0,
    location: 'Lincoln, NE',
    trade: 'Roofing',
    verified: false,
    projectCount: 156,
    hasTrustyProfile: false,
  },
  {
    id: '13',
    name: 'ABC Plumbing Services',
    image: null,
    rating: 0,
    reviewCount: 0,
    yearsInBusiness: 0,
    location: 'Waverly, NE',
    trade: 'Plumbing',
    verified: false,
    projectCount: 43,
    hasTrustyProfile: false,
  },
  {
    id: '14',
    name: 'Mike\'s Electric',
    image: null,
    rating: 0,
    reviewCount: 0,
    yearsInBusiness: 0,
    location: 'Lincoln, NE',
    trade: 'Electrical',
    verified: false,
    projectCount: 234,
    hasTrustyProfile: false,
  },
  {
    id: '15',
    name: 'Smith Brothers HVAC',
    image: null,
    rating: 0,
    reviewCount: 0,
    yearsInBusiness: 0,
    location: 'Hickman, NE',
    trade: 'HVAC',
    verified: false,
    projectCount: 67,
    hasTrustyProfile: false,
  },
];

// Get unique trades from the data
// "Trusty Contractors" shows only contractors with completed Trusty profiles
// "Favorites" shows contractors you've hearted or collaborated with
// "All" shows all contractors including those without Trusty profiles
const TRADE_FILTERS = [
  'Trusty Contractors', // Default - only shows contractors with hasTrustyProfile: true
  'Favorites', // Shows contractors you've favorited or collaborated with
  'All', // Shows all contractors
  ...Array.from(new Set(PROS_DATA.map(c => c.trade))).sort()
];

type ViewMode = 'grid' | 'list';

export default function LeaderboardScreen({ onClose }: LeaderboardScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedTrade, setSelectedTrade] = useState<string>('Trusty Contractors');
  const [showTradePicker, setShowTradePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContractor, setSelectedContractor] = useState<ProData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  // Track favorited contractor IDs (contractors you've hearted or collaborated with)
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set(['1', '6'])); // Pre-populate with a couple favorites for demo
  const tradeBottomSheetRef = useRef<BottomSheet>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Toggle favorite status for a contractor
  const toggleFavorite = useCallback((contractorId: string) => {
    setFavoritedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contractorId)) {
        newSet.delete(contractorId);
      } else {
        newSet.add(contractorId);
      }
      return newSet;
    });
  }, []);

  // Add contractor to favorites (used when collaborating)
  const addToFavorites = useCallback((contractorId: string) => {
    setFavoritedIds(prev => {
      const newSet = new Set(prev);
      newSet.add(contractorId);
      return newSet;
    });
  }, []);

  const getFilteredPros = () => {
    let filtered = PROS_DATA;
    
    // Filter by selected option
    if (selectedTrade === 'Trusty Contractors') {
      // Only show contractors with completed Trusty profiles
      filtered = filtered.filter(pro => pro.hasTrustyProfile);
    } else if (selectedTrade === 'Favorites') {
      // Show only favorited contractors
      filtered = filtered.filter(pro => favoritedIds.has(pro.id));
    } else if (selectedTrade === 'All') {
      // Show all contractors (no filtering by Trusty status)
      // Keep all
    } else {
      // Filter by specific trade (also only show Trusty contractors within that trade by default)
      filtered = filtered.filter(pro => pro.trade === selectedTrade);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(pro => 
        pro.name.toLowerCase().includes(query) ||
        pro.trade.toLowerCase().includes(query) ||
        pro.location.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const filteredPros = getFilteredPros();

  // Calculate full header height including safe area
  const fullHeaderHeight = HEADER_BASE_HEIGHT + insets.top;

  // Animated values for header collapse
  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [fullHeaderHeight, 0],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD * 0.7],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const stickyFilterOpacity = scrollY.interpolate({
    inputRange: [SCROLL_THRESHOLD * 0.5, SCROLL_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Render backdrop for bottom sheet
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
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

  // Handle bottom sheet open
  const openTradePicker = useCallback(() => {
    setShowTradePicker(true);
  }, []);

  // Handle bottom sheet close
  const closeTradePicker = useCallback(() => {
    tradeBottomSheetRef.current?.close();
  }, []);

  // Handle sheet changes
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setShowTradePicker(false);
    }
  }, []);

  // Expand sheet when showTradePicker becomes true
  useEffect(() => {
    if (showTradePicker) {
      requestAnimationFrame(() => {
        tradeBottomSheetRef.current?.expand();
      });
    }
  }, [showTradePicker]);

  // Handle trade selection
  const handleSelectTrade = useCallback((trade: string) => {
    setSelectedTrade(trade);
    closeTradePicker();
  }, [closeTradePicker]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return (
    <View style={styles.container}>
      {/* Sticky Filter Bar (appears when header is collapsed) */}
      <Animated.View 
        style={[
          styles.stickyFilterBar, 
          { 
            paddingTop: insets.top + 8,
            opacity: stickyFilterOpacity,
          }
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.stickyFilterContent}>
          <TouchableOpacity style={styles.stickyBackButton} onPress={onClose}>
            <ChevronLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.stickyTradeFilter, selectedTrade !== 'Trusty Contractors' && styles.stickyTradeFilterActive]}
            onPress={openTradePicker}
          >
            <Briefcase size={14} color={selectedTrade !== 'Trusty Contractors' ? '#DC2626' : '#64748B'} />
            <Text style={[styles.stickyTradeFilterText, selectedTrade !== 'Trusty Contractors' && styles.stickyTradeFilterTextActive]}>
              {selectedTrade}
            </Text>
            <ChevronDown size={14} color={selectedTrade !== 'Trusty Contractors' ? '#DC2626' : '#64748B'} />
          </TouchableOpacity>
          
          <Text style={styles.stickyResultCount}>
            {filteredPros.length} pros
          </Text>
        </View>
      </Animated.View>

      {/* Hero Header */}
      <Animated.View style={{ height: headerHeight, overflow: 'hidden' }}>
        <LinearGradient
          colors={['#DC2626', '#B91C1C', '#991B1B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroHeader, { paddingTop: insets.top, minHeight: fullHeaderHeight }]}
        >
          {/* Decorative Elements */}
          <View style={styles.heroPattern}>
            <View style={[styles.heroCircle, styles.heroCircle1]} />
            <View style={[styles.heroCircle, styles.heroCircle2]} />
            <View style={[styles.heroCircle, styles.heroCircle3]} />
          </View>
          
          <Animated.View style={{ opacity: headerOpacity }}>
            {/* Top Nav Row - Location Centered */}
            <View style={styles.topNavRow}>
              <TouchableOpacity style={styles.heroBackButton} onPress={onClose}>
                <ChevronLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.locationBadgeCentered} activeOpacity={0.8}>
                <MapPin size={16} color="#FCD34D" />
                <Text style={styles.locationBadgeText}>{LOCAL_AREA.city}, {LOCAL_AREA.state}</Text>
                <ChevronDown size={16} color="rgba(255, 255, 255, 0.7)" />
              </TouchableOpacity>
              
              <View style={styles.heroBackButton} />
            </View>
            
            {/* Main Title */}
            <Text style={styles.heroTitle}>CompanyCam Pros</Text>
            <Text style={styles.heroSubtitle}>{LOCAL_AREA.tagline}</Text>
            
            {/* Stats Pills */}
            <View style={styles.statsPills}>
              <View style={styles.statPill}>
                <Users size={14} color="#FFFFFF" />
                <Text style={styles.statPillText}>286 Pros</Text>
              </View>
              <View style={styles.statPill}>
                <Star size={14} color="#FCD34D" fill="#FCD34D" />
                <Text style={styles.statPillText}>4.8 Avg</Text>
              </View>
              <View style={styles.statPill}>
                <FolderOpen size={14} color="#FFFFFF" />
                <Text style={styles.statPillText}>31K Projects</Text>
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Search size={18} color="rgba(255, 255, 255, 0.6)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search pros by name, trade..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={18} color="rgba(255, 255, 255, 0.6)" />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView 
        style={styles.prosContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Inline Filter Bar (scrolls with content) */}
        <View style={styles.inlineFilterBar}>
          <TouchableOpacity 
            style={[styles.tradeFilter, selectedTrade !== 'Trusty Contractors' && styles.tradeFilterActive]}
            onPress={openTradePicker}
          >
            <Briefcase size={16} color={selectedTrade !== 'Trusty Contractors' ? '#DC2626' : '#64748B'} />
            <Text style={[styles.tradeFilterText, selectedTrade !== 'Trusty Contractors' && styles.tradeFilterTextActive]}>
              {selectedTrade}
            </Text>
            <ChevronDown size={16} color={selectedTrade !== 'Trusty Contractors' ? '#DC2626' : '#64748B'} />
          </TouchableOpacity>
          
          <View style={styles.filterBarRight}>
            <Text style={styles.resultCount}>
              {filteredPros.length} {filteredPros.length === 1 ? 'pro' : 'pros'}
            </Text>
            <View style={styles.viewToggle}>
              <TouchableOpacity 
                style={[styles.viewToggleButton, viewMode === 'grid' && styles.viewToggleButtonActive]}
                onPress={() => setViewMode('grid')}
              >
                <LayoutGrid size={18} color={viewMode === 'grid' ? '#DC2626' : '#94A3B8'} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
                onPress={() => setViewMode('list')}
              >
                <List size={18} color={viewMode === 'list' ? '#DC2626' : '#94A3B8'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Pros Grid View */}
        {viewMode === 'grid' && (
          <View style={styles.prosGrid}>
            {filteredPros.map((pro) => {
              // Get initials for placeholder
              const initials = pro.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
              
              return (
                <TouchableOpacity 
                  key={pro.id} 
                  style={[styles.proCard, !pro.hasTrustyProfile && styles.proCardNoTrusty]}
                  activeOpacity={0.9}
                  onPress={() => setSelectedContractor(pro)}
                >
                  {/* Show image if has Trusty profile and image, otherwise show placeholder */}
                  {pro.image && pro.hasTrustyProfile ? (
                    <Image source={pro.image} style={styles.proImage} />
                  ) : (
                    <View style={styles.proImagePlaceholder}>
                      <Text style={styles.proInitials}>{initials}</Text>
                    </View>
                  )}
                  <LinearGradient
                    colors={pro.hasTrustyProfile 
                      ? ['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']
                      : ['transparent', 'rgba(100,116,139,0.3)', 'rgba(100,116,139,0.85)']
                    }
                    locations={[0, 0.4, 1]}
                    style={styles.proOverlay}
                  >
                    {/* Favorited Heart Badge */}
                    {favoritedIds.has(pro.id) && (
                      <View style={styles.favoritedBadge}>
                        <Heart size={12} color="#FFFFFF" fill="#FFFFFF" />
                      </View>
                    )}
                    
                    {/* Verified Badge - only for Trusty contractors */}
                    {pro.verified && pro.hasTrustyProfile && (
                      <View style={[styles.verifiedBadge, favoritedIds.has(pro.id) && styles.verifiedBadgeOffset]}>
                        <Shield size={10} color="#FFFFFF" />
                      </View>
                    )}
                    
                    {/* Rating Badge - only show for Trusty contractors with ratings */}
                    {pro.hasTrustyProfile && pro.rating > 0 && (
                      <View style={styles.ratingBadge}>
                        <Star size={12} color="#FCD34D" fill="#FCD34D" />
                        <Text style={styles.ratingText}>{pro.rating}</Text>
                      </View>
                    )}
                    
                    {/* No Trusty Badge */}
                    {!pro.hasTrustyProfile && (
                      <View style={styles.noTrustyBadge}>
                        <Text style={styles.noTrustyBadgeText}>CompanyCam User</Text>
                      </View>
                    )}
                    
                    {/* Pro Info */}
                    <View style={styles.proInfo}>
                      <Text style={styles.proName} numberOfLines={2}>{pro.name}</Text>
                      <Text style={styles.proTrade}>{pro.trade}</Text>
                      <View style={styles.proMeta}>
                        <View style={styles.proMetaItem}>
                          <Camera size={11} color="rgba(255,255,255,0.7)" />
                          <Text style={styles.proMetaText}>{pro.projectCount} photos</Text>
                        </View>
                        {/* Only show years in business for Trusty contractors */}
                        {pro.hasTrustyProfile && pro.yearsInBusiness > 0 && (
                          <>
                            <View style={styles.proMetaDot} />
                            <View style={styles.proMetaItem}>
                              <Clock size={11} color="rgba(255,255,255,0.7)" />
                              <Text style={styles.proMetaText}>{pro.yearsInBusiness}yr</Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Pros List View */}
        {viewMode === 'list' && (
          <View style={styles.prosList}>
            {filteredPros.map((pro) => {
              // Get initials for placeholder
              const initials = pro.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
              
              return (
                <TouchableOpacity 
                  key={pro.id} 
                  style={[styles.listCard, !pro.hasTrustyProfile && styles.listCardNoTrusty]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedContractor(pro)}
                >
                  {/* Show image if has Trusty profile and image, otherwise show placeholder */}
                  {pro.image && pro.hasTrustyProfile ? (
                    <Image source={pro.image} style={styles.listCardImage} />
                  ) : (
                    <View style={styles.listCardImagePlaceholder}>
                      <Text style={styles.listCardInitials}>{initials}</Text>
                    </View>
                  )}
                  <View style={styles.listCardContent}>
                    <View style={styles.listCardHeader}>
                      <Text style={styles.listCardName} numberOfLines={1}>{pro.name}</Text>
                      {favoritedIds.has(pro.id) && (
                        <View style={styles.listFavoritedBadge}>
                          <Heart size={12} color="#EF4444" fill="#EF4444" />
                        </View>
                      )}
                      {pro.verified && pro.hasTrustyProfile && (
                        <View style={styles.listVerifiedBadge}>
                          <Shield size={10} color="#22C55E" />
                        </View>
                      )}
                    </View>
                    <View style={styles.listCardTradeRow}>
                      <Text style={styles.listCardTrade}>{pro.trade}</Text>
                      {!pro.hasTrustyProfile && (
                        <View style={styles.listNoTrustyPill}>
                          <Text style={styles.listNoTrustyPillText}>CompanyCam User</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.listCardMeta}>
                      {/* Only show rating for Trusty contractors */}
                      {pro.hasTrustyProfile && pro.rating > 0 && (
                        <>
                          <View style={styles.listCardRating}>
                            <Star size={12} color="#F59E0B" fill="#F59E0B" />
                            <Text style={styles.listCardRatingText}>{pro.rating}</Text>
                            <Text style={styles.listCardReviews}>({pro.reviewCount})</Text>
                          </View>
                          <View style={styles.listCardDot} />
                        </>
                      )}
                      <View style={styles.listCardStat}>
                        <Camera size={12} color="#64748B" />
                        <Text style={styles.listCardStatText}>{pro.projectCount} photos</Text>
                      </View>
                      {/* Only show years for Trusty contractors */}
                      {pro.hasTrustyProfile && pro.yearsInBusiness > 0 && (
                        <>
                          <View style={styles.listCardDot} />
                          <View style={styles.listCardStat}>
                            <Clock size={12} color="#64748B" />
                            <Text style={styles.listCardStatText}>{pro.yearsInBusiness}yr</Text>
                          </View>
                        </>
                      )}
                    </View>
                    <Text style={styles.listCardLocation}>{pro.location}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      {/* Trade Picker Bottom Sheet */}
      {showTradePicker && (
        <BottomSheet
          ref={tradeBottomSheetRef}
          index={0}
          snapPoints={['90%']}
          backdropComponent={renderBackdrop}
          onClose={() => setShowTradePicker(false)}
          onChange={handleSheetChanges}
          enablePanDownToClose={true}
          style={styles.bottomSheet}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.handleIndicator}
        >
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Filter by Trade</Text>
            <TouchableOpacity 
              style={styles.bottomSheetCloseButton}
              onPress={closeTradePicker}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          <BottomSheetScrollView 
            style={styles.tradeList}
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            showsVerticalScrollIndicator={true}
          >
            {TRADE_FILTERS.map((trade) => {
              const isFavorites = trade === 'Favorites';
              const favoriteCount = favoritedIds.size;
              
              return (
                <TouchableOpacity
                  key={trade}
                  style={[styles.tradeOption, selectedTrade === trade && styles.tradeOptionActive]}
                  onPress={() => handleSelectTrade(trade)}
                >
                  <View style={styles.tradeOptionContent}>
                    <View style={[
                      styles.tradeIconContainer, 
                      selectedTrade === trade && styles.tradeIconContainerActive,
                      isFavorites && styles.tradeIconContainerFavorites,
                      isFavorites && selectedTrade === trade && styles.tradeIconContainerFavoritesActive,
                    ]}>
                      {isFavorites ? (
                        <Heart 
                          size={18} 
                          color={selectedTrade === trade ? '#EF4444' : '#EF4444'} 
                          fill={selectedTrade === trade ? '#EF4444' : 'transparent'}
                        />
                      ) : (
                        <Briefcase size={18} color={selectedTrade === trade ? '#DC2626' : '#64748B'} />
                      )}
                    </View>
                    <Text style={[styles.tradeOptionText, selectedTrade === trade && styles.tradeOptionTextActive]}>
                      {trade}
                    </Text>
                    {isFavorites && favoriteCount > 0 && (
                      <View style={styles.favoriteCountBadge}>
                        <Text style={styles.favoriteCountText}>{favoriteCount}</Text>
                      </View>
                    )}
                  </View>
                  {selectedTrade === trade && (
                    <View style={styles.checkMark}>
                      <Text style={styles.checkMarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </BottomSheetScrollView>
        </BottomSheet>
      )}

      {/* Contractor Detail Modal */}
      <Modal
        visible={selectedContractor !== null}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        {selectedContractor && (
          <ContractorDetailScreen 
            contractor={selectedContractor}
            onClose={() => setSelectedContractor(null)}
            isFavorited={favoritedIds.has(selectedContractor.id)}
            onToggleFavorite={() => toggleFavorite(selectedContractor.id)}
            onCollaborate={() => addToFavorites(selectedContractor.id)}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Sticky Filter Bar (collapsed state)
  stickyFilterBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  stickyFilterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  stickyBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyTradeFilter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  stickyTradeFilterActive: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  stickyTradeFilterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  stickyTradeFilterTextActive: {
    color: '#DC2626',
    fontFamily: 'Inter-SemiBold',
  },
  stickyResultCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  // Hero Header Styles
  heroHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  heroPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroCircle1: {
    width: 200,
    height: 200,
    top: -60,
    right: -40,
  },
  heroCircle2: {
    width: 120,
    height: 120,
    bottom: 20,
    left: -30,
  },
  heroCircle3: {
    width: 80,
    height: 80,
    top: 40,
    left: '40%',
    backgroundColor: 'rgba(252, 211, 77, 0.15)',
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationBadgeCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  locationBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 16,
  },
  statsPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statPillText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#FFFFFF',
    padding: 0,
  },
  // Scrollable Content
  prosContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Inline Filter Bar (scrolls with content)
  inlineFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  tradeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tradeFilterActive: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  tradeFilterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#1E293B',
  },
  tradeFilterTextActive: {
    color: '#DC2626',
    fontFamily: 'Inter-SemiBold',
  },
  resultCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  filterBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
  },
  viewToggleButton: {
    width: 36,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  viewToggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // Pros Grid
  prosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 18,
    gap: 12,
  },
  proCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  proImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  proImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proInitials: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#94A3B8',
    letterSpacing: 1,
  },
  proCardNoTrusty: {
    opacity: 0.85,
  },
  proOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 14,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  verifiedBadgeOffset: {
    left: 38, // Offset when favorited badge is shown
  },
  favoritedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#1E293B',
  },
  noTrustyBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(100, 116, 139, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  noTrustyBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#FFFFFF',
  },
  proInfo: {
    gap: 4,
  },
  proName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  proTrade: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  proMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  proMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  proMetaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  proMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 6,
  },
  // Pros List View
  prosList: {
    paddingHorizontal: 18,
    gap: 12,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  listCardImage: {
    width: 100,
    height: 110,
    resizeMode: 'cover',
  },
  listCardImagePlaceholder: {
    width: 100,
    height: 110,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCardInitials: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#94A3B8',
    letterSpacing: 1,
  },
  listCardNoTrusty: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  listCardContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },
  listCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  listCardName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
  },
  listVerifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listFavoritedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCardTrade: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  listCardTradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  listNoTrustyPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listNoTrustyPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#64748B',
  },
  listCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  listCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listCardRatingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#1E293B',
  },
  listCardReviews: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  listCardDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  listCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listCardStatText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  listCardLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  // Bottom Sheet Styles
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
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
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  bottomSheetTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
  },
  bottomSheetCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tradeList: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tradeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  tradeOptionActive: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  tradeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tradeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tradeIconContainerActive: {
    backgroundColor: '#FECACA',
  },
  tradeIconContainerFavorites: {
    backgroundColor: '#FEE2E2',
  },
  tradeIconContainerFavoritesActive: {
    backgroundColor: '#FECACA',
  },
  favoriteCountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  favoriteCountText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  tradeOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1E293B',
  },
  tradeOptionTextActive: {
    color: '#DC2626',
    fontFamily: 'Inter-SemiBold',
  },
  checkMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
