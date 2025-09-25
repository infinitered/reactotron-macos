import { useCallback } from "react"
import { menuSettings } from "./menuSettings"
import type { Position } from "./types"

export interface PositioningStrategy {
  calculateSubmenuPosition: (
    basePosition: Position,
    itemIndex: number,
    parentWidth?: number
  ) => Position
  calculateContextMenuPosition?: (
    clickPosition: Position,
    menuSize?: { width: number; height: number },
    screenSize?: { width: number; height: number }
  ) => Position
}

const defaultStrategy: PositioningStrategy = {
  calculateSubmenuPosition: (basePosition, itemIndex, parentWidth = menuSettings.submenuOffsetX) => ({
    x: basePosition.x + parentWidth,
    y: basePosition.y + itemIndex * menuSettings.itemHeight + menuSettings.submenuOffsetY,
  }),

  calculateContextMenuPosition: (clickPosition, menuSize, screenSize) => {
    // Basic positioning - can be enhanced for screen edge detection
    return {
      x: clickPosition.x,
      y: clickPosition.y,
    }
  },
}

export const useMenuPositioning = (strategy: PositioningStrategy = defaultStrategy) => {
  const calculateSubmenuPosition = useCallback(
    (basePosition: Position, itemIndex: number, parentWidth?: number) =>
      strategy.calculateSubmenuPosition(basePosition, itemIndex, parentWidth),
    [strategy]
  )

  const calculateContextMenuPosition = useCallback(
    (clickPosition: Position, menuSize?: { width: number; height: number }, screenSize?: { width: number; height: number }) =>
      strategy.calculateContextMenuPosition?.(clickPosition, menuSize, screenSize) ?? clickPosition,
    [strategy]
  )

  return {
    calculateSubmenuPosition,
    calculateContextMenuPosition,
  }
}