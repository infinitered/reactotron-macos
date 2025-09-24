import { useGlobal } from "../state/useGlobal"
import { TimelineItem } from "../types"

/**
 * A hook that is used to select a timeline item.
 * @returns The selected timeline item and a function to set the selected timeline item.
 *
 * The selected timeline item is stored in the global state.
 *
 * The timeline items are stored in the global state.
 *
 * The selected timeline item is set by the user clicking on a timeline item.
 *
 * Eventually this will be used to hold open tabs for different timeline items.
 */
export const useSelectedTimelineItems = () => {
  const [selectedItemId, setSelectedItemId] = useGlobal<string | null>("selectedTimelineItem", null)
  const [timelineItems] = useGlobal<TimelineItem[]>("timelineItems", [])

  const selectedItem = selectedItemId
    ? timelineItems.find((item) => item.id === selectedItemId) || null
    : null

  return { selectedItem, setSelectedItemId }
}
