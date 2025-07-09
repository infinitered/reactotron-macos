export const colorsLight = {
  background: "#FAFAFA",
  cardBackground: "#EDEDED",
  mainText: "#000000",
  border: "#E0E0E0",
  neutral: "#808080",
  success: "#008000",
  danger: "#ff0000",
  primary: "#cf6b4c",
}
export type Colors = typeof colorsLight

// These override any light colors with dark equivalents
export const colorsDark: Partial<Colors> = {
  background: "#121212",
}
