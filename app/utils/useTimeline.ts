import { TimelineItem } from "../types"
import { TimelineFilters } from "../components/TimelineToolbar"
import { useGlobal } from "../state/useGlobal"
import { useMemo } from "react"
import { normalize } from "./normalize"
import { safeTime } from "./safeTime"

export function useTimeline(filters: TimelineFilters): TimelineItem[] {
  const [items] = useGlobal<TimelineItem[]>("timelineItems", [], { persist: true })
  const [search] = useGlobal("search", "")

  return useMemo(() => {
    const clientScopedItems = items.filter((item) => item.clientId === filters.clientId)
    // 1) Types filter: if none selected, show everything
    const byType =
      (filters.types?.length ?? 0) === 0
        ? clientScopedItems.slice() // clone so we can sort safely later
        : clientScopedItems.filter((item) => filters.types.includes(item.type))

    // 2) Search (normalize once)
    const q = normalize(search)
    const visited = new WeakSet<object>()
    const matches = (val: unknown): boolean => {
      if (val === null || val === undefined) return false

      if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
        return normalize(val).includes(q)
      }
      if (val instanceof Date) {
        return normalize(val.toISOString()).includes(q)
      }
      if (Array.isArray(val)) {
        for (const v of val) if (matches(v)) return true
        return false
      }
      if (typeof val === "object") {
        const obj = val as Record<string, unknown>
        if (visited.has(obj)) return false
        visited.add(obj)
        for (const k in obj) {
          if (matches(obj[k])) return true
        }
        return false
      }

      return false
    }

    const bySearch = q ? byType.filter((item) => matches(item)) : byType

    // 3) Sort newest first, safely handling bad dates
    bySearch.sort((a, b) => safeTime(b.date) - safeTime(a.date))

    return bySearch
  }, [items, JSON.stringify(filters.types ?? []), search, filters.clientId])

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
