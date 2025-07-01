import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

export interface Spec extends TurboModule {
  runAsync(command: string): Promise<string>
  runSync(command: string): string
  runTaskWithCommand(
    command: string,
    arguments: string[],
    callback: (output: string, typeOfOutput: string) => void,
    completion: (terminationStatus: number) => void,
  ): void
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRRunShellCommand")
