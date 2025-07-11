export const colorsLight = {
  background: "#FAFAFA",
  cardBackground: "#EDEDED",
  mainText: "#000000",
  border: "#ff0000",
  neutral: "#808080",
  success: "#008000",
  danger: "#ff0000",
  primary: "#cf6b4c",
}
export type Colors = typeof colorsLight

// These override any light colors with dark equivalents
export const colorsDark: Partial<Colors> = {
  background: "#121212",
  cardBackground: "#232323",
  mainText: "#FAFAFA",
  border: "#333333",
  neutral: "#A0A0A0",
  success: "#4CAF50",
  danger: "#FF5252",
  primary: "#FFB86C",
}
