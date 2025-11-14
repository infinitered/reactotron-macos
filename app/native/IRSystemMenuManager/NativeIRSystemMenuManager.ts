import type { EventEmitter } from "react-native/Libraries/Types/CodegenTypes"
import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

// Menu item separator constant from native
export const SEPARATOR = "menu-item-separator" as const

// Path shape: ["View", "Zen Mode"]
export interface SystemMenuItemPressedEvent {
  menuPath: string[]
}

// Native -> JS: Tree node describing a menu item returned by getMenuStructure()
export interface SystemMenuNode {
  title: string
  enabled: boolean
  path: string[]
  // TODO: This creates an infinite loop when building for windows
  // children?: SystemMenuNode[]
  children?: any
}

// Native -> JS: Top-level entry from getMenuStructure()
export interface SystemMenuEntry {
  title: string
  items: SystemMenuNode[]
}

export type SystemMenuStructure = SystemMenuEntry[]

// JS -> Native: For building menu (legacy - use SystemMenuItem instead)
export interface SystemNativeMenuItem {
  label: string
  shortcut?: string
  enabled?: boolean
  action: () => void
}

export type SystemMenuListEntry = SystemNativeMenuItem | typeof SEPARATOR

export interface Spec extends TurboModule {
  getAvailableMenus(): string[]
  getMenuStructure(): SystemMenuStructure
  createMenu(menuName: string): Promise<{ success: boolean; existed: boolean; menuName: string }>
  addMenuItemAtPath(
    parentPath: string[],
    title: string,
    keyEquivalent?: string,
  ): Promise<{ success: boolean; error?: string; actualParent?: string[] }>
  insertMenuItemAtPath(
    parentPath: string[],
    title: string,
    atIndex: number,
    keyEquivalent?: string,
  ): Promise<{ success: boolean; error?: string; actualParent?: string[]; actualIndex?: number }>
  removeMenuItemAtPath(
    path: string[],
  ): Promise<{ success: boolean; error?: string; removed?: number }>
  setMenuItemEnabledAtPath(
    path: string[],
    enabled: boolean,
  ): Promise<{ success: boolean; error?: string }>
  readonly onMenuItemPressed: EventEmitter<SystemMenuItemPressedEvent>
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRSystemMenuManager")
