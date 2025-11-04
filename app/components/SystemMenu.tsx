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
                        shortcut: "cmd+b",
                        action: toggleSidebar,
                    },
                    {
                        label: "Logs Tab",
                        shortcut: "cmd+1",
                        action: () => setActiveItem("logs"),
                    },
                    {
                        label: "Network Tab",
                        shortcut: "cmd+2",
                        action: () => setActiveItem("network"),
                    },
                    {
                        label: "Performance Tab",
                        shortcut: "cmd+3",
                        action: () => setActiveItem("performance"),
                    },
                    {
                        label: "Plugins Tab",
                        shortcut: "cmd+4",
                        action: () => setActiveItem("plugins"),
                    },
                    {
                        label: "Custom Commands Tab",
                        shortcut: "cmd+5",
                        action: () => setActiveItem("customCommands"),
                    },
                    {
                        label: "Help Tab",
                        shortcut: "cmd+6",
                        action: () => setActiveItem("help"),
                    },
                    ...(__DEV__
                        ? [
                            {
                                label: "Toggle Dev Menu",
                                shortcut: "cmd+shift+d",
                                action: () => NativeModules.DevMenu.show(),
                            },
                        ]
                        : []),
                ],
                Window: [
                    {
                        label: "Reload",
                        shortcut: "cmd+shift+r",
                        action: () => DevSettings.reload(),
                    },
                ],
                Tools: [
                    {
                        label: "Clear Timeline Items",
                        shortcut: "cmd+k",
                        action: () => setTimelineItems([]),
                    },
                ],
            },
        }),
        [toggleSidebar, setActiveItem],
    )

    useSystemMenu(menuConfig)

    return (<>{children}

        <AboutModal visible={aboutVisible} onClose={() => setAboutVisible(false)} /></>)
}

