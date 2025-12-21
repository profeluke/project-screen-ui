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
  Sparkles
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

export default function CollaborateProjectScreen({ contractor, onClose }: CollaborateProjectScreenProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = PROJECTS.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    // Close the success modal first with animation, then close this screen
    // The delay prevents state updates on an unmounting component
    setShowSuccess(false);
    setTimeout(() => {
      onClose();
    }, 150);
  };

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

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <View style={styles.infoBannerIcon}>
          <Sparkles size={20} color="#DC2626" />
        </View>
        <Text style={styles.infoBannerText}>
          Select a project to invite {contractor.name.split(' ')[0]} to collaborate. They'll be able to add photos and notes.
        </Text>
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

