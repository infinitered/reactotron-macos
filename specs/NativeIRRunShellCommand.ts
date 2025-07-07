import type { EventEmitter } from "react-native/Libraries/Types/CodegenTypes"
import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

export interface ShellCommandOutputEvent {
  taskId: string
  output: string
  type: "stdout" | "stderr"
}

export interface ShellCommandCompleteEvent {
  taskId: string
  exitCode: number
}

export interface Spec extends TurboModule {
  runAsync(command: string): Promise<string>
  runSync(command: string): string
  runCommandOnShutdown(command: string): void
  runTaskWithCommand(command: string, args: ReadonlyArray<string>, taskId: string): void
  readonly onShellCommandOutput: EventEmitter<ShellCommandOutputEvent>
  readonly onShellCommandComplete: EventEmitter<ShellCommandCompleteEvent>
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRRunShellCommand")
