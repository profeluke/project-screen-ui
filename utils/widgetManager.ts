import { NativeModules, Platform } from 'react-native';
import { Task } from './taskStorage';

interface WidgetDataManager {
  updateWidgetData(data: { tasks: Task[] }): Promise<{ success: boolean }>;
  getWidgetData(): Promise<{ tasks: Task[]; lastUpdated: string }>;
}

const { WidgetDataManager } = NativeModules;

/**
 * Updates the widget with current task data
 * @param tasks Array of tasks to display in the widget
 */
export async function updateWidgetData(tasks: Task[]): Promise<void> {
  if (Platform.OS !== 'ios') {
    return; // Widgets are iOS-only
  }

  try {
    const widgetData = {
      tasks: tasks.slice(0, 10) // Limit to 10 most recent tasks
    };
    
    await WidgetDataManager.updateWidgetData(widgetData);
    console.log('Widget data updated successfully');
  } catch (error) {
    console.error('Failed to update widget data:', error);
  }
}

/**
 * Gets the current widget data
 */
export async function getWidgetData(): Promise<{ tasks: Task[]; lastUpdated: string } | null> {
  if (Platform.OS !== 'ios') {
    return null;
  }

  try {
    const data = await WidgetDataManager.getWidgetData();
    return data;
  } catch (error) {
    console.error('Failed to get widget data:', error);
    return null;
  }
}

/**
 * React hook to automatically update widget data when tasks change
 */
export function useWidgetDataSync() {
  const syncWidgetData = async (tasks: Task[]) => {
    await updateWidgetData(tasks);
  };

  return { syncWidgetData };
} 