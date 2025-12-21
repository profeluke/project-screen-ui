import { Linking } from 'react-native';

export interface DeepLinkHandlers {
  onShowTasks?: () => void;
  onShowCamera?: () => void;
  onShowAudioModal?: () => void;
  onShowCreateModal?: () => void;
  onShowHome?: () => void;
}

/**
 * Handles deep link URLs from the widget
 * @param url The URL to handle
 * @param handlers Object containing handler functions for different screens
 */
export function handleDeepLink(url: string, handlers: DeepLinkHandlers): boolean {
  if (!url.startsWith('projectscreen://')) {
    return false;
  }

  const action = url.replace('projectscreen://', '');
  
  switch (action) {
    case 'tasks':
      handlers.onShowTasks?.();
      return true;
    
    case 'camera':
      handlers.onShowCamera?.();
      return true;
    
    case 'audio':
      handlers.onShowAudioModal?.();
      return true;
    
    case 'create':
      handlers.onShowCreateModal?.();
      return true;
    
    case 'home':
    case '':
      handlers.onShowHome?.();
      return true;
    
    default:
      console.log('Unknown deep link action:', action);
      return false;
  }
}

/**
 * Sets up deep link listener for the app
 * @param handlers Object containing handler functions for different screens
 */
export function setupDeepLinkListener(handlers: DeepLinkHandlers) {
  // Handle app launch from deep link
  Linking.getInitialURL().then(url => {
    if (url) {
      handleDeepLink(url, handlers);
    }
  });

  // Handle deep links when app is running
  const subscription = Linking.addEventListener('url', ({ url }) => {
    handleDeepLink(url, handlers);
  });

  return () => {
    subscription?.remove();
  };
} 