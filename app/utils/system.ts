import { useEffect, useRef } from "react"
import IRRunShellCommand from "../../specs/NativeIRRunShellCommand"
import IRSystemInfo, { SystemInfo, type SystemInfoMemory } from "../../specs/NativeIRSystemInfo"
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
