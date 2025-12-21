import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, DollarSign, Calendar, Clock, Check, AlertCircle, Send, Edit3, MoreHorizontal } from 'lucide-react-native';
import PaymentCreationBottomSheet from '../components/PaymentCreationBottomSheet';

interface PaymentRequest {
  id: string;
  title: string;
  recipient: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'draft';
  dueDate: string;
  sentDate: string;
  description?: string;
  projectName?: string;
}

interface PaymentsScreenProps {
  onClose: () => void;
}

const samplePayments: PaymentRequest[] = [
  {
    id: '1',
    title: 'Foundation Work Invoice',
    recipient: 'Bob Anderson',
    amount: 15000,
    status: 'pending',
    dueDate: '2024-01-15',
    sentDate: '2023-12-28',
    description: 'Foundation excavation and concrete work',
    projectName: 'Oakridge Residence'
  },
  {
    id: '2',
    title: 'Electrical Installation',
    recipient: 'Sarah Anderson',
    amount: 8500,
    status: 'paid',
    dueDate: '2023-12-20',
    sentDate: '2023-12-01',
    description: 'Complete electrical rough-in',
    projectName: 'Oakridge Residence'
  },
  {
    id: '3',
    title: 'Material Deposit',
    recipient: 'Mike Johnson',
    amount: 5000,
    status: 'overdue',
    dueDate: '2023-12-15',
    sentDate: '2023-11-30',
    description: 'Lumber and materials deposit',
    projectName: 'Downtown Office Complex'
  },
  {
    id: '4',
    title: 'Plumbing Rough-in',
    recipient: 'David Martinez',
    amount: 12000,
    status: 'draft',
    dueDate: '2024-01-30',
    sentDate: '',
    description: 'Plumbing installation and fixtures',
    projectName: 'Sunset Villa Renovation'
  },
];

export default function PaymentsScreen({ onClose }: PaymentsScreenProps) {
  const insets = useSafeAreaInsets();
  const [payments, setPayments] = useState<PaymentRequest[]>(samplePayments);
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'paid' | 'overdue' | 'draft'>('all');
  const [showCreationModal, setShowCreationModal] = useState(false);

  const getStatusColor = (status: PaymentRequest['status']) => {
    switch (status) {
      case 'paid': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'overdue': return '#EF4444';
      case 'draft': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: PaymentRequest['status']) => {
    switch (status) {
      case 'paid': return <Check size={16} color="#10B981" />;
      case 'pending': return <Clock size={16} color="#F59E0B" />;
      case 'overdue': return <AlertCircle size={16} color="#EF4444" />;
      case 'draft': return <Edit3 size={16} color="#6B7280" />;
      default: return <Clock size={16} color="#6B7280" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not sent';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredPayments = payments.filter(payment => {
    if (selectedTab === 'all') return true;
    return payment.status === selectedTab;
  });

  const getTotalAmount = () => {
    return filteredPayments.reduce((total, payment) => total + payment.amount, 0);
  };

  const getStatusCounts = () => {
    return {
      all: payments.length,
      pending: payments.filter(p => p.status === 'pending').length,
      paid: payments.filter(p => p.status === 'paid').length,
      overdue: payments.filter(p => p.status === 'overdue').length,
      draft: payments.filter(p => p.status === 'draft').length,
    };
  };

  const statusCounts = getStatusCounts();

  const handleCreatePayment = () => {
    setShowCreationModal(true);
  };

  const handleQuickInvoice = () => {
    console.log('Creating quick invoice...');
    // TODO: Navigate to quick invoice creation
  };

  const handleFromTemplate = () => {
    console.log('Creating from template...');
    // TODO: Navigate to template selection
  };

  const handleCustomRequest = () => {
    console.log('Creating custom request...');
    // TODO: Navigate to custom request creation
  };

  const handlePaymentAction = (payment: PaymentRequest) => {
    const actions = payment.status === 'draft' 
      ? [
          { text: 'Send Now', onPress: () => console.log('Send draft') },
          { text: 'Edit', onPress: () => console.log('Edit draft') },
          { text: 'Delete', style: 'destructive' as const, onPress: () => console.log('Delete draft') },
          { text: 'Cancel', style: 'cancel' as const }
        ]
      : [
          { text: 'Mark as Paid', onPress: () => console.log('Mark paid') },
          { text: 'Send Reminder', onPress: () => console.log('Send reminder') },
          { text: 'View Details', onPress: () => console.log('View details') },
          { text: 'Cancel', style: 'cancel' as const }
        ];

    Alert.alert(payment.title, 'Choose an action:', actions);
  };

  const renderPaymentItem = ({ item }: { item: PaymentRequest }) => (
    <TouchableOpacity 
      style={styles.paymentCard}
      onPress={() => handlePaymentAction(item)}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentTitle}>
          <Text style={styles.paymentTitleText}>{item.title}</Text>
          <Text style={styles.paymentRecipient}>{item.recipient}</Text>
        </View>
        <View style={styles.paymentAmount}>
          <Text style={styles.amountText}>{formatCurrency(item.amount)}</Text>
          <View style={styles.statusContainer}>
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      
      {item.projectName && (
        <Text style={styles.projectName}>📁 {item.projectName}</Text>
      )}
      
      {item.description && (
        <Text style={styles.paymentDescription}>{item.description}</Text>
      )}
      
      <View style={styles.paymentFooter}>
        <View style={styles.dateInfo}>
          <Calendar size={14} color="#6B7280" />
          <Text style={styles.dateText}>
            Due: {formatDate(item.dueDate)}
          </Text>
        </View>
        {item.sentDate && (
          <View style={styles.dateInfo}>
            <Send size={14} color="#6B7280" />
            <Text style={styles.dateText}>
              Sent: {formatDate(item.sentDate)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const tabs = [
    { key: 'all' as const, label: 'All', count: statusCounts.all },
    { key: 'pending' as const, label: 'Pending', count: statusCounts.pending },
    { key: 'paid' as const, label: 'Paid', count: statusCounts.paid },
    { key: 'overdue' as const, label: 'Overdue', count: statusCounts.overdue },
    { key: 'draft' as const, label: 'Drafts', count: statusCounts.draft },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 16, 32) }]}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreatePayment}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <DollarSign size={24} color="#3B82F6" />
          <Text style={styles.summaryTitle}>Total {selectedTab === 'all' ? 'Outstanding' : selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}</Text>
        </View>
        <Text style={styles.summaryAmount}>{formatCurrency(getTotalAmount())}</Text>
        <Text style={styles.summarySubtext}>
          {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.tabActive
              ]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text style={[
                styles.tabText,
                selectedTab === tab.key && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View style={[
                  styles.tabBadge,
                  selectedTab === tab.key && styles.tabBadgeActive
                ]}>
                  <Text style={[
                    styles.tabBadgeText,
                    selectedTab === tab.key && styles.tabBadgeTextActive
                  ]}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Payments List */}
      <FlatList
        data={filteredPayments}
        keyExtractor={(item) => item.id}
        renderItem={renderPaymentItem}
        style={styles.paymentsList}
        contentContainerStyle={styles.paymentsListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <DollarSign size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No {selectedTab === 'all' ? '' : selectedTab} payments</Text>
            <Text style={styles.emptyText}>
              {selectedTab === 'draft' 
                ? 'Create a new payment request to get started'
                : 'Payment requests will appear here when created'
              }
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleCreatePayment}>
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Create Payment</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <PaymentCreationBottomSheet
        visible={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        onQuickInvoice={handleQuickInvoice}
        onFromTemplate={handleFromTemplate}
        onCustomRequest={handleCustomRequest}
      />
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
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: '#1E293B',
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#64748B',
    marginLeft: 8,
  },
  summaryAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#1E293B',
    marginBottom: 4,
  },
  summarySubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsScroll: {
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  tabActive: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#64748B',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  paymentsList: {
    flex: 1,
  },
  paymentsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentTitle: {
    flex: 1,
  },
  paymentTitleText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 2,
  },
  paymentRecipient: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  projectName: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 8,
  },
  paymentDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  emptyButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
}); 