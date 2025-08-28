export type FilterType = "all" | "log" | "api.request" | "api.response"
// export type LogLevel = "all" | "debug" | "warn" | "error"
// export type SortBy = "time-newest" | "time-oldest" | "type" | "level"

export interface TimelineFilters {
  types: FilterType[]
  // logLevel: LogLevel
  // sortBy: SortBy
}

// TODO: TimelineToolbar component
