import { Text, ViewStyle, ScrollView, TextStyle, Pressable, View, TextInput } from "react-native"
import { themed } from "../theme/theme"

export function CustomCommandsScreen() {
  return (
    <ScrollView contentContainerStyle={$container()}>
      <Text>Custom Commands</Text>
    </ScrollView>
  )
}

const $container = themed<ViewStyle>(({ spacing }) => ({
  padding: spacing.xl,
  flex: 1,
}))
