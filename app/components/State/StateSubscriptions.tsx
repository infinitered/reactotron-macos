import { Text, ViewStyle, TextStyle, Pressable, View } from "react-native"
import { themed, useTheme } from "../../theme/theme"
import { TreeViewWithProvider } from "../TreeView"
import { Divider } from "../Divider"
import { Icon } from "../Icon"
import type { StateSubscription } from "app/types"
import { useGlobal } from "app/state/useGlobal"
import { sendToCore } from "app/state/connectToServer"

export function StateSubscriptions() {
  const theme = useTheme()
  const [stateSubscriptionsByClientId, setStateSubscriptionsByClientId] = useGlobal<{
    [clientId: string]: StateSubscription[]
  }>("stateSubscriptionsByClientId", {})
  const [activeClientId, _] = useGlobal("activeClientId", "")
  const clientStateSubscriptions = stateSubscriptionsByClientId[activeClientId] || []

  const removeSubscription = (path: string) => {
    const newStateSubscriptions = clientStateSubscriptions.filter((s) => s.path !== path)
    sendToCore("state.values.subscribe", {
      paths: newStateSubscriptions.map((s) => s.path),
      clientId: activeClientId,
    })
    setStateSubscriptionsByClientId((prev) => ({
      ...prev,
      [activeClientId]: newStateSubscriptions,
    }))
  }

  if (clientStateSubscriptions.length === 0) {
    return <Text style={$emptyStateText()}>State is empty</Text>
  }

  return (
    <>
      {clientStateSubscriptions.map((subscription, index) => (
        <View key={`${subscription.path}-${index}`} style={$stateItemContainer()}>
          <Text style={$pathText()}>{subscription.path ? subscription.path : "Full State"}</Text>
          <View style={$treeViewContainer()}>
            <View style={$treeViewInnerContainer()}>
              <TreeViewWithProvider data={subscription.value} />
            </View>
            <Pressable onPress={() => removeSubscription(subscription.path)}>
              <Icon icon="trash" size={20} color={theme.colors.mainText} />
            </Pressable>
          </View>
          {index < clientStateSubscriptions.length - 1 && <Divider extraStyles={$stateDivider()} />}
        </View>
      ))}
    </>
  )
}

const $pathText = themed<TextStyle>(({ colors, typography, spacing }) => ({
  fontSize: typography.body,
  fontWeight: "400",
  color: colors.mainText,
  marginBottom: spacing.sm,
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

const $stateDivider = themed<ViewStyle>(({ spacing }) => ({
  marginTop: spacing.lg,
}))

const $emptyStateText = themed<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.body,
  fontWeight: "400",
  color: colors.mainText,
}))
