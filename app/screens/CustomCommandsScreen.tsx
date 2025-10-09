import { Text, ViewStyle, ScrollView, TextStyle, View, Pressable, TextInput } from "react-native"
import { themed, useTheme } from "../theme/theme"
import { useGlobal } from "../state/useGlobal"
import type { CustomCommand } from "../types"
import { sendToClient } from "../state/connectToServer"
import { useState, useMemo } from "react"
import { Icon } from "../components/Icon"

export function CustomCommandsScreen() {
  const [customCommands] = useGlobal<CustomCommand[]>("customCommands", [], {
    persist: true,
  })
  const [argumentValues, setArgumentValues] = useState<Record<number, Record<string, string>>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [searchVisible, setSearchVisible] = useState(false)
  const theme = useTheme()

  const updateArgValue = (commandId: number, argName: string, value: string) => {
    setArgumentValues((prev) => ({
      ...prev,
      [commandId]: {
        ...prev[commandId],
        [argName]: value,
      },
    }))
  }

  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) {
      return customCommands
    }

    const query = searchQuery.toLowerCase()
    return customCommands.filter((cmd) => {
      const title = (cmd.title || cmd.command).toLowerCase()
      const description = (cmd.description || "").toLowerCase()
      return title.includes(query) || description.includes(query)
    })
  }, [customCommands, searchQuery])

  const sendCommand = (command: CustomCommand) => {
    if (!command.clientId) return

    const args = argumentValues[command.id] || {}

    sendToClient(
      "custom",
      {
        command: command.command,
        args: args,
      },
      command.clientId,
    )
  }

  const toggleSearch = () => {
    setSearchVisible(!searchVisible)
    if (searchVisible) {
      setSearchQuery("")
    }
  }

  return (
    <ScrollView contentContainerStyle={$container()}>
      <View style={$header()}>
        <View style={$headerRow()}>
          <Text style={$title()}>Custom Commands</Text>
          <Pressable onPress={toggleSearch} style={$searchButton()}>
            <Icon icon="search" size={20} color={theme.colors.neutral} />
          </Pressable>
        </View>
        {searchVisible && (
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search commands..."
            style={$searchInput()}
            autoFocus
          />
        )}
      </View>

      <View style={$commandsList()}>
        <Text style={$commandsListTitle()}>
          {customCommands.length === 0
            ? "When your app registers a custom command it will show here!"
            : `${filteredCommands.length} of ${customCommands.length} ${
                customCommands.length === 1 ? "command" : "commands"
              }${searchQuery ? " matching search" : ""}`}
        </Text>
        {filteredCommands.map((cmd) => (
          <View key={cmd.id} style={$commandItem()}>
            <Text style={$commandTitle()}>{cmd.title || cmd.command}</Text>
            <Text style={$commandDescription()}>
              {cmd.description || `Command: ${cmd.command}`}
            </Text>
            {cmd.args && cmd.args.length > 0 && (
              <View>
                <Text style={$argsLabel()}>Arguments:</Text>
                {cmd.args.map((arg) => (
                  <View key={arg.name} style={$argInputContainer()}>
                    <Text style={$commandArgs()}>
                      {arg.name} ({arg.type}):
                    </Text>
                    <TextInput
                      value={argumentValues[cmd.id]?.[arg.name] || ""}
                      onChangeText={(value) => updateArgValue(cmd.id, arg.name, value)}
                      placeholder={`Enter ${arg.name} value`}
                      style={$argInput()}
                    />
                  </View>
                ))}
              </View>
            )}
            <Pressable style={$sendButton()} onPress={() => sendCommand(cmd)}>
              <Text style={$sendButtonText()}>Send Command</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const $container = themed<ViewStyle>(({ spacing }) => ({
  padding: spacing.xl,
}))

const $header = themed<ViewStyle>(({ spacing }) => ({
  marginBottom: spacing.md,
  gap: spacing.sm,
}))

const $headerRow = themed<ViewStyle>(() => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}))

const $searchButton = themed<ViewStyle>(({ spacing, colors }) => ({
  padding: spacing.xs,
  cursor: "pointer",
  color: colors.mainText,
}))

const $searchInput = themed<TextStyle>(({ colors, typography, spacing }) => ({
  fontSize: typography.body,
  color: colors.mainText,
  fontFamily: typography.code.normal,
  backgroundColor: colors.neutralVery,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: colors.border,
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

const $commandsListTitle = themed<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.body,
  fontWeight: "600",
  color: colors.mainText,
}))

const $commandItem = themed<ViewStyle>(({ colors, spacing }) => ({
  backgroundColor: colors.cardBackground,
  padding: spacing.lg,
  gap: spacing.md,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
}))

const $commandTitle = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.mainText,
  fontSize: typography.heading,
  fontWeight: "600",
}))

const $commandDescription = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.neutral,
  fontSize: typography.subheading,
}))

const $argsLabel = themed<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.body,
  color: colors.neutral,
  fontWeight: "600",
}))

const $argInput = themed<TextStyle>(({ colors, typography, spacing }) => ({
  fontSize: typography.caption,
  color: colors.mainText,
  fontFamily: typography.code.normal,
  backgroundColor: colors.neutralVery,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: colors.border,
  flex: 1,
}))

const $argInputContainer = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginTop: spacing.xs,
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
  fontSize: typography.body,
  fontFamily: typography.code.normal,
}))
