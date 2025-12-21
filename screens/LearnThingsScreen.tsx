import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image, Dimensions, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Camera, Activity, MessageSquare, Tag, Edit, CheckSquare, FileText, Share2, Image as ImageIcon, Zap, Star, ChevronRight, Play, Video, Users, Upload, Plug, FolderPlus, Trophy, Lock, CheckCircle2, Gift, ArrowRight } from 'lucide-react-native';

interface LearnThingsScreenProps {
  onClose: () => void;
}

interface LearningItem {
  id: string;
  title: string;
  category: string;
  action: string;
  icon: any;
  completed: boolean;
  xp: number;
  image: any;
}

interface LearningBundle {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  gradientColors: [string, string];
  unlockReward: string;
  items: LearningItem[];
  level: number;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_HEIGHT = CARD_WIDTH * 1.3; // ~3:4 aspect ratio

export default function LearnThingsScreen({ onClose }: LearnThingsScreenProps) {
  const insets = useSafeAreaInsets();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LearningItem | null>(null);
  
  // Using specific images based on the user's request for visual cards
  const [bundles, setBundles] = useState<LearningBundle[]>([
    {
      id: 'rookie',
      name: 'Rookie',
      subtitle: 'Get your first wins',
      color: '#10B981',
      gradientColors: ['#10B981', '#059669'],
      unlockReward: '$25 Swag Credit',
      level: 1,
      items: [
        {
          id: 'rookie-1',
          title: 'Create a Project',
          category: 'Operations',
          action: 'Create your first project and add details',
          icon: FolderPlus,
          completed: false,
          xp: 100,
          image: require('../assets/images/Screenshotmap.png'),
        },
        {
          id: 'rookie-2',
          title: 'Photo & Video Capture',
          category: 'Field',
          action: 'Take 3 jobsite photos in a new project',
          icon: Camera,
          completed: false,
          xp: 100,
          image: require('../assets/images/project-family-home.jpg'),
        },
        {
          id: 'rookie-3',
          title: 'Project Feed',
          category: 'Operations',
          action: 'Open the Feed and view today\'s updates',
          icon: Activity,
          completed: false,
          xp: 50,
          image: require('../assets/images/photo-feed-icon-chatgpt.jpg'),
        },
        {
          id: 'rookie-4',
          title: 'Comments & @mentions',
          category: 'Collab',
          action: '@mention a teammate on a photo',
          icon: MessageSquare,
          completed: false,
          xp: 75,
          image: require('../assets/images/activity-sarah.jpg'),
        },
        {
          id: 'rookie-5',
          title: 'Tags & Labels',
          category: 'Organization',
          action: 'Add two tags to today\'s photos',
          icon: Tag,
          completed: false,
          xp: 75,
          image: require('../assets/images/thumb-modern-loft.jpg'),
        },
        {
          id: 'rookie-6',
          title: 'Add Users',
          category: 'Collab',
          action: 'Invite a teammate to join your account',
          icon: Users,
          completed: false,
          xp: 150,
          image: require('../assets/images/activity-david.jpg'),
        },
      ],
    },
    {
      id: 'journeyman',
      name: 'Journeyman',
      subtitle: 'Work faster, reduce rework',
      color: '#3B82F6',
      gradientColors: ['#3B82F6', '#2563EB'],
      unlockReward: 'Beta Feature Access',
      level: 2,
      items: [
        {
          id: 'journeyman-1',
          title: 'Annotations & Measurements',
          category: 'Field',
          action: 'Mark up a photo with an arrow + note',
          icon: Edit,
          completed: false,
          xp: 150,
          image: require('../assets/images/thumb-warehouse.jpg'),
        },
        {
          id: 'journeyman-2',
          title: 'Dual Video Recording',
          category: 'Marketing',
          action: 'Record front and back camera for video explainer',
          icon: Video,
          completed: false,
          xp: 150,
          image: require('../assets/images/project-downtown-office.jpg'),
        },
        {
          id: 'journeyman-3',
          title: 'Checklists / Punchlists',
          category: 'AI',
          action: 'Complete a checklist with your voice',
          icon: CheckSquare,
          completed: false,
          xp: 200,
          image: require('../assets/images/thumb-beach-house.jpg'),
        },
        {
          id: 'journeyman-4',
          title: 'Pages (Docs Builder)',
          category: 'Reporting',
          action: 'Create a Page and export to PDF',
          icon: FileText,
          completed: false,
          xp: 200,
          image: require('../assets/images/project-modern-loft.jpg'),
        },
        {
          id: 'journeyman-5',
          title: 'Magic Uploader',
          category: 'AI',
          action: 'Find and upload photos by location to project',
          icon: Upload,
          completed: false,
          xp: 150,
          image: require('../assets/images/mapwithpiczoomedout.png'),
        },
        {
          id: 'journeyman-6',
          title: 'Galleries & Timelines',
          category: 'Client Comms',
          action: 'Create and share one Timeline link',
          icon: Share2,
          completed: false,
          xp: 200,
          image: require('../assets/images/project-sunset-villa.jpg'),
        },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      subtitle: 'Turn work into reputation',
      color: '#8B5CF6',
      gradientColors: ['#8B5CF6', '#7C3AED'],
      unlockReward: '30 Days Priority Support',
      level: 3,
      items: [
        {
          id: 'pro-1',
          title: 'Photo Reports',
          category: 'Reporting',
          action: 'Build a Photo Report from your last project',
          icon: FileText,
          completed: false,
          xp: 250,
          image: require('../assets/images/thumb-family-home.jpg'),
        },
        {
          id: 'pro-2',
          title: 'Before/After Templates',
          category: 'Marketing',
          action: 'Publish one Before/After to share',
          icon: ImageIcon,
          completed: false,
          xp: 250,
          image: require('../assets/images/project-beach-house.jpg'),
        },
        {
          id: 'pro-3',
          title: 'Share Your Portfolio',
          category: 'Marketing',
          action: 'Share your portfolio map with a client',
          icon: Share2,
          completed: false,
          xp: 300,
          image: require('../assets/images/Screenshotmap.png'),
        },
        {
          id: 'pro-4',
          title: 'AI Note',
          category: 'AI',
          action: 'Take photos, talk to your phone, get organized notes',
          icon: Zap,
          completed: false,
          xp: 200,
          image: require('../assets/images/photo-feed-icon-chatgpt.png'),
        },
        {
          id: 'pro-5',
          title: 'Reviews',
          category: 'Marketing',
          action: 'Send one review request from a completed project',
          icon: Star,
          completed: false,
          xp: 300,
          image: require('../assets/images/activity-lisa.jpg'),
        },
        {
          id: 'pro-6',
          title: 'Connect Integration',
          category: 'Integrations',
          action: 'Link CompanyCam with another software tool',
          icon: Plug,
          completed: false,
          xp: 400,
          image: require('../assets/images/cc-logo.png'),
        },
      ],
    },
  ]);

  const handleItemPress = (bundleId: string, item: LearningItem) => {
    setSelectedItem(item);
    setShowVideoModal(true);
  };

  const handleMarkComplete = (bundleId: string, itemId: string) => {
    setBundles(prevBundles => 
      prevBundles.map(bundle => {
        if (bundle.id === bundleId) {
          return {
            ...bundle,
            items: bundle.items.map(item => 
              item.id === itemId ? { ...item, completed: !item.completed } : item
            ),
          };
        }
        return bundle;
      })
    );
  };

  const calculateProgress = (bundle: LearningBundle) => {
    const completed = bundle.items.filter(item => item.completed).length;
    const total = bundle.items.length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const calculateTotalXP = () => {
    return bundles.reduce((total, bundle) => {
      return total + bundle.items.reduce((bundleTotal, item) => {
        return bundleTotal + (item.completed ? item.xp : 0);
      }, 0);
    }, 0);
  };

  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'Field': return { color: '#F59E0B', bg: '#FFFBEB' };
      case 'Operations': return { color: '#3B82F6', bg: '#EFF6FF' };
      case 'Collab': return { color: '#8B5CF6', bg: '#F5F3FF' };
      case 'Organization': return { color: '#EC4899', bg: '#FDF2F8' };
      case 'Reporting': return { color: '#6366F1', bg: '#EEF2FF' };
      case 'Marketing': return { color: '#10B981', bg: '#ECFDF5' };
      case 'AI': return { color: '#7C3AED', bg: '#F5F3FF' };
      case 'Integrations': return { color: '#0891B2', bg: '#ECFEFF' };
      case 'Client Comms': return { color: '#DB2777', bg: '#FDF2F8' };
      default: return { color: '#64748B', bg: '#F8FAFC' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerSubtitle}>TRAINING CENTER</Text>
            <Text style={styles.headerTitle}>Master the App</Text>
          </View>
          <View style={styles.xpContainer}>
            <Trophy size={16} color="#F59E0B" />
            <Text style={styles.xpText}>{calculateTotalXP()} XP</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.closeButton, { top: insets.top + 10 }]}
          onPress={onClose}
        >
          <X size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introDescription}>
            Swipe through missions to unlock badges and rewards.
          </Text>
        </View>

