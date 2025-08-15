import type { EventEmitter } from "react-native/Libraries/Types/CodegenTypes"
import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

// Keep this constant identical to the menu bar manager for familiarity
export const SEPARATOR = "menu-item-separator" as const

export interface ContextMenuItemPressedEvent {
  // Path of labels leading to the clicked item, e.g. ["Copy", "As JSON"]
  menuPath: string[]
}

// JS description of a context menu item (no functions passed to native)
export interface ContextMenuItem {
  label: string
  shortcut?: string
  enabled?: boolean
  checked?: boolean
  children?: ContextMenuListEntry[]
}

export type ContextMenuListEntry = ContextMenuItem | typeof SEPARATOR

export interface Spec extends TurboModule {
  // Show a native context menu at current mouse location
  showContextMenu(items: ContextMenuListEntry[]): void

  readonly onContextMenuItemPressed: EventEmitter<ContextMenuItemPressedEvent>
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRContextMenuManager")


