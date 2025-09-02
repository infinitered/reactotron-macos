import { Image, ImageStyle, StyleProp, View, ViewProps, ViewStyle } from "react-native"

import { useTheme, useThemeName } from "../theme/theme"

export type IconTypes = keyof typeof iconRegistry

type BaseIconProps = {
  /**
   * The name of the icon
   */
  icon: IconTypes

  /**
   * An optional tint color for the icon
   */
  color?: string

  /**
   * An optional size for the icon. If not provided, the icon will be sized to the icon's resolution.
   */
  size?: number

  /**
   * Style overrides for the icon image
   */
  style?: StyleProp<ImageStyle>

  /**
   * Style overrides for the icon container
   */
  containerStyle?: StyleProp<ViewStyle>
}

type IconProps = Omit<ViewProps, "style"> & BaseIconProps

/**
 * A component to render a registered icon.
 * It is wrapped in a <View />, use `ActionButton` if you want to react to input
 * @param {IconProps} props - The props for the `Icon` component.
 * @returns {JSX.Element} The rendered `Icon` component.
 */
export function Icon(props: IconProps) {
  const {
    icon,
    color,
    size,
    style: $imageStyleOverride,
    containerStyle: $containerStyleOverride,
    ...viewProps
  } = props

  const theme = useTheme()

  const $imageStyle: StyleProp<ImageStyle> = [
    $imageStyleBase,
    { tintColor: color ?? theme.colors.mainText },
    size !== undefined && { width: size, height: size },
    $imageStyleOverride,
  ]

  return (
    <View {...viewProps} style={$containerStyleOverride}>
      <Image style={$imageStyle} source={iconRegistry[icon]} />
    </View>
  )
}

export const iconRegistry = {
  panelLeftClose: require("../../assets/icons/panelLeftClose.png"),
  panelLeftOpen: require("../../assets/icons/panelLeftOpen.png"),
  plug: require("../../assets/icons/plug.png"),
  scrollText: require("../../assets/icons/scrollText.png"),
  chevronsLeftRightEllipsis: require("../../assets/icons/chevronsLeftRightEllipsis.png"),
  circleGauge: require("../../assets/icons/circleGauge.png"),
}

const $imageStyleBase: ImageStyle = {
  resizeMode: "contain",
}
