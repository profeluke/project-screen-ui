import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, Share, DollarSign, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  onBackPress?: () => void;
  onManagePress?: () => void;
  onStarPress?: () => void;
  onSharePress?: () => void;
  onPaymentsPress?: () => void;
  onChatPress?: () => void;
  paymentsBadge?: number | boolean;
  chatBadge?: number | boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onBackPress, 
  onManagePress, 
  onStarPress, 
  onSharePress,
  onPaymentsPress,
  onChatPress,
  paymentsBadge,
  chatBadge 
}) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.container,
      { paddingTop: Math.max(insets.top, 16) }
    ]}>
      <View style={styles.leftContainer}>
        <TouchableOpacity onPress={onBackPress}>
          <ChevronLeft size={32} color="#1E293B" />
        </TouchableOpacity>
      </View>
      
      <View style={{ flex: 1 }} />

      <View style={styles.rightContainer}>
        {onPaymentsPress && (
          <TouchableOpacity style={styles.iconButton} onPress={onPaymentsPress}>
            <DollarSign size={20} color="#1E293B" />
            {paymentsBadge && (
              <View style={styles.badge}>
                {typeof paymentsBadge === 'number' ? (
                  <Text style={styles.badgeText}>{paymentsBadge > 99 ? '99+' : paymentsBadge}</Text>
                ) : (
                  <View style={styles.badgeDot} />
                )}
              </View>
            )}
          </TouchableOpacity>
        )}
        {onChatPress && (
          <TouchableOpacity style={styles.iconButton} onPress={onChatPress}>
            <MessageCircle size={20} color="#1E293B" />
            {chatBadge && (
              <View style={styles.badge}>
                {typeof chatBadge === 'number' ? (
                  <Text style={styles.badgeText}>{chatBadge > 99 ? '99+' : chatBadge}</Text>
                ) : (
                  <View style={styles.badgeDot} />
                )}
              </View>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.iconButton} onPress={onSharePress}>
          <Share size={20} color="#1E293B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuTextButton} onPress={onManagePress}>
          <Text style={styles.menuText}>Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F5F5F4',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  managePill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#1E293B',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#F5F5F4',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  
});

export default Header;