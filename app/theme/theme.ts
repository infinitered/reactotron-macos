import { TextStyle, ViewStyle } from "react-native"
import { colorsLight, colorsDark, type Colors } from "./colors"
import { useState } from "react"
import { useGlobalState } from "../state/useGlobalState"

export type ThemeName = "light" | "dark"

export type Theme = {
  colors: Colors
  spacing: Spacing
  typography: Typography
  timing: Timing
  isDark: boolean
}

export function useTheme(theme: ThemeName): Theme {
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
  return useGlobalState<ThemeName>("theme", "light")
}
