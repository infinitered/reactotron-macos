import { Text, ViewStyle, ScrollView, TextStyle, View, Pressable } from "react-native"
import { themed } from "../theme/theme"
import { useGlobal } from "../state/useGlobal"
import type { CustomCommand } from "../types"
import { sendToClient } from "../state/connectToServer"

export function CustomCommandsScreen() {
  // Persist custom commands across app restarts
  const [customCommands] = useGlobal<CustomCommand[]>("custom-commands", [], {
    persist: true,
  })

  // Get client data to show client names
  const [clientIds] = useGlobal<string[]>("clientIds", [])

  const getClientName = (clientId?: string) => {
    if (!clientId) return "Unknown Client"
    const [clientData] = useGlobal<any>(`client-${clientId}`, {})
    return clientData?.name || clientId
  }

  const sendCommand = (command: CustomCommand) => {
    if (!command.clientId) return

    // Send the custom command to the client
    // The client will receive this as a custom command execution
    sendToClient(
      "custom.command",
      {
        command: command.command,
        // TODO: Add support for args when we implement argument input
      },
      command.clientId,
    )
  }

  return (
    <ScrollView contentContainerStyle={$container()}>
      <View style={$header()}>
        <Text style={$title()}>Custom Commands</Text>
      </View>

      <View style={$commandsList()}>
        <Text>
          {customCommands.length === 0
            ? "When your app registers a custom command it will show here!"
            : `${customCommands.length} ${
                customCommands.length === 1 ? "command" : "commands"
              } registered`}
        </Text>
        {customCommands.map((cmd) => (
          <View key={cmd.id} style={$commandItem()}>
            <View style={$commandInfo()}>
              <Text style={$commandTitle()}>{cmd.title || cmd.command}</Text>
              <Text style={$commandDescription()}>
                {cmd.description || `Command: ${cmd.command}`}
                {cmd.args && cmd.args.length > 0 && (
                  <Text style={$commandArgs()}>
                    {"\n"}Args: {cmd.args.map((arg) => `${arg.name} (${arg.type})`).join(", ")}
                  </Text>
                )}
              </Text>
              <Pressable style={$sendButton()} onPress={() => sendCommand(cmd)}>
                <Text style={$sendButtonText()}>Send Command</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const $container = themed<ViewStyle>(({ spacing }) => ({
  padding: spacing.xl,
  flex: 1,
}))

const $header = themed<ViewStyle>(({ spacing }) => ({
  marginBottom: spacing.md,
}))

const $title = themed<TextStyle>(({ colors, typography, spacing }) => ({
  fontSize: 20,
  fontWeight: "bold",
  color: colors.mainText,
  fontFamily: typography.code.normal,
  marginTop: spacing.xl,
}))

const $commandsList = themed<ViewStyle>(({ spacing }) => ({
  gap: spacing.md,
}))

const $emptyText = themed<TextStyle>(({ colors, spacing, typography }) => ({
  color: colors.neutral,
  textAlign: "center",
  marginTop: spacing.xl,
  fontSize: typography.subheading,
}))

const $commandItem = themed<ViewStyle>(({ colors, spacing }) => ({
  backgroundColor: colors.cardBackground,
  padding: spacing.lg,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
}))

const $commandInfo = themed<ViewStyle>(({ spacing }) => ({
  flex: 1,
  gap: spacing.sm,
}))

const $commandTitle = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.mainText,
  fontSize: typography.subheading,
  fontWeight: "600",
}))

const $commandCommand = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.primary,
  fontSize: typography.body,
  fontFamily: typography.code.normal,
}))

const $commandDescription = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.neutral,
  fontSize: typography.body,
}))

const $subtitle = themed<TextStyle>(({ typography, colors, spacing }) => ({
  fontSize: typography.body,
  color: colors.neutral,
  marginTop: spacing.xs,
}))

const $commandHeader = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.xs,
}))

const $commandClient = themed<TextStyle>(({ colors, typography, spacing }) => ({
  fontSize: typography.small,
  color: colors.primary,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  backgroundColor: colors.neutralVery,
  borderRadius: 4,
}))

const $argsContainer = themed<ViewStyle>(({ spacing }) => ({
  marginTop: spacing.sm,
  gap: spacing.xxs,
}))

const $argsLabel = themed<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.small,
  color: colors.neutral,
  fontWeight: "600",
}))

const $argItem = themed<TextStyle>(({ colors, typography, spacing }) => ({
  fontSize: typography.small,
  color: colors.neutral,
  fontFamily: typography.code.normal,
  marginLeft: spacing.sm,
}))

const $sendButton = themed<ViewStyle>(({ colors, spacing }) => ({
  backgroundColor: colors.neutralVery,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: 6,
  alignSelf: "flex-start",
  cursor: "pointer",
}))

const $sendButtonText = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.mainText,
  fontSize: typography.body,
  fontWeight: "600",
}))

const $commandArgs = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.primary,
  fontSize: typography.small,
  fontFamily: typography.code.normal,
}))
