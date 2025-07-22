import { Text, View, type ViewStyle, type TextStyle, ScrollView } from "react-native"
import { TimelineItemNetwork } from "../../../types"
import { useGlobal } from "../../../state/useGlobal"
import TimelineRow from "../TimelineRow"

type NetworkItemProps = { item: TimelineItemNetwork }

/**
 * A single network item in the timeline.
 */
export function NetworkItem({ item }: NetworkItemProps) {
  // Type guard to ensure this is a network item
  if (item.type !== "api.response") return null

  const { payload, date, deltaTime, important } = item
  const [isOpen, setIsOpen] = useGlobal(`network-${item.messageId}-open`, false)

  const isRequest = payload?.type === "api.request"
  const isResponse = payload?.type === "api.response"

  // Determine status and color
  let status: string = "REQUEST"
  let responseStatusCode: number | undefined

  if (isRequest) {
    status = payload?.request?.method?.toUpperCase() || "REQUEST"
  } else if (isResponse) {
    const response = payload?.response
    responseStatusCode = response?.status
    if (response?.status) {
      if (response.status >= 200 && response.status < 300) {
        status = "SUCCESS"
      } else if (response.status >= 400 && response.status < 500) {
        status = "CLIENT ERROR"
      } else if (response.status >= 500) {
        status = "SERVER ERROR"
      } else {
        status = "INFO"
      }
    } else if (payload?.error) {
      status = "ERROR"
    }
  }

  const preview = isRequest
    ? `${payload?.request?.method || "GET"} ${payload?.request?.url || ""}`
    : `${payload?.response?.status || ""} ${payload?.response?.statusText || ""}`

  const toolbar = [
    {
      icon: ({ size }: { size: number }) => <Text style={{ fontSize: size }}>📋</Text>,
      tip: "Copy to clipboard",
      onClick: () => console.log("Copy to clipboard"),
    },
    {
      icon: ({ size }: { size: number }) => <Text style={{ fontSize: size }}>🔍</Text>,
      tip: "Search similar",
      onClick: () => console.log("Search similar"),
    },
  ]

  return (
    <TimelineRow
      title={status}
      date={new Date(date)}
      deltaTime={deltaTime}
      preview={preview}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      toolbar={toolbar}
      isImportant={important}
      isTagged={important}
      responseStatusCode={responseStatusCode}
    >
      {isRequest && payload?.request && (
        <View style={$sectionContainer}>
          <Text style={$sectionLabel}>Request:</Text>
          <View style={$urlContainer}>
            <Text style={$urlLabel}>URL:</Text>
            <Text style={$urlText}>{payload?.request?.url}</Text>
          </View>
          <View style={$methodContainer}>
            <Text style={$methodLabel}>Method:</Text>
            <Text style={$methodText}>{payload?.request?.method}</Text>
          </View>
          {payload?.request?.headers && Object.keys(payload?.request?.headers).length > 0 && (
            <View style={$headersContainer}>
              <Text style={$headersLabel}>Headers:</Text>
              <ScrollView style={$headersScroll}>
                {Object.entries(payload?.request?.headers).map(([key, value]) => (
                  <Text key={key} style={$headerText}>
                    {key}: {value}
                  </Text>
                ))}
              </ScrollView>
            </View>
          )}
          {payload?.request?.data && (
            <View style={$dataContainer}>
              <Text style={$dataLabel}>Data:</Text>
              <Text style={$dataText}>{JSON.stringify(payload?.request?.data, null, 2)}</Text>
            </View>
          )}
        </View>
      )}

      {isResponse && payload?.response && (
        <View style={$sectionContainer}>
          <Text style={$sectionLabel}>Response:</Text>
          <View style={$statusContainer}>
            <Text style={$statusLabel}>Status:</Text>
            <Text style={$statusText}>
              {payload?.response?.status} {payload?.response?.statusText}
            </Text>
          </View>
          <View style={$durationContainer}>
            <Text style={$durationLabel}>Duration:</Text>
            <Text style={$durationText}>{payload?.response?.duration}ms</Text>
          </View>
          {payload?.response?.headers && Object.keys(payload?.response?.headers).length > 0 && (
            <View style={$headersContainer}>
              <Text style={$headersLabel}>Headers:</Text>
              <ScrollView style={$headersScroll}>
                {Object.entries(payload?.response?.headers).map(([key, value]) => (
                  <Text key={key} style={$headerText}>
                    {key}: {value}
                  </Text>
                ))}
              </ScrollView>
            </View>
          )}
          {payload?.response?.data && (
            <View style={$dataContainer}>
              <Text style={$dataLabel}>Data:</Text>
              <Text style={$dataText}>{JSON.stringify(payload?.response?.data, null, 2)}</Text>
            </View>
          )}
        </View>
      )}

      {payload?.error && (
        <View style={$errorContainer}>
          <Text style={$errorLabel}>Error:</Text>
          <Text style={$errorText}>{payload?.error}</Text>
        </View>
      )}
    </TimelineRow>
  )
}

