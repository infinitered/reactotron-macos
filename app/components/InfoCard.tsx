/**
 * InfoCard component
 *
 * Likely to be removed; double-check that it is even used.
 */
import { Pressable, Text, TextStyle, View, ViewStyle } from "react-native"
import { useThemeName, withTheme } from "../theme/theme"

interface InfoCardProps {
  title: string
  description: string
  onPress: () => void
}

export function InfoCard(props: InfoCardProps) {
  const [theme] = useThemeName()

  return (
    <View style={$cardContainer(theme)}>
      <View style={$card(theme)}>
        <View style={$accentBar(theme)} />
        <View style={$cardContent(theme)}>
          <Pressable style={$button(theme)} onPress={props.onPress}>
            <Text style={$buttonText(theme)}>▶️ Run</Text>
          </Pressable>
          <View style={$cardText(theme)}>
            <Text style={$testLabel(theme)}>{props.title}</Text>
            <Text style={$testDesc(theme)}>{props.description}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const $cardContainer = withTheme<ViewStyle>(() => ({
  gap: 24,
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
}))

const $card = withTheme<ViewStyle>(({ colors }) => ({
  flex: 1,
  flexDirection: "row",
  alignItems: "stretch",
  backgroundColor: colors.cardBackground,
  borderRadius: 14,
  marginBottom: 24,
  shadowColor: "#000",
  shadowOpacity: 0.03,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  overflow: "hidden",
}))
const $accentBar = withTheme<ViewStyle>(({ colors }) => ({
  width: 6,
  backgroundColor: colors.primary,
  borderTopLeftRadius: 14,
  borderBottomLeftRadius: 14,
}))
const $cardContent = withTheme<ViewStyle>(() => ({
  flex: 1,
  padding: 18,
  justifyContent: "space-between",
  flexDirection: "row",
  alignItems: "center",
  gap: 16,
}))
const $cardText = withTheme<ViewStyle>(() => ({
  flex: 1,
  justifyContent: "center",
}))
const $testLabel = withTheme<TextStyle>(({ colors }) => ({
  fontSize: 17,
  fontWeight: "700",
  marginBottom: 4,
  color: colors.mainText,
}))
const $testDesc = withTheme<TextStyle>(({ colors }) => ({
  fontSize: 14,
  color: colors.neutral,
  marginBottom: 16,
}))

const $button = withTheme<ViewStyle>(({ colors }) => ({
  backgroundColor: colors.primary,
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 18,
  alignSelf: "flex-start",
  marginTop: 2,
  shadowColor: colors.primary,
  shadowOpacity: 0.08,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
}))

const $buttonText = withTheme<TextStyle>(({ typography, colors }) => ({
  color: colors.background,
  fontWeight: "bold",
  fontSize: typography.body,
  letterSpacing: 0.2,
}))
