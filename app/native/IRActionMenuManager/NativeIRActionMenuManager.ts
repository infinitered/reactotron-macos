import type { EventEmitter } from "react-native/Libraries/Types/CodegenTypes"
import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

// Keep this constant identical to the menu bar manager for familiarity
export const SEPARATOR = "menu-item-separator" as const

export interface ActionMenuItemPressedEvent {
  // Path of labels leading to the clicked item, e.g. ["Copy", "As JSON"]
  menuPath: string[]
}

// JS description of an action menu item (no functions passed to native)
export interface ActionMenuItem {
  label: string
  shortcut?: string
  enabled?: boolean
  checked?: boolean
  children?: ActionMenuListEntry[]
}

export type ActionMenuListEntry = ActionMenuItem | typeof SEPARATOR

export interface Spec extends TurboModule {
  // Show a native action menu at current mouse location
  showActionMenu(items: ActionMenuListEntry[]): void

  readonly onActionMenuItemPressed: EventEmitter<ActionMenuItemPressedEvent>
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRActionMenuManager")
