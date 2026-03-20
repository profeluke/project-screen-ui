import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowDownLeft, Send, Sparkles, CreditCard, Eye, EyeOff, ChevronRight, TrendingUp, TrendingDown, Fuel, ShoppingBag, Wrench, Utensils, Receipt, Lock, Copy, MoreHorizontal, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PaymentsScreenProps {
  onClose: () => void;
}

type TabType = 'proposals' | 'invoices' | 'card' | 'estimates';

// --- Mock Data ---

const proposals = [
  { id: '1', project: 'Oakridge Kitchen Remodel', client: 'Sarah Mitchell', amount: 42500, status: 'Sent', dateSent: 'Mar 15' },
  { id: '2', project: 'Downtown Office Buildout', client: 'Apex Partners LLC', amount: 128000, status: 'Viewed', dateSent: 'Mar 12' },
  { id: '3', project: 'Riverside Deck Addition', client: 'James & Lori Chen', amount: 28750, status: 'Signed', dateSent: 'Mar 10' },
  { id: '4', project: 'Master Bath Renovation', client: 'Tom Brewer', amount: 18200, status: 'Sent', dateSent: 'Mar 8' },
  { id: '5', project: 'Garage Conversion', client: 'Diana Reeves', amount: 35400, status: 'Expired', dateSent: 'Feb 22' },
  { id: '6', project: 'Basement Finishing', client: 'Mark & Julie Tran', amount: 52000, status: 'Signed', dateSent: 'Mar 3' },
];

const invoices = [
  { id: '1', invoiceNum: 'INV-1047', project: 'Oakridge Kitchen Remodel', amount: 12750, status: 'Sent', dueDate: 'Mar 25' },
  { id: '2', invoiceNum: 'INV-1046', project: 'Downtown Office Buildout', amount: 38400, status: 'Overdue', dueDate: 'Mar 10' },
  { id: '3', invoiceNum: 'INV-1045', project: 'Riverside Deck Addition', amount: 28750, status: 'Paid', dueDate: 'Mar 5' },
  { id: '4', invoiceNum: 'INV-1044', project: 'Elm St Siding Repair', amount: 8900, status: 'Paid', dueDate: 'Mar 1' },
  { id: '5', invoiceNum: 'INV-1043', project: 'Master Bath Renovation', amount: 5460, status: 'Draft', dueDate: '—' },
  { id: '6', invoiceNum: 'INV-1042', project: 'Garage Conversion', amount: 10620, status: 'Overdue', dueDate: 'Mar 3' },
];

const transactions = [
  { id: '1', title: 'Home Depot', category: 'Materials', amount: -1284.50, date: 'Today', icon: Wrench, iconColor: '#F59E0B', iconBg: '#FFFBEB' },
  { id: '2', title: 'Client Payment - Oakridge', category: 'Income', amount: 15000, date: 'Today', icon: ArrowDownLeft, iconColor: '#10B981', iconBg: '#ECFDF5' },
  { id: '3', title: 'Fuel Station', category: 'Fuel', amount: -89.40, date: 'Yesterday', icon: Fuel, iconColor: '#EF4444', iconBg: '#FEF2F2' },
  { id: '4', title: 'Lumber Supply Co', category: 'Materials', amount: -3450.00, date: 'Yesterday', icon: ShoppingBag, iconColor: '#8B5CF6', iconBg: '#F5F3FF' },
  { id: '5', title: 'Client Payment - Downtown', category: 'Income', amount: 8500, date: 'Mar 1', icon: ArrowDownLeft, iconColor: '#10B981', iconBg: '#ECFDF5' },
  { id: '6', title: 'Team Lunch', category: 'Food', amount: -142.30, date: 'Mar 1', icon: Utensils, iconColor: '#EC4899', iconBg: '#FDF2F8' },
  { id: '7', title: 'Permit Filing Fee', category: 'Permits', amount: -350.00, date: 'Feb 28', icon: Receipt, iconColor: '#6366F1', iconBg: '#EEF2FF' },
];

const estimates = [
  { id: '1', project: 'Kitchen Renovation', amount: 42500, status: 'Sent', daysAgo: 2 },
  { id: '2', project: 'Bathroom Remodel', amount: 18200, status: 'Draft', daysAgo: 0 },
  { id: '3', project: 'Deck Addition', amount: 28750, status: 'Accepted', daysAgo: 5 },
];

