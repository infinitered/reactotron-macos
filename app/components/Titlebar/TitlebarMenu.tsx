import { View, ViewStyle } from "react-native"
import { useState, useCallback, useRef } from "react"
import { themed } from "../../theme/theme"
import { TitlebarMenuItem } from "./TitlebarMenuItem"
import { MenuDropdown } from "../Menu/MenuDropdown"
import { MenuOverlay } from "../Menu/MenuOverlay"
import type { Position } from "../Menu/types"
import { PassthroughView } from "./PassthroughView"
import { useSystemMenu } from "../../utils/useSystemMenu"

export const TitlebarMenu = () => {
  const { menuStructure, menuItems, handleMenuItemPressed } = useSystemMenu()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<Position>({ x: 0, y: 0 })
  const menuRefs = useRef<Map<string, View>>(new Map())

  const handleMenuClick = useCallback((menuName: string) => {
    const menuRef = menuRefs.current.get(menuName)
    if (!menuRef) return
    menuRef.measureInWindow((x, y, _, height) => {
      setDropdownPosition({ x, y: y + height })
      setOpenMenu((prev) => (prev === menuName ? null : menuName))
    })
  }, [])

  const handleMenuHover = useCallback(
    (menuName: string) => {
      if (openMenu === null || openMenu === menuName) return
      handleMenuClick(menuName)
    },
    [openMenu, handleMenuClick],
  )

  const handleClose = () => setOpenMenu(null)

  // TODO: Add hotkey handling

  return (
    <PassthroughView style={$menuBar()}>
      {menuStructure.map((menu) => (
        <View
          key={menu.title}
          ref={(ref) => {
            if (ref) menuRefs.current.set(menu.title, ref)
          }}
        >
          <TitlebarMenuItem
            title={menu.title}
            isOpen={openMenu === menu.title}
            onPress={() => handleMenuClick(menu.title)}
            onHoverIn={() => handleMenuHover(menu.title)}
          />
        </View>
      ))}
      {openMenu && menuItems[openMenu] && (
        <>
          {/* Single overlay for all menu interactions */}
          <MenuOverlay
            onPress={handleClose}
            excludeArea={{ top: 36 }}
          />
          <MenuDropdown
            items={menuItems[openMenu]}
            position={dropdownPosition}
            onItemPress={(item) => {
              handleMenuItemPressed({ menuPath: [openMenu, item.label] })
              handleClose()
            }}
          />
        </>
      )}
    </PassthroughView>
  )
}

const $menuBar = themed<ViewStyle>(() => ({
  flexDirection: "row",
  alignItems: "center",
  height: "100%",
  paddingHorizontal: 4,
}))