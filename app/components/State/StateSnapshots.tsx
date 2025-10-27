import { Text, ViewStyle, TextStyle, Pressable, View } from "react-native"
import { themed, useTheme } from "../../theme/theme"
import { TreeViewWithProvider } from "../TreeView"
import { Divider } from "../Divider"
import { Icon } from "../Icon"
import { Tooltip } from "../Tooltip"
import { useState } from "react"
import { useGlobal } from "../../state/useGlobal"
import { sendToCore } from "../../state/connectToServer"
import IRClipboard from "../../native/IRClipboard/NativeIRClipboard"
import type { Snapshot } from "app/types"

export function StateSnapshots() {
  const theme = useTheme()
  const [snapshots, setSnapshots] = useGlobal<Snapshot[]>("snapshots", [])
  const [activeClientId, _] = useGlobal("activeClientId", "")
  const [expandedSnapshotIds, setExpandedSnapshotIds] = useState<Set<string>>(new Set())

  const deleteSnapshot = (snapshotId: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== snapshotId))
  }

  const copySnapshotToClipboard = (snapshot: Snapshot) => {
    try {
      IRClipboard.setString(JSON.stringify(snapshot.state, null, 2))
      console.log("Snapshot copied to clipboard")
    } catch (error) {
      console.error("Failed to copy snapshot to clipboard:", error)
    }
  }

  const restoreSnapshot = (snapshot: Snapshot) => {
    if (!snapshot || !snapshot.state) return

    // Use the snapshot's clientId if available, otherwise fall back to the active client
    const targetClientId = snapshot.clientId || activeClientId

    if (!targetClientId) return

    // Send the restore command to the client
    sendToCore("state.restore.request", {
      clientId: targetClientId,
      state: snapshot.state,
    })
  }

  const toggleSnapshotExpanded = (snapshotId: string) => {
    setExpandedSnapshotIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(snapshotId)) {
        newSet.delete(snapshotId)
      } else {
        newSet.add(snapshotId)
      }
      return newSet
    })
  }

  if (snapshots.length === 0) {
    return (
      <Text style={$emptyStateText()}>
        To take a snapshot of your current redux or mobx-state-tree store, press the Create Snapshot
        button in the top right corner of this window.
      </Text>
    )
  }

  return (
    <>
      {snapshots.map((snapshot) => (
        <View key={snapshot.id}>
          <View style={$snapshotCard()}>
            <Pressable
              style={$snapshotHeader()}
              onPress={() => toggleSnapshotExpanded(snapshot.id)}
            >
              <View style={$snapshotInfo()}>
                <Text style={$snapshotName()}>{snapshot.name}</Text>
                <Tooltip label="Copy Snapshot">
                  <Pressable
                    style={$iconButton()}
                    onPress={(e) => {
                      e.stopPropagation()
                      copySnapshotToClipboard(snapshot)
                    }}
                  >
                    <Icon icon="clipboard" size={18} color={theme.colors.mainText} />
                  </Pressable>
                </Tooltip>
                <Tooltip label="Restore Snapshot">
                  <Pressable
                    style={$iconButton()}
                    onPress={(e) => {
                      e.stopPropagation()
                      restoreSnapshot(snapshot)
                    }}
                  >
                    <Icon icon="arrowUpFromLine" size={18} color={theme.colors.mainText} />
                  </Pressable>
                </Tooltip>
                <Tooltip label="Delete Snapshot">
                  <Pressable
                    style={$iconButton()}
                    onPress={(e) => {
                      e.stopPropagation()
                      deleteSnapshot(snapshot.id)
                    }}
                  >
                    <Icon icon="trash" size={18} color={theme.colors.mainText} />
                  </Pressable>
                </Tooltip>
              </View>
            </Pressable>
            {expandedSnapshotIds.has(snapshot.id) && (
              <View style={$snapshotContent()}>
                <TreeViewWithProvider data={snapshot.state} />
              </View>
            )}
          </View>
          <Divider />
        </View>
      ))}
    </>
  )
}

const $snapshotCard = themed<ViewStyle>(({ colors }) => ({
  backgroundColor: colors.cardBackground,
  overflow: "hidden",
}))

const $snapshotHeader = themed<ViewStyle>(({ spacing, colors }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: spacing.sm,
  backgroundColor: colors.cardBackground,
  cursor: "pointer",
}))

const $snapshotInfo = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
}))

const $snapshotName = themed<TextStyle>(({ colors, typography }) => ({
  flex: 1,
  fontSize: typography.body,
  fontWeight: "600",
  color: colors.mainText,
  fontFamily: typography.code.normal,
}))

const $iconButton = themed<ViewStyle>(({ spacing, colors }) => ({
  padding: spacing.xs,
  borderRadius: 4,
  cursor: "pointer",
  backgroundColor: colors.neutralVery,
}))

const $snapshotContent = themed<ViewStyle>(({ spacing, colors }) => ({
  padding: spacing.md,
  backgroundColor: colors.cardBackground,
}))

const $emptyStateText = themed<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.body,
  fontWeight: "400",
  color: colors.mainText,
}))
