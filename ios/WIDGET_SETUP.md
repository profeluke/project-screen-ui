# iOS Widget Setup Guide

This guide will help you configure the iOS home screen widget for the Project Screen UI app.

## Files Created

The following files have been created for the widget:

- `ProjectScreenUIWidget/ProjectScreenUIWidget.swift` - Main widget implementation
- `ProjectScreenUIWidget/ProjectScreenUIWidgetBundle.swift` - Widget bundle registration  
- `ProjectScreenUIWidget/Info.plist` - Widget extension configuration
- `ProjectScreenUIWidget/ProjectScreenUIWidget.entitlements` - Widget entitlements for App Groups
- `ProjectScreenUI/WidgetDataManager.swift` - Native module for data sharing
- `ProjectScreenUI/WidgetDataManager.m` - Objective-C bridge
- `utils/widgetManager.ts` - React Native utility for widget data
- `utils/deepLinkHandler.ts` - Deep link handler for widget actions

## Xcode Configuration Steps

### 1. Add Widget Extension Target

1. Open `ios/ProjectScreenUI.xcworkspace` in Xcode
2. Select the project in the navigator (top level "ProjectScreenUI")
3. Click the "+" button at the bottom of the targets list
4. Choose "Widget Extension" 
5. Set Product Name: `ProjectScreenUIWidget`
6. Set Bundle Identifier: `com.lukemhansen.projectscreenui.ProjectScreenUIWidget`
7. Uncheck "Include Configuration Intent"
8. Click "Finish"
9. Choose "Cancel" when asked to activate the scheme

### 2. Configure Widget Target

1. Select the `ProjectScreenUIWidget` target
2. Go to "General" tab
3. Set Deployment Target to iOS 14.0 or later
4. Under "Frameworks and Libraries", ensure WidgetKit is added

### 3. Replace Generated Files

1. Delete the generated widget files in the `ProjectScreenUIWidget` folder
2. Add the files we created:
   - `ProjectScreenUIWidget.swift`
   - `ProjectScreenUIWidgetBundle.swift`
   - `Info.plist`
   - `ProjectScreenUIWidget.entitlements`

### 4. Configure App Groups

#### For Main App Target:
1. Select the `ProjectScreenUI` target
2. Go to "Signing & Capabilities" tab
3. Click "+" and add "App Groups"
4. Add group: `group.com.lukemhansen.projectscreenui`
5. Ensure the entitlements file is set to `ProjectScreenUI/ProjectScreenUI.entitlements`

#### For Widget Target:
1. Select the `ProjectScreenUIWidget` target  
2. Go to "Signing & Capabilities" tab
3. Click "+" and add "App Groups"
4. Add group: `group.com.lukemhansen.projectscreenui`
5. Set Code Signing Entitlements to `ProjectScreenUIWidget/ProjectScreenUIWidget.entitlements`

### 5. Add Native Module Files

1. Add `WidgetDataManager.swift` to the main app target
2. Add `WidgetDataManager.m` to the main app target
3. Make sure both files are added to the ProjectScreenUI target only (not the widget target)

### 6. Update Build Settings

#### For Widget Target:
1. Go to Build Settings
2. Set "Skip Install" to "NO"
3. Set "Always Embed Swift Standard Libraries" to "YES"

### 7. Configure Schemes

1. Edit the ProjectScreenUI scheme
2. Go to "Build" tab  
3. Ensure both `ProjectScreenUI` and `ProjectScreenUIWidget` are checked for "Run"

## Testing the Widget

1. Build and run the app on a physical device or simulator (iOS 14+)
2. Go to the iOS home screen
3. Long press on an empty area to enter edit mode
4. Tap the "+" button to add widgets
5. Search for "Project Screen UI" 
6. Select the "Project Tasks" widget
7. Choose the size (Small, Medium, or Large)
8. Tap "Add Widget"

## Widget Features

### Small Widget
- Shows up to 3 recent tasks
- Displays task count
- Taps navigate to tasks screen

### Medium Widget  
- Shows up to 3 recent tasks with project names
- Quick action buttons for Photo, Note, and New
- Shows completion status

### Large Widget
- Shows up to 6 recent tasks
- Four quick action buttons
- Complete task overview
- Scroll support for many tasks

## Deep Links

The widget uses these deep link URLs:

- `projectscreen://tasks` - Navigate to tasks/My Stuff screen
- `projectscreen://camera` - Open camera
- `projectscreen://audio` - Open audio recording modal  
- `projectscreen://create` - Open create modal
- `projectscreen://home` - Navigate to home screen

## Data Synchronization

The widget automatically updates when:
- Tasks are created, updated, or deleted
- App data changes
- Widget timeline refreshes (every 15 minutes)

Task data is shared between the app and widget using App Groups in a shared container at:
`/group.com.lukemhansen.projectscreenui/widget_data.json`

## Troubleshooting

### Widget not appearing
- Ensure iOS deployment target is 14.0+
- Check App Groups are configured correctly
- Verify bundle identifiers are correct

### Widget not updating
- Check App Groups permissions
- Verify widget data is being written to shared container
- Test with fresh widget installation

### Deep links not working  
- Ensure URL scheme is registered in main app Info.plist
- Check deep link handler is set up in HomeScreen
- Verify widget URLs match the registered scheme

## Development Tips

- Use Xcode widget previews for quick UI testing
- Widget data updates trigger automatically on task changes
- Use device console to debug widget issues
- Test on both simulator and physical device 