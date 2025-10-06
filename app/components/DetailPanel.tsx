import {
  View,
  Text,
  ScrollView,
  type ViewStyle,
  type TextStyle,
  Image,
  type ImageStyle,
  Pressable,
  Linking,
} from "react-native"
import { themed } from "../theme/theme"
import { CommandType } from "reactotron-core-contract"
import type { TimelineItem } from "../types"
import { TreeViewWithProvider } from "./TreeView"
import ActionButton from "./ActionButton"
import { Tooltip } from "./Tooltip"
import IRClipboard from "../native/IRClipboard/NativeIRClipboard"
import { $flex } from "../theme/basics"
import { formatTime } from "../utils/formatTime"

type DetailPanelProps = {
  selectedItem: TimelineItem | null
  onClose?: () => void
}

/**
 * DetailPanel displays comprehensive information about a selected timeline item.
 * Shows different content based on whether the item is a log entry or network request.
 */

export function DetailPanel({ selectedItem, onClose }: DetailPanelProps) {
  // Show empty state when no item is selected
  if (!selectedItem) {
    return (
      <View style={$emptyContainer()}>
        <View style={$emptyCard()}>
          <Text style={$emptyIcon()}>📋</Text>
          <Text style={$emptyTitle()}>No Selection</Text>
          <Text style={$emptyText()}>Select a timeline item to view details</Text>
        </View>
      </View>
    )
  }

  const getHeaderTitle = () => {
    switch (selectedItem.type) {
      case CommandType.StateActionComplete:
        return "State Action Details"
      case CommandType.Log:
        return "Log Details"
      case CommandType.Display:
        return "Display Details"
      default:
        return "Network Details"
    }
  }

  const renderDetailContent = () => {
    switch (selectedItem.type) {
      case CommandType.StateActionComplete:
        return <StateActionDetailContent item={selectedItem} />
      case CommandType.Log:
        return <LogDetailContent item={selectedItem} />
      case CommandType.Display:
        return <DisplayDetailContent item={selectedItem} />
      case CommandType.ApiResponse:
        return <NetworkDetailContent item={selectedItem} />
      default:
        return null
    }
  }

  return (
    <View style={$container()}>
      <View style={$header()}>
        <View style={$flex}>
          <View style={$headerTitleRow}>
            <View style={$selectedIndicator()} />
            <Text style={$headerTitle()}>{getHeaderTitle()}</Text>
          </View>
          <View style={$headerInfo()}>
            <Text style={$headerInfoText()}>{formatTime(new Date(selectedItem.date))}</Text>
            {!!selectedItem.deltaTime && (
              <Text style={$headerInfoText()}>+{selectedItem.deltaTime}ms</Text>
            )}
          </View>
        </View>
        <View style={$headerActions()}>
          <Tooltip label="Copy payload">
            <Pressable
              style={$copyButton()}
              onPress={() => IRClipboard.setString(JSON.stringify(selectedItem.payload))}
            >
              <Text style={$copyButtonText()}>📋</Text>
            </Pressable>
          </Tooltip>
          {onClose && (
            <ActionButton
              icon={({ size }) => <Text style={{ fontSize: size }}>✕</Text>}
              onClick={onClose}
            />
          )}
        </View>
      </View>

      <ScrollView
        style={$flex}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={$scrollContent()}
      >
        {/* Render appropriate content based on timeline item type */}
        {renderDetailContent()}
      </ScrollView>
    </View>
  )
}

function StateActionDetailContent({
  item,
}: {
  item: TimelineItem & { type: typeof CommandType.StateActionComplete }
}) {
  const {
    payload: { action, name },
  } = item
  return (
    <View style={$detailContent()}>
      <DetailSection title="Type">
        <Text style={$valueText()}>{name}</Text>
      </DetailSection>
      <DetailSection title="Payload">
        <TreeViewWithProvider data={action.payload} />
      </DetailSection>
    </View>
  )
}

