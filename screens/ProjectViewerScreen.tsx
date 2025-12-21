import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  FlatList,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  X,
  Heart,
  Bookmark,
  Share2,
  MessageCircle,
  Star,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Project {
  id: string;
  image: any;
  images?: any[]; // Multiple photos for horizontal swiping
  title: string;
  rating: number;
  date: string;
  materials?: string[];
  description?: string;
}

interface ProjectViewerScreenProps {
  projects: Project[];
  initialIndex: number;
  onClose: () => void;
}

export default function ProjectViewerScreen({ 
  projects, 
  initialIndex, 
  onClose 
}: ProjectViewerScreenProps) {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<{[key: string]: number}>({});
  const [liked, setLiked] = useState<{[key: string]: boolean}>({});
  const [bookmarked, setBookmarked] = useState<{[key: string]: boolean}>({});

  const currentProject = projects[currentIndex];
  const projectPhotos = currentProject.images || [currentProject.image];
  const currentPhotoIdx = currentPhotoIndex[currentProject.id] || 0;

  const handleViewportChange = (viewableItems: any) => {
    if (viewableItems.viewableItems && viewableItems.viewableItems.length > 0) {
      setCurrentIndex(viewableItems.viewableItems[0].index);
      // Reset photo index when changing projects
      setCurrentPhotoIndex(prev => ({ ...prev, [currentProject.id]: 0 }));
    }
  };

  const handlePhotoChange = (projectId: string, viewableItems: any) => {
    if (viewableItems.viewableItems && viewableItems.viewableItems.length > 0) {
      const newPhotoIndex = viewableItems.viewableItems[0].index;
      setCurrentPhotoIndex(prev => ({ ...prev, [projectId]: newPhotoIndex }));
    }
  };

  const toggleLike = (projectId: string) => {
    setLiked(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const toggleBookmark = (projectId: string) => {
    setBookmarked(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const handleShare = () => {
    console.log('Share functionality would go here');
  };

  const handleComment = () => {
    console.log('Comment functionality would go here');
  };

  const handleViewFullProject = () => {
    console.log('Full project details would open here');
  };

  const renderProject = ({ item }: { item: Project }) => {
    const photos = item.images || [item.image];
    const photoIdx = currentPhotoIndex[item.id] || 0;

    return (
      <View style={styles.projectSlide}>
        {/* Horizontal Photo Swiper */}
        <FlatList
          data={photos}
          renderItem={({ item: photo }) => (
            <View style={styles.imageContainer}>
              <Image source={photo} style={styles.fullScreenImage} />
            </View>
          )}
          keyExtractor={(photo, index) => `${item.id}-photo-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={(viewableItems) => handlePhotoChange(item.id, viewableItems)}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50,
          }}
        />

        {/* Pagination Dots - Only show if multiple photos */}
        {photos.length > 1 && (
          <View style={styles.paginationContainer}>
            {photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === photoIdx && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Vertical Scrolling Projects - Behind UI */}
      <FlatList
        ref={flatListRef}
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(data, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
        onViewableItemsChanged={handleViewportChange}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
      />

      {/* Fixed UI Layer - Above Images */}
      <View style={styles.uiLayer} pointerEvents="box-none">
        {/* Top gradient for better visibility */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0)']}
          style={styles.topGradient}
          pointerEvents="none"
        />

        {/* Close Button */}
        <TouchableOpacity 
          onPress={onClose} 
          style={[styles.closeButton, { top: insets.top + 8 }]}
        >
          <View style={styles.closeButtonCircle}>
            <X size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Bottom Info Card - Glass Effect - Full Width */}
        <TouchableOpacity 
          style={[styles.infoCardContainer, { bottom: insets.bottom + 20 }]}
          onPress={handleViewFullProject}
          activeOpacity={0.9}
        >
          <BlurView intensity={80} tint="dark" style={styles.infoCard}>
            <View style={styles.infoCardContent}>
              <View style={styles.infoHeader}>
                <Text style={styles.projectTitle}>{currentProject.title}</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingNumber}>{currentProject.rating}</Text>
                  <Star size={12} color="#FCD34D" fill="#FCD34D" />
                </View>
              </View>

              {currentProject.materials && currentProject.materials.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.materialsScrollView}
                  contentContainerStyle={styles.materialsContainer}
                >
                  {currentProject.materials.map((material, index) => (
                    <View key={index} style={styles.materialTag}>
                      <Text style={styles.materialTagText}>{material}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}

              {currentProject.description && (
                <Text style={styles.projectDescription} numberOfLines={2}>
                  {currentProject.description}
                </Text>
              )}
            </View>
          </BlurView>
        </TouchableOpacity>

        {/* Action Buttons - Right Side, Above Info Card */}
        <View style={[styles.actionButtonsContainer, { bottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleLike(currentProject.id)}
          >
            <Heart
              size={32}
              color="#FFFFFF"
              fill={liked[currentProject.id] ? "#EF4444" : "none"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleBookmark(currentProject.id)}
          >
            <Bookmark
              size={32}
              color="#FFFFFF"
              fill={bookmarked[currentProject.id] ? "#FFFFFF" : "none"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Share2 size={32} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleComment}
          >
            <MessageCircle size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  projectSlide: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'flex-start',
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight,
    overflow: 'hidden',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uiLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    zIndex: 100,
  },
  closeButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonsContainer: {
    position: 'absolute',
    right: 16,
    gap: 16,
    alignItems: 'center',
  },
  actionButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  infoCardContainer: {
    position: 'absolute',
    left: 16,
    right: 80,
  },
  infoCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoCardContent: {
    padding: 10,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  projectTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingNumber: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  materialsScrollView: {
    marginBottom: 6,
    maxHeight: 32,
  },
  materialsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  materialTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  materialTagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  projectDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 220,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
