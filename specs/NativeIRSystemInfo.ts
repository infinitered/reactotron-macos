import type { EventEmitter } from "react-native/Libraries/Types/CodegenTypes"
import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

export interface SystemInfo {
  rss: number // Resident Set Size: The amount of memory used by the process in MB
  vsz: number // Virtual Memory Size: The total amount of memory available to the process in MB
  cpu: number // CPU Usage: The percentage of CPU usage by the process in % (0-100)
}

export interface Spec extends TurboModule {
  startMonitoring(): void
  stopMonitoring(): void
  readonly onSystemInfo: EventEmitter<SystemInfo>
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRSystemInfo")
