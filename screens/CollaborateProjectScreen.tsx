import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  TextInput,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  Search, 
  X, 
  MapPin, 
  Camera, 
  Calendar,
  FolderOpen,
  Check,
  Sparkles,
  Users,
  CheckSquare,
  MessageSquare,
  Share2,
  ArrowRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ContractorData {
  id: string;
  name: string;
  image: any;
  trade: string;
}

interface Project {
  id: string;
  name: string;
  address: string;
  image: any;
  photoCount: number;
  lastUpdated: string;
}

interface CollaborateProjectScreenProps {
  contractor: ContractorData;
  onClose: () => void;
  onCollaborationStarted?: () => void;
}

// Fake projects data
const PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Johnson Family Renovation',
    address: '1234 Oak Street, Lincoln, NE',
    image: require('../assets/images/project-family-home.jpg'),
    photoCount: 156,
    lastUpdated: '2 hours ago',
  },
  {
    id: '2',
    name: 'Downtown Office Remodel',
    address: '500 P Street, Lincoln, NE',
    image: require('../assets/images/project-downtown-office.jpg'),
    photoCount: 89,
    lastUpdated: 'Yesterday',
  },
  {
    id: '3',
    name: 'Sunset Vista Build',
    address: '8900 Pioneers Blvd, Lincoln, NE',
    image: require('../assets/images/project-sunset-villa.jpg'),
    photoCount: 234,
    lastUpdated: '3 days ago',
  },
  {
    id: '4',
    name: 'Haymarket Loft Conversion',
    address: '700 Q Street #4, Lincoln, NE',
    image: require('../assets/images/project-modern-loft.jpg'),
    photoCount: 67,
    lastUpdated: '1 week ago',
  },
  {
    id: '5',
    name: 'Coastal Beach House',
    address: '2500 South Shore Dr, Lincoln, NE',
    image: require('../assets/images/project-beach-house.jpg'),
    photoCount: 312,
    lastUpdated: '2 weeks ago',
  },
  {
    id: '6',
    name: 'Industrial Warehouse',
    address: '1800 N 56th Street, Lincoln, NE',
    image: require('../assets/images/project-warehouse.jpg'),
    photoCount: 45,
    lastUpdated: '1 month ago',
  },
];

