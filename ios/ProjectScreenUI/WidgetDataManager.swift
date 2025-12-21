import Foundation
import React
import WidgetKit

@objc(WidgetDataManager)
class WidgetDataManager: NSObject {
  
  private let appGroupIdentifier = "group.com.lukemhansen.projectscreenui"
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc
  func updateWidgetData(_ data: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    
    guard let sharedContainer = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier) else {
      rejecter("APP_GROUP_ERROR", "Failed to access App Group container", nil)
      return
    }
    
    let tasksArray = data["tasks"] as? [[String: Any]] ?? []
    
    var widgetTasks: [[String: Any]] = []
    
    for taskData in tasksArray {
      let widgetTask: [String: Any] = [
        "id": taskData["id"] as? String ?? "",
        "text": taskData["text"] as? String ?? "",
        "projectName": taskData["projectName"] as? String ?? "Oak Ridge Residence",
        "isCompleted": taskData["completed"] as? Bool ?? false
      ]
      widgetTasks.append(widgetTask)
    }
    
    let widgetData: [String: Any] = [
      "tasks": widgetTasks,
      "lastUpdated": ISO8601DateFormatter().string(from: Date())
    ]
    
    do {
      let jsonData = try JSONSerialization.data(withJSONObject: widgetData, options: [])
      let fileURL = sharedContainer.appendingPathComponent("widget_data.json")
      
      try jsonData.write(to: fileURL)
      
      // Reload widget timelines
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
      
      resolver(["success": true])
    } catch {
      rejecter("WRITE_ERROR", "Failed to write widget data: \(error.localizedDescription)", error)
    }
  }
  
  @objc
  func getWidgetData(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    
    guard let sharedContainer = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier) else {
      rejecter("APP_GROUP_ERROR", "Failed to access App Group container", nil)
      return
    }
    
    let fileURL = sharedContainer.appendingPathComponent("widget_data.json")
    
    do {
      let data = try Data(contentsOf: fileURL)
      let json = try JSONSerialization.jsonObject(with: data, options: [])
      resolver(json)
    } catch {
      // Return empty data if file doesn't exist or can't be read
      resolver([
        "tasks": [],
        "lastUpdated": ISO8601DateFormatter().string(from: Date())
      ])
    }
  }
} 