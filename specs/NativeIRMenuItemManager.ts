import type { EventEmitter } from "react-native/Libraries/Types/CodegenTypes"
import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

// Path shape: ["View", "Zen Mode"]
export interface MenuItemPressedEvent {
  menuPath: string[]
}

export interface MenuNode {
  title: string
  enabled: boolean
  path: string[]
  children?: MenuNode[]
}

export interface MenuEntry {
  title: string
  items: MenuNode[]
}
export type MenuStructure = MenuEntry[]

export interface Spec extends TurboModule {
  getAvailableMenus(): string[]
  getMenuStructure(): MenuStructure
  createMenu(menuName: string): Promise<{ success: boolean; existed: boolean; menuName: string }>
  addMenuItemAtPath(
    parentPath: string[],
    title: string,
    keyEquivalent?: string,
    addSeparatorBefore?: boolean,
  ): Promise<{ success: boolean; error?: string; actualParent?: string[] }>
  insertMenuItemAtPath(
    parentPath: string[],
    title: string,
    atIndex: number,
    keyEquivalent?: string,
    addSeparatorBefore?: boolean,
  ): Promise<{ success: boolean; error?: string; actualParent?: string[]; actualIndex?: number }>
  removeMenuItemAtPath(path: string[]): Promise<{ success: boolean; error?: string }>
  setMenuItemEnabledAtPath(
    path: string[],
    enabled: boolean,
  ): Promise<{ success: boolean; error?: string }>
  readonly onMenuItemPressed: EventEmitter<MenuItemPressedEvent>
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRMenuItemManager")
