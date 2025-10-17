import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

export interface Spec extends TurboModule {
  read(path: string): string
  write(path: string, data: string): void
  remove(path: string): void
  ensureDir(path: string): void
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRFileStorage")
