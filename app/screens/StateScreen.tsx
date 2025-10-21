import { Text, ViewStyle, ScrollView, TextStyle, Pressable, View, TextInput } from "react-native"
import { themed, useTheme } from "../theme/theme"
import { sendToCore } from "../state/connectToServer"
import { useGlobal } from "../state/useGlobal"
import { TreeViewWithProvider } from "../components/TreeView"
import { useState } from "react"
import { Divider } from "../components/Divider"
import { useKeyboardEvents } from "../utils/system"
import type { StateSubscription, Snapshot } from "app/types"
import { Icon } from "../components/Icon"
import { Tab } from "../components/Tab"
import IRClipboard from "../native/IRClipboard/NativeIRClipboard"
import { Tooltip } from "../components/Tooltip"

type StateTab = "Subscriptions" | "Snapshots"

export function StateScreen() {
  const theme = useTheme()
  const [showAddSubscription, setShowAddSubscription] = useState(false)
  const [activeStateTab, setActiveStateTab] = useGlobal<StateTab>("activeStateTab", "Subscriptions")

  const [stateSubscriptionsByClientId, setStateSubscriptionsByClientId] = useGlobal<{
    [clientId: string]: StateSubscription[]
  }>("stateSubscriptionsByClientId", {})
  const [activeTab, setActiveTab] = useGlobal("activeClientId", "")
  const [snapshots, setSnapshots] = useGlobal<Snapshot[]>("snapshots", [])
  const [expandedSnapshotIds, setExpandedSnapshotIds] = useState<Set<string>>(new Set())
  const [renamingSnapshotId, setRenamingSnapshotId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  const clientStateSubscriptions = stateSubscriptionsByClientId[activeTab] || []
  const iconColor = theme.colors.mainText

  const saveSubscription = (path: string) => {
    if (clientStateSubscriptions.some((s) => s.path === path)) return
    sendToCore("state.values.subscribe", {
      paths: [...clientStateSubscriptions.map((s) => s.path), path],
      clientId: activeTab,
    })
  }

  const removeSubscription = (path: string) => {
    const newStateSubscriptions = clientStateSubscriptions.filter((s) => s.path !== path)
    sendToCore("state.values.subscribe", {
      paths: newStateSubscriptions.map((s) => s.path),
      clientId: activeTab,
    })
    setStateSubscriptionsByClientId((prev) => ({
      ...prev,
      [activeTab]: newStateSubscriptions,
    }))
  }

  const createSnapshot = () => {
    if (!activeTab) {
      console.log("No active client to create snapshot from")
      return
    }
    sendToCore("state.backup.request", { clientId: activeTab })
  }

  const copySnapshotToClipboard = (snapshot: Snapshot) => {
    try {
      IRClipboard.setString(JSON.stringify(snapshot.state, null, 2))
      console.log("Snapshot copied to clipboard")
    } catch (error) {
      console.error("Failed to copy snapshot to clipboard:", error)
    }
  }

  const copyAllSnapshotsToClipboard = () => {
    try {
      console.log("Copying all snapshots to clipboard", snapshots)
      IRClipboard.setString(JSON.stringify(snapshots, null, 2))
      console.log("All snapshots copied to clipboard")
    } catch (error) {
      console.error("Failed to copy snapshots to clipboard:", error)
    }
  }

  const deleteSnapshot = (snapshotId: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== snapshotId))
  }

  const renameSnapshot = (snapshotId: string, newName: string) => {
    setSnapshots((prev) => prev.map((s) => (s.id === snapshotId ? { ...s, name: newName } : s)))
    setRenamingSnapshotId(null)
    setRenameValue("")
  }

  const startRenaming = (snapshot: Snapshot) => {
    setRenamingSnapshotId(snapshot.id)
    setRenameValue(snapshot.name)
  }

  const cancelRenaming = () => {
    setRenamingSnapshotId(null)
    setRenameValue("")
  }

  const handleRenameKeyPress = (snapshotId: string, key: string) => {
    if (key === "Enter" && renameValue.trim()) {
      renameSnapshot(snapshotId, renameValue.trim())
    } else if (key === "Escape") {
      cancelRenaming()
    }
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

  const restoreSnapshot = (snapshot: Snapshot) => {
    if (!snapshot || !snapshot.state) {
      console.error("Invalid snapshot: missing state data")
      return
    }

    // Use the snapshot's clientId if available, otherwise fall back to the active client
    const targetClientId = snapshot.clientId || activeTab

    if (!targetClientId) {
      console.error("Cannot restore snapshot: no client available")
      return
    }

    // Send the restore command to the client
    sendToCore("state.restore.request", {
      clientId: targetClientId,
      state: snapshot.state,
    })

    console.log(`Restoring snapshot "${snapshot.name}" to client ${targetClientId}`)
  }

  if (showAddSubscription) {
    return (
      <AddSubscription
        saveSubscription={saveSubscription}
        setShowAddSubscription={setShowAddSubscription}
      />
    )
  }

  return (
    <>
      <ScrollView contentContainerStyle={$container()}>
        <View style={$header()}>
          <Text style={$title()}>State</Text>
          {activeStateTab === "Subscriptions" ? (
            <View style={$buttonsContainer()}>
              <Pressable style={$button()} onPress={() => setShowAddSubscription(true)}>
                <Text style={$buttonText()}>Add Subscription</Text>
              </Pressable>
              <Pressable
                style={$button()}
                onPress={() => {
                  setStateSubscriptionsByClientId((prev) => ({
                    ...prev,
                    [activeTab]: [],
                  }))
                  sendToCore("state.values.subscribe", { paths: [], clientId: activeTab })
                  setActiveTab("")
                }}
              >
                <Text style={$buttonText()}>Clear State</Text>
              </Pressable>
            </View>
          ) : (
            <View style={$buttonsContainer()}>
              <Pressable style={$button()} onPress={copyAllSnapshotsToClipboard}>
                <Text style={$buttonText()}>Copy All</Text>
              </Pressable>
              <Pressable style={$button()} onPress={createSnapshot}>
                <Text style={$buttonText()}>Create Snapshot</Text>
              </Pressable>
            </View>
          )}
        </View>
        <View style={$tabsContainer()}>
          <Tab id="subscriptions" label="Subscriptions" tabgroup="activeStateTab" />
          <Tab id="snapshots" label="Snapshots" tabgroup="activeStateTab" />
        </View>
        <View style={$stateContainer()}>
          {activeStateTab === "Subscriptions" ? (
            <>
              {clientStateSubscriptions.length > 0 ? (
                <>
                  {clientStateSubscriptions.map((subscription, index) => (
                    <View key={`${subscription.path}-${index}`} style={$stateItemContainer()}>
                      <Text style={$pathText()}>
                        {subscription.path ? subscription.path : "Full State"}
                      </Text>
                      <View style={$treeViewContainer()}>
                        <View style={$treeViewInnerContainer()}>
                          <TreeViewWithProvider data={subscription.value} />
                        </View>
                        <Pressable onPress={() => removeSubscription(subscription.path)}>
                          <Icon icon="trash" size={20} />
                        </Pressable>
                      </View>
                      {index < clientStateSubscriptions.length - 1 && (
                        <Divider extraStyles={$stateDivider()} />
                      )}
                    </View>
                  ))}
                </>
              ) : (
                <Text>State is empty</Text>
              )}
            </>
          ) : (
            <>
              {snapshots.length > 0 ? (
                <>
                  {snapshots.map((snapshot, index) => (
                    <View key={snapshot.id}>
                      <View style={$snapshotCard(expandedSnapshotIds.has(snapshot.id))()}>
                        <Pressable
                          style={$snapshotHeader(expandedSnapshotIds.has(snapshot.id))()}
                          onPress={() => {
                            if (renamingSnapshotId !== snapshot.id) {
                              toggleSnapshotExpanded(snapshot.id)
                            }
                          }}
                        >
                          <View style={$snapshotInfo()}>
                            {renamingSnapshotId === snapshot.id ? (
                              <View style={$renameContainer()}>
                                <TextInput
                                  style={$renameInput()}
                                  value={renameValue}
                                  onChangeText={setRenameValue}
                                  onKeyPress={(e) =>
                                    handleRenameKeyPress(snapshot.id, e.nativeEvent.key)
                                  }
                                  onBlur={() => {
                                    if (renameValue.trim()) {
                                      renameSnapshot(snapshot.id, renameValue.trim())
                                    } else {
                                      cancelRenaming()
                                    }
                                  }}
                                  autoFocus
                                  selectTextOnFocus
                                />
                                <Tooltip label="Save (Enter)">
                                  <Pressable
                                    style={$renameButton()}
                                    onPress={() => {
                                      if (renameValue.trim()) {
                                        renameSnapshot(snapshot.id, renameValue.trim())
                                      }
                                    }}
                                  >
                                    <Text>Save</Text>
                                  </Pressable>
                                </Tooltip>
                                <Tooltip label="Cancel (Esc)">
                                  <Pressable style={$renameButton()} onPress={cancelRenaming}>
                                    <Text>Cancel</Text>
                                  </Pressable>
                                </Tooltip>
                              </View>
                            ) : (
                              <Text style={$snapshotName()}>{snapshot.name}</Text>
                            )}
                            <Tooltip label="Copy Snapshot">
                              <Pressable
                                style={$iconButton()}
                                onPress={(e) => {
                                  e.stopPropagation()
                                  copySnapshotToClipboard(snapshot)
                                }}
                              >
                                <Icon icon="clipboard" size={18} color={iconColor} />
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
                                <Icon icon="arrowUpFromLine" size={18} color={iconColor} />
                              </Pressable>
                            </Tooltip>
                            <Tooltip label="Rename Snapshot">
                              <Pressable
                                style={$iconButton()}
                                onPress={(e) => {
                                  e.stopPropagation()
                                  startRenaming(snapshot)
                                }}
                              >
                                <Icon icon="pen" size={18} color={iconColor} />
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
                                <Icon icon="trash" size={18} color={iconColor} />
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
              ) : (
                <Text>
                  To take a snapshot of your current redux or mobx-state-tree store, press the
                  Create Snapshot button in the top right corner of this window.
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </>
  )
}

function AddSubscription({
  saveSubscription,
  setShowAddSubscription,
}: {
  saveSubscription: (path: string) => void
  setShowAddSubscription: (show: boolean) => void
}) {
  const [path, setPath] = useState("")

  useKeyboardEvents(
    (event) => {
      // TODO: check these key events in windows
      if (event.type === "keydown" && event.key === "\u001b") {
        setShowAddSubscription(false)
      }
      // TODO: Make this event work, it currently always sends ""
      if (event.type === "keydown" && event.key === "\r") {
        saveSubscription(path)
        setPath("")
        setShowAddSubscription(false)
      }
    },
    [path],
  )

  return (
    <View style={$addSubscriptionOuterContainer()}>
      <View style={$addSubscriptionContainer()}>
        <Text style={$addSubscriptionTitle()}>Add Subscription</Text>
        <Text style={$addSubscriptionText()}>
          Enter a path you would like to subscribe. Here are some examples to get you started:
        </Text>
        <Text style={$subscriptionExampleText()}>*</Text>
        <Text style={$subscriptionExampleText()}>user.firstName</Text>
        <Text style={$subscriptionExampleText()}>repo</Text>
        <Text style={$subscriptionExampleText()}>repo.*</Text>
        <View style={$pathInputContainer()}>
          <Text>PATH</Text>
          <TextInput
            style={$pathInput()}
            value={path}
            onChangeText={(newText) => {
              setPath(newText)
            }}
          />
          <Divider />
        </View>
        <View style={$subscriptionButtonsContainer()}>
          <Pressable
            style={$subscriptionButtonContainer()}
            onPress={() => setShowAddSubscription(false)}
          >
            <View style={$subscriptionButton()}>
              <Text>ESC</Text>
            </View>
            <Text>Cancel</Text>
          </Pressable>
          <Pressable
            style={$subscriptionButtonContainer()}
            onPress={() => {
              saveSubscription(path)
              setPath("")
              setShowAddSubscription(false)
            }}
          >
            <View style={$subscriptionButton()}>
              <Text>ENTER</Text>
            </View>
            <Text>Subscribe</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const $pathText = themed<TextStyle>(({ colors, typography, spacing }) => ({
  fontSize: typography.body,
  fontWeight: "400",
  color: colors.mainText,
  marginBottom: spacing.sm,
}))

const $container = themed<ViewStyle>(({ spacing }) => ({
  padding: spacing.xl,
  flex: 1,
}))

const $header = themed<ViewStyle>(() => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}))

const $title = themed<TextStyle>(({ colors, spacing, typography }) => ({
  fontSize: 20,
  fontWeight: "bold",
  color: colors.mainText,
  fontFamily: typography.code.normal,
  marginTop: spacing.xl,
}))

const $tabsContainer = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  marginTop: spacing.lg,
  marginBottom: spacing.md,
}))

const $stateItemContainer = themed<ViewStyle>(({ spacing }) => ({
  marginTop: spacing.xl,
}))

const $treeViewInnerContainer = themed<ViewStyle>(() => ({
  flex: 1,
}))

const $treeViewContainer = themed<ViewStyle>(() => ({
  flexDirection: "row",
  justifyContent: "space-between",
}))

const $stateContainer = themed<ViewStyle>(({ spacing }) => ({
  marginTop: spacing.sm,
}))

const $buttonsContainer = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
}))

const $button = themed<ViewStyle>(({ colors, spacing }) => ({
  padding: spacing.sm,
  backgroundColor: colors.cardBackground,
  borderRadius: 8,
  marginTop: spacing.xl,
  cursor: "pointer",
}))

const $buttonText = themed<TextStyle>(({ colors }) => ({
  color: colors.mainText,
}))

const $addSubscriptionOuterContainer = themed<ViewStyle>(({ spacing }) => ({
  flex: 1,
  padding: spacing.xl,
  justifyContent: "center",
  alignItems: "center",
}))

const $addSubscriptionContainer = themed<ViewStyle>(({ spacing, colors }) => ({
  padding: spacing.xl,
  backgroundColor: colors.cardBackground,
  borderRadius: 8,
  justifyContent: "center",
}))

const $addSubscriptionTitle = themed<TextStyle>(({ colors, typography, spacing }) => ({
  fontSize: typography.heading,
  fontWeight: "600",
  color: colors.mainText,
  marginBottom: spacing.xl,
}))

const $addSubscriptionText = themed<TextStyle>(({ colors, typography, spacing }) => ({
  fontSize: typography.body,
  fontWeight: "400",
  color: colors.mainText,
  marginBottom: spacing.sm,
}))

const $subscriptionExampleText = themed<TextStyle>(({ colors, typography, spacing }) => ({
  fontSize: typography.body,
  fontWeight: "400",
  color: colors.primary,
  fontFamily: typography.code.normal,
  marginLeft: spacing.xl,
}))

const $pathInputContainer = themed<ViewStyle>(({ spacing }) => ({
  marginTop: spacing.xl,
  marginBottom: spacing.sm,
}))

const $pathInput = themed<TextStyle>(({ colors, typography, spacing }) => ({
  fontSize: typography.subheading,
  fontWeight: "400",
  color: colors.mainText,
  marginBottom: spacing.sm,
  padding: spacing.xs,
  marginTop: spacing.sm,
}))

const $subscriptionButtonsContainer = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xl,
  justifyContent: "center",
}))

const $subscriptionButtonContainer = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  cursor: "pointer",
  alignItems: "center",
  gap: spacing.xxs,
}))

const $subscriptionButton = themed<ViewStyle>(({ colors, spacing }) => ({
  padding: spacing.xs,
  backgroundColor: colors.neutralVery,
  borderRadius: 8,
  cursor: "pointer",
}))

const $stateDivider = themed<ViewStyle>(({ spacing }) => ({
  marginTop: spacing.lg,
}))

const $snapshotCard = (isExpanded: boolean) =>
  themed<ViewStyle>(({ colors }) => ({
    backgroundColor: colors.cardBackground,
    overflow: "hidden",
  }))

const $snapshotHeader = (isExpanded: boolean) =>
  themed<ViewStyle>(({ spacing, colors }) => ({
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

const $renameContainer = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
  flex: 1,
}))

const $renameInput = themed<TextStyle>(({ colors, typography, spacing }) => ({
  fontSize: typography.body,
  fontWeight: "600",
  color: colors.mainText,
  fontFamily: typography.code.normal,
  padding: spacing.xs,
  backgroundColor: colors.background,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: colors.primary,
  flex: 1,
}))

const $renameButton = themed<ViewStyle>(({ colors, spacing }) => ({
  padding: spacing.xxs,
  borderRadius: 4,
  backgroundColor: colors.neutralVery,
  cursor: "pointer",
}))