function DisplayDetailContent({
  item,
}: {
  item: TimelineItem & { type: typeof CommandType.Display }
}) {
  const { payload } = item
  const { name, image, preview, ...rest } = payload

  const renderImage = () => {
    if (image) {
      let imgComponent = null
      if (typeof image === "string") {
        imgComponent = <Image source={{ uri: image }} style={$image()} />
      } else {
        imgComponent = <Image source={image} style={$image()} />
      }
      return (
        <DetailSection title="Image">
          <Pressable
            onPress={() => {
              Linking.openURL(typeof image === "string" ? image : image.uri)
            }}
          >
            {imgComponent}
          </Pressable>
        </DetailSection>
      )
    }
  }

  return (
    <View style={$detailContent()}>
      {name ? (
        <DetailSection title="Name">
          {typeof name === "string" ? (
            <Text style={$valueText()}>{name}</Text>
          ) : (
            <TreeViewWithProvider data={name} />
          )}
        </DetailSection>
      ) : null}
      {preview ? (
        <DetailSection title="Preview">
          {typeof preview === "string" ? (
            <Text style={$valueText()}>{preview}</Text>
          ) : (
            <TreeViewWithProvider data={preview} />
          )}
        </DetailSection>
      ) : null}
      {renderImage()}
      <DetailSection title="Full Payload">
        <TreeViewWithProvider data={rest} />
      </DetailSection>
      <DetailSection title="Metadata">
        <TreeViewWithProvider
          data={{
            id: item.id,
            clientId: item.clientId,
            connectionId: item.connectionId,
            messageId: item.messageId,
            important: item.important,
            date: item.date,
            deltaTime: item.deltaTime,
          }}
        />
      </DetailSection>
    </View>
  )
}

/**
 * Renders detailed content for log timeline items including level, message, stack trace, and metadata.
 */
function LogDetailContent({ item }: { item: TimelineItem & { type: typeof CommandType.Log } }) {
  const { payload } = item

  return (
    <View style={$detailContent()}>
      <DetailSection title="Log Level">
        <Text style={$valueText()}>{payload.level.toUpperCase()}</Text>
      </DetailSection>

      <DetailSection title="Message">
        {typeof payload.message === "string" ? (
          <Text style={$valueText()}>{payload.message}</Text>
        ) : (
          <TreeViewWithProvider data={payload.message} />
        )}
      </DetailSection>

      {/* Show stack trace only for error level logs that have stack data */}
      {payload.level === "error" && "stack" in payload && (
        <DetailSection title="Stack Trace">
          <TreeViewWithProvider data={payload.stack} />
        </DetailSection>
      )}

      <DetailSection title="Full Payload">
        <TreeViewWithProvider data={payload} />
      </DetailSection>

      <DetailSection title="Metadata">
        <TreeViewWithProvider
          data={{
            id: item.id,
            clientId: item.clientId,
            connectionId: item.connectionId,
            messageId: item.messageId,
            important: item.important,
            date: item.date,
            deltaTime: item.deltaTime,
          }}
        />
      </DetailSection>
    </View>
  )
}

/**
 * Renders detailed content for network timeline items including request/response data and errors.
 */
function NetworkDetailContent({
  item,
}: {
  item: TimelineItem & { type: typeof CommandType.ApiResponse }
}) {
  const { payload } = item

  return (
    <View style={$detailContent()}>
      {/* Show request data if available */}
      {payload.request && (
        <>
          <DetailSection title="Request">
            <TreeViewWithProvider data={payload.request} />
          </DetailSection>
        </>
      )}

      {/* Show response data if available */}
      {payload.response && (
        <>
          <DetailSection title="Response">
            <TreeViewWithProvider data={payload.response} />
          </DetailSection>
        </>
      )}

      {/* Show error information if request failed */}
      {payload.error && (
        <DetailSection title="Error">
          <Text style={$errorText()}>{payload.error}</Text>
        </DetailSection>
      )}

      <DetailSection title="Full Payload">
        <TreeViewWithProvider data={payload} />
      </DetailSection>

      <DetailSection title="Metadata">
        <TreeViewWithProvider
          data={{
            id: item.id,
            clientId: item.clientId,
            connectionId: item.connectionId,
            messageId: item.messageId,
            important: item.important,
            date: item.date,
            deltaTime: item.deltaTime,
          }}
        />
      </DetailSection>
    </View>
  )
}

/**
 * A reusable section component with a header and content area for organizing detail information.
 */
function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={$section()}>
      <View style={$sectionHeader()}>
        <Text style={$sectionTitle()}>{title}</Text>
      </View>
      <View style={$sectionContent()}>{children}</View>
    </View>
  )
}

const $container = themed<ViewStyle>(({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
  borderLeftWidth: 1,
  borderLeftColor: colors.border,
}))

const $emptyContainer = themed<ViewStyle>(({ colors }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.background,
  borderLeftWidth: 1,
  borderLeftColor: colors.border,
}))

const $emptyCard = themed<ViewStyle>(({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  padding: spacing.xl,
  alignItems: "center",
  maxWidth: 300,
}))

const $emptyIcon = themed<TextStyle>(({ spacing }) => ({
  fontSize: 48,
  marginBottom: spacing.md,
  opacity: 0.5,
}))

const $emptyTitle = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.mainText,
  fontSize: typography.subheading,
  fontWeight: "600",
  marginBottom: 8,
  textAlign: "center",
}))

const $emptyText = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.neutral,
  fontSize: typography.body,
  textAlign: "center",
  lineHeight: typography.body * 1.5,
}))

const $header = themed<ViewStyle>(({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
  backgroundColor: colors.background,
}))

const $headerTitleRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $selectedIndicator = themed<ViewStyle>(({ colors, spacing }) => ({
  width: spacing.xxs,
  height: spacing.md,
  backgroundColor: colors.primary,
  borderRadius: spacing.xxxs,
  marginRight: spacing.sm,
}))

const $headerTitle = themed<TextStyle>(({ colors, typography, spacing }) => ({
  color: colors.mainText,
  fontSize: typography.subheading,
  fontFamily: typography.primary.semiBold,
  marginBottom: spacing.xxs,
}))

const $headerInfo = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
}))

const $headerInfoText = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.neutral,
  fontSize: typography.caption,
}))

const $headerActions = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
}))

const $scrollContent = themed<ViewStyle>(({ spacing }) => ({
  paddingBottom: spacing.xl, // Extra padding at bottom for better scrolling
}))

const $detailContent = themed<ViewStyle>(({ spacing }) => ({
  flex: 1,
  padding: spacing.md,
}))

const $section = themed<ViewStyle>(({ colors, spacing }) => ({
  marginBottom: spacing.lg,
  backgroundColor: colors.background,
  borderRadius: spacing.xs,
  borderWidth: 1,
  borderColor: colors.border,
  overflow: "hidden",
}))

const $sectionHeader = themed<ViewStyle>(({ colors, spacing }) => ({
  backgroundColor: colors.cardBackground,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
}))

const $sectionTitle = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.mainText,
  fontSize: typography.body,
  fontFamily: typography.primary.semiBold,
  letterSpacing: 0.5,
}))

const $sectionContent = themed<ViewStyle>(({ spacing }) => ({
  padding: spacing.md,
  backgroundColor: "transparent",
}))

const $valueText = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.mainText,
  fontSize: typography.body,
  fontFamily: typography.code.normal,
}))

const $errorText = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.danger,
  fontSize: typography.body,
  fontFamily: typography.code.normal,
}))

const $image = themed<ImageStyle>(() => ({
  width: 200,
  height: 200,
  resizeMode: "contain",
}))

const $copyButton = themed<ViewStyle>(({ spacing }) => ({
  marginHorizontal: spacing.sm,
  padding: spacing.sm,
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  borderRadius: spacing.xs,
  backgroundColor: "transparent",
}))

const $copyButtonText = themed<TextStyle>(() => ({
  fontSize: 20,
}))
