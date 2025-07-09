import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

export interface Spec extends TurboModule {
  appPath(): string
  appPID(): number
  runAsync(command: string): Promise<string>
  runSync(command: string): string
  runCommandOnShutdown(command: string): void
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRRunShellCommand")
