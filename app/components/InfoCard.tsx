/**
 * InfoCard component
 *
 * Likely to be removed; double-check that it is even used.
 */
import { Pressable, Text, TextStyle, View, ViewStyle } from "react-native"
import { colors } from "../theme/colors"

interface InfoCardProps {
  title: string
  description: string
  onPress: () => void
}

export function InfoCard(props: InfoCardProps) {
  return (
    <View style={$cardContainer}>
      <View style={$card}>
        <View style={$accentBar} />
        <View style={$cardContent}>
          <Pressable style={$button} onPress={props.onPress}>
            <Text style={$buttonText}>▶️ Run</Text>
          </Pressable>
          <View style={$cardText}>
            <Text style={$testLabel}>{props.title}</Text>
            <Text style={$testDesc}>{props.description}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const $cardContainer: ViewStyle = {
  gap: 24,
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
}

const $card: ViewStyle = {
  flex: 1,
  flexDirection: "row",
  alignItems: "stretch",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 14,
  marginBottom: 24,
  shadowColor: "#000",
  shadowOpacity: 0.03,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  overflow: "hidden",
}
const $accentBar: ViewStyle = {
  width: 6,
  backgroundColor: colors.green,
  borderTopLeftRadius: 14,
  borderBottomLeftRadius: 14,
}
const $cardContent: ViewStyle = {
  flex: 1,
  padding: 18,
  justifyContent: "space-between",
  flexDirection: "row",
  alignItems: "center",
  gap: 16,
}
const $cardText: ViewStyle = {
  flex: 1,
  justifyContent: "center",
}
const $testLabel: TextStyle = {
  fontSize: 17,
  fontWeight: "700",
  marginBottom: 4,
  color: colors.palette.neutral300,
}
const $testDesc: TextStyle = {
  fontSize: 14,
  color: colors.palette.neutral300,
  marginBottom: 16,
}
const $button: ViewStyle = {
  backgroundColor: colors.palette.accent500,
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 18,
  alignSelf: "flex-start",
  marginTop: 2,
  shadowColor: colors.palette.accent500,
  shadowOpacity: 0.08,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
}
const $buttonText: TextStyle = {
  color: "#FFF",
  fontWeight: "bold",
  fontSize: 16,
  letterSpacing: 0.2,
}
