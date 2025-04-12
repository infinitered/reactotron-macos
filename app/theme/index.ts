import type { StyleProp } from "react-native"

import { colors as colorsLight } from "./colors"
import { colors as colorsDark } from "./colorsDark"
import { spacing } from "./spacing"
import { timing } from "./timing"
import { typography } from "./typography"

// This supports "light" and "dark" themes by default. If undefined, it'll use the system theme
export type ThemeContexts = "light" | "dark" | undefined
export type Colors = typeof colorsLight | typeof colorsDark
export type Spacing = typeof spacing
export type Timing = typeof timing
export type Typography = typeof typography

// The overall Theme object should contain all of the data you need to style your app.
export interface Theme {
  colors: Colors
  spacing: Spacing
  typography: Typography
  timing: Timing
  isDark: boolean
}

// Here we define our themes.
export const lightTheme: Theme = {
  colors: colorsLight,
  spacing: spacing,
  typography,
  timing,
  isDark: false,
}
export const darkTheme: Theme = {
  colors: colorsDark,
  spacing: spacing,
  typography,
  timing,
  isDark: true,
}

/**
 * Represents a function that returns a styled component based on the provided theme.
 * @template T The type of the style.
 * @param theme The theme object.
 * @returns The styled component.
 *
 * @example
 * const $container: ThemedStyle<ViewStyle> = (theme) => ({
 *   flex: 1,
 *   backgroundColor: theme.colors.background,
 *   justifyContent: "center",
 *   alignItems: "center",
 * })
 * // Then use in a component like so:
 * const Component = () => {
 *   const { themed } = useAppTheme()
 *   return <View style={themed($container)} />
 * }
 */
export type ThemedStyle<T> = (theme: Theme) => T
export type ThemedStyleArray<T> = (
  | ThemedStyle<T>
  | StyleProp<T>
  | (StyleProp<T> | ThemedStyle<T>)[]
)[]

// Export the theme objects with backwards compatibility for the old theme structure.
export { colorsLight, colorsDark, spacing }

export * from "./styles"
export * from "./typography"
export * from "./timing"
