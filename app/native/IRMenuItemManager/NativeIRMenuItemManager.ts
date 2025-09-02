import type { EventEmitter } from "react-native/Libraries/Types/CodegenTypes"
import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

// Menu item separator constant from native
export const SEPARATOR = "menu-item-separator" as const

// Path shape: ["View", "Zen Mode"]
export interface MenuItemPressedEvent {
  menuPath: string[]
}

// Native -> JS: Tree node describing a menu item returned by getMenuStructure()
export interface MenuNode {
  title: string
  enabled: boolean
  path: string[]
  children?: MenuNode[]
}

// Native -> JS: Top-level entry from getMenuStructure()
export interface MenuEntry {
  title: string
  items: MenuNode[]
}

export type MenuStructure = MenuEntry[]

// JS -> Native: For building menu
export interface MenuItem {
  label: string
  shortcut?: string
  enabled?: boolean
  action: () => void
}

export type MenuListEntry = MenuItem | typeof SEPARATOR

export interface Spec extends TurboModule {
  getAvailableMenus(): string[]
  getMenuStructure(): MenuStructure
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
  readonly onMenuItemPressed: EventEmitter<MenuItemPressedEvent>
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRMenuItemManager")
