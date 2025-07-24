import type { EventEmitter } from "react-native/Libraries/Types/CodegenTypes"
import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

export interface KeyboardEvent {
  type: "keydown" | "keyup"
  key: string
  characters: string
  keyCode: number
  modifiers: {
    ctrl: boolean
    alt: boolean
    shift: boolean
    cmd: boolean
  }
}

export interface Spec extends TurboModule {
  ctrl(): boolean
  alt(): boolean
  shift(): boolean
  cmd(): boolean
  startListening(): void
  stopListening(): void
  readonly onKeyboardEvent: EventEmitter<KeyboardEvent>
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRKeyboard")
