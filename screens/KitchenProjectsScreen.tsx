import React, { useState } from 'react';
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
import { X, Star, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProjectViewerScreen from './ProjectViewerScreen';

const { width: screenWidth } = Dimensions.get('window');

interface KitchenProjectsScreenProps {
  onClose: () => void;
}

export default function KitchenProjectsScreen({ onClose }: KitchenProjectsScreenProps) {
  const insets = useSafeAreaInsets();
  const [showProjectViewer, setShowProjectViewer] = useState(false);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const filterCategories = ['All', 'Modern', 'Traditional', 'Industrial', 'Coastal'];

  // Masonry layout - alternating heights for Pinterest effect
  const kitchenProjects = [
    {
      id: '1',
      image: require('../assets/images/project-family-home.jpg'),
      images: [
        require('../assets/images/project-family-home.jpg'),
        require('../assets/images/project-modern-loft.jpg'),
        require('../assets/images/project-beach-house.jpg'),
      ],
      title: 'Modern White Kitchen',
      rating: 5,
      date: 'Sep 2025',
      height: 280,
      materials: ['Quartz countertops', 'Shaker cabinets', 'Subway tile'],
      description: 'Complete kitchen transformation featuring modern white cabinetry, marble countertops, and stainless steel appliances.',
    },
    {
      id: '2',
      image: require('../assets/images/project-modern-loft.jpg'),
      images: [
        require('../assets/images/project-modern-loft.jpg'),
        require('../assets/images/project-downtown-office.jpg'),
      ],
      title: 'Industrial Loft Kitchen',
      rating: 5,
      date: 'Aug 2025',
      height: 220,
      materials: ['Concrete counters', 'Metal fixtures', 'Edison lighting'],
      description: 'Urban industrial design with exposed brick, concrete surfaces, and custom metal shelving.',
    },
    {
      id: '3',
      image: require('../assets/images/project-beach-house.jpg'),
      title: 'Coastal Kitchen Remodel',
      rating: 5,
      date: 'Jul 2025',
      height: 300,
      materials: ['Soft-close cabinets', 'Glass tile backsplash', 'Pendant lights'],
      description: 'Light and airy coastal kitchen with white shaker cabinets and ocean-inspired blue accents.',
    },
    {
      id: '4',
      image: require('../assets/images/project-downtown-office.jpg'),
      title: 'Contemporary Dark Kitchen',
      rating: 5,
      date: 'Jun 2025',
      height: 240,
      materials: ['Dark oak cabinets', 'Granite counters', 'Under-cabinet LED'],
      description: 'Sophisticated dark kitchen featuring custom cabinetry and premium appliances.',
    },
    {
      id: '5',
      image: require('../assets/images/project-sunset-villa.jpg'),
      title: 'Luxury Villa Kitchen',
      rating: 5,
      date: 'May 2025',
      height: 260,
      materials: ['Marble island', 'Custom range hood', 'Wine refrigerator'],
      description: 'High-end kitchen remodel with luxury finishes and professional-grade appliances.',
    },
    {
      id: '6',
      image: require('../assets/images/project-warehouse.jpg'),
      title: 'Rustic Farmhouse Kitchen',
      rating: 5,
      date: 'Apr 2025',
      height: 290,
      materials: ['Reclaimed wood', 'Farmhouse sink', 'Butcher block'],
      description: 'Charming farmhouse kitchen with rustic wood beams and vintage-inspired fixtures.',
    },
    {
      id: '7',
      image: require('../assets/images/hero-project.jpg'),
      title: 'Classic Traditional Kitchen',
      rating: 5,
      date: 'Mar 2025',
      height: 250,
      materials: ['Raised panel doors', 'Granite counters', 'Crown molding'],
      description: 'Timeless traditional kitchen with rich wood tones and elegant detailing.',
    },
    {
      id: '8',
      image: require('../assets/images/project-family-home.jpg'),
      title: 'Open Concept Kitchen',
      rating: 5,
      date: 'Feb 2025',
      height: 270,
      materials: ['Large island', 'Waterfall edge', 'Smart appliances'],
      description: 'Spacious open-concept kitchen perfect for entertaining with seamless flow to living areas.',
    },
  ];

  // Split into two columns for masonry
  const leftColumn = kitchenProjects.filter((_, index) => index % 2 === 0);
  const rightColumn = kitchenProjects.filter((_, index) => index % 2 === 1);

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
        {/* Title and Description */}
        <View style={styles.topSection}>
          <Text style={styles.pageTitle}>Kitchen Projects</Text>
          <Text style={styles.description}>
            We specialize in transforming kitchens into beautiful, functional spaces. From modern minimalist designs to warm traditional styles, our expert team brings your vision to life with quality craftsmanship and attention to detail.
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {/* Search Icon */}
            <TouchableOpacity style={styles.searchIconButton}>
              <Search size={20} color="#64748B" />
            </TouchableOpacity>

            {/* Filter Pills */}
            {filterCategories.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  selectedFilter === filter && styles.filterPillActive,
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterPillText,
                  selectedFilter === filter && styles.filterPillTextActive,
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Masonry Grid */}
        <View style={styles.masonryContainer}>
          <View style={styles.masonryColumn}>
            {leftColumn.map((project, idx) => {
              const projectIndex = kitchenProjects.findIndex(p => p.id === project.id);
              return (
                <TouchableOpacity 
                  key={project.id} 
                  style={[styles.projectCard, { height: project.height }]}
                  onPress={() => {
                    console.log('Tapped left column project:', project.title, 'at index:', projectIndex);
                    setSelectedProjectIndex(projectIndex);
                    setShowProjectViewer(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Image source={project.image} style={styles.projectImage} />
                  <LinearGradient
                    colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']}
                    style={styles.projectOverlay}
                  >
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <View style={styles.projectMetadata}>
                      <View style={styles.projectRating}>
                        <Text style={styles.ratingNumber}>{project.rating}</Text>
                        <Star size={10} color="#FCD34D" fill="#FCD34D" />
                      </View>
                      <Text style={styles.projectDate}>{project.date}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.masonryColumn}>
            {rightColumn.map((project, idx) => {
              const projectIndex = kitchenProjects.findIndex(p => p.id === project.id);
              return (
                <TouchableOpacity 
                  key={project.id} 
                  style={[styles.projectCard, { height: project.height }]}
                  onPress={() => {
                    console.log('Tapped right column project:', project.title, 'at index:', projectIndex);
                    setSelectedProjectIndex(projectIndex);
                    setShowProjectViewer(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Image source={project.image} style={styles.projectImage} />
                  <LinearGradient
                    colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']}
                    style={styles.projectOverlay}
                  >
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <View style={styles.projectMetadata}>
                      <View style={styles.projectRating}>
                        <Text style={styles.ratingNumber}>{project.rating}</Text>
                        <Star size={10} color="#FCD34D" fill="#FCD34D" />
                      </View>
                      <Text style={styles.projectDate}>{project.date}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Project Viewer Modal */}
      <Modal
        visible={showProjectViewer}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <ProjectViewerScreen
          projects={kitchenProjects}
          initialIndex={selectedProjectIndex}
          onClose={() => setShowProjectViewer(false)}
        />
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
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  topSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  pageTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#1E293B',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  filterContainer: {
    paddingVertical: 16,
  },
  filterScrollContent: {
    paddingHorizontal: 24,
    gap: 12,
    alignItems: 'center',
  },
  searchIconButton: {
    width: 44,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#64748B',
  },
  filterPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  masonryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  masonryColumn: {
    flex: 1,
    gap: 12,
  },
  projectCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 0,
  },
  projectImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  projectOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 12,
  },
  projectTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  projectMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingNumber: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  projectDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
