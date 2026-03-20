import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Search,
  Plus,
  Sparkles,
  Hash,
  Home,
  Info,
  X,
} from 'lucide-react-native';

// ─── Types ───────────────────────────────────────────────────────────

type Conversation = {
  id: string;
  type: 'ai' | 'channel' | 'dm';
  name: string;
  initials?: string;
  avatarColor?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  relevant?: boolean;
};

type Message = {
  id: string;
  sender: string;
  initials: string;
  text: string;
  timestamp: string;
  isMe: boolean;
};

// ─── Mock Data ───────────────────────────────────────────────────────

const CONVERSATIONS: Conversation[] = [
  {
    id: 'ch-1',
    type: 'channel',
    name: 'oakridge-residence',
    lastMessage: 'Roof inspection photos uploaded',
    timestamp: '2m',
    unread: 3,
    relevant: true,
  },
  {
    id: 'dm-1',
    type: 'dm',
    name: 'Sarah Chen',
    initials: 'SC',
    avatarColor: '#8B5CF6',
    lastMessage: 'Sent you the updated floor plans',
    timestamp: '5m',
    unread: 2,
    relevant: true,
  },
  {
    id: 'ai',
    type: 'ai',
    name: 'AI Assistant',
    lastMessage: 'Here\'s the Oakridge project summary you asked for.',
    timestamp: '8m',
    unread: 0,
    relevant: true,
  },
  {
    id: 'ch-2',
    type: 'channel',
    name: 'downtown-office',
    lastMessage: 'Final walkthrough scheduled for Thursday',
    timestamp: '15m',
    unread: 0,
    relevant: true,
  },
  {
    id: 'dm-2',
    type: 'dm',
    name: 'Marcus Rivera',
    initials: 'MR',
    avatarColor: '#F59E0B',
    lastMessage: 'Can you review the inspection report?',
    timestamp: '30m',
    unread: 1,
    relevant: true,
  },
  {
    id: 'ch-3',
    type: 'channel',
    name: 'sunset-villa',
    lastMessage: 'Exterior paint color approved by client',
    timestamp: '1h',
    unread: 1,
    relevant: true,
  },
  {
    id: 'ch-4',
    type: 'channel',
    name: 'general',
    lastMessage: 'Team standup moved to 9:30 AM',
    timestamp: '3h',
    unread: 0,
  },
  {
    id: 'dm-3',
    type: 'dm',
    name: 'Emily Watson',
    initials: 'EW',
    avatarColor: '#10B981',
    lastMessage: 'Thanks for the update!',
    timestamp: '2h',
    unread: 0,
  },
  {
    id: 'dm-4',
    type: 'dm',
    name: 'James Miller',
    initials: 'JM',
    avatarColor: '#EF4444',
    lastMessage: 'Meeting notes from today',
    timestamp: '4h',
    unread: 0,
  },
  {
    id: 'dm-5',
    type: 'dm',
    name: 'Lisa Park',
    initials: 'LP',
    avatarColor: '#3B82F6',
    lastMessage: 'The client loved the presentation',
    timestamp: 'Yesterday',
    unread: 0,
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  ai: [
    {
      id: '1',
      sender: 'AI Assistant',
      initials: 'AI',
      text: "Hello! I'm your AI assistant. I can help you with project management, photo organization, report generation, and more. What would you like to work on today?",
      timestamp: '9:00 AM',
      isMe: false,
    },
    {
      id: '2',
      sender: 'Me',
      initials: 'ME',
      text: 'Can you summarize the Oakridge project status?',
      timestamp: '9:01 AM',
      isMe: true,
    },
    {
      id: '3',
      sender: 'AI Assistant',
      initials: 'AI',
      text: "Here's a summary of the Oakridge Residence project:\n\n- Phase: Exterior finishing (85% complete)\n- Recent activity: Roof inspection photos uploaded today\n- Open items: 3 punch list items remaining\n- Budget: On track, $2,400 under estimate\n- Next milestone: Final walkthrough on March 22\n\nWould you like me to generate a detailed report or notify the team about any updates?",
      timestamp: '9:01 AM',
      isMe: false,
    },
    {
      id: '4',
      sender: 'Me',
      initials: 'ME',
      text: 'That looks great, thanks!',
      timestamp: '9:02 AM',
      isMe: true,
    },
    {
      id: '5',
      sender: 'AI Assistant',
      initials: 'AI',
      text: "You're welcome! Let me know if you need anything else. I can also help draft client updates or schedule follow-ups.",
      timestamp: '9:02 AM',
      isMe: false,
    },
  ],
  'ch-1': [
    {
      id: '1',
      sender: 'Sarah Chen',
      initials: 'SC',
      text: 'Just finished the roof inspection. Uploading photos now.',
      timestamp: '10:15 AM',
      isMe: false,
    },
    {
      id: '2',
      sender: 'Marcus Rivera',
      initials: 'MR',
      text: 'Great, how does the flashing look around the chimney?',
      timestamp: '10:18 AM',
      isMe: false,
    },
    {
      id: '3',
      sender: 'Sarah Chen',
      initials: 'SC',
      text: 'Looks solid. No signs of deterioration. I tagged the close-up shots.',
      timestamp: '10:20 AM',
      isMe: false,
    },
    {
      id: '4',
      sender: 'Me',
      initials: 'ME',
      text: 'Perfect. I will let the client know we are on track for the walkthrough.',
      timestamp: '10:25 AM',
      isMe: true,
    },
    {
      id: '5',
      sender: 'Sarah Chen',
      initials: 'SC',
      text: 'Roof inspection photos uploaded',
      timestamp: '10:30 AM',
      isMe: false,
    },
  ],
  'ch-2': [
    {
      id: '1',
      sender: 'Emily Watson',
      initials: 'EW',
      text: 'Client confirmed Thursday at 2 PM for the final walkthrough.',
      timestamp: '8:00 AM',
      isMe: false,
    },
    {
      id: '2',
      sender: 'Me',
      initials: 'ME',
      text: 'Works for me. Should we prep a punch list beforehand?',
      timestamp: '8:05 AM',
      isMe: true,
    },
    {
      id: '3',
      sender: 'Emily Watson',
      initials: 'EW',
      text: 'Already started one. Will share it by end of day.',
      timestamp: '8:10 AM',
      isMe: false,
    },
    {
      id: '4',
      sender: 'James Miller',
      initials: 'JM',
      text: 'Final walkthrough scheduled for Thursday',
      timestamp: '8:15 AM',
      isMe: false,
    },
  ],
  'ch-3': [
    {
      id: '1',
      sender: 'Lisa Park',
      initials: 'LP',
      text: 'The client went with Sherwin-Williams "Agreeable Gray" for the exterior.',
      timestamp: 'Yesterday',
      isMe: false,
    },
    {
      id: '2',
      sender: 'Me',
      initials: 'ME',
      text: 'Good choice. I will order the paint tomorrow morning.',
      timestamp: 'Yesterday',
      isMe: true,
    },
    {
      id: '3',
      sender: 'Lisa Park',
      initials: 'LP',
      text: 'Exterior paint color approved by client',
      timestamp: '1h ago',
      isMe: false,
    },
  ],
  'ch-4': [
    {
      id: '1',
      sender: 'Marcus Rivera',
      initials: 'MR',
      text: 'Hey team, moving standup to 9:30 starting next week.',
      timestamp: '3h ago',
      isMe: false,
    },
    {
      id: '2',
      sender: 'Me',
      initials: 'ME',
      text: 'Sounds good!',
      timestamp: '3h ago',
      isMe: true,
    },
  ],
  'dm-1': [
    {
      id: '1',
      sender: 'Sarah Chen',
      initials: 'SC',
      text: 'Hey, I just finished updating the floor plans for Oakridge.',
      timestamp: '9:50 AM',
      isMe: false,
    },
    {
      id: '2',
      sender: 'Me',
      initials: 'ME',
      text: 'Awesome, can you send them over?',
      timestamp: '9:52 AM',
      isMe: true,
    },
    {
      id: '3',
      sender: 'Sarah Chen',
      initials: 'SC',
      text: 'Sent you the updated floor plans',
      timestamp: '9:55 AM',
      isMe: false,
    },
  ],
  'dm-2': [
    {
      id: '1',
      sender: 'Marcus Rivera',
      initials: 'MR',
      text: 'Hey, I attached the inspection report for the downtown office. Can you take a look when you get a chance?',
      timestamp: '10:00 AM',
      isMe: false,
    },
    {
      id: '2',
      sender: 'Me',
      initials: 'ME',
      text: 'Sure, I will check it this afternoon.',
      timestamp: '10:05 AM',
      isMe: true,
    },
    {
      id: '3',
      sender: 'Marcus Rivera',
      initials: 'MR',
      text: 'Can you review the inspection report?',
      timestamp: '10:10 AM',
      isMe: false,
    },
  ],
  'dm-3': [
    {
      id: '1',
      sender: 'Me',
      initials: 'ME',
      text: 'Updated the project timeline. We should be done two days early.',
      timestamp: '2h ago',
      isMe: true,
    },
    {
      id: '2',
      sender: 'Emily Watson',
      initials: 'EW',
      text: 'Thanks for the update!',
      timestamp: '2h ago',
      isMe: false,
    },
  ],
  'dm-4': [
    {
      id: '1',
      sender: 'James Miller',
      initials: 'JM',
      text: "Here are the meeting notes from today's client call. Let me know if I missed anything.",
      timestamp: '4h ago',
      isMe: false,
    },
    {
      id: '2',
      sender: 'Me',
      initials: 'ME',
      text: 'Looks comprehensive. Thanks James!',
      timestamp: '4h ago',
      isMe: true,
    },
  ],
  'dm-5': [
    {
      id: '1',
      sender: 'Me',
      initials: 'ME',
      text: 'Just wrapped up the portfolio presentation for the sunset villa project.',
      timestamp: 'Yesterday',
      isMe: true,
    },
    {
      id: '2',
      sender: 'Lisa Park',
      initials: 'LP',
      text: 'The client loved the presentation',
      timestamp: 'Yesterday',
      isMe: false,
    },
  ],
};

// ─── Component ───────────────────────────────────────────────────────

export default function ChatScreen({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [chatTab, setChatTab] = useState<'Relevant' | 'Projects' | 'People' | 'AI Agents'>('Relevant');
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when entering a conversation
  useEffect(() => {
    if (activeConversation) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [activeConversation]);

  const filteredConversations = CONVERSATIONS.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    switch (chatTab) {
      case 'Relevant': return !!c.relevant;
      case 'Projects': return c.type === 'channel';
      case 'People': return c.type === 'dm';
      case 'AI Agents': return c.type === 'ai';
      default: return true;
    }
  });

  // ─── Chat Detail View ──────────────────────────────────────────────

  if (activeConversation) {
    const messages = MOCK_MESSAGES[activeConversation.id] || [];
    const isAI = activeConversation.type === 'ai';
    const displayName =
      activeConversation.type === 'channel'
        ? `#${activeConversation.name}`
        : activeConversation.name;

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Detail Header */}
        <View style={styles.detailHeader}>
          <TouchableOpacity
            onPress={() => setActiveConversation(null)}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={22} color="#1E293B" />
          </TouchableOpacity>
          <View style={styles.detailHeaderCenter}>
            {isAI ? (
              <View style={styles.detailHeaderAIRow}>
                <View style={styles.aiIconSmall}>
                  <Sparkles size={14} color="#FFFFFF" />
                </View>
                <Text style={styles.detailHeaderTitle}>{displayName}</Text>
              </View>
            ) : activeConversation.type === 'channel' ? (
              <View style={styles.detailHeaderChannelRow}>
                <Hash size={16} color="#64748B" strokeWidth={2.5} />
                <Text style={styles.detailHeaderTitle}>
                  {activeConversation.name}
                </Text>
              </View>
            ) : (
              <View style={styles.detailHeaderDMRow}>
                <View
                  style={[
                    styles.detailAvatar,
                    { backgroundColor: activeConversation.avatarColor || '#94A3B8' },
                  ]}
                >
                  <Text style={styles.detailAvatarText}>
                    {activeConversation.initials}
                  </Text>
                </View>
                <Text style={styles.detailHeaderTitle}>{displayName}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.infoButton}>
            <Info size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesArea}
          contentContainerStyle={styles.messagesContent}
          keyboardDismissMode="on-drag"
        >
          {messages.map((msg, index) => {
            const showSenderName =
              !msg.isMe &&
              activeConversation.type === 'channel' &&
              (index === 0 || messages[index - 1].sender !== msg.sender);
            const showTimestamp =
              index === messages.length - 1 ||
              messages[index + 1].isMe !== msg.isMe;

            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.isMe ? styles.messageRowRight : styles.messageRowLeft,
                ]}
              >
                {!msg.isMe && (
                  <View style={styles.messageBubbleGroup}>
                    <View style={styles.messageAvatarRow}>
                      {isAI ? (
                        <View style={styles.aiMessageAvatar}>
                          <Sparkles size={14} color="#FFFFFF" />
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.messageAvatar,
                            {
                              backgroundColor:
                                activeConversation.type === 'dm'
                                  ? activeConversation.avatarColor || '#94A3B8'
                                  : getColorForInitials(msg.initials),
                            },
                          ]}
                        >
                          <Text style={styles.messageAvatarText}>
                            {msg.initials}
                          </Text>
                        </View>
                      )}
                      <View style={styles.messageBubbleWrapper}>
                        {showSenderName && (
                          <Text style={styles.senderName}>{msg.sender}</Text>
                        )}
                        <View
                          style={[
                            styles.messageBubble,
                            isAI
                              ? styles.aiBubble
                              : styles.incomingBubble,
                          ]}
                        >
                          <Text
                            style={[
                              styles.messageText,
                              isAI
                                ? styles.aiMessageText
                                : styles.incomingMessageText,
                            ]}
                          >
                            {msg.text}
                          </Text>
                        </View>
                        {showTimestamp && (
                          <Text style={styles.messageTimestamp}>
                            {msg.timestamp}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                )}
                {msg.isMe && (
                  <View style={styles.outgoingBubbleWrapper}>
                    <View style={[styles.messageBubble, styles.outgoingBubble]}>
                      <Text
                        style={[styles.messageText, styles.outgoingMessageText]}
                      >
                        {msg.text}
                      </Text>
                    </View>
                    {showTimestamp && (
                      <Text
                        style={[
                          styles.messageTimestamp,
                          styles.outgoingTimestamp,
                        ]}
                      >
                        {msg.timestamp}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Input Bar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <View
            style={[
              styles.inputBar,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            <TouchableOpacity style={styles.attachButton}>
              <Paperclip size={20} color="#94A3B8" />
            </TouchableOpacity>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor="#94A3B8"
                value={messageText}
                onChangeText={setMessageText}
                multiline
              />
            </View>
            <TouchableOpacity
              style={[
                styles.sendButton,
                messageText.trim() ? styles.sendButtonActive : null,
              ]}
            >
              <Send
                size={18}
                color={messageText.trim() ? '#FFFFFF' : '#94A3B8'}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ─── Conversation List View ────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Messages</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.chatTabs}>
        {(['Relevant', 'Projects', 'People', 'AI Agents'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.chatTab, chatTab === tab && styles.chatTabActive]}
            onPress={() => setChatTab(tab)}
          >
            <Text style={[styles.chatTabText, chatTab === tab && styles.chatTabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conversation List */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
        keyboardDismissMode="on-drag"
      >
        {filteredConversations.map((convo) => {
          const isAI = convo.type === 'ai';
          const isChannel = convo.type === 'channel';

          const avatar = isAI ? (
            <View style={styles.aiAvatar}>
              <Sparkles size={20} color="#FFFFFF" />
            </View>
          ) : isChannel ? (
            <View style={styles.channelIcon}>
              <Home size={18} color="#64748B" strokeWidth={2} />
            </View>
          ) : (
            <View style={[styles.dmAvatar, { backgroundColor: convo.avatarColor || '#94A3B8' }]}>
              <Text style={styles.dmAvatarText}>{convo.initials}</Text>
            </View>
          );

          return (
            <TouchableOpacity
              key={convo.id}
              style={isAI ? styles.aiItem : styles.convoItem}
              onPress={() => setActiveConversation(convo)}
              activeOpacity={0.6}
            >
              {avatar}
              <View style={styles.convoContent}>
                <View style={styles.convoTopRow}>
                  <Text style={[isAI ? styles.aiName : styles.convoName, convo.unread > 0 && styles.convoNameUnread]}>
                    {convo.name}
                  </Text>
                  <Text style={styles.convoTimestamp}>{convo.timestamp}</Text>
                </View>
                <View style={styles.convoBottomRow}>
                  <Text
                    style={[styles.convoPreview, convo.unread > 0 && styles.convoPreviewUnread]}
                    numberOfLines={1}
                  >
                    {convo.lastMessage}
                  </Text>
                  {convo.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{convo.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Floating compose button */}
      <TouchableOpacity style={[styles.composeFab, { bottom: 16 }]} activeOpacity={0.8}>
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.composeFabText}>Message</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────

function getColorForInitials(initials: string): string {
  const colors = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899'];
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── List Header ──
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  listTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 28,
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  composeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  composeFab: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  composeFabText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  doneText: {
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    fontSize: 14,
  },

  // ── Tabs ──
  chatTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 12,
  },
  chatTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatTabActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  chatTabText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
  chatTabTextActive: {
    color: '#FFFFFF',
  },

  // ── Search ──
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#1E293B',
    padding: 0,
  },

  // ── Conversation List ──
  listScroll: {
    flex: 1,
  },

  // ── AI Assistant Item ──
  aiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F8FAFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  aiAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#3B82F6',
  },

  // ── Section Header ──
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ── Conversation Item ──
  convoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  channelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dmAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dmAvatarText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  convoContent: {
    flex: 1,
    marginLeft: 12,
  },
  convoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  convoName: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#1E293B',
  },
  convoNameUnread: {
    fontFamily: 'Inter-SemiBold',
  },
  convoTimestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#94A3B8',
  },
  convoBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convoPreview: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
    flex: 1,
    marginRight: 8,
  },
  convoPreviewUnread: {
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  unreadBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
  },

  // ── Detail Header ──
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailHeaderCenter: {
    flex: 1,
    marginLeft: 4,
  },
  detailHeaderTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: '#1E293B',
  },
  detailHeaderAIRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailHeaderChannelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailHeaderDMRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAvatarText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Messages ──
  messagesArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  messageRow: {
    marginBottom: 6,
  },
  messageRowLeft: {
    alignItems: 'flex-start',
  },
  messageRowRight: {
    alignItems: 'flex-end',
  },
  messageBubbleGroup: {
    maxWidth: '82%',
  },
  messageAvatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  aiMessageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  messageAvatarText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  messageBubbleWrapper: {
    flexShrink: 1,
  },
  senderName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 3,
    marginLeft: 2,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  incomingBubble: {
    backgroundColor: '#E2E8F0',
    borderTopLeftRadius: 6,
  },
  aiBubble: {
    backgroundColor: '#EFF6FF',
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  outgoingBubble: {
    backgroundColor: '#3B82F6',
    borderTopRightRadius: 6,
  },
  outgoingBubbleWrapper: {
    maxWidth: '82%',
    alignItems: 'flex-end',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  incomingMessageText: {
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  aiMessageText: {
    fontFamily: 'Inter-Regular',
    color: '#1E3A5F',
  },
  outgoingMessageText: {
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  messageTimestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    marginLeft: 2,
    marginBottom: 4,
  },
  outgoingTimestamp: {
    textAlign: 'right',
    marginRight: 2,
  },

  // ── Input Bar ──
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  attachButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    maxHeight: 120,
    marginBottom: 2,
  },
  textInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#1E293B',
    padding: 0,
    lineHeight: 20,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendButtonActive: {
    backgroundColor: '#3B82F6',
  },
});
