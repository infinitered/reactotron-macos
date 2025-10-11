import { Text, View, ViewStyle, TextStyle } from "react-native"
import { themed } from "../theme/theme"
import { Icon, IconTypes } from "./Icon"

interface EmptyStateProps {
  icon: IconTypes
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View style={$container()}>
      <Icon icon={icon} size={64} />
      <Text style={$title()}>{title}</Text>
      <Text style={$description()}>{description}</Text>
    </View>
  )
}

const $container = themed<ViewStyle>(({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xxxl,
  paddingHorizontal: spacing.xl,
}))

const $title = themed<TextStyle>(({ colors, typography, spacing }) => ({
  fontSize: typography.heading,
  fontWeight: "600",
  color: colors.neutral,
  marginTop: spacing.lg,
  marginBottom: spacing.sm,
}))

const $description = themed<TextStyle>(({ colors, typography, spacing }) => ({
  fontSize: typography.body,
  fontWeight: "400",
  color: colors.neutral,
  textAlign: "center",
  maxWidth: 400,
  lineHeight: typography.body * 1.5,
}))
