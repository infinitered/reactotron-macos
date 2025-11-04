import { useMemo } from "react"
import { DevSettings, NativeModules } from "react-native"
import { useSidebar } from "../state/useSidebar"
import { useGlobal, withGlobal } from "../state/useGlobal"
import { useSystemMenu } from "../utils/useSystemMenu/useSystemMenu"
import { TimelineItem } from "app/types"
import { MenuItemId } from "./Sidebar/SidebarMenu"

export function SystemMenu({ children }: { children: React.ReactNode }) {
    const { toggleSidebar } = useSidebar()
    const [_, setActiveItem] = useGlobal<MenuItemId>("sidebar-active-item", "logs", {
        persist: true,
    })
    const [__, setTimelineItems] = withGlobal<TimelineItem[]>("timelineItems", [], {
        persist: true,
    })

    const menuConfig = useMemo(
        () => ({
            remove: ["File", "Edit", "Format"],
            items: {
                View: [
                    {
                        label: "Toggle Sidebar",
                        shortcut: { windows: "ctrl+b", macos: "cmd+b" },
                        action: () => toggleSidebar(),
                    },
                    {
                        label: "Logs Tab",
                        shortcut: { windows: "ctrl+1", macos: "cmd+1" },
                        action: () => setActiveItem("logs"),
                    },
                    {
                        label: "Network Tab",
                        shortcut: { windows: "ctrl+2", macos: "cmd+2" },
                        action: () => setActiveItem("network"),
                    },
                    {
                        label: "Performance Tab",
                        shortcut: { windows: "ctrl+3", macos: "cmd+3" },
                        action: () => setActiveItem("performance"),
                    },
                    {
                        label: "Plugins Tab",
                        shortcut: { windows: "ctrl+4", macos: "cmd+4" },
                        action: () => setActiveItem("plugins"),
                    },
                    {
                        label: "Help Tab",
                        shortcut: { windows: "ctrl+5", macos: "cmd+5" },
                        action: () => setActiveItem("help"),
                    },
                    ...(__DEV__
                        ? [
                            {
                                label: "Toggle Dev Menu",
                                shortcut: { windows: "ctrl+shift+d", macos: "cmd+shift+d" },
                                action: () => NativeModules.DevMenu.show(),
                            },
                        ]
                        : []),
                ],
                Window: [
                    {
                        label: "Reload",
                        shortcut: { windows: "ctrl+shift+r", macos: "cmd+shift+r" },
                        action: () => DevSettings.reload(),
                    },
                ],
                Tools: [
                    {
                        label: "Clear Timeline Items",
                        shortcut: { windows: "ctrl+k", macos: "cmd+k" },
                        action: () => setTimelineItems([]),
                    },
                ],
            },
        }),
        [toggleSidebar, setActiveItem, setTimelineItems],
    )

    useSystemMenu(menuConfig)

    return <>{children}</>
}