export default function CollaborateProjectScreen({ contractor, onClose, onCollaborationStarted }: CollaborateProjectScreenProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectSelection, setShowProjectSelection] = useState(false);

  const filteredProjects = PROJECTS.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setShowSuccess(true);
    // Auto-favorite the contractor when collaborating
    if (onCollaborationStarted) {
      onCollaborationStarted();
    }
  };

  const handleSuccessClose = () => {
    // Close the success modal first with animation, then close this screen
    // The delay prevents state updates on an unmounting component
    setShowSuccess(false);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  // Collaboration features for the explainer
  const collaborationFeatures = [
    {
      icon: Camera,
      title: 'Share Photos',
      description: 'Both of you can take and upload photos to the same project',
    },
    {
      icon: CheckSquare,
      title: 'Share Checklists',
      description: 'Assign and complete tasks together to keep work on track',
    },
    {
      icon: MessageSquare,
      title: 'Stay in Sync',
      description: 'Comment on photos and get notified of updates in real-time',
    },
    {
      icon: Users,
      title: 'Team Visibility',
      description: 'Everyone stays up to speed on project progress',
    },
  ];

  // Intro/Explainer View
  if (!showProjectSelection) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <ChevronLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Collaborate</Text>
            <Text style={styles.headerSubtitle}>with {contractor.name}</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <ScrollView 
          style={styles.explainerScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.explainerContent}
        >
          {/* Hero Section */}
          <View style={styles.explainerHero}>
            <LinearGradient
              colors={['#DC2626', '#B91C1C']}
              style={styles.explainerIconContainer}
            >
              <Share2 size={40} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.explainerTitle}>Project Collaboration</Text>
            <Text style={styles.explainerSubtitle}>
              Share a project in CompanyCam where you and {contractor.name} can work together seamlessly.
            </Text>
          </View>

          {/* Features List */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresSectionTitle}>What you can do together</Text>
            {collaborationFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <View key={index} style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <IconComponent size={22} color="#DC2626" />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Sparkles size={18} color="#F59E0B" />
            <Text style={styles.infoNoteText}>
              Your collaborator will receive an invitation to join the project. They'll have access to add photos and complete assigned tasks.
            </Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom CTA */}
        <View style={[styles.bottomCTA, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity 
            style={styles.chooseProjectButton}
            onPress={() => setShowProjectSelection(true)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#DC2626', '#B91C1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.chooseProjectGradient}
            >
              <Text style={styles.chooseProjectText}>Choose which project to share</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Project Selection View
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setShowProjectSelection(false)}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Select a Project</Text>
          <Text style={styles.headerSubtitle}>to share with {contractor.name}</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={20} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Projects List */}
      <ScrollView 
        style={styles.projectsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.projectsContent}
      >
        <Text style={styles.sectionTitle}>Your Projects</Text>
        
        {filteredProjects.map((project) => (
          <TouchableOpacity 
            key={project.id}
            style={styles.projectCard}
            onPress={() => handleSelectProject(project)}
            activeOpacity={0.7}
          >
            <Image source={project.image} style={styles.projectImage} />
            <View style={styles.projectInfo}>
              <Text style={styles.projectName} numberOfLines={1}>{project.name}</Text>
              <View style={styles.projectMeta}>
                <MapPin size={12} color="#64748B" />
                <Text style={styles.projectAddress} numberOfLines={1}>{project.address}</Text>
              </View>
              <View style={styles.projectStats}>
                <View style={styles.projectStat}>
                  <Camera size={12} color="#64748B" />
                  <Text style={styles.projectStatText}>{project.photoCount}</Text>
                </View>
                <View style={styles.projectStatDot} />
                <View style={styles.projectStat}>
                  <Calendar size={12} color="#64748B" />
                  <Text style={styles.projectStatText}>{project.lastUpdated}</Text>
                </View>
              </View>
            </View>
            <View style={styles.selectButton}>
              <Text style={styles.selectButtonText}>Select</Text>
            </View>
          </TouchableOpacity>
        ))}

        {filteredProjects.length === 0 && (
          <View style={styles.emptyState}>
            <FolderOpen size={48} color="#CBD5E1" />
            <Text style={styles.emptyStateTitle}>No projects found</Text>
            <Text style={styles.emptyStateText}>Try a different search term</Text>
          </View>
        )}

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        animationType="fade"
        transparent
      >
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconContainer}>
              <LinearGradient
                colors={['#22C55E', '#16A34A']}
                style={styles.successIconGradient}
              >
                <Check size={48} color="#FFFFFF" strokeWidth={3} />
              </LinearGradient>
            </View>
            
            <Text style={styles.successTitle}>Collaboration Started!</Text>
            <Text style={styles.successSubtitle}>
              {contractor.name} now has access to
            </Text>
            
            {selectedProject && (
              <View style={styles.successProjectCard}>
                <Image source={selectedProject.image} style={styles.successProjectImage} />
                <View style={styles.successProjectInfo}>
                  <Text style={styles.successProjectName}>{selectedProject.name}</Text>
                  <Text style={styles.successProjectAddress}>{selectedProject.address}</Text>
                </View>
              </View>
            )}

            <Text style={styles.successDescription}>
              They can now add photos, notes, and collaborate with your team on this project.
            </Text>

            <View style={styles.successActions}>
              <TouchableOpacity 
                style={styles.successButton}
                onPress={handleSuccessClose}
              >
                <Text style={styles.successButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  // Explainer View Styles
  explainerScroll: {
    flex: 1,
  },
  explainerContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  explainerHero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  explainerIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  explainerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  explainerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresSectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  infoNoteText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#92400E',
    lineHeight: 19,
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  chooseProjectButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  chooseProjectGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 10,
  },
  chooseProjectText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  // Original styles below
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  infoBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBannerText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1E293B',
    padding: 0,
  },
  projectsList: {
    flex: 1,
    marginTop: 16,
  },
  projectsContent: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  projectImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 14,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  projectAddress: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  projectStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  projectStatText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  projectStatDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  selectButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  selectButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#64748B',
    marginTop: 16,
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  // Success Modal
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  successTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  successProjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  successProjectImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
  },
  successProjectInfo: {
    flex: 1,
  },
  successProjectName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 2,
  },
  successProjectAddress: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
  },
  successDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  successActions: {
    width: '100%',
  },
  successButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  successButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

