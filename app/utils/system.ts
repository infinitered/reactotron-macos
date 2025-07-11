import { useEffect, useRef } from "react"
import IRRunShellCommand from "../../specs/NativeIRRunShellCommand"
import IRSystemInfo, { type SystemInfoMemory } from "../../specs/NativeIRSystemInfo"
import type { EventSubscription } from "react-native"

export async function getAppMemUsage(): Promise<number> {
  const appPID = IRRunShellCommand.appPID()
  const memUsage = await IRRunShellCommand.runAsync(`ps -p ${appPID} -o rss=`)
  return parseInt(memUsage)
}

export function useSystemInfo(onInfo: (info: SystemInfoMemory) => void) {
  const systemInfoSubscription = useRef<EventSubscription | null>(null)

  useEffect(() => {
    IRSystemInfo.startMonitoring()
    systemInfoSubscription.current = IRSystemInfo.onSystemInfo(onInfo)

    return () => {
      systemInfoSubscription.current?.remove()
      IRSystemInfo.stopMonitoring()
    }
  }, [systemInfoSubscription])
}
