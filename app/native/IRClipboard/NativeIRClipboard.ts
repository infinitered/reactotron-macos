import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

export interface Spec extends TurboModule {
  getString(): string
  setString(text: string): void
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRClipboard")
