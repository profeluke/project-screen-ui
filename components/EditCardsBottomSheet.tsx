import React, { useCallback, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
import BottomSheet, { 
  BottomSheetView, 
  BottomSheetBackdrop,
  BottomSheetBackdropProps 
} from '@gorhom/bottom-sheet';
import { FolderOpen, Map, CheckSquare, FileText, DollarSign, Users, BarChart3, Image as ImageIcon, X, GripVertical, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CamAIIcon from './CamAIIcon';

export interface QuickAccessCard {
  id: string;
  label: string;
  icon: string;
  color: string;
  backgroundColor: string;
  visible: boolean;
  order: number;
}

interface EditCardsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  cards: QuickAccessCard[];
  onUpdateCards: (cards: QuickAccessCard[]) => void;
}

const EditCardsBottomSheet: React.FC<EditCardsBottomSheetProps> = ({
  visible,
  onClose,
  cards,
  onUpdateCards,
}) => {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [localCards, setLocalCards] = useState<QuickAccessCard[]>(cards);

  // Update local cards when props change
  useEffect(() => {
    setLocalCards(cards);
  }, [cards]);

  // Get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'FolderOpen': return FolderOpen;
      case 'Map': return Map;
      case 'CheckSquare': return CheckSquare;
      case 'FileText': return FileText;
      case 'DollarSign': return DollarSign;
      case 'Users': return Users;
      case 'BarChart3': return BarChart3;
      case 'ImageIcon': return ImageIcon;
      default: return FolderOpen;
    }
  };

  const toggleCardVisibility = (cardId: string) => {
    const updatedCards = localCards.map(card => 
      card.id === cardId ? { ...card, visible: !card.visible } : card
    );
    setLocalCards(updatedCards);
  };

  const moveCard = (fromIndex: number, toIndex: number) => {
    const updatedCards = [...localCards];
    const [movedCard] = updatedCards.splice(fromIndex, 1);
    updatedCards.splice(toIndex, 0, movedCard);
    
    // Update order values
    const reorderedCards = updatedCards.map((card, index) => ({
      ...card,
      order: index
    }));
    
    setLocalCards(reorderedCards);
  };

  const createDragHandler = (cardIndex: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderMove: (evt, gestureState) => {
        const { dy } = gestureState;
        const cardHeight = 60; // Approximate height of each card item
        const targetIndex = Math.round(dy / cardHeight);
        const newIndex = Math.max(0, Math.min(localCards.length - 1, cardIndex + targetIndex));
        
        // Visual feedback could be added here
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        const { dy } = gestureState;
        const cardHeight = 60;
        const targetIndex = Math.round(dy / cardHeight);
        const newIndex = Math.max(0, Math.min(localCards.length - 1, cardIndex + targetIndex));
        
        if (newIndex !== cardIndex) {
          moveCard(cardIndex, newIndex);
        }
      },
    });
  };

  const handleSave = () => {
    onUpdateCards(localCards);
    onClose();
  };

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  // Expand when visible
  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        bottomSheetRef.current?.expand();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={['80%']}
      backdropComponent={renderBackdrop}
      onClose={onClose}
      enablePanDownToClose={true}
      style={styles.bottomSheet}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      containerStyle={{ zIndex: 99999 }}
    >
      <BottomSheetView style={[styles.container, { paddingBottom: Math.max(insets.bottom, 32) }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Quick Access</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Choose which cards to show and drag to reorder</Text>

        <View style={styles.content}>
          {localCards
            .sort((a, b) => a.order - b.order)
            .map((card, index) => {
              const IconComponent = getIconComponent(card.icon);
              
              return (
                <View key={card.id} style={styles.cardItem}>
                  <TouchableOpacity 
                    style={styles.dragHandle}
                    onLongPress={() => {
                      // TODO: Implement drag and drop
                      console.log('Long press to drag:', card.label);
                    }}
                  >
                    <GripVertical size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                  
                  <View style={[styles.cardIcon, { backgroundColor: card.backgroundColor }]}>
                    <IconComponent size={16} color={card.color} />
                  </View>
                  
                  <Text style={styles.cardLabel}>{card.label}</Text>
                  
                  <View style={styles.cardActions}>
                    <TouchableOpacity 
                      style={styles.reorderButton}
                      onPress={() => index > 0 && moveCard(index, index - 1)}
                      disabled={index === 0}
                    >
                      <ChevronUp size={16} color={index === 0 ? "#E5E7EB" : "#64748B"} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.reorderButton}
                      onPress={() => index < localCards.length - 1 && moveCard(index, index + 1)}
                      disabled={index === localCards.length - 1}
                    >
                      <ChevronDown size={16} color={index === localCards.length - 1 ? "#E5E7EB" : "#64748B"} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.visibilityButton}
                      onPress={() => toggleCardVisibility(card.id)}
                    >
                      {card.visible ? (
                        <Eye size={20} color="#3B82F6" />
                      ) : (
                        <EyeOff size={20} color="#9CA3AF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 50,
    zIndex: 99999,
  },
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#CBD5E1',
    width: 40,
  },
  container: {
    flex: 1,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1E293B',
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
  },
  saveButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#64748B',
    paddingHorizontal: 24,
    paddingBottom: 16,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  dragHandle: {
    padding: 4,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reorderButton: {
    padding: 4,
    borderRadius: 4,
  },
  visibilityButton: {
    padding: 8,
  },
});

export default EditCardsBottomSheet;
