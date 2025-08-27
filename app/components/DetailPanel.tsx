import { View, Text, ScrollView, type ViewStyle, type TextStyle } from "react-native"
import { themed } from "../theme/theme"
import { TimelineItem } from "../types"
import { TreeView } from "./TreeView"
import ActionButton from "./ActionButton"
import IRClipboard from "../native/IRClipboard/NativeIRClipboard"
import { $flex } from "../theme/basics"

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

  return (
    <View style={$container()}>
      <View style={$header()}>
        <View style={$flex}>
          <View style={$headerTitleRow}>
            <View style={$selectedIndicator()} />
            <Text style={$headerTitle()}>
              {selectedItem.type === "log" ? "Log Details" : "Network Details"}
            </Text>
          </View>
          <View style={$headerInfo()}>
            <Text style={$headerInfoText()}>{new Date(selectedItem.date).toLocaleString()}</Text>
            {!!selectedItem.deltaTime && (
              <Text style={$headerInfoText()}>+{selectedItem.deltaTime}ms</Text>
            )}
          </View>
        </View>
        <View style={$headerActions()}>
          <ActionButton
            icon={({ size }) => <Text style={{ fontSize: size }}>📋</Text>}
            onClick={() => IRClipboard.setString(JSON.stringify(selectedItem.payload))}
          />
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
        {selectedItem.type === "log" ? (
          <LogDetailContent item={selectedItem} />
        ) : (
          <NetworkDetailContent item={selectedItem} />
        )}
      </ScrollView>
    </View>
  )
}

/**
 * Renders detailed content for log timeline items including level, message, stack trace, and metadata.
 */
function LogDetailContent({ item }: { item: TimelineItem & { type: "log" } }) {
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
          <TreeView data={payload.message} />
        )}
      </DetailSection>

      {/* Show stack trace only for error level logs that have stack data */}
      {payload.level === "error" && "stack" in payload && (
        <DetailSection title="Stack Trace">
          <TreeView data={payload.stack} />
        </DetailSection>
      )}

      <DetailSection title="Full Payload">
        <TreeView data={payload} />
      </DetailSection>

      <DetailSection title="Metadata">
        <TreeView
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
  item: TimelineItem & { type: "api.request" | "api.response" }
}) {
  const { payload } = item

  return (
    <View style={$detailContent()}>
      {/* Show request data if available */}
      {payload.request && (
        <>
          <DetailSection title="Request">
            <TreeView data={payload.request} />
          </DetailSection>
        </>
      )}

      {/* Show response data if available */}
      {payload.response && (
        <>
          <DetailSection title="Response">
            <TreeView data={payload.response} />
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
        <TreeView data={payload} />
      </DetailSection>

      <DetailSection title="Metadata">
        <TreeView
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
  backgroundColor: colors.cardBackground,
  borderLeftWidth: 1,
  borderLeftColor: colors.border,
}))

const $emptyContainer = themed<ViewStyle>(({ colors }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.cardBackground,
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
