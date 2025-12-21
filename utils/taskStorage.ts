import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateWidgetData } from './widgetManager';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  projectId?: string;
  projectName?: string;
  noteId?: string;
  createdAt: number;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  photoIds?: string[];
}

const TASKS_STORAGE_KEY = 'app_tasks';

/**
 * Get all tasks
 */
export async function getAllTasks(): Promise<Task[]> {
  try {
    const tasksJson = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    if (!tasksJson) {
      return [];
    }
    
    const tasks = JSON.parse(tasksJson) as Task[];
    // Sort by creation date, newest first
    return tasks.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

/**
 * Get tasks for a specific project
 */
export async function getTasksByProject(projectId: string): Promise<Task[]> {
  try {
    const allTasks = await getAllTasks();
    return allTasks.filter(task => task.projectId === projectId);
  } catch (error) {
    console.error('Error loading project tasks:', error);
    return [];
  }
}

/**
 * Get incomplete tasks
 */
export async function getIncompleteTasks(): Promise<Task[]> {
  try {
    const allTasks = await getAllTasks();
    return allTasks.filter(task => !task.completed);
  } catch (error) {
    console.error('Error loading incomplete tasks:', error);
    return [];
  }
}

/**
 * Save multiple tasks at once (used by Accept All)
 */
export async function saveTasks(tasks: Array<{
  text: string;
  projectId?: string;
  projectName?: string;
  noteId?: string;
  photoIds?: string[];
}>): Promise<string[]> {
  try {
    const existingTasks = await getAllTasks();
    const newTaskIds: string[] = [];
    
    const newTasks = tasks.map(task => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      newTaskIds.push(id);
      
      return {
        id,
        text: task.text,
        completed: false,
        projectId: task.projectId || 'oak-ridge-residence', // Default to Oak Ridge
        projectName: task.projectName || 'Oak Ridge Residence',
        noteId: task.noteId,
        createdAt: Date.now(),
        photoIds: task.photoIds
      };
    });
    
    const updatedTasks = [...existingTasks, ...newTasks];
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
    
    // Update widget with new tasks
    await updateWidgetData(updatedTasks);
    
    console.log(`${tasks.length} tasks saved successfully`);
    return newTaskIds;
  } catch (error) {
    console.error('Error saving tasks:', error);
    throw error;
  }
}

/**
 * Save a single task
 */
export async function saveTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<string> {
  try {
    const existingTasks = await getAllTasks();
    
    const newTask: Task = {
      ...task,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
    
    const updatedTasks = [...existingTasks, newTask];
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
    
    // Update widget with new tasks
    await updateWidgetData(updatedTasks);
    
    console.log('Task saved successfully:', newTask.id);
    return newTask.id;
  } catch (error) {
    console.error('Error saving task:', error);
    throw error;
  }
}

/**
 * Update a task (e.g., mark as complete)
 */
export async function updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
  try {
    const existingTasks = await getAllTasks();
    const taskIndex = existingTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    existingTasks[taskIndex] = { ...existingTasks[taskIndex], ...updates };
    
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(existingTasks));
    
    // Update widget with updated tasks
    await updateWidgetData(existingTasks);
    
    console.log('Task updated:', taskId);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

/**
 * Toggle task completion status
 */
export async function toggleTaskComplete(taskId: string): Promise<void> {
  try {
    const existingTasks = await getAllTasks();
    const taskIndex = existingTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    existingTasks[taskIndex].completed = !existingTasks[taskIndex].completed;
    
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(existingTasks));
    
    // Update widget with updated tasks
    await updateWidgetData(existingTasks);
    
    console.log('Task toggled:', taskId);
  } catch (error) {
    console.error('Error toggling task:', error);
    throw error;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  try {
    const existingTasks = await getAllTasks();
    const filteredTasks = existingTasks.filter(task => task.id !== taskId);
    
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(filteredTasks));
    
    // Update widget with updated tasks
    await updateWidgetData(filteredTasks);
    
    console.log('Task deleted:', taskId);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

/**
 * Clear all tasks (for testing/debugging)
 */
export async function clearAllTasks(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
    console.log('All tasks cleared');
  } catch (error) {
    console.error('Error clearing tasks:', error);
    throw error;
  }
} 