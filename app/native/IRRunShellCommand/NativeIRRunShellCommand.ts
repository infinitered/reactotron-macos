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
  appPath(): string
  appPID(): number
  getUserShell(): string
  runAsync(command: string): Promise<string>
  runSync(command: string): string
  runCommandOnShutdown(command: string): void
  runTaskWithCommand(
    command: string,
    args: string[],
    options: {
      /** Shell to execute the command with. */
      shell?: string
      /** Arguments to pass to the shell like -l and -i. */
      shellArgs?: string[]
      /** ID of the task. */
      taskId: string
    },
  ): void
  getRunningTaskIds(): ReadonlyArray<string>
  killTaskWithId(taskId: string): boolean
  killAllTasks(): void
  readonly onShellCommandOutput: EventEmitter<ShellCommandOutputEvent>
  readonly onShellCommandComplete: EventEmitter<ShellCommandCompleteEvent>
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRRunShellCommand")
