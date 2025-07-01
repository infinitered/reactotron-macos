/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useEffect, useState } from "react"
import {
  ScrollView,
  StatusBar,
  Text,
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from "react-native"

import IRRunShellCommand from "../specs/NativeIRRunShellCommand"

if (__DEV__) {
  // This is for debugging Reactotron with ... Reactotron!
  // Load Reactotron client in development only.
  // Note that you must be using metro's `inlineRequires` for this to work.
  // If you turn it off in metro.config.js, you'll have to manually import it.
  require("./devtools/ReactotronConfig.ts")
}

function App(): React.JSX.Element {
  const p = console.tron.log
  const [nodeInstalled, setNodeInstalled] = useState<boolean | null>(null)
  const [bunInstalled, setBunInstalled] = useState<boolean | null>(null)
  const arch = global?.nativeFabricUIManager ? "Fabric" : "Paper"
  const [activeTab, setActiveTab] = useState("Example1")

  useEffect(() => {
    // Check Node
    try {
      const nodePath = IRRunShellCommand.runSync("which node")
      setNodeInstalled(!!nodePath)
    } catch {
      setNodeInstalled(false)
    }
    // Check Bun
    try {
      const bunPath = IRRunShellCommand.runSync("which bun")
      setBunInstalled(!!bunPath)
    } catch {
      setBunInstalled(false)
    }
  }, [])

  // const fonts = IRFontList.getFontListSync()

  // Test the long-running command functionality
  const testLongRunningCommand = () => {
    p("Starting long-running command test...")

    // Start a simple long-running process using the new API
    IRRunShellCommand.runTaskWithCommand(
      "/bin/bash", // command
      ["-c", "for i in {1..3}; do echo 'Test output $i'; sleep 1; done"], // arguments
      (output: string, typeOfOutput: string) => {
        p(`[${typeOfOutput}] ${output.trim()}`)
      },
      (terminationStatus: number) => {
        if (terminationStatus === 0) {
          p("✅ Long-running command completed successfully")
        } else {
          p(`❌ Long-running command failed with status: ${terminationStatus}`)
        }
      },
    )
  }

  // Test the regular command functionality
  const testRegularCommands = () => {
    p("Testing regular commands...")

    const bun: string = IRRunShellCommand.runSync("which bun")
    const node: string = IRRunShellCommand.runSync("which node")

    // Test async command
    IRRunShellCommand.runAsync("echo 'Hello from async command!'")
      .then((result: string) => {
        p(`Async result: ${result}`)
      })
      .catch((error: any) => {
        p(`Async error: ${error}`)
      })
  }

  return (
    <View style={$root}>
      <StatusBar barStyle={"dark-content"} backgroundColor={colors.background} />
      {/* Tabs */}
      <View style={$tabBar}>
        <TouchableOpacity onPress={() => setActiveTab("Example1")}>
          <Text style={activeTab === "Example1" ? $tabActive : $tabInactive}>Example1</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("Example2")}>
          <Text style={activeTab === "Example2" ? $tabActive : $tabInactive}>Example2</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={$scrollView}>
        <View style={$dashboard}>
          {/* Status Row */}
          <View style={$statusRow}>
            <View style={$statusItem}>
              <View style={[$dot, nodeInstalled ? $dotGreen : $dotRed]} />
              <Text style={$statusText}>Node</Text>
            </View>
            <View style={$divider} />
            <View style={$statusItem}>
              <View style={[$dot, bunInstalled ? $dotGreen : $dotRed]} />
              <Text style={$statusText}>Bun</Text>
            </View>
            <View style={$divider} />
            <View style={$statusItem}>
              <View style={[$dot, arch === "Fabric" ? $dotGreen : $dotOrange]} />
              <Text style={$statusText}>{arch}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={$title}>IRRunShellCommand Tests</Text>

          {/* Test Cards */}
          <View style={$testCardContainer}>
            <View style={$testCard}>
              <View style={$testAccentBar} />
              <View style={$testCardContent}>
                <TouchableOpacity style={$button} onPress={testRegularCommands}>
                  <Text style={$buttonText}>▶️ Run</Text>
                </TouchableOpacity>
                <View style={$testCardText}>
                  <Text style={$testLabel}>Test Regular Commands</Text>
                  <Text style={$testDesc}>Tests sync and async command execution</Text>
                </View>
              </View>
            </View>
            <View style={$testCard}>
              <View style={[$testAccentBar, { backgroundColor: colors.orange }]} />
              <View style={$testCardContent}>
                <TouchableOpacity style={$button} onPress={testLongRunningCommand}>
                  <Text style={$buttonText}>▶️ Run</Text>
                </TouchableOpacity>
                <View style={$testCardText}>
                  <Text style={$testLabel}>Test Long-Running Command</Text>
                  <Text style={$testDesc}>Starts a ping command and monitors its output</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

// const $highlight: TextStyle = {
//   fontWeight: "700",
// }

// --- Styles ---
const colors = {
  background: "#FAFAFA",
  card: "#FFF",
  border: "#E0E0E0",
  orange: "#FF8800",
  orangeLight: "#FFF3E0",
  gray: "#888",
  grayLight: "#F5F5F5",
  green: "#3DDC91",
  red: "#FF5252",
}

const $root: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $tabBar: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 32,
  paddingTop: 18,
  paddingBottom: 8,
  gap: 16,
}
const $tabActive: TextStyle = {
  fontSize: 16,
  fontWeight: "700",
  color: colors.orange,
  borderBottomWidth: 3,
  borderBottomColor: colors.orange,
  paddingBottom: 6,
  marginRight: 16,
}
const $tabInactive: TextStyle = {
  fontSize: 16,
  fontWeight: "500",
  color: colors.gray,
  borderBottomWidth: 3,
  borderBottomColor: "transparent",
  paddingBottom: 6,
  marginRight: 16,
}

const $scrollView: ViewStyle = {
  flex: 1,
}

const $dashboard: ViewStyle = {
  margin: 24,
  padding: 32,
  backgroundColor: colors.card,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
}

const $statusRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
  marginBottom: 32,
  gap: 0,
}
const $statusItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  minWidth: 80,
  justifyContent: "center",
}
const $divider: ViewStyle = {
  width: 1,
  height: 24,
  backgroundColor: colors.border,
  marginHorizontal: 18,
  borderRadius: 1,
}
const $dot: ViewStyle = {
  width: 12,
  height: 12,
  borderRadius: 6,
  marginRight: 8,
  borderWidth: 1,
  borderColor: colors.border,
}
const $dotGreen: ViewStyle = { backgroundColor: colors.green }
const $dotRed: ViewStyle = { backgroundColor: colors.red }
const $dotOrange: ViewStyle = { backgroundColor: colors.orange }
const $dotGray: ViewStyle = { backgroundColor: colors.gray }
const $statusText: TextStyle = {
  fontSize: 16,
  color: colors.gray,
  fontWeight: "600",
}

