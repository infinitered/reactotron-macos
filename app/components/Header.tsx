import type { PropsWithChildren } from "react"
import { View, ViewStyle } from "react-native"
import { useThemeName, withTheme } from "../theme/theme"

export interface HeaderProps {}

/**
 * A header component similar to the ones used in Ignite apps.
 */
export function Header(props: PropsWithChildren<HeaderProps>) {
  const { children } = props
  const [theme] = useThemeName()

  return (
    <View style={$container(theme)}>
      <View style={$contentContainer(theme)}>{children}</View>
    </View>
  )
}

const $container = withTheme<ViewStyle>(({ colors }) => ({
  backgroundColor: colors.cardBackground,
  borderBottomColor: colors.border,
  borderBottomWidth: 1,
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
}))

const $contentContainer = withTheme<ViewStyle>(() => ({
  alignItems: "center",
  flexDirection: "row",
  height: 70,
  justifyContent: "space-between",
  paddingHorizontal: 10,
}))

// const $leftContainer: ViewStyle = {
//   alignItems: "center",
//   flex: 1,
//   flexDirection: "row",
//   justifyContent: "flex-start",
//   minWidth: 100,
// }

// const $middleContainer: ViewStyle = {
//   alignItems: "center",
//   flex: 1,
//   justifyContent: "center",
//   paddingHorizontal: 10,
// }

// const $rightContainer: ViewStyle = {
//   alignItems: "center",
//   flex: 1,
//   flexDirection: "row",
//   justifyContent: "flex-end",
//   minWidth: 100,
// }

// const $title: TextStyle = {
//   color: "#333333",
//   fontSize: 16,
//   fontWeight: "500",
//   textAlign: "center",
// }

export default Header