// --- Helpers ---

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Signed':
    case 'Paid':
    case 'Accepted':
      return { bg: '#ECFDF5', text: '#10B981' };
    case 'Sent':
    case 'Viewed':
      return { bg: '#EFF6FF', text: '#3B82F6' };
    case 'Overdue':
    case 'Expired':
      return { bg: '#FEF2F2', text: '#EF4444' };
    case 'Draft':
    default:
      return { bg: '#F1F5F9', text: '#64748B' };
  }
};

const formatCurrency = (amount: number) => {
  const absAmount = Math.abs(amount);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(absAmount);
};

// --- Computed stats ---

const awaitingSignatureProposals = proposals.filter(p => p.status === 'Sent' || p.status === 'Viewed');
const signedProposals = proposals.filter(p => p.status === 'Signed');
const awaitingSignatureTotal = awaitingSignatureProposals.reduce((s, p) => s + p.amount, 0);
const signedTotal = signedProposals.reduce((s, p) => s + p.amount, 0);

const outstandingInvoices = invoices.filter(i => i.status === 'Sent');
const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
const paidInvoices = invoices.filter(i => i.status === 'Paid');
const outstandingTotal = outstandingInvoices.reduce((s, i) => s + i.amount, 0);
const overdueTotal = overdueInvoices.reduce((s, i) => s + i.amount, 0);
const paidTotal = paidInvoices.reduce((s, i) => s + i.amount, 0);

const totalOutstanding = awaitingSignatureTotal + outstandingTotal + overdueTotal;

// --- Component ---

