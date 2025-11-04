import { useMemo, useState } from "react"
import { DevSettings, NativeModules } from "react-native"
import { useSidebar } from "../state/useSidebar"
import { useGlobal, withGlobal } from "../state/useGlobal"
import { useSystemMenu } from "../utils/useSystemMenu/useSystemMenu"
import { TimelineItem } from "app/types"
import { MenuItemId } from "./Sidebar/SidebarMenu"
import { AboutModal } from "./AboutModal"

export function SystemMenu({ children }: { children: React.ReactNode }) {
  const { toggleSidebar } = useSidebar()
  const [_, setActiveItem] = useGlobal<MenuItemId>("sidebar-active-item", "logs", {
    persist: true,
  })
  const [__, setTimelineItems] = withGlobal<TimelineItem[]>("timelineItems", [], {
    persist: true,
  })
  const [aboutVisible, setAboutVisible] = useState(false)

  const menuConfig = useMemo(
    () => ({
      remove: ["File", "Edit", "Format", "Reactotron > About Reactotron"],
      items: {
        Reactotron: [
          {
            label: "About Reactotron",
            position: 0,
            action: () => setAboutVisible(true),
          },
        ],
        View: [
          {
            label: "Toggle Sidebar",
            shortcut: { macos: "cmd+b", windows: "ctrl+b" },
            action: toggleSidebar,
          },
          {
            label: "Logs Tab",
            shortcut: { macos: "cmd+1", windows: "ctrl+1" },
            action: () => setActiveItem("logs"),
          },
          {
            label: "Network Tab",
            shortcut: { macos: "cmd+2", windows: "ctrl+2" },
            action: () => setActiveItem("network"),
          },
          {
            label: "Performance Tab",
            shortcut: { macos: "cmd+3", windows: "ctrl+3" },
            action: () => setActiveItem("performance"),
          },
          {
            label: "Plugins Tab",
            shortcut: { macos: "cmd+4", windows: "ctrl+4" },
            action: () => setActiveItem("plugins"),
          },
          {
            label: "Custom Commands Tab",
            shortcut: { macos: "cmd+5", windows: "ctrl+5" },
            action: () => setActiveItem("customCommands"),
          },
          {
            label: "Help Tab",
            shortcut: { macos: "cmd+6", windows: "ctrl+6" },
            action: () => setActiveItem("help"),
          },
          ...(__DEV__
            ? [
                {
                  label: "Toggle Dev Menu",
                  shortcut: { macos: "cmd+shift+d", windows: "ctrl+shift+d" },
                  action: () => NativeModules.DevMenu.show(),
                },
              ]
            : []),
        ],
        Window: [
          {
            label: "Reload",
            shortcut: { macos: "cmd+shift+r", windows: "ctrl+shift+r" },
            action: () => DevSettings.reload(),
          },
        ],
        Tools: [
          {
            label: "Clear Timeline Items",
            shortcut: { macos: "cmd+k", windows: "ctrl+k" },
            action: () => setTimelineItems([]),
          },
        ],
      },
    }),
    [toggleSidebar, setActiveItem],
  )

  useSystemMenu(menuConfig)

  return (
    <>
      {children}

      <AboutModal visible={aboutVisible} onClose={() => setAboutVisible(false)} />
    </>
  )
}