const $sectionContainer: ViewStyle = {
  marginBottom: 16,
}

const $sectionLabel: TextStyle = {
  fontSize: 14,
  fontWeight: "bold",
  marginBottom: 8,
  opacity: 0.8,
}

const $urlContainer: ViewStyle = {
  marginBottom: 8,
}

const $urlLabel: TextStyle = {
  fontSize: 12,
  fontWeight: "bold",
  marginBottom: 4,
  opacity: 0.7,
}

const $urlText: TextStyle = {
  fontSize: 13,
  fontFamily: "Courier",
  color: "#007AFF",
}

const $methodContainer: ViewStyle = {
  marginBottom: 8,
}

const $methodLabel: TextStyle = {
  fontSize: 12,
  fontWeight: "bold",
  marginBottom: 4,
  opacity: 0.7,
}

const $methodText: TextStyle = {
  fontSize: 13,
  fontFamily: "Courier",
}

const $statusContainer: ViewStyle = {
  marginBottom: 8,
}

const $statusLabel: TextStyle = {
  fontSize: 12,
  fontWeight: "bold",
  marginBottom: 4,
  opacity: 0.7,
}

const $statusText: TextStyle = {
  fontSize: 13,
  fontFamily: "Courier",
}

const $durationContainer: ViewStyle = {
  marginBottom: 8,
}

const $durationLabel: TextStyle = {
  fontSize: 12,
  fontWeight: "bold",
  marginBottom: 4,
  opacity: 0.7,
}

const $durationText: TextStyle = {
  fontSize: 13,
  fontFamily: "Courier",
}

const $headersContainer: ViewStyle = {
  marginBottom: 8,
}

const $headersLabel: TextStyle = {
  fontSize: 12,
  fontWeight: "bold",
  marginBottom: 4,
  opacity: 0.7,
}

const $headersScroll: ViewStyle = {
  maxHeight: 100,
}

const $headerText: TextStyle = {
  fontSize: 12,
  fontFamily: "Courier",
  marginBottom: 2,
}

const $dataContainer: ViewStyle = {
  marginBottom: 8,
}

const $dataLabel: TextStyle = {
  fontSize: 12,
  fontWeight: "bold",
  marginBottom: 4,
  opacity: 0.7,
}

const $dataText: TextStyle = {
  fontSize: 12,
  fontFamily: "Courier",
  flex: 1,
}

const $errorContainer: ViewStyle = {
  marginBottom: 16,
}

const $errorLabel: TextStyle = {
  fontSize: 12,
  fontWeight: "bold",
  marginBottom: 8,
  opacity: 0.7,
  color: "#FF3B30",
}

const $errorText: TextStyle = {
  fontSize: 12,
  fontFamily: "Courier",
  color: "#FF3B30",
}
