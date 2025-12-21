import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PrototypeOptionsScreenProps {
  onClose: () => void;
  hideActivityFeed: boolean;
  onToggleActivityFeed: (value: boolean) => void;
  hideActivityTitle: boolean;
  onToggleActivityTitle: (value: boolean) => void;
  hideSearchBar: boolean;
  onToggleSearchBar: (value: boolean) => void;
  showBottomSearchBar: boolean;
  onToggleBottomSearchBar: (value: boolean) => void;
  condensedMyStuff?: boolean;
  onToggleCondensedMyStuff?: (value: boolean) => void;
  disablePaymentButton?: boolean;
  onToggleDisablePaymentButton?: (value: boolean) => void;
  showProjectTabs?: boolean;
  onToggleShowProjectTabs?: (value: boolean) => void;
  showFloatingActionLabels?: boolean;
  onToggleShowFloatingActionLabels?: (value: boolean) => void;
  showWidgetsAtTop?: boolean;
  onToggleShowWidgetsAtTop?: (value: boolean) => void;
  showMyStuffWidgets?: boolean;
  onToggleShowMyStuffWidgets?: (value: boolean) => void;
  showHeaderIcons?: boolean;
  onToggleShowHeaderIcons?: (value: boolean) => void;
  hideProjectSection?: boolean;
  onToggleHideProjectSection?: (value: boolean) => void;
}

export default function PrototypeOptionsScreen({ 
  onClose, 
  hideActivityFeed, 
  onToggleActivityFeed,
  hideActivityTitle,
  onToggleActivityTitle,
  hideSearchBar,
  onToggleSearchBar,
  showBottomSearchBar,
  onToggleBottomSearchBar,
  condensedMyStuff = false,
  onToggleCondensedMyStuff = () => {},
  disablePaymentButton = false,
  onToggleDisablePaymentButton = () => {},
  showProjectTabs = true,
  onToggleShowProjectTabs = () => {},
  showFloatingActionLabels = true,
  onToggleShowFloatingActionLabels = () => {},
  showWidgetsAtTop = true,
  onToggleShowWidgetsAtTop = () => {},
  showMyStuffWidgets = true,
  onToggleShowMyStuffWidgets = () => {},
  showHeaderIcons = true,
  onToggleShowHeaderIcons = () => {},
  hideProjectSection = false,
  onToggleHideProjectSection = () => {}
}: PrototypeOptionsScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 16, 32) }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <ChevronRight size={24} color="#1E293B" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prototype Options</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* UI Options Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>UI Options</Text>
          
          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionTitle}>Hide Activity Feed</Text>
              <Text style={styles.optionDescription}>
                Hide the entire activity section including Feed, Sarah, and all people
              </Text>
            </View>
            <Switch
              value={hideActivityFeed}
              onValueChange={onToggleActivityFeed}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={hideActivityFeed ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionTitle}>Hide Activity Title</Text>
              <Text style={styles.optionDescription}>
                Hide just the "Activity" title while keeping the activity feed visible
              </Text>
            </View>
            <Switch
              value={hideActivityTitle}
              onValueChange={onToggleActivityTitle}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={hideActivityTitle ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionTitle}>Hide Top Search Bar</Text>
              <Text style={styles.optionDescription}>
                Hide the "Search or Create with AI..." search bar at the top
              </Text>
            </View>
            <Switch
              value={hideSearchBar}
              onValueChange={onToggleSearchBar}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={hideSearchBar ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionTitle}>Show Bottom Search Bar</Text>
              <Text style={styles.optionDescription}>
                Show a duplicate search bar at the bottom above the menu buttons
              </Text>
            </View>
            <Switch
              value={showBottomSearchBar}
              onValueChange={onToggleBottomSearchBar}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={showBottomSearchBar ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionTitle}>Condensed My Stuff</Text>
              <Text style={styles.optionDescription}>
                Replace the full "My Stuff" section with a condensed button that links to a dedicated page
              </Text>
            </View>
            <Switch
              value={condensedMyStuff}
              onValueChange={onToggleCondensedMyStuff}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={condensedMyStuff ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionTitle}>Disable Payment Button</Text>
              <Text style={styles.optionDescription}>
                Disable the payment button
              </Text>
            </View>
            <Switch
              value={disablePaymentButton}
              onValueChange={onToggleDisablePaymentButton}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={disablePaymentButton ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionTitle}>Show Project Tabs</Text>
              <Text style={styles.optionDescription}>
                Replace photo scroller and cards with horizontal tabs (Activity, Photos, To-Do's, Notes, Docs)
              </Text>
            </View>
            <Switch
              value={showProjectTabs}
              onValueChange={onToggleShowProjectTabs}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={showProjectTabs ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionTitle}>Floating Action Bar Labels</Text>
              <Text style={styles.optionDescription}>
                Show text labels below the icons in the floating action bar
              </Text>
            </View>
            <Switch
              value={showFloatingActionLabels}
              onValueChange={onToggleShowFloatingActionLabels}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={showFloatingActionLabels ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionTitle}>Widgets at Top</Text>
              <Text style={styles.optionDescription}>
                Toggle to place the widgets above Activity (on) or below Projects (off)
              </Text>
            </View>
            <Switch
              value={showWidgetsAtTop}
              onValueChange={onToggleShowWidgetsAtTop}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={showWidgetsAtTop ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionTitle}>Show My Stuff Widgets</Text>
              <Text style={styles.optionDescription}>
                Toggle to show or hide the My Stuff widgets section completely
              </Text>
            </View>
            <Switch
              value={showMyStuffWidgets}
              onValueChange={onToggleShowMyStuffWidgets}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={showMyStuffWidgets ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionTitle}>Show Header Icons</Text>
              <Text style={styles.optionDescription}>
                Toggle to show or hide the map and notification icons in the header
              </Text>
            </View>
            <Switch
              value={showHeaderIcons}
              onValueChange={onToggleShowHeaderIcons}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={showHeaderIcons ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionTitle}>Hide Projects Section</Text>
              <Text style={styles.optionDescription}>
                Hide the projects carousel from the home screen
              </Text>
            </View>
            <Switch
              value={hideProjectSection}
              onValueChange={onToggleHideProjectSection}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={hideProjectSection ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
            />
          </View>
        </View>
      </ScrollView>
    </View>
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
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
  },
  placeholder: {
    width: 44,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  optionLeft: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  optionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
}); 