export const timing = {
  /**
   * The duration (ms) for quick animations.
   */
  quick: 300,
} as const

export type Timing = typeof timing
