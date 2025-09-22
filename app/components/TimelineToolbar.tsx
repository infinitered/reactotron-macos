export type FilterType = "all" | "log" | "display" | "api.request" | "api.response"
// export type LogLevel = "all" | "debug" | "warn" | "error"
// export type SortBy = "time-newest" | "time-oldest" | "type" | "level"

export interface TimelineFilters {
  types: FilterType[]
  clientId: string
  // logLevel: LogLevel
  // sortBy: SortBy
}

// TODO: TimelineToolbar component
