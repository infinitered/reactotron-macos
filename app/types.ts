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

export interface ErrorStackFrame {
  fileName: string
  functionName: string
  lineNumber: number
  columnNumber: number | null
}

export interface ErrorLogPayload {
  level: "error"
  message: string
  stack: Error["stack"] | string[] | ErrorStackFrame[]
}

export type LogPayload =
  | {
      level: "debug"
      message: string
    }
  | {
      level: "warn"
      message: string
    }
  | ErrorLogPayload

export type LogEntry = {
  type: "log"
  important: boolean
  connectionId: number
  messageId: number
  date: string
  deltaTime: number
  clientId: string
  payload: LogPayload
}
