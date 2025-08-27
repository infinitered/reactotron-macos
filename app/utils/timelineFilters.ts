import { TimelineItem, TimelineItemLog, TimelineItemNetwork } from "../types"
import { FilterType, LogLevel, SortBy, TimelineFilters } from "../components/TimelineToolbar"

export function filterAndSortTimelineItems(
  items: TimelineItem[],
  filters: TimelineFilters
): TimelineItem[] {
  let filteredItems = [...items]

  filteredItems = filteredItems.filter(item => {
    if (filters.type !== "all") {
      if (filters.type === "log" && item.type !== "log") return false
      if (filters.type === "network" && !item.type.startsWith("api.")) return false
    }

    if (filters.logLevel !== "all" && item.type === "log") {
      const logItem = item as TimelineItemLog
      if (filters.logLevel !== logItem.payload.level) return false
    }

    return true
  })

  filteredItems.sort((a, b) => {
    switch (filters.sortBy) {
      case "time-newest":
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      
      case "time-oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      
      case "type":
        if (a.type !== b.type) {
          if (a.type === "log") return -1
          if (b.type === "log") return 1
          return a.type.localeCompare(b.type)
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      
      case "level":
        const getLevelPriority = (item: TimelineItem): number => {
          if (item.type === "log") {
            const logItem = item as TimelineItemLog
            switch (logItem.payload.level) {
              case "error": return 3
              case "warn": return 2
              case "debug": return 1
              default: return 0
            }
          }
          if (item.type.startsWith("api.")) {
            const networkItem = item as TimelineItemNetwork
            const status = networkItem.payload.response?.status
            if (status && status >= 400) return 3
            if (status && status >= 300) return 2
            return 1
          }
          return 0
        }
        
        const aPriority = getLevelPriority(a)
        const bPriority = getLevelPriority(b)
        if (aPriority !== bPriority) {
          return bPriority - aPriority
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
  })

  return filteredItems
}