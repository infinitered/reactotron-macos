import type { EventEmitter } from "react-native/Libraries/Types/CodegenTypes"
import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

export interface MenuItemPressedEvent {
  menuItemId: string
}

export interface MenuItemInfo {
  title: string
  enabled: boolean
  id: string | null
}

interface MenuEntry {
  name: string
  items: MenuItemInfo[]
}

export type MenuStructure = MenuEntry[]

export interface Spec extends TurboModule {
  getAvailableMenus(): string[]
  getMenuStructure(): MenuStructure[]

  addMenuItem(
    id: string,
    title: string,
    menuName: string,
  ): Promise<{ success: boolean; error?: string; actualMenuName?: string }>

  addMenuItemWithOptions(
    id: string,
    title: string,
    menuName: string,
    keyEquivalent?: string,
    addSeparatorBefore?: boolean,
  ): Promise<{ success: boolean; error?: string; actualMenuName?: string }>

  insertMenuItem(
    id: string,
    title: string,
    menuName: string,
    atIndex: number,
  ): Promise<{ success: boolean; error?: string; actualIndex?: number }>

  removeMenuItemByName(name: string): Promise<{ success: boolean; error?: string }>

  removeMenuItemById(id: string): Promise<{ success: boolean; error?: string }>

  createMenu(menuName: string): Promise<{ success: boolean; existed: boolean; menuName: string }>

  setMenuItemEnabled(id: string, enabled: boolean): Promise<{ success: boolean; error?: string }>
  getAllMenuItems(): Promise<string[]>

  readonly onMenuItemPressed: EventEmitter<MenuItemPressedEvent>
}

export default TurboModuleRegistry.getEnforcing<Spec>("IRMenuItemManager")
