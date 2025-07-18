import { ViewStyle } from "react-native"
import { colorsLight, colorsDark, type Colors } from "./colors"
import { useGlobal } from "../state/useGlobal"
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

export function useTheme(theme: ThemeName = "light"): Theme {
  return {
    colors: { ...colorsLight, ...(theme === "dark" ? colorsDark : {}) },
    spacing: spacing,
    typography: typography,
    timing: timing,
    isDark: theme === "dark",
  }
}

export type ComponentStyle<T = ViewStyle> = (theme: Theme) => T
export type ThemedStyle<T = ViewStyle> = (themeName: ThemeName) => T

/**
 * You can use this to create styles that are modified by the theme.
 */
export function withTheme<T = ViewStyle>(style: ComponentStyle<T>): ThemedStyle<T> {
  return (themeName: ThemeName): T => style(useTheme(themeName))
}

export function useThemeName(): [ThemeName, (value: ThemeName) => void] {
  return useGlobal<ThemeName>("theme", "light")
}