        <View style={styles.contentContainer}>
          {bundles.map((bundle) => {
            const progress = calculateProgress(bundle);
            const isComplete = progress.completed === progress.total;

            return (
              <View key={bundle.id} style={styles.bundleSection}>
                {/* Bundle Header */}
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <View style={[styles.levelBadge, { backgroundColor: bundle.color }]}>
                      <Text style={styles.levelBadgeText}>{bundle.level}</Text>
                    </View>
                    <View>
                      <Text style={styles.sectionTitle}>{bundle.name}</Text>
                      <Text style={styles.sectionSubtitle}>{bundle.subtitle}</Text>
                    </View>
                  </View>
                  <View style={styles.progressIndicator}>
                    <Text style={[styles.progressText, { color: bundle.color }]}>
                      {progress.completed}/{progress.total}
                    </Text>
                  </View>
                </View>

                {/* Horizontal Cards ScrollView */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cardsScrollContent}
                  decelerationRate="fast"
                  snapToInterval={CARD_WIDTH + 16} // Card width + gap
                >
                  {bundle.items.map((item) => {
                    const categoryColors = getCategoryColors(item.category);
                    
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.card,
                          { width: CARD_WIDTH, height: CARD_HEIGHT }
                        ]}
                        onPress={() => handleItemPress(bundle.id, item)}
                        activeOpacity={0.9}
                      >
                        {/* Card Image Background */}
                        <ImageBackground
                          source={item.image}
                          style={styles.cardImage}
                          imageStyle={{ borderRadius: 24 }}
                        >
                          <LinearGradient
                            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
                            style={styles.cardGradient}
                          >
                            <View style={styles.cardHeader}>
                              <View style={[styles.categoryTag, { backgroundColor: categoryColors.bg }]}>
                                <Text style={[styles.categoryText, { color: categoryColors.color }]}>
                                  {item.category}
                                </Text>
                              </View>
                              <View style={styles.xpTag}>
                                <Text style={styles.xpTagText}>{item.xp} XP</Text>
                              </View>
                            </View>

                            <View style={styles.cardContent}>
                              <Text style={styles.cardTitle} numberOfLines={2}>
                                {item.title}
                              </Text>
                              <Text style={styles.cardAction} numberOfLines={2}>
                                {item.action}
                              </Text>
                              
                              <View style={styles.cardFooter}>
                                <TouchableOpacity 
                                  style={[
                                    styles.actionButton,
                                    item.completed ? styles.actionButtonCompleted : { backgroundColor: bundle.color }
                                  ]}
                                  onPress={(e) => {
                                    // Stop propagation if needed, but here we want the button to feel functional
                                    // For now, let's make the button open the modal too, or mark complete if that's the only action
                                    handleItemPress(bundle.id, item);
                                  }}
                                >
                                  <Text style={styles.actionButtonText}>
                                    {item.completed ? 'Completed' : 'Start Mission'}
                                  </Text>
                                  {!item.completed && <ArrowRight size={16} color="#FFFFFF" />}
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={[
                                    styles.checkbox,
                                    item.completed && { backgroundColor: '#10B981', borderColor: '#10B981' }
                                  ]}
                                  onPress={() => handleMarkComplete(bundle.id, item.id)}
                                >
                                  {item.completed && <CheckCircle2 size={20} color="#FFFFFF" />}
                                </TouchableOpacity>
                              </View>
                            </View>
                          </LinearGradient>
                        </ImageBackground>
                      </TouchableOpacity>
                    );
                  })}
                  
                  {/* Reward Card at end of scroll */}
                  <View style={[styles.card, styles.rewardCard, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
                    <View style={[styles.rewardCardContent, { borderColor: bundle.color }]}>
                      <View style={[styles.rewardIconCircle, { backgroundColor: bundle.backgroundColor }]}>
                        <Gift size={40} color={bundle.color} />
                      </View>
                      <Text style={styles.rewardCardTitle}>Level Complete!</Text>
                      <Text style={styles.rewardCardSubtitle}>
                        Complete all missions to unlock:
                      </Text>
                      <Text style={[styles.rewardCardValue, { color: bundle.color }]}>
                        {bundle.unlockReward}
                      </Text>
                      {isComplete ? (
                        <View style={[styles.unlockedBadge, { backgroundColor: '#10B981' }]}>
                          <Text style={styles.unlockedText}>UNLOCKED</Text>
                        </View>
                      ) : (
                        <View style={styles.lockedBadge}>
                          <Lock size={16} color="#94A3B8" />
                          <Text style={styles.lockedText}>LOCKED</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </ScrollView>
              </View>
            );
          })}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Video/Task Modal */}
      <Modal
        visible={showVideoModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVideoModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mission Briefing</Text>
            <TouchableOpacity onPress={() => setShowVideoModal(false)}>
              <X size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>
          
          {selectedItem && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalImageContainer}>
                <Image 
                  source={selectedItem.image} 
                  style={styles.modalImage} 
                  resizeMode="cover" 
                />
              </View>

              <View style={styles.modalMissionInfo}>
                <View style={[styles.modalCategoryBadge, { backgroundColor: getCategoryColors(selectedItem.category).bg }]}>
                  <Text style={[styles.modalCategoryText, { color: getCategoryColors(selectedItem.category).color }]}>
                    {selectedItem.category.toUpperCase()}
                  </Text>
                </View>
                
                <Text style={styles.modalMissionTitle}>{selectedItem.title}</Text>
                <Text style={styles.modalMissionDesc}>{selectedItem.action}</Text>
                
                <View style={styles.modalXpBadge}>
                  <Trophy size={16} color="#F59E0B" />
                  <Text style={styles.modalXpText}>{selectedItem.xp} XP REWARD</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[
                  styles.completeButton, 
                  selectedItem.completed && styles.completeButtonActive
                ]}
                onPress={() => {
                  if (selectedItem) {
                    const bundle = bundles.find(b => b.items.some(i => i.id === selectedItem.id));
                    if (bundle) handleMarkComplete(bundle.id, selectedItem.id);
                  }
                  setShowVideoModal(false);
                }}
              >
                <Text style={styles.completeButtonText}>
                  {selectedItem.completed ? 'Mark Incomplete' : 'Complete Mission'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 10,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 40, 
  },
  headerSubtitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#0F172A',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCD34D',
    gap: 6,
    marginBottom: 4,
  },
  xpText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#B45309',
  },
  scrollView: {
    flex: 1,
  },
  introSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  introDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
  },
  contentContainer: {
    paddingVertical: 10,
    gap: 32,
  },
  bundleSection: {
    gap: 16,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1E293B',
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  progressIndicator: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
  },
  cardsScrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardImage: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  categoryText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  xpTag: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  xpTagText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#FCD34D',
  },
  cardContent: {
    gap: 8,
  },
  cardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardAction: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonCompleted: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  actionButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  checkbox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  rewardCard: {
    backgroundColor: '#F8FAFC',
    padding: 8,
  },
  rewardCardContent: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  rewardIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardCardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1E293B',
    textAlign: 'center',
  },
  rewardCardSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  rewardCardValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginTop: 8,
  },
  lockedText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#64748B',
  },
  unlockedBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  unlockedText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1E293B',
  },
  modalContent: {
    flex: 1,
  },
  modalImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#F1F5F9',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalMissionInfo: {
    padding: 24,
    alignItems: 'center',
  },
  modalCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalCategoryText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  modalMissionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMissionDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalXpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 8,
  },
  modalXpText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#D97706',
  },
  completeButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    backgroundColor: '#1E293B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonActive: {
    backgroundColor: '#10B981',
  },
  completeButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
