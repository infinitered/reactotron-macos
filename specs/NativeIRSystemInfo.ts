import type { EventEmitter } from "react-native/Libraries/Types/CodegenTypes"
import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

export interface SystemInfoMemory {
  rss: number
  vsz: number
}

export interface SystemInfo {
  memory: SystemInfoMemory
}

export interface Spec extends TurboModule {
  startMonitoring(): void
  stopMonitoring(): void
  readonly onSystemInfo: EventEmitter<SystemInfoMemory>
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRSystemInfo")