export default function PaymentsScreen({ onClose }: PaymentsScreenProps) {
  const insets = useSafeAreaInsets();
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('proposals');

  const tabs: { key: TabType; label: string }[] = [
    { key: 'proposals', label: 'Proposals' },
    { key: 'invoices', label: 'Invoices' },
    { key: 'card', label: 'Card' },
    { key: 'estimates', label: 'Estimates' },
  ];

  const renderStatusBadge = (status: string) => {
    const style = getStatusStyle(status);
    return (
      <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
        <Text style={[styles.statusBadgeText, { color: style.text }]}>{status}</Text>
      </View>
    );
  };

  // --- Tab Content Renderers ---

  const renderProposals = () => (
    <>
      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIconWrap, { backgroundColor: '#EFF6FF' }]}>
            <Clock size={14} color="#3B82F6" />
          </View>
          <Text style={styles.summaryCount}>{awaitingSignatureProposals.length}</Text>
          <Text style={styles.summaryLabel}>Awaiting Signature</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(awaitingSignatureTotal)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIconWrap, { backgroundColor: '#ECFDF5' }]}>
            <CheckCircle size={14} color="#10B981" />
          </View>
          <Text style={styles.summaryCount}>{signedProposals.length}</Text>
          <Text style={styles.summaryLabel}>Signed This Month</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(signedTotal)}</Text>
        </View>
      </View>

      {/* Proposals List */}
      <View style={styles.listContainer}>
        {proposals.map((p) => (
          <TouchableOpacity key={p.id} style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <Text style={styles.listItemTitle}>{p.project}</Text>
              <Text style={styles.listItemSubtitle}>{p.client}</Text>
              <Text style={styles.listItemMeta}>Sent {p.dateSent}</Text>
            </View>
            <View style={styles.listItemRight}>
              <Text style={styles.listItemAmount}>{formatCurrency(p.amount)}</Text>
              {renderStatusBadge(p.status)}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderInvoices = () => (
    <>
      {/* Summary Cards */}
      <View style={styles.summaryRowThree}>
        <View style={styles.summaryCardSmall}>
          <Text style={styles.summaryLabelSmall}>Outstanding</Text>
          <Text style={styles.summaryAmountBlue}>{formatCurrency(outstandingTotal)}</Text>
        </View>
        <View style={styles.summaryCardSmall}>
          <Text style={styles.summaryLabelSmall}>Overdue</Text>
          <Text style={styles.summaryAmountRed}>{formatCurrency(overdueTotal)}</Text>
        </View>
        <View style={styles.summaryCardSmall}>
          <Text style={styles.summaryLabelSmall}>Paid (MTD)</Text>
          <Text style={styles.summaryAmountGreen}>{formatCurrency(paidTotal)}</Text>
        </View>
      </View>

      {/* Invoices List */}
      <View style={styles.listContainer}>
        {invoices.map((inv) => (
          <TouchableOpacity key={inv.id} style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <Text style={styles.listItemTitle}>{inv.invoiceNum}</Text>
              <Text style={styles.listItemSubtitle}>{inv.project}</Text>
              <Text style={styles.listItemMeta}>{inv.status === 'Draft' ? 'Draft' : `Due ${inv.dueDate}`}</Text>
            </View>
            <View style={styles.listItemRight}>
              <Text style={styles.listItemAmount}>{formatCurrency(inv.amount)}</Text>
              {renderStatusBadge(inv.status)}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderCard = () => (
    <>
      {/* Digital Card */}
      <View style={styles.cardWrapper}>
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.digitalCard}
        >
          <View style={styles.cardTopRow}>
            <View>
              <Text style={styles.cardLabel}>Available Balance</Text>
              <View style={styles.balanceRow}>
                <Text style={styles.cardBalance}>
                  {showBalance ? '$24,831.50' : '••••••'}
                </Text>
                <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.eyeButton}>
                  {showBalance ? <Eye size={18} color="#94A3B8" /> : <EyeOff size={18} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.cardChip}>
              <View style={styles.chipLines}>
                <View style={styles.chipLine} />
                <View style={styles.chipLine} />
                <View style={styles.chipLine} />
              </View>
            </View>
          </View>

          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardNumberLabel}>CARD NUMBER</Text>
              <View style={styles.cardNumberRow}>
                <Text style={styles.cardNumber}>•••• •••• •••• 4829</Text>
                <TouchableOpacity style={styles.copyButton}>
                  <Copy size={14} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.cardMeta}>
              <View>
                <Text style={styles.cardMetaLabel}>EXPIRES</Text>
                <Text style={styles.cardMetaValue}>09/28</Text>
              </View>
              <View style={styles.lockIcon}>
                <Lock size={14} color="#64748B" />
              </View>
            </View>
          </View>

          <Text style={styles.cardHolder}>EMILY CHEN</Text>
        </LinearGradient>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIndicator, { backgroundColor: '#ECFDF5' }]}>
            <TrendingUp size={14} color="#10B981" />
          </View>
          <Text style={styles.statAmount}>$47,200</Text>
          <Text style={styles.statLabel}>Income (MTD)</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIndicator, { backgroundColor: '#FEF2F2' }]}>
            <TrendingDown size={14} color="#EF4444" />
          </View>
          <Text style={styles.statAmount}>$12,840</Text>
          <Text style={styles.statLabel}>Spent (MTD)</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIndicator, { backgroundColor: '#FFFBEB' }]}>
            <Receipt size={14} color="#F59E0B" />
          </View>
          <Text style={styles.statAmount}>$5,000</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Transactions */}
      <View style={styles.transactionsList}>
        {transactions.map((tx, index) => {
          const Icon = tx.icon;
          const showDateHeader = index === 0 || transactions[index - 1].date !== tx.date;
          return (
            <View key={tx.id}>
              {showDateHeader && (
                <Text style={styles.transactionDateHeader}>{tx.date}</Text>
              )}
              <TouchableOpacity style={styles.transactionItem}>
                <View style={[styles.transactionIcon, { backgroundColor: tx.iconBg }]}>
                  <Icon size={18} color={tx.iconColor} />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{tx.title}</Text>
                  <Text style={styles.transactionCategory}>{tx.category}</Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  tx.amount > 0 && styles.transactionAmountPositive,
                ]}>
                  {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount)}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
      <TouchableOpacity style={styles.seeAllButton}>
        <Text style={styles.seeAllText}>See all transactions</Text>
        <ChevronRight size={16} color="#3B82F6" />
      </TouchableOpacity>
    </>
  );

  const renderEstimates = () => (
    <>
      {/* Create AI Estimate */}
      <TouchableOpacity style={styles.newEstimateCard}>
        <LinearGradient
          colors={['#7C3AED', '#6D28D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.newEstimateGradient}
        >
          <Sparkles size={24} color="#FFFFFF" />
          <View style={styles.newEstimateContent}>
            <Text style={styles.newEstimateTitle}>Create AI Estimate</Text>
            <Text style={styles.newEstimateDesc}>Describe the project and get an instant cost breakdown</Text>
          </View>
          <ChevronRight size={20} color="rgba(255,255,255,0.6)" />
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.estimatesList}>
        {estimates.map((est) => (
          <TouchableOpacity key={est.id} style={styles.estimateItem}>
            <View style={styles.estimateInfo}>
              <Text style={styles.estimateProject}>{est.project}</Text>
              <Text style={styles.estimateMeta}>
                {est.status} {est.daysAgo === 0 ? '• Just now' : `• ${est.daysAgo}d ago`}
              </Text>
            </View>
            <View style={styles.estimateRight}>
              <Text style={styles.estimateAmount}>{formatCurrency(est.amount)}</Text>
              {renderStatusBadge(est.status)}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.seeAllButton}>
        <Text style={styles.seeAllText}>See all estimates</Text>
        <ChevronRight size={16} color="#3B82F6" />
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Dark Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 12, 28) }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Money</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Overview */}
        <View style={styles.overviewSection}>
          <Text style={styles.overviewTotal}>{formatCurrency(totalOutstanding)}</Text>
          <Text style={styles.overviewLabel}>Total Outstanding</Text>
          <Text style={styles.overviewDetail}>
            You have {awaitingSignatureProposals.length} proposal{awaitingSignatureProposals.length !== 1 ? 's' : ''} awaiting signature
          </Text>
        </View>

        {/* Tab Bar — pill style */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
          style={styles.tabBarScroll}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab Content */}
        {activeTab === 'proposals' && renderProposals()}
        {activeTab === 'invoices' && renderInvoices()}
        {activeTab === 'card' && renderCard()}
        {activeTab === 'estimates' && renderEstimates()}

        {/* AI Spending Insight — always visible */}
        <View style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <Sparkles size={16} color="#7C3AED" />
            <Text style={styles.insightsTitle}>AI Spending Insight</Text>
          </View>
          <Text style={styles.insightsText}>
            Your material costs are 12% lower than last month. You've saved $1,840 on lumber by switching suppliers.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#0F172A',
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Overview
  overviewSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  overviewTotal: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#1E293B',
    marginBottom: 4,
  },
  overviewLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
  },
  overviewDetail: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#94A3B8',
  },

  // Tabs — pill style (ChatScreen pattern)
  tabBarScroll: {
    marginBottom: 20,
  },
  tabBarContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  tabTextActive: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },

  // Summary Cards (Proposals)
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'flex-start',
  },
  summaryIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#1E293B',
    marginBottom: 2,
  },
  summaryLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 6,
  },
  summaryAmount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1E293B',
  },

  // Summary Cards (Invoices — 3 columns)
  summaryRowThree: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  summaryCardSmall: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'flex-start',
  },
  summaryLabelSmall: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 6,
  },
  summaryAmountBlue: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#3B82F6',
  },
  summaryAmountRed: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#EF4444',
  },
  summaryAmountGreen: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#10B981',
  },

  // List Items (Proposals / Invoices)
  listContainer: {
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  listItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  listItemTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 3,
  },
  listItemSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  listItemMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  listItemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  listItemAmount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#1E293B',
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
  },

  // Digital Card
  cardWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  digitalCard: {
    borderRadius: 20,
    padding: 24,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  cardLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardBalance: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#FFFFFF',
  },
  eyeButton: {
    padding: 4,
  },
  cardChip: {
    width: 40,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#334155',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  chipLines: {
    gap: 3,
  },
  chipLine: {
    height: 2,
    backgroundColor: '#475569',
    borderRadius: 1,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  cardNumberLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 1,
  },
  cardNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardNumber: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#CBD5E1',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardMetaLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 1,
  },
  cardMetaValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#CBD5E1',
  },
  lockIcon: {
    marginBottom: -2,
  },
  cardHolder: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#64748B',
    letterSpacing: 2,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'flex-start',
  },
  statIndicator: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#94A3B8',
  },

  // Transactions
  transactionsList: {
    paddingHorizontal: 20,
  },
  transactionDateHeader: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 2,
  },
  transactionCategory: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#94A3B8',
  },
  transactionAmount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#1E293B',
  },
  transactionAmountPositive: {
    color: '#10B981',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  seeAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#3B82F6',
  },

  // AI Estimates
  newEstimateCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  newEstimateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  newEstimateContent: {
    flex: 1,
  },
  newEstimateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  newEstimateDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  estimatesList: {
    paddingHorizontal: 20,
  },
  estimateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  estimateInfo: {
    flex: 1,
  },
  estimateProject: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 3,
  },
  estimateMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#94A3B8',
  },
  estimateRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  estimateAmount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#1E293B',
  },

  // Insights
  insightsCard: {
    marginHorizontal: 20,
    backgroundColor: '#F5F3FF',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#7C3AED',
  },
  insightsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4C1D95',
    lineHeight: 20,
  },
});
