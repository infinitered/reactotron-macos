import { TimelineItemNetwork } from "../types"
import { TimelineItem } from "./TimelineItem"
import { useTheme, useThemeName } from "../theme/theme"
import type { MenuListEntry } from "../utils/useContextMenu"
import IRClipboard from "../native/IRClipboard/NativeIRClipboard"

type TimelineNetworkItemProps = {
  item: TimelineItemNetwork
  isSelected?: boolean
  onSelect?: () => void
}

/**
 * A single network item in the timeline.
 */
export function TimelineNetworkItem({
  item,
  isSelected = false,
  onSelect,
}: TimelineNetworkItemProps) {
  // Type guard to ensure this is a network item
  if (item.type !== "api.response") return null

  const { payload, date, deltaTime, important } = item

  const [themeName] = useThemeName()
  const { colors } = useTheme(themeName)

  // Determine status and color
  let status: string = "UNKNOWN"
  let statusColor: string = colors.mainText
  let responseStatusCode: number | undefined

  if (payload?.response) {
    const response = payload?.response
    responseStatusCode = response?.status
    if (response?.status) {
      if (response.status >= 200 && response.status < 300) {
        status = "SUCCESS"
        statusColor = colors.success
      } else if (response.status >= 400 && response.status < 500) {
        status = "CLIENT ERROR"
        statusColor = colors.danger
      } else if (response.status >= 500) {
        status = "SERVER ERROR"
        statusColor = colors.danger
      } else {
        status = "INFO"
        statusColor = colors.neutral
      }
    } else if (payload?.error) {
      status = "ERROR"
      statusColor = colors.danger
    }
  } else if (payload?.request) {
    status = payload?.request?.method?.toUpperCase() || "REQUEST"
    statusColor = colors.neutral
  } else {
    status = "UNKNOWN"
    statusColor = colors.neutral
  }

  const preview = payload?.request
    ? `${payload?.request?.method || "GET"} ${payload?.request?.url || ""}`
    : payload?.response
    ? `${payload?.response?.status || ""} ${payload?.response?.statusText || ""}`
    : "UNKNOWN"

  const contextMenu: MenuListEntry[] = [
    {
      label: "Copy",
      children: [
        {
          label: "Copy Request",
          action: () => IRClipboard.setString(JSON.stringify(payload?.request)),
        },
        {
          label: "Copy Response",
          action: () => IRClipboard.setString(JSON.stringify(payload?.response)),
        },
      ],
    },
  ]

  return (
    <TimelineItem
      title={status}
      titleColor={statusColor}
      date={new Date(date)}
      deltaTime={deltaTime}
      preview={preview}
      isImportant={important}
      isTagged={important}
      responseStatusCode={responseStatusCode}
      isSelected={isSelected}
      onSelect={onSelect}
      contextMenu={contextMenu}
    />
  )
}
