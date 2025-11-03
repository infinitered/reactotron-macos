import { Text, ViewStyle, ScrollView, TextStyle, Pressable, View, TextInput } from "react-native"
import { themed } from "../theme/theme"
import { sendToCore } from "../state/connectToServer"
import { useGlobal } from "../state/useGlobal"
import { useState } from "react"
import { Divider } from "../components/Divider"
import { useKeyboardEvents } from "../utils/system"
import type { StateSubscription, Snapshot } from "app/types"
import { Tab } from "../components/Tab"
import { StateSubscriptions } from "../components/State/StateSubscriptions"
import { StateSnapshots } from "../components/State/StateSnapshots"
import IRClipboard from "../native/IRClipboard/NativeIRClipboard"
import { useSnapshots } from "../../app/state/useSnapshots"

type StateTab = "Subscriptions" | "Snapshots"

export function StateScreen() {
  const [showAddSubscription, setShowAddSubscription] = useState(false)
  const [activeStateTab] = useGlobal<StateTab>("activeStateTab", "Subscriptions")

  const [stateSubscriptionsByClientId, setStateSubscriptionsByClientId] = useGlobal<{
    [clientId: string]: StateSubscription[]
  }>("stateSubscriptionsByClientId", {})
  const [activeClientId, setActiveClient] = useGlobal("activeClientId", "")
  const { snapshots } = useSnapshots()

  const clientStateSubscriptions = stateSubscriptionsByClientId[activeClientId] || []

  const saveSubscription = (path: string) => {
    if (clientStateSubscriptions.some((s) => s.path === path)) return
    sendToCore("state.values.subscribe", {
      paths: [...clientStateSubscriptions.map((s) => s.path), path],
      clientId: activeClientId,
    })
  }

  const createSnapshot = () => {
    if (!activeClientId) return

    sendToCore("state.backup.request", { clientId: activeClientId })
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
                  [activeClientId]: [],
                }))
                sendToCore("state.values.subscribe", { paths: [], clientId: activeClientId })
                setActiveClient("")
              }}
            >
              <Text style={$buttonText()}>Clear State</Text>
            </Pressable>
          </View>
        ) : (
          <View style={$buttonsContainer()}>
            <Pressable style={$button()} onPress={() => copyAllSnapshotsToClipboard(snapshots)}>
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
        {activeStateTab === "Subscriptions" ? <StateSubscriptions /> : <StateSnapshots />}
      </View>
    </ScrollView>
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

function copyAllSnapshotsToClipboard(snapshots: Snapshot[]): void {
  try {
    IRClipboard.setString(JSON.stringify(snapshots))
  } catch (error) {
    console.error("Failed to copy snapshots to clipboard:", error)
  }
}

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
