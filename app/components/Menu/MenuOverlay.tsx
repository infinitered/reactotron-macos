import { Pressable, type ViewStyle } from "react-native"
import { Portal } from "../Portal"
import { menuSettings } from "./menuSettings"

interface MenuOverlayProps {
  onPress: () => void
  portalName?: string
  style?: ViewStyle
  excludeArea?: {
    top?: number
    left?: number
    right?: number
    bottom?: number
  }
}

export const MenuOverlay = ({
  onPress,
  portalName = 'menu-overlay',
  style,
  excludeArea,
}: MenuOverlayProps) => {

  return (
    <Portal name={portalName}>
      <Pressable style={overlayStyle({ excludeArea, style })} onPress={onPress} />
    </Portal>
  )
}

interface OverlayStyleArgs {
  excludeArea?: { top?: number, left?: number, right?: number, bottom?: number }
  style?: ViewStyle
}

const overlayStyle: (args: OverlayStyleArgs) => ViewStyle = ({ excludeArea, style }: OverlayStyleArgs) => ({
  position: "absolute",
  top: excludeArea?.top ?? 0,
  left: excludeArea?.left ?? 0,
  right: excludeArea?.right ?? 0,
  bottom: excludeArea?.bottom ?? 0,
  zIndex: menuSettings.zIndex.menuOverlay,
  ...style,
})