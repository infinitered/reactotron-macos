import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

export interface Spec extends TurboModule {
  getRandomNumber(): number
  getUUID(): string
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRRandom")
