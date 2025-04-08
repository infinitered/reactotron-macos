import type { PropsWithChildren } from "react"
import { View, Text, StyleProp, ViewStyle, TextStyle } from "react-native"

import ActionButton from "./ActionButton"
import HeaderTabButton from "./HeaderTabButton"

export interface HeaderProps {
  /**
   * Array of tabs to display on the left side.
   */
  tabs?: {
    text: string
    icon: any
    onClick: () => void
    isActive: boolean
  }[]
  /**
   * Optional title text to display in the center.
   */
  title?: string
  /**
   * Array of actions to display on the right side.
   */
  actions?: {
    tip: string
    icon: any
    onClick: () => void
  }[]
  /**
   * Optional style override for the main container.
   */
  style?: StyleProp<ViewStyle>
  /**
   * Optional style override for the content container (inside the main container).
   */
  contentStyle?: StyleProp<ViewStyle>
  /**
   * Optional style override for the title text.
   */
  titleStyle?: StyleProp<TextStyle>
}

/**
 * A header component similar to the ones used in Ignite apps.
 */
export function Header(props: PropsWithChildren<HeaderProps>) {
  const {
    tabs,
    title,
    actions,
    children,
    style: $styleOverride,
    contentStyle: $contentStyleOverride,
    titleStyle: $titleStyleOverride,
  } = props

  return (
    <View style={[$container, $styleOverride]}>
      <View style={[$contentContainer, $contentStyleOverride]}>
        <View style={$leftContainer}>
          {tabs &&
            tabs.map((t, idx) => (
              <HeaderTabButton
                key={idx}
                text={t.text}
                icon={t.icon}
                onClick={t.onClick}
                isActive={t.isActive}
              />
            ))}
        </View>
        <View style={$middleContainer}>
          {!!title && <Text style={[$title, $titleStyleOverride]}>{title}</Text>}
        </View>
        <View style={$rightContainer}>
          {actions &&
            actions.map((a, idx) => <ActionButton key={idx} icon={a.icon} onClick={a.onClick} />)}
        </View>
      </View>
      {children}
    </View>
  )
}

const $container: ViewStyle = {
  backgroundColor: "#F3F3F3",
  borderBottomColor: "#E0E0E0",
  borderBottomWidth: 1,
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
}

const $contentContainer: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
  height: 70,
  justifyContent: "space-between",
  paddingHorizontal: 10,
}

const $leftContainer: ViewStyle = {
  alignItems: "center",
  flex: 1,
  flexDirection: "row",
  justifyContent: "flex-start",
  minWidth: 100,
}

const $middleContainer: ViewStyle = {
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
  paddingHorizontal: 10,
}

const $rightContainer: ViewStyle = {
  alignItems: "center",
  flex: 1,
  flexDirection: "row",
  justifyContent: "flex-end",
  minWidth: 100,
}

const $title: TextStyle = {
  color: "#333333",
  fontSize: 16,
  fontWeight: "500",
  textAlign: "center",
}

export default Header
