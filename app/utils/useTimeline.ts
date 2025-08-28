import { TimelineItem } from "../types"
import { TimelineFilters } from "../components/TimelineToolbar"
import { useGlobal } from "../state/useGlobal"

export function useTimeline(filters: TimelineFilters): TimelineItem[] {
  const [items] = useGlobal<TimelineItem[]>("timelineItems", [], { persist: true })

  const filteredItems = items.filter((item) => {
    // if there are any filters selected, only show items that match the filters
    return filters.types.includes(item.type)
  })

  filteredItems.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return filteredItems

  // TODO: User controlled sorting and level filtering

  //   switch (filters.sortBy) {
  //     case "time-newest":
  //       return new Date(b.date).getTime() - new Date(a.date).getTime()

  //     case "time-oldest":
  //       return new Date(a.date).getTime() - new Date(b.date).getTime()

  //     case "type":
  //       if (a.type !== b.type) {
  //         if (a.type === "log") return -1
  //         if (b.type === "log") return 1
  //         return a.type.localeCompare(b.type)
  //       }
  //       return new Date(b.date).getTime() - new Date(a.date).getTime()

  //     case "level":
  //       const getLevelPriority = (item: TimelineItem): number => {
  //         if (item.type === "log") {
  //           const logItem = item as TimelineItemLog
  //           switch (logItem.payload.level) {
  //             case "error":
  //               return 3
  //             case "warn":
  //               return 2
  //             case "debug":
  //               return 1
  //             default:
  //               return 0
  //           }
  //         }
  //         if (item.type.startsWith("api.")) {
  //           const networkItem = item as TimelineItemNetwork
  //           const status = networkItem.payload.response?.status
  //           if (status && status >= 400) return 3
  //           if (status && status >= 300) return 2
  //           return 1
  //         }
  //         return 0
  //       }

  //       const aPriority = getLevelPriority(a)
  //       const bPriority = getLevelPriority(b)
  //       if (aPriority !== bPriority) {
  //         return bPriority - aPriority
  //       }
  //       return new Date(b.date).getTime() - new Date(a.date).getTime()

  //     default:
  //       return new Date(b.date).getTime() - new Date(a.date).getTime()
  //   }
  // })
}
