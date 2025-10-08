import {
  Image,
  NativeModules,
  Pressable,
  Text,
  View,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from "react-native"
import { themed } from "../theme/theme"
import { Portal } from "./Portal"
import { getReactotronAppId } from "../state/connectToServer"
import Clipboard from "../native/IRClipboard/NativeIRClipboard"
import { useState } from "react"

interface AboutModalProps {
  visible: boolean
  onClose: () => void
}

export function AboutModal({ visible, onClose }: AboutModalProps) {
  const [copied, setCopied] = useState(false)
  if (!visible) return null

  const copyToClipboard = () => {
    Clipboard.setString(reactotronAppId)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const reactotronAppId = getReactotronAppId()
  const appVersion: string = require("../../package.json").version
  const appBuild: string =
    (NativeModules as any)?.PlatformConstants?.appBuildVersion ??
    (NativeModules as any)?.PlatformConstants?.CFBundleVersion ??
    ""

  return (
    <Portal name="about-modal">
      <View style={$backdrop()}>
        <Pressable style={$backdropTouchable} onPress={onClose} />

        <View style={$card()}>
          <View style={$header()}>
            <Image
              source={require("../../assets/images/reactotronLogo.png")}
              style={$logo()}
              resizeMode="contain"
            />
            <Text style={$title()}>Reactotron</Text>
            <Text style={$bodyText()}>Copyright © 2025 Infinite Red, Inc.</Text>
            <Text style={$bodyText()}>{`Version ${appVersion}${
              appBuild ? ` (${appBuild})` : ""
            }`}</Text>
            <Pressable
              style={[$uuidButton(), $button(), $linkContainer()]}
              onPress={copyToClipboard}
            >
              <Text style={$bodyText()}>{copied ? "Copied!" : `UUID: ${reactotronAppId}`}</Text>
            </Pressable>
          </View>

          <View style={$footer()}>
            <Pressable style={[$button(), $linkContainer()]} onPress={onClose}>
              <Text style={$buttonText()}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Portal>
  )
}

const $backdrop = themed<ViewStyle>(({ colors }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: colors.background,
  alignItems: "center",
  justifyContent: "center",
}))

const $backdropTouchable: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  cursor: "default",
}

const $card = themed<ViewStyle>(({ colors, spacing }) => ({
  width: 520,
  maxWidth: "90%",
  backgroundColor: colors.cardBackground,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: spacing.sm,
  overflow: "hidden",
}))

const $header = themed<ViewStyle>(({ spacing }) => ({
  alignItems: "center",
  padding: spacing.lg,
  gap: spacing.sm,
}))

const $logo = themed<ImageStyle>(() => ({
  width: 64,
  height: 64,
}))

const $title = themed<TextStyle>(({ typography, colors }) => ({
  fontSize: typography.heading,
  color: colors.mainText,
}))

const $bodyText = themed<TextStyle>(({ colors }) => ({
  color: colors.mainText,
}))

const $footer = themed<ViewStyle>(({ spacing, colors }) => ({
  borderTopColor: colors.border,
  borderTopWidth: 1,
  padding: spacing.md,
  alignItems: "flex-end",
}))

const $button = themed<ViewStyle>(({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 1,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  borderRadius: spacing.xs,
}))

const $buttonText = themed<TextStyle>(({ colors }) => ({
  color: colors.mainText,
}))

const $linkContainer = themed<ViewStyle>(() => ({
  cursor: "pointer",
}))

const $uuidButton = themed<ViewStyle>(({ spacing }) => ({
  marginTop: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  width: "90%",
}))
