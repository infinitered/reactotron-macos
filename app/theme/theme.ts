import { ViewStyle } from "react-native"
import { colorsLight, colorsDark, type Colors } from "./colors"
import { useGlobal, withGlobal } from "../state/useGlobal"
import { Spacing, spacing } from "./spacing"
import { Typography, typography } from "./typography"
import { Timing, timing } from "./timing"

export type ThemeName = "light" | "dark"

export type Theme = {
  colors: Colors
  spacing: Spacing
  typography: Typography
  timing: Timing
  isDark: boolean
}

/**
 * Returns the theme object for the current theme name.
 * This is a hook, should follow React hook rules,
 * and will subscribe to rerenders. Use withTheme
 * if you don't want to subscribe and rerender.
 */
export function useTheme(theme?: ThemeName): Theme {
  if (theme === undefined) theme = useThemeName()[0]
  return withTheme(theme)
}

/**
 * Returns the theme object for a given theme name.
 * This is not a hook and can be used outside of React components
 * or inside without subscribing to rerenders.
 */
export function withTheme(theme?: ThemeName): Theme {
  if (theme === undefined) theme = withThemeName()[0]
  return {
    colors: { ...colorsLight, ...(theme === "dark" ? colorsDark : {}) },
    spacing: spacing,
    typography: typography,
    timing: timing,
    isDark: theme === "dark",
  }
}

export type ComponentStyle<T = ViewStyle> = (theme: Theme) => T
export type ThemedStyle<T = ViewStyle> = (themeName?: ThemeName) => T

/**
 * You can use this to create styles that are modified by the theme.
 */
export function themed<T = ViewStyle>(style: ComponentStyle<T>): ThemedStyle<T> {
  return (themeName?: ThemeName): T => style(withTheme(themeName))
}

/**
 * Set the theme name.
 */
export function setThemeName(themeName: ThemeName) {
  const [, setName] = withGlobal<ThemeName>("theme", "light")
  setName(themeName)
}

export function useThemeName(): [ThemeName, (value: ThemeName) => void] {
  return useGlobal<ThemeName>("theme", "light")
}

export function withThemeName(): [ThemeName, (value: ThemeName) => void] {
  return withGlobal<ThemeName>("theme", "light")
}
