import WidgetKit
import SwiftUI

struct ProjectScreenUIWidget: Widget {
    let kind: String = "ProjectScreenUIWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            ProjectScreenUIWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Project Tasks")
        .description("View recent tasks and quick actions for your construction projects.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), tasks: [
            WidgetTask(id: "1", text: "Review electrical plans", projectName: "Oak Ridge Residence", isCompleted: false),
            WidgetTask(id: "2", text: "Schedule inspection", projectName: "Oak Ridge Residence", isCompleted: false)
        ])
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), tasks: loadTasks())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let currentDate = Date()
        let refreshDate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        
        let entry = SimpleEntry(date: currentDate, tasks: loadTasks())
        let timeline = Timeline(entries: [entry], policy: .after(refreshDate))
        completion(timeline)
    }
    
    private func loadTasks() -> [WidgetTask] {
        guard let sharedContainer = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.lukemhansen.projectscreenui") else {
            return []
        }
        
        let tasksURL = sharedContainer.appendingPathComponent("widget_data.json")
        
        guard let data = try? Data(contentsOf: tasksURL),
              let widgetData = try? JSONDecoder().decode(WidgetData.self, from: data) else {
            return []
        }
        
        return widgetData.tasks.filter { !$0.isCompleted }.prefix(5).map { $0 }
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let tasks: [WidgetTask]
}

struct WidgetTask: Codable, Identifiable {
    let id: String
    let text: String
    let projectName: String
    let isCompleted: Bool
}

struct WidgetData: Codable {
    let tasks: [WidgetTask]
    let lastUpdated: Date
}

struct ProjectScreenUIWidgetEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(tasks: entry.tasks)
        case .systemMedium:
            MediumWidgetView(tasks: entry.tasks)
        case .systemLarge:
            LargeWidgetView(tasks: entry.tasks)
        default:
            SmallWidgetView(tasks: entry.tasks)
        }
    }
}

struct SmallWidgetView: View {
    let tasks: [WidgetTask]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "hammer.fill")
                    .foregroundColor(.blue)
                    .font(.system(size: 16, weight: .medium))
                Text("Tasks")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.primary)
                Spacer()
                Text("\(tasks.count)")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.secondary)
            }
            
            if tasks.isEmpty {
                VStack {
                    Spacer()
                    Text("No pending tasks")
                        .font(.system(size: 14))
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                    Spacer()
                }
            } else {
                VStack(alignment: .leading, spacing: 6) {
                    ForEach(tasks.prefix(3)) { task in
                        VStack(alignment: .leading, spacing: 2) {
                            Text(task.text)
                                .font(.system(size: 13, weight: .medium))
                                .lineLimit(2)
                                .foregroundColor(.primary)
                            Text(task.projectName)
                                .font(.system(size: 11))
                                .foregroundColor(.secondary)
                        }
                        
                        if task.id != tasks.prefix(3).last?.id {
                            Rectangle()
                                .fill(Color.secondary.opacity(0.2))
                                .frame(height: 1)
                        }
                    }
                }
                Spacer()
            }
        }
        .padding(16)
        .widgetURL(URL(string: "projectscreen://tasks"))
    }
}

struct MediumWidgetView: View {
    let tasks: [WidgetTask]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                Image(systemName: "hammer.fill")
                    .foregroundColor(.blue)
                    .font(.system(size: 18, weight: .medium))
                Text("Project Tasks")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.primary)
                Spacer()
                Text("\(tasks.count) pending")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.secondary)
            }
            
            if tasks.isEmpty {
                VStack {
                    Spacer()
                    Text("All tasks completed!")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("Tap to add new tasks")
                        .font(.system(size: 14))
                        .foregroundColor(.secondary)
                    Spacer()
                }
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(tasks.prefix(3)) { task in
                        TaskRowView(task: task)
                    }
                }
                
                if tasks.count > 3 {
                    HStack {
                        Spacer()
                        Text("+ \(tasks.count - 3) more tasks")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.blue)
                        Spacer()
                    }
                }
                
                Spacer()
            }
            
            // Quick actions
            HStack(spacing: 12) {
                QuickActionButton(icon: "camera.fill", title: "Photo", url: "projectscreen://camera")
                QuickActionButton(icon: "mic.fill", title: "Note", url: "projectscreen://audio")
                QuickActionButton(icon: "plus", title: "New", url: "projectscreen://create")
                Spacer()
            }
        }
        .padding(16)
        .widgetURL(URL(string: "projectscreen://tasks"))
    }
}

struct LargeWidgetView: View {
    let tasks: [WidgetTask]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack {
                Image(systemName: "hammer.fill")
                    .foregroundColor(.blue)
                    .font(.system(size: 20, weight: .medium))
                Text("Project Tasks")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(.primary)
                Spacer()
                Text("\(tasks.count) pending")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.secondary)
            }
            
            if tasks.isEmpty {
                VStack {
                    Spacer()
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.green)
                    Text("All tasks completed!")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(.primary)
                    Text("Great work! Tap to add new tasks.")
                        .font(.system(size: 16))
                        .foregroundColor(.secondary)
                    Spacer()
                }
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 10) {
                        ForEach(tasks.prefix(6)) { task in
                            TaskRowView(task: task, showProject: true)
                        }
                    }
                }
                
                if tasks.count > 6 {
                    HStack {
                        Spacer()
                        Text("+ \(tasks.count - 6) more tasks")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(.blue)
                        Spacer()
                    }
                }
            }
            
            // Quick actions
            HStack(spacing: 16) {
                QuickActionButton(icon: "camera.fill", title: "Take Photo", url: "projectscreen://camera")
                QuickActionButton(icon: "mic.fill", title: "Voice Note", url: "projectscreen://audio")
                QuickActionButton(icon: "plus", title: "New Task", url: "projectscreen://create")
                QuickActionButton(icon: "list.bullet", title: "All Tasks", url: "projectscreen://tasks")
            }
        }
        .padding(16)
        .widgetURL(URL(string: "projectscreen://tasks"))
    }
}

struct TaskRowView: View {
    let task: WidgetTask
    var showProject: Bool = false
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Circle()
                .fill(Color.secondary.opacity(0.3))
                .frame(width: 8, height: 8)
                .padding(.top, 6)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(task.text)
                    .font(.system(size: 15, weight: .medium))
                    .lineLimit(2)
                    .foregroundColor(.primary)
                
                if showProject {
                    Text(task.projectName)
                        .font(.system(size: 13))
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
        }
        .padding(.vertical, 4)
    }
}

struct QuickActionButton: View {
    let icon: String
    let title: String
    let url: String
    
    var body: some View {
        Link(destination: URL(string: url)!) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.blue)
                Text(title)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.primary)
            }
            .frame(minWidth: 0, maxWidth: .infinity)
            .padding(.vertical, 8)
            .background(Color.secondary.opacity(0.1))
            .cornerRadius(8)
        }
    }
}

#Preview(as: .systemSmall) {
    ProjectScreenUIWidget()
} timeline: {
    SimpleEntry(date: .now, tasks: [
        WidgetTask(id: "1", text: "Review electrical plans", projectName: "Oak Ridge Residence", isCompleted: false),
        WidgetTask(id: "2", text: "Schedule inspection", projectName: "Oak Ridge Residence", isCompleted: false)
    ])
}

#Preview(as: .systemMedium) {
    ProjectScreenUIWidget()
} timeline: {
    SimpleEntry(date: .now, tasks: [
        WidgetTask(id: "1", text: "Review electrical plans", projectName: "Oak Ridge Residence", isCompleted: false),
        WidgetTask(id: "2", text: "Schedule inspection", projectName: "Oak Ridge Residence", isCompleted: false),
        WidgetTask(id: "3", text: "Order materials for kitchen", projectName: "Oak Ridge Residence", isCompleted: false)
    ])
} 