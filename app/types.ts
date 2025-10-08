// Import types from the official Reactotron contract package
import { CommandType, CommandMap } from "reactotron-core-contract"
import type {
  ErrorStackFrame,
  ErrorLogPayload,
  CommandTypeKey,
  StateValuesChangePayload,
  StateValuesSubscribePayload,
  StateKeysRequestPayload,
  StateValuesRequestPayload,
  StateBackupRequestPayload,
  StateRestoreRequestPayload,
  Command,
  StateActionCompletePayload,
} from "reactotron-core-contract"

/**
 * ClientData is data describing a particular client
 * (usually a React Native app running on a simulator or device).
 *
 * It's sent by the client to the reactotron-core-server right after connecting,
 * and then is forwarded to us here in the app.
 */
export type ClientData = {
  environment: "development" | "production"
  reactotronLibraryName: "reactotron-react-native"
  reactotronLibraryVersion: string
  platform: "ios" | "android" | "macos" | "windows" | "linux" | "web"
  platformVersion: string
  osRelease: string
  model: string
  serverHost: string
  forceTouch: boolean
  interfaceIdiom: "phone" | "pad" | "tv" | "carPlay" | "watch"
  systemName: "iOS" | "Android" | "macOS" | "Windows" | "Linux" | "Web"
  uiMode: string
  serial: string
  reactNativeVersion: string
  screenWidth: number
  screenHeight: number
  screenScale: number
  screenFontScale: number
  windowWidth: number
  windowHeight: number
  windowScale: number
  windowFontScale: number
  name: string
  clientId: string
  reactotronCoreClientVersion: string
  address: string
}

// Re-export types from reactotron-core-contract for convenience
export type {
  ErrorStackFrame,
  ErrorLogPayload,
  CommandTypeKey,
  Command,
  StateValuesChangePayload,
  StateValuesSubscribePayload,
  StateKeysRequestPayload,
  StateValuesRequestPayload,
  StateBackupRequestPayload,
  StateRestoreRequestPayload,
}
export { CommandType }

// Extended LogPayload to support debug level with objects
// Note: We extend the contract's LogPayload to allow Record<string, any> for debug messages
// The contract only supports string messages, but we need richer debugging capabilities
export type LogPayload =
  | {
      level: "debug"
      message: string | Record<string, any>
    }
  | {
      level: "warn"
      message: string
    }
  | ErrorLogPayload

export interface DisplayPayload {
  name: string
  value: any
  preview: string
  image: string | { uri: string }
}

export interface NetworkRequest {
  url: string
  method: string
  data?: any
  headers?: Record<string, string>
}

export interface NetworkResponse {
  status: number
  statusText: string
  headers?: Record<string, string>
  data?: any
  duration: number
}

export interface NetworkPayload {
  type: typeof CommandType.ApiResponse
  request?: NetworkRequest
  response?: NetworkResponse
  error?: string
}

/**
 * TimelineItem types are app-specific representations of commands received from reactotron-core-server.
 * While they share similarities with the Command type from reactotron-core-contract, they are
 * tailored for this macOS app's UI needs (e.g., date as string for serialization, additional id field).
 */

// Unified timeline item type
export type TimelineItemBase = {
  id: string
  important: boolean
  connectionId: number
  messageId: number
  date: string
  deltaTime: number
  clientId: string
}

export type TimelineItemLog = TimelineItemBase & {
  type: typeof CommandType.Log
  payload: LogPayload
}

export type TimelineItemBenchmark = TimelineItemBase & {
  type: typeof CommandType.Benchmark
  payload: CommandMap[typeof CommandType.Benchmark]
}

export type TimelineItemNetwork = TimelineItemBase & {
  type: typeof CommandType.ApiResponse
  payload: NetworkPayload
}

export type TimelineItemDisplay = TimelineItemBase & {
  type: typeof CommandType.Display
  payload: DisplayPayload
}

export type TimelineItemStateActionComplete = TimelineItemBase & {
  type: typeof CommandType.StateActionComplete
  payload: StateActionCompletePayload
}

export type TimelineItem =
  | TimelineItemLog
  | TimelineItemNetwork
  | TimelineItemDisplay
  | TimelineItemStateActionComplete
  | TimelineItemBenchmark

// StateSubscription represents a single state path/value pair tracked by the app
// This is derived from the contract's StateValuesChangePayload structure
export type StateSubscription = StateValuesChangePayload["changes"][number]

// ArgType represents the possible types for custom command arguments
export type ArgType = "string" | "number" | "boolean"

// CustomCommand represents a user-defined command that can be sent to connected clients
// This matches the CustomCommandRegisterPayload from reactotron-core-contract
export type CustomCommand = {
  id: number
  command: string
  title?: string
  description?: string
  args?: Array<{
    name: string
    type: string
  }>
  clientId?: string
}
