import { Text, ViewStyle, ScrollView, TextStyle, Pressable, View, TextInput } from "react-native"
import { themed } from "../theme/theme"
import { sendToCore } from "../state/connectToServer"
import { useGlobal } from "../state/useGlobal"
import { TreeViewWithProvider } from "../components/TreeView"
import { useState } from "react"
import { Divider } from "../components/Divider"
import { useKeyboardEvents } from "../utils/system"
import { StateSubscription } from "app/types"
import { Icon } from "../components/Icon"

export function StateScreen() {
  const [showAddSubscription, setShowAddSubscription] = useState(false)

  const [stateSubscriptions, setStateSubscriptions] = useGlobal<StateSubscription[]>(
    "stateSubscriptions",
    [],
  )
  const [activeTab] = useGlobal("activeClientId", "")

  const saveSubscription = (path: string) => {
    if (stateSubscriptions.some((s) => s.path === path)) return
    sendToCore("state.values.subscribe", {
      paths: [...stateSubscriptions.map((s) => s.path), path],
      clientId: activeTab,
    })
  }

  const removeSubscription = (path: string) => {
    const newStateSubscriptions = stateSubscriptions.filter((s) => s.path !== path)
    sendToCore("state.values.subscribe", {
      paths: newStateSubscriptions.map((s) => s.path),
      clientId: activeTab,
    })
    setStateSubscriptions(newStateSubscriptions)
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
        <View style={$buttonsContainer()}>
          <Pressable style={$button()} onPress={() => setShowAddSubscription(true)}>
            <Text>Add Subscription</Text>
          </Pressable>
          <Pressable
            style={$button()}
            onPress={() => {
              setStateSubscriptions([])
              sendToCore("state.values.subscribe", { paths: [], clientId: activeTab })
            }}
          >
            <Text>Clear State</Text>
          </Pressable>
        </View>
      </View>
      <View style={$stateContainer()}>
        {stateSubscriptions.length > 0 ? (
          <>
            {stateSubscriptions.map((subscription, index) => (
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
                {index < stateSubscriptions.length - 1 && <Divider extraStyles={$stateDivider()} />}
              </View>
            ))}
          </>
        ) : (
          <Text>State is empty</Text>
        )}
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
              console.log("newText", newText)
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
