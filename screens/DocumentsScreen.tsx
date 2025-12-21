import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Search, FileText, File, Receipt, FileSpreadsheet, Download, Eye, Calendar, User } from 'lucide-react-native';

interface DocumentsScreenProps {
  onClose: () => void;
}

// Sample documents data
const documentsData = [
  {
    id: '1',
    name: 'Project Proposal - Oakridge Residence',
    type: 'proposal',
    size: '2.4 MB',
    date: '2024-01-15',
    author: 'Sarah Anderson',
    category: 'Notes and proposals',
  },
  {
    id: '2',
    name: 'Architectural Plans v3.2',
    type: 'proposal',
    size: '15.8 MB',
    date: '2024-02-20',
    author: 'Emily Chen',
    category: 'Notes and proposals',
  },
  {
    id: '3',
    name: 'Invoice #INV-2024-001',
    type: 'invoice',
    size: '124 KB',
    date: '2024-03-01',
    author: 'Mike Johnson',
    category: 'Invoices',
    amount: '$12,500',
  },
  {
    id: '4',
    name: 'Invoice #INV-2024-002',
    type: 'invoice',
    size: '98 KB',
    date: '2024-03-15',
    author: 'David Martinez',
    category: 'Invoices',
    amount: '$8,750',
  },
  {
    id: '5',
    name: 'Electrical Inspection Report',
    type: 'report',
    size: '3.2 MB',
    date: '2024-03-10',
    author: 'Lisa Thompson',
    category: 'Reports',
  },
  {
    id: '6',
    name: 'Foundation Inspection Certificate',
    type: 'report',
    size: '1.8 MB',
    date: '2024-02-28',
    author: 'Lisa Thompson',
    category: 'Reports',
  },
  {
    id: '7',
    name: 'Meeting Notes - March 15',
    type: 'proposal',
    size: '45 KB',
    date: '2024-03-15',
    author: 'Sarah Anderson',
    category: 'Notes and proposals',
  },
  {
    id: '8',
    name: 'Change Order #CO-001',
    type: 'proposal',
    size: '234 KB',
    date: '2024-03-05',
    author: 'Mike Johnson',
    category: 'Notes and proposals',
  },
  {
    id: '9',
    name: 'Progress Report - Week 12',
    type: 'report',
    size: '5.6 MB',
    date: '2024-03-18',
    author: 'Mike Johnson',
    category: 'Reports',
  },
  {
    id: '10',
    name: 'Invoice #INV-2024-003',
    type: 'invoice',
    size: '156 KB',
    date: '2024-03-20',
    author: 'Emily Chen',
    category: 'Invoices',
    amount: '$4,200',
  },
];

export default function DocumentsScreen({ onClose }: DocumentsScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = ['All', 'Notes and proposals', 'Invoices', 'Reports'];

  // Filter documents based on selected category
  const getFilteredDocuments = () => {
    let filtered = [...documentsData];

    // Filter by category
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(doc => doc.category === selectedFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <Receipt size={24} color="#059669" />;
      case 'report':
        return <FileSpreadsheet size={24} color="#DC2626" />;
      case 'proposal':
      default:
        return <FileText size={24} color="#3B82F6" />;
    }
  };

  const getDocumentIconBackground = (type: string) => {
    switch (type) {
      case 'invoice':
        return '#ECFDF5';
      case 'report':
        return '#FEE2E2';
      case 'proposal':
      default:
        return '#EEF2FF';
    }
  };

  const renderDocument = ({ item }: { item: typeof documentsData[0] }) => (
    <TouchableOpacity style={styles.documentCard}>
      <View style={[
        styles.documentIcon,
        { backgroundColor: getDocumentIconBackground(item.type) }
      ]}>
        {getDocumentIcon(item.type)}
      </View>
      
      <View style={styles.documentInfo}>
        <Text style={styles.documentName} numberOfLines={1}>
          {item.name}
        </Text>
        
        <View style={styles.documentMeta}>
          <View style={styles.metaItem}>
            <Calendar size={12} color="#6B7280" />
            <Text style={styles.metaText}>{item.date}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <User size={12} color="#6B7280" />
            <Text style={styles.metaText}>{item.author}</Text>
          </View>
          
          <Text style={styles.metaText}>{item.size}</Text>
          
          {item.amount && (
            <Text style={styles.amountText}>{item.amount}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.documentActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Eye size={18} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Download size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const filteredDocuments = getFilteredDocuments();

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <ChevronLeft size={28} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documents</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                selectedFilter === filter && styles.filterTabActive
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterTabText,
                selectedFilter === filter && styles.filterTabTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Documents List */}
      <FlatList
        data={filteredDocuments}
        keyExtractor={(item) => item.id}
        renderItem={renderDocument}
        contentContainerStyle={styles.documentsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FileText size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No documents found</Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? `No documents match "${searchQuery}"`
                : `No ${selectedFilter === 'All' ? 'documents' : selectedFilter.toLowerCase()} in this project`}
            </Text>
          </View>
        }
      />

      {/* Document Count */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}
        </Text>
      </View>
    </SafeAreaView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1E293B',
  },
  headerSpacer: {
    width: 36,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1E293B',
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterTabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  documentsList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 6,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  amountText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#059669',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});