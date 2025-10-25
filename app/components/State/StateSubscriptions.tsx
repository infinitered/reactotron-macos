import { Text, ViewStyle, TextStyle, Pressable, View } from "react-native"
import { themed, useTheme } from "../../theme/theme"
import { TreeViewWithProvider } from "../TreeView"
import { Divider } from "../Divider"
import { Icon } from "../Icon"
import type { StateSubscription } from "app/types"

interface StateSubscriptionsProps {
  subscriptions: StateSubscription[]
  onRemoveSubscription: (path: string) => void
}

export function StateSubscriptions({
  subscriptions,
  onRemoveSubscription,
}: StateSubscriptionsProps) {
  const theme = useTheme()

  if (subscriptions.length === 0) {
    return <Text style={$emptyStateText()}>State is empty</Text>
  }

  return (
    <>
      {subscriptions.map((subscription, index) => (
        <View key={`${subscription.path}-${index}`} style={$stateItemContainer()}>
          <Text style={$pathText()}>{subscription.path ? subscription.path : "Full State"}</Text>
          <View style={$treeViewContainer()}>
            <View style={$treeViewInnerContainer()}>
              <TreeViewWithProvider data={subscription.value} />
            </View>
            <Pressable onPress={() => onRemoveSubscription(subscription.path)}>
              <Icon icon="trash" size={20} color={theme.colors.mainText} />
            </Pressable>
          </View>
          {index < subscriptions.length - 1 && <Divider extraStyles={$stateDivider()} />}
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
