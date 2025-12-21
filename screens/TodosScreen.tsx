import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckSquare, Square, User, AlertCircle, Clock, ChevronDown, X, Filter, ChevronLeft } from 'lucide-react-native';
import Header from '../components/Header';
import { getTasksByProject, toggleTaskComplete, deleteTask as deleteTaskFromStorage, Task } from '../utils/taskStorage';

interface TodosScreenProps {
  onClose: () => void;
}

// Sample extended task data with more properties for filtering
const sampleTasks = [
  {
    id: '1',
    text: 'Review electrical inspection report and approve changes',
    completed: false,
    assignedTo: 'You',
    priority: 'High',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    category: 'Review',
    projectId: 'oak-ridge-residence'
  },
  {
    id: '2',
    text: 'Schedule drywall team for next week',
    completed: false,
    assignedTo: 'Mike Johnson',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    category: 'Scheduling',
    projectId: 'oak-ridge-residence'
  },
  {
    id: '3',
    text: 'Order premium tiles for kitchen renovation',
    completed: false,
    assignedTo: 'You',
    priority: 'High',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    category: 'Procurement',
    projectId: 'oak-ridge-residence'
  },
  {
    id: '4',
    text: 'Update client on project timeline changes',
    completed: true,
    assignedTo: 'Sarah Anderson',
    priority: 'Medium',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    category: 'Communication',
    projectId: 'oak-ridge-residence'
  },
  {
    id: '5',
    text: 'Coordinate concrete pour with weather forecast',
    completed: false,
    assignedTo: 'You',
    priority: 'Low',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    category: 'Coordination',
    projectId: 'oak-ridge-residence'
  },
  {
    id: '6',
    text: 'Submit permit application for phase 2',
    completed: false,
    assignedTo: 'Emily Chen',
    priority: 'High',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    category: 'Documentation',
    projectId: 'oak-ridge-residence'
  }
];

export default function TodosScreen({ onClose }: TodosScreenProps) {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState(sampleTasks);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showAssigneeFilter, setShowAssigneeFilter] = useState(false);
  const [showPriorityFilter, setShowPriorityFilter] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  const filterOptions = ['All', 'Mine', 'Pending', 'Completed'];
  const assigneeOptions = ['All', 'You', 'Mike Johnson', 'Sarah Anderson', 'Emily Chen'];
  const priorityOptions = ['All', 'High', 'Medium', 'Low'];

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days ago`;
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return `${diffDays} days`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#10B981';
      default: return '#64748B';
    }
  };

  const getFilteredTasks = () => {
    let filteredTasks = [...tasks];

    // Filter by main filter
    if (selectedFilter === 'Mine') {
      filteredTasks = filteredTasks.filter(task => task.assignedTo === 'You');
    } else if (selectedFilter === 'Pending') {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (selectedFilter === 'Completed') {
      filteredTasks = filteredTasks.filter(task => task.completed);
    }

    // Filter by assignee
    if (selectedAssignee !== 'All') {
      filteredTasks = filteredTasks.filter(task => task.assignedTo === selectedAssignee);
    }

    // Filter by priority
    if (selectedPriority !== 'All') {
      filteredTasks = filteredTasks.filter(task => task.priority === selectedPriority);
    }

    return filteredTasks;
  };

  const handleTaskToggle = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const renderTaskItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.taskItem, item.completed && styles.completedTask]}
      onPress={() => handleTaskToggle(item.id)}
    >
      <View style={styles.taskCheckbox}>
        {item.completed ? (
          <CheckSquare size={24} color="#3B82F6" />
        ) : (
          <Square size={24} color="#94A3B8" />
        )}
      </View>

      <View style={styles.taskContent}>
        <Text style={[styles.taskText, item.completed && styles.completedTaskText]}>
          {item.text}
        </Text>
        
        <View style={styles.taskMeta}>
          <View style={styles.taskMetaLeft}>
            <View style={styles.assigneeContainer}>
              <User size={14} color="#64748B" />
              <Text style={styles.assigneeText}>{item.assignedTo}</Text>
            </View>
            
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
              <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                {item.priority}
              </Text>
            </View>
          </View>
          
          <View style={styles.dueDateContainer}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.dueDateText}>{formatDueDate(item.dueDate)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.simpleHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <ChevronLeft size={32} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Title and Stats */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>To-Do's</Text>
          <Text style={styles.subtitle}>
            {getFilteredTasks().filter(t => !t.completed).length} pending • {getFilteredTasks().filter(t => t.completed).length} completed
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {filterOptions.map((filter) => (
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

            {/* Assignee Filter */}
            <TouchableOpacity
              style={[styles.filterTab, styles.filterDropdown]}
              onPress={() => setShowAssigneeFilter(true)}
            >
              <User size={16} color="#64748B" />
              <Text style={styles.filterTabText}>
                {selectedAssignee === 'All' ? 'Assignee' : selectedAssignee}
              </Text>
              <ChevronDown size={16} color="#64748B" />
            </TouchableOpacity>

            {/* Priority Filter */}
            <TouchableOpacity
              style={[styles.filterTab, styles.filterDropdown]}
              onPress={() => setShowPriorityFilter(true)}
            >
              <AlertCircle size={16} color="#64748B" />
              <Text style={styles.filterTabText}>
                {selectedPriority === 'All' ? 'Priority' : selectedPriority}
              </Text>
              <ChevronDown size={16} color="#64748B" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Tasks List */}
        <FlatList
          data={getFilteredTasks()}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          style={styles.tasksList}
          contentContainerStyle={styles.tasksListContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Assignee Filter Modal */}
      {showAssigneeFilter && (
        <View style={styles.filterOverlay}>
          <TouchableOpacity 
            style={styles.filterBackdrop}
            onPress={() => setShowAssigneeFilter(false)}
          />
          <View style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter by Assignee</Text>
              <TouchableOpacity onPress={() => setShowAssigneeFilter(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.filterOptions}>
              {assigneeOptions.map((assignee) => (
                <TouchableOpacity
                  key={assignee}
                  style={styles.filterOption}
                  onPress={() => {
                    setSelectedAssignee(assignee);
                    setShowAssigneeFilter(false);
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedAssignee === assignee && styles.filterOptionTextActive
                  ]}>
                    {assignee}
                  </Text>
                  {selectedAssignee === assignee && (
                    <CheckSquare size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Priority Filter Modal */}
      {showPriorityFilter && (
        <View style={styles.filterOverlay}>
          <TouchableOpacity 
            style={styles.filterBackdrop}
            onPress={() => setShowPriorityFilter(false)}
          />
          <View style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter by Priority</Text>
              <TouchableOpacity onPress={() => setShowPriorityFilter(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.filterOptions}>
              {priorityOptions.map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={styles.filterOption}
                  onPress={() => {
                    setSelectedPriority(priority);
                    setShowPriorityFilter(false);
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedPriority === priority && styles.filterOptionTextActive
                  ]}>
                    {priority}
                  </Text>
                  {selectedPriority === priority && (
                    <CheckSquare size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
  },
  simpleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersScroll: {
    paddingRight: 20,
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterDropdown: {
    paddingHorizontal: 12,
  },
  filterTabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  tasksList: {
    flex: 1,
  },
  tasksListContent: {
    paddingBottom: 100,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  completedTask: {
    opacity: 0.6,
  },
  taskCheckbox: {
    marginRight: 12,
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 22,
    marginBottom: 8,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assigneeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  // Filter Modal Styles
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filterBackdrop: {
    flex: 1,
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 34,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
  },
  filterOptions: {
    maxHeight: 400,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterOptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#374151',
  },
  filterOptionTextActive: {
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
});