import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  useSharedValue, 
  interpolateColor,
  Easing
} from 'react-native-reanimated';
import { FileText, CheckSquare, ListChecks, Folder, BarChart2 } from 'lucide-react-native';

type Tab = {
  id: string;
  label: string;
  icon: string;
};

type TabBarProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabChange }) => {
  // Function to render the appropriate icon based on tab id
  const renderIcon = (tabId: string, color: string) => {
    const iconSize = 18;
    
    switch (tabId) {
      case 'pages':
        return <FileText size={iconSize} color={color} />;
      case 'todos':
        return <CheckSquare size={iconSize} color={color} />;
      case 'checklists':
        return <ListChecks size={iconSize} color={color} />;
      case 'documents':
        return <Folder size={iconSize} color={color} />;
      case 'reports':
        return <BarChart2 size={iconSize} color={color} />;
      default:
        return <FileText size={iconSize} color={color} />;
    }
  };
  // Create animated values for each tab
  const tabAnimations = tabs.reduce((acc, tab) => {
    acc[tab.id] = useSharedValue(tab.id === activeTab ? 1 : 0);
    return acc;
  }, {} as Record<string, Animated.SharedValue<number>>);
  
  // Update animations when activeTab changes
  React.useEffect(() => {
    tabs.forEach(tab => {
      tabAnimations[tab.id].value = withTiming(
        tab.id === activeTab ? 1 : 0, 
        { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }
      );
    });
  }, [activeTab]);
  
  // Create the tab components
  const renderTab = (tab: Tab) => {
    const animatedTabStyle = useAnimatedStyle(() => {
      const backgroundColor = interpolateColor(
        tabAnimations[tab.id].value,
        [0, 1],
        ['transparent', 'rgba(59, 130, 246, 0.1)']
      );
      
      return {
        backgroundColor,
      };
    });
    
    const animatedTextStyle = useAnimatedStyle(() => {
      const color = interpolateColor(
        tabAnimations[tab.id].value,
        [0, 1],
        ['#64748B', '#3B82F6']
      );
      
      return {
        color,
        fontWeight: tabAnimations[tab.id].value > 0.5 ? '500' : '400',
      };
    });
    
    return (
      <TouchableOpacity
        key={tab.id}
        onPress={() => onTabChange(tab.id)}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.tab, animatedTabStyle]}>
          <View>
            {renderIcon(tab.id, tab.id === activeTab ? '#3B82F6' : '#64748B')}
          </View>
          <Animated.Text style={[styles.tabText, animatedTextStyle]}>
            {tab.label}
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {tabs.map(renderTab)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 2,
    paddingBottom: 8,
  },
  // divider: {
  //   height: 1,
  //   backgroundColor: '#E2E8F0',
  //   marginTop: 12,
  // },
  scrollContainer: {
    paddingHorizontal: 8,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});

export default TabBar;