// In React Native 0.79+ I think this is in a different place?
import type { EventEmitter } from "react-native/Libraries/Types/CodegenTypes"
import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

export interface MyTemplateEvent {
  message: string
  timestamp: number
}

export interface Spec extends TurboModule {
  getADictionary(
    someString: string,
  ): Promise<{ someString: string; someNumber: number; someBool: boolean }>
  getADictionaryAsync(
    someString: string,
  ): Promise<{ someString: string; someNumber: number; someBool: boolean }>
  readonly onMyTemplateEvent: EventEmitter<MyTemplateEvent>
}

export default TurboModuleRegistry.getEnforcing<Spec>("MyTemplate")
