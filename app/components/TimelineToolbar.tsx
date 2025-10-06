import { CommandType } from "reactotron-core-contract"

export type FilterType =
  | "all"
  | typeof CommandType.Log
  | typeof CommandType.Display
  | typeof CommandType.ApiResponse
  | typeof CommandType.StateActionComplete
// export type LogLevel = "all" | "debug" | "warn" | "error"
// export type SortBy = "time-newest" | "time-oldest" | "type" | "level"

export interface TimelineFilters {
  types: FilterType[]
  clientId: string
  // logLevel: LogLevel
  // sortBy: SortBy
}

// TODO: TimelineToolbar component