const $title: TextStyle = {
  fontSize: 22,
  fontWeight: "bold",
  marginBottom: 28,
  textAlign: "center",
  color: colors.gray,
  letterSpacing: 0.2,
}

const $testCardContainer: ViewStyle = {
  gap: 24,
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
}

const $testCard: ViewStyle = {
  flex: 1,
  flexDirection: "row",
  alignItems: "stretch",
  backgroundColor: colors.grayLight,
  borderRadius: 14,
  marginBottom: 24,
  shadowColor: "#000",
  shadowOpacity: 0.03,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  overflow: "hidden",
}
const $testAccentBar: ViewStyle = {
  width: 6,
  backgroundColor: colors.green,
  borderTopLeftRadius: 14,
  borderBottomLeftRadius: 14,
}
const $testCardContent: ViewStyle = {
  flex: 1,
  padding: 18,
  justifyContent: "space-between",
  flexDirection: "row",
  alignItems: "center",
  gap: 16,
}
const $testCardText: ViewStyle = {
  flex: 1,
  justifyContent: "center",
}
const $testLabel: TextStyle = {
  fontSize: 17,
  fontWeight: "700",
  marginBottom: 4,
  color: colors.gray,
}
const $testDesc: TextStyle = {
  fontSize: 14,
  color: colors.gray,
  marginBottom: 16,
}
const $button: ViewStyle = {
  backgroundColor: colors.orange,
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 18,
  alignSelf: "flex-start",
  marginTop: 2,
  shadowColor: colors.orange,
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

export default App
