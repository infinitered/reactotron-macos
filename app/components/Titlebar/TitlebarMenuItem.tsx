import { Pressable, Text, type TextStyle, type ViewStyle } from "react-native"
import { useCallback, useState } from "react"
import { themed } from "../../theme/theme"

interface TitlebarMenuItemProps {
  title: string
  isOpen?: boolean
  onPress: () => void
  onHoverIn?: () => void
  onHoverOut?: () => void
}

export const TitlebarMenuItem = ({ title, isOpen, onPress, onHoverIn, onHoverOut }: TitlebarMenuItemProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleHover = useCallback((isHovered: boolean) => {
    setIsHovered(isHovered)
    if (isHovered) {
      onHoverIn?.()
    } else {
      onHoverOut?.()
    }
  }, [onHoverIn, onHoverOut])

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => {
        handleHover(true)
      }}
      onHoverOut={() => {
        handleHover(false)
      }}
      style={({ pressed }) => [
        $menuItem(),
        (pressed || isOpen || isHovered) && $menuItemHovered(),
      ]}
    >
      <Text style={$menuItemText()}>{title}</Text>
    </Pressable>
  )
}

const $menuItem = themed<ViewStyle>(({ spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 4,
  justifyContent: "center",
}))

const $menuItemHovered = themed<ViewStyle>(({ colors }) => ({
  backgroundColor: colors.neutralVery,
  opacity: 0.8,
}))

const $menuItemText = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.mainText,
  fontSize: typography.caption,
  fontWeight: "400",
}))