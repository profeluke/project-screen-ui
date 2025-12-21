import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { 
  BottomSheetView, 
  BottomSheetBackdrop,
  BottomSheetBackdropProps 
} from '@gorhom/bottom-sheet';
import { Map, Users, FolderOpen, CheckSquare, FileText, BarChart3, CreditCard, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Widget {
  id: string;
  label: string;
  description: string;
  icon: string;
}

interface AddWidgetBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectWidget: (widget: Widget) => void;
}

const AddWidgetBottomSheet: React.FC<AddWidgetBottomSheetProps> = ({
  visible,
  onClose,
  onSelectWidget,
}) => {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const widgets = [
    { id: 'map', label: 'Map', icon: 'Map', description: 'View project locations' },
    { id: 'users', label: 'Users', icon: 'Users', description: 'Team members and contacts' },
    { id: 'projects', label: 'Projects', icon: 'FolderOpen', description: 'Recent and active projects' },
    { id: 'groups', label: 'Groups', icon: 'Users', description: 'Project groups and teams' },
    { id: 'checklists', label: 'Checklists', icon: 'CheckSquare', description: 'Quick access to checklists' },
    { id: 'documents', label: 'Documents', icon: 'FileText', description: 'Important documents' },
    { id: 'reports', label: 'Reports', icon: 'BarChart3', description: 'Project reports and analytics' },
    { id: 'payments', label: 'Payments', icon: 'CreditCard', description: 'Payment tracking' },
  ];

  // Get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Map': return Map;
      case 'Users': return Users;
      case 'FolderOpen': return FolderOpen;
      case 'CheckSquare': return CheckSquare;
      case 'FileText': return FileText;
      case 'BarChart3': return BarChart3;
      case 'CreditCard': return CreditCard;
      default: return FolderOpen;
    }
  };

  // Get icon background color based on widget type
  const getIconStyle = (id: string) => {
    switch (id) {
      case 'map':
        return { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' };
      case 'users':
      case 'groups':
        return { backgroundColor: '#F3E8FF', borderColor: '#E9D5FF' };
      case 'projects':
      case 'documents':
        return { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' };
      case 'checklists':
        return { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' };
      case 'reports':
        return { backgroundColor: '#FDF2F8', borderColor: '#FECACA' };
      case 'payments':
        return { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' };
      default:
        return { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' };
    }
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
      // Delay to ensure mount before expand
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
      snapPoints={['100%']}
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
          <Text style={styles.title}>Add Widget</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Choose a widget to add to your home screen</Text>

        <View style={styles.content}>
          {widgets.map((widget) => {
            const IconComponent = getIconComponent(widget.icon);
            const iconStyle = getIconStyle(widget.id);
            
            return (
              <TouchableOpacity
                key={widget.id}
                style={styles.option}
                onPress={() => onSelectWidget(widget)}
              >
                <View style={[styles.iconContainer, iconStyle]}>
                  <IconComponent size={24} color="#1E293B" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>{widget.label}</Text>
                  <Text style={styles.optionSubtitle}>{widget.description}</Text>
                </View>
              </TouchableOpacity>
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
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
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
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#64748B',
    lineHeight: 20,
  },
});

export default AddWidgetBottomSheet;
