export { SEPARATOR } from "../../native/IRSystemMenuManager/NativeIRSystemMenuManager"
export type {
  SystemMenuItemPressedEvent,
  SystemMenuStructure,
} from "../../native/IRSystemMenuManager/NativeIRSystemMenuManager"

export interface SystemMenuItem {
  label: string
  shortcut?: string
  enabled?: boolean
  position?: number
  action?: () => void
  submenu?: SystemMenuListEntry[]
}

export type SystemMenuListEntry = SystemMenuItem | typeof SEPARATOR

export interface SystemMenuConfig {
  items?: Record<string, SystemMenuListEntry[]>
  remove?: string[]
}