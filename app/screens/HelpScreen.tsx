import { View, Text, ViewStyle, TextStyle, Pressable, Linking, ScrollView } from "react-native"
import { themed, useTheme } from "../theme/theme"
import { Icon, IconTypes } from "../components/Icon"

export function HelpScreen() {
  return (
    <ScrollView style={$container()}>
      <View style={$connectContainer()}>
        <Text style={$title()}>{"Let's Connect!"}</Text>
        <View style={$divider()} />
        <View style={$connectRow()}>
          <ConnectItem
            icon="gitHub"
            title="GitHub Docs"
            url="https://github.com/infinitered/reactotron"
          />
          <ConnectItem
            icon="messageSquare"
            title="Feedback"
            url="https://github.com/infinitered/reactotron/issues/new/choose"
          />
          <ConnectItem
            icon="squirrel"
            title="Updates"
            url="https://github.com/infinitered/reactotron/releases"
          />
          <ConnectItem icon="xLogo" title="@reactotron" url="https://x.com/reactotron" />
        </View>
        <Text style={$title()}>Keystrokes</Text>
        <View style={$divider()} />
        <View style={$keystrokesContainer()}>
          <Text style={$keystrokeSectionTitle()}>Navigation</Text>
          <KeystrokeItem title="Toggle Sidebar" keystrokes={["⌘", "b"]} />
          {__DEV__ ? <KeystrokeItem title="Toggle Dev Menu" keystrokes={["⇧", "⌘", "d"]} /> : null}
          <KeystrokeItem title="Logs Tab" keystrokes={["⌘", "1"]} />
          <KeystrokeItem title="Network Tab" keystrokes={["⌘", "2"]} />
          <KeystrokeItem title="Performance Tab" keystrokes={["⌘", "3"]} />
          <KeystrokeItem title="Plugins Tab" keystrokes={["⌘", "4"]} />
          <KeystrokeItem title="Help Tab" keystrokes={["⌘", "5"]} />
          <Text style={$keystrokeSectionTitle()}>Timeline</Text>
          <KeystrokeItem title="Clear Timeline Items" keystrokes={["⌘", "k"]} />
        </View>
      </View>
    </ScrollView>
  )
}

function KeystrokeItem({ title, keystrokes }: { title: string; keystrokes: string[] }) {
  return (
    <View style={$keystrokeContainer()}>
      <View style={$keystrokeKeysContainer()}>
        {keystrokes.map((keystroke, index) => (
          <View key={`${title}-${keystroke}`}>
            <View style={$keystrokeKey()}>
              <Text style={$keystroke()}>{keystroke}</Text>
            </View>
            {index !== keystrokes.length - 1 && <Text style={$keystroke()}>+</Text>}
          </View>
        ))}
      </View>
      <Text style={$keystroke()}>{title}</Text>
    </View>
  )
}

function ConnectItem({ icon, title, url }: { icon: IconTypes; title: string; url: string }) {
  const theme = useTheme()
  return (
    <Pressable style={$connectItem()} onPress={() => Linking.openURL(url)}>
      <Icon icon={icon} size={24} color={theme.colors.mainText} />
      <Text style={$connectItemTitle()}>{title}</Text>
    </Pressable>
  )
}

const $connectItemTitle = themed<TextStyle>(({ colors, spacing }) => ({
  fontSize: 16,
  fontWeight: "bold",
  color: colors.mainText,
  marginTop: spacing.sm,
}))

const $title = themed<TextStyle>(({ colors, typography, spacing }) => ({
  fontSize: 20,
  fontWeight: "bold",
  color: colors.mainText,
  fontFamily: typography.code.normal,
  marginTop: spacing.xl,
}))

const $divider = themed<ViewStyle>(({ colors, spacing }) => ({
  height: 1,
  backgroundColor: colors.border,
  width: "100%",
  marginTop: spacing.md,
}))

const $container = themed<ViewStyle>(({ spacing }) => ({
  padding: spacing.xl,
  flex: 1,
}))

const $connectContainer = themed<ViewStyle>(({ spacing }) => ({
  paddingHorizontal: spacing.xl,
  paddingBottom: spacing.xl,
}))

const $connectRow = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: spacing.md,
  marginTop: spacing.xl,
  flexWrap: "wrap",
}))

const $connectItem = themed<ViewStyle>(({ spacing, colors }) => ({
  padding: spacing.xl,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.cardBackground,
  borderRadius: 8,
  flex: 1,
  minWidth: 160,
}))

const $keystrokesContainer = themed<ViewStyle>(({ spacing }) => ({
  justifyContent: "space-between",
  gap: spacing.md,
}))

const $keystrokeKey = themed<ViewStyle>(({ spacing, colors }) => ({
  padding: spacing.xs,
  backgroundColor: colors.cardBackground,
  borderRadius: 8,
  width: 40,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
}))

const $keystroke = themed<TextStyle>(({ colors, spacing }) => ({
  fontSize: 16,
  fontWeight: "bold",
  color: colors.mainText,
}))

const $keystrokeContainer = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: spacing.md,
  width: 400,
}))

const $keystrokeKeysContainer = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
}))

const $keystrokeSectionTitle = themed<TextStyle>(({ colors, spacing }) => ({
  fontSize: 16,
  fontWeight: "bold",
  color: colors.neutral,
  marginTop: spacing.xl,
}))
