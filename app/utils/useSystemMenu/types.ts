import { MENU_SEPARATOR } from "../../components/Menu/types"
export type {
  SystemMenuItemPressedEvent,
  SystemMenuStructure,
} from "../../native/IRSystemMenuManager/NativeIRSystemMenuManager"

export type PlatformShortcut = {
  windows?: string
  macos?: string
}

export interface SystemMenuItem {
  label: string
  shortcut?: string | PlatformShortcut
  enabled?: boolean
  position?: number
  action?: () => void
  submenu?: SystemMenuListEntry[]
}

export type SystemMenuListEntry = SystemMenuItem | typeof MENU_SEPARATOR

export interface SystemMenuConfig {
  items?: Record<string, SystemMenuListEntry[]>
  remove?: string[]
}
