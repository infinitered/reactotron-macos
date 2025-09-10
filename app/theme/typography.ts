const fonts = {
  spaceGrotesk: {
    // Cross-platform Google font.
    light: "spaceGroteskLight",
    normal: "spaceGroteskRegular",
    medium: "spaceGroteskMedium",
    semiBold: "spaceGroteskSemiBold",
    bold: "spaceGroteskBold",
  },
  helveticaNeue: {
    // iOS only font.
    thin: "HelveticaNeue-Thin",
    light: "HelveticaNeue-Light",
    normal: "Helvetica Neue",
    medium: "HelveticaNeue-Medium",
  },
  courier: {
    // iOS only font.
    normal: "Courier",
  },
  sansSerif: {
    // Android only font.
    thin: "sans-serif-thin",
    light: "sans-serif-light",
    normal: "sans-serif",
    medium: "sans-serif-medium",
  },
  monospace: {
    // Android only font.
    normal: "monospace",
  },
}

export type Typography = {
  fonts: typeof fonts
  primary: typeof fonts.spaceGrotesk
  secondary: typeof fonts.helveticaNeue
  code: typeof fonts.courier
  heading: number
  subheading: number
  body: number
  caption: number
  small: number
}

export const typography: Typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places.
   */
  primary: fonts.spaceGrotesk,
  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: fonts.helveticaNeue,
  /**
   * Lets get fancy with a monospace font!
   */
  code: fonts.courier,
  /**
   * Font sizes
   */
  heading: 24,
  subheading: 18,
  body: 16,
  caption: 12,
  small: 10,
} as const
