/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useRef, useState } from "react"
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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface TestCardProps {
  title: string
  description: string
  onPress: () => void
}

function TestCard(props: TestCardProps) {
  return (
    <View style={$testCardContainer}>
      <View style={$testCard}>
        <View style={$testAccentBar} />
        <View style={$testCardContent}>
          <TouchableOpacity style={$button} onPress={props.onPress}>
            <Text style={$buttonText}>▶️ Run</Text>
          </TouchableOpacity>
          <View style={$testCardText}>
            <Text style={$testLabel}>{props.title}</Text>
            <Text style={$testDesc}>{props.description}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

function App(): React.JSX.Element {
  const p = console.tron.log
  const shell = (cmd: string) => IRRunShellCommand.runSync(cmd)?.trim()
  const shellAsync = (cmd: string) => IRRunShellCommand.runAsync(cmd).then((r) => r?.trim())
  const [nodeVersion, setNodeVersion] = useState<string | null>(null)
  const [bunVersion, setBunVersion] = useState<string | null>(null)
  const arch = (global as any)?.nativeFabricUIManager ? "Fabric" : "Paper"
  const [activeTab, setActiveTab] = useState("Example1")
  const pid = useRef<string | null>(null)

  // const fonts = IRFontList.getFontListSync()

  // Test the regular command functionality
  const testRegularCommands = () => {
    p("Testing regular commands...")

    const p1: number = performance.now()
    const bun: string = shell("bun --version")
    const p1b: number = performance.now() - p1

    const p2: number = performance.now()
    const node: string = shell("node --version")
    const p2b: number = performance.now() - p2

    p(`Bun: ${bun} in ${p1b}ms`)
    p(`Node: ${node} in ${p2b}ms`)

    setNodeVersion(node)
    setBunVersion(bun)

    // Test async command
    const p3: number = performance.now()
    shellAsync("node --version")
      .then((result: string) => {
        const p3b: number = performance.now() - p3
        p(`Async result: ${result} in ${p3b}ms`)
      })
      .catch((error: any) => p(`Async error: ${error}`))
  }

  const testStartNodeServer = async () => {
    const port = 9095
    const host = "localhost"
    const path = "/"

    const startServerScript = `
      // REACTOTRON_CORE_SERVER
      const { startReactotronServer } = require("${IRRunShellCommand.appPath()}/Contents/Resources/reactotron-server.js")
      startReactotronServer({
        port: ${port}, 
        host: "${host}",
        path: "${path}",
      })
    `

    p("Starting Node HTTP server...")
    // This won't return until the server is done
    console.tron.log(startServerScript)
    shellAsync(`node -e '${startServerScript}'`)
      .then((r) => {
        p(`Node server stopped from PID: ${pid.current}`)
        if (__DEV__) {
          console.tron.display({
            name: `Node server output`,
            value: r,
            preview: r.slice(0, 100),
            important: true,
          })
        }
      })
      .catch((e) => {
        p(`Error starting Node server: ${e}`)
        if (__DEV__) {
          console.tron.display({
            name: `Node server error`,
            value: e,
            important: true,
          })
        }
      })

    // Wait for the server to start
    // await delay(1)

    const p1: number = performance.now()
    pid.current = await shellAsync(
      `ps aux | grep 'REACTOTRON_CORE_SERVER' | grep -v grep | awk '{print $2}'`,
    )
    const p1b: number = performance.now() - p1

    // Get the PID of the server
    p(`Node HTTP server PID: ${pid.current} in ${p1b}ms`)

    // Kill that process on shutdown
    IRRunShellCommand.runCommandOnShutdown(`kill -9 ${pid.current}`)

    // const grep = await shellAsync(`ps aux | grep ${pid}`)
    // p(`Node HTTP server grep for ${pid}: ${grep}`)
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
              <View
                style={[$dot, nodeVersion === null ? $dotGray : nodeVersion ? $dotGreen : $dotRed]}
              />
              <Text style={$statusText}>Node {nodeVersion}</Text>
            </View>
            <View style={$divider} />
            <View style={$statusItem}>
              <View
                style={[$dot, bunVersion === null ? $dotGray : bunVersion ? $dotGreen : $dotRed]}
              />
              <Text style={$statusText}>Bun {bunVersion}</Text>
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
          <TestCard
            title="Test Regular Commands"
            description="Tests sync and async command execution"
            onPress={testRegularCommands}
          />
          <TestCard
            title="Start Node HTTP Server"
            description="Starts a Node HTTP server at localhost:9000"
            onPress={testStartNodeServer}
          />
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
const $dotGray: ViewStyle = { backgroundColor: colors.gray }
const $dotGreen: ViewStyle = { backgroundColor: colors.green }
const $dotRed: ViewStyle = { backgroundColor: colors.red }
const $dotOrange: ViewStyle = { backgroundColor: colors.orange }
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
