import type { EventEmitter } from "react-native/Libraries/Types/CodegenTypes"
import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

export interface IRRandomEvent {
  message: string
  timestamp: number
}

export interface Spec extends TurboModule {
  getValue(callback: (value: string) => void): void
  performAsyncTask(): Promise<{ result: string }>
  startEventStream(): void
  readonly onIRRandomEvent: EventEmitter<IRRandomEvent>
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRRandom")
