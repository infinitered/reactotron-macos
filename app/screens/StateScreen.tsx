import { Text, ViewStyle, ScrollView, TextStyle, Pressable, View } from "react-native"
import { themed } from "../theme/theme"
import { sendToCore } from "../state/connectToServer"
import { useGlobal } from "../state/useGlobal"
import { TreeViewWithProvider } from "../components/TreeView"

export function StateScreen() {
  const [stateValues, setStateValues] = useGlobal<Record<string, any>>("stateValues", {})

  return (
    <ScrollView contentContainerStyle={$container()}>
      <View style={$header()}>
        <Text style={$title()}>State</Text>
        <View style={$buttonsContainer()}>
          <Pressable
            style={$button()}
            onPress={() => sendToCore("state.values.request", { path: "" })}
          >
            <Text>Request Full State</Text>
          </Pressable>
          <Pressable style={$button()} onPress={() => setStateValues({})}>
            <Text>Clear State</Text>
          </Pressable>
        </View>
      </View>
      <View style={$stateContainer()}>
        {Object.keys(stateValues).length > 0 ? (
          <TreeViewWithProvider data={stateValues} />
        ) : (
          <Text>State is empty</Text>
        )}
      </View>
    </ScrollView>
  )
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

const $stateContainer = themed<ViewStyle>(({ spacing }) => ({
  marginTop: spacing.xl,
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
