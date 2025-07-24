import { useEffect, useRef } from "react"
import IRRunShellCommand from "../../specs/NativeIRRunShellCommand"
import IRSystemInfo, { SystemInfo } from "../../specs/NativeIRSystemInfo"
import IRKeyboard, { KeyboardEvent } from "../../specs/NativeIRKeyboard"
import type { EventSubscription } from "react-native"

/**
 * Get the current memory usage of the app in MB via a shell command.
 */
export async function getAppMemUsage(): Promise<number> {
  const appPID = IRRunShellCommand.appPID()
  const memUsage = await IRRunShellCommand.runAsync(`ps -p ${appPID} -o rss=`)
  return parseInt(memUsage)
}

/**
 * Subscribe to a polling system for memory usage and CPU usage.
 *
 * @param onInfo - Callback to receive the system info.
 * @returns A function to unsubscribe from the system info.
 */
let _sysInfoSubscribers: number = 0
export function useSystemInfo(onInfo: (info: SystemInfo) => void) {
  const systemInfoSubscription = useRef<EventSubscription | null>(null)

  useEffect(() => {
    _sysInfoSubscribers++
    if (_sysInfoSubscribers === 1) IRSystemInfo.startMonitoring()
    systemInfoSubscription.current = IRSystemInfo.onSystemInfo(onInfo)

    return () => {
      _sysInfoSubscribers--
      systemInfoSubscription.current?.remove()
      if (_sysInfoSubscribers === 0) IRSystemInfo.stopMonitoring()
    }
  }, [])
}

/**
 * Subscribe to keyboard events.
 *
 * @param onKeyboardEvent - Callback to receive keyboard events.
 * @returns A function to unsubscribe from keyboard events.
 */
let _keyboardSubscribers: number = 0
export function useKeyboardEvents(onKeyboardEvent: (event: KeyboardEvent) => void) {
  const keyboardSubscription = useRef<EventSubscription | null>(null)

  useEffect(() => {
    _keyboardSubscribers++
    if (_keyboardSubscribers === 1) IRKeyboard.startListening()
    keyboardSubscription.current = IRKeyboard.onKeyboardEvent(onKeyboardEvent)

    return () => {
      _keyboardSubscribers--
      keyboardSubscription.current?.remove()
      if (_keyboardSubscribers === 0) IRKeyboard.stopListening()
    }
  }, [])
}
