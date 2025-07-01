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
  AppState,
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
  const [nodeVersion, setNodeVersion] = useState<string | null>(null)
  const [bunVersion, setBunVersion] = useState<string | null>(null)
  const arch = global?.nativeFabricUIManager ? "Fabric" : "Paper"
  const [activeTab, setActiveTab] = useState("Example1")
  const [countdownPID, setCountdownPID] = useState<string | null>(null)

  useEffect(() => {
    // Check Node
    try {
      const nodePath = IRRunShellCommand.runSync("which node")
      const nodeVersion = nodePath ? IRRunShellCommand.runSync(`node -v`).trim() : null
      setNodeVersion(nodeVersion)
    } catch {
      setNodeVersion(false)
    }
    // Check Bun
    try {
      const bunPath = IRRunShellCommand.runSync("which bun")
      const bunVersion = bunPath ? IRRunShellCommand.runSync(`bun -v`).trim() : null
      setBunVersion(bunVersion)
    } catch {
      setBunVersion(false)
    }
  }, [setNodeVersion, setBunVersion])

  // Handle app state changes to kill countdown when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        if (countdownPID) {
          p("App going to background, killing countdown process...")
          IRRunShellCommand.killProcess(countdownPID)
            .then((result) => {
              p(`Killed countdown process: ${JSON.stringify(result)}`)
              setCountdownPID(null)
            })
            .catch((error) => {
              p(`Failed to kill countdown process: ${error}`)
            })
        }
      }
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange)
    return () => subscription?.remove()
  }, [countdownPID])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownPID) {
        p("Component unmounting, killing countdown process...")
        IRRunShellCommand.killProcess(countdownPID)
          .then((result) => {
            p(`Killed countdown process on unmount: ${JSON.stringify(result)}`)
          })
          .catch((error) => {
            p(`Failed to kill countdown process on unmount: ${error}`)
          })
      }
    }
  }, [countdownPID])

  // const fonts = IRFontList.getFontListSync()

  // Test the long-running command functionality
  const testLongRunningCommand = () => {
    // p("Starting long-running command test...")
    // // Start a simple long-running process using the new API
    // IRRunShellCommand.runTaskWithCommand(
    //   "/bin/bash", // command
    //   ["-c", "for i in {1..3}; do echo 'Test output $i'; sleep 1; done"], // arguments
    //   (output: string, typeOfOutput: string) => {
    //     p(`[${typeOfOutput}] ${output.trim()}`)
    //   },
    //   (terminationStatus: number) => {
    //     if (terminationStatus === 0) {
    //       p("✅ Long-running command completed successfully")
    //     } else {
    //       p(`❌ Long-running command failed with status: ${terminationStatus}`)
    //     }
    //   },
    // )
  }

  // Test the regular command functionality
  const testRegularCommands = () => {
    p("Testing regular commands...")

    const bun: string = IRRunShellCommand.runSync("which bun").trim()
    const node: string = IRRunShellCommand.runSync("which node").trim()

    // a script that does a countdown from 10 to 0 using "say"
    const countdownShellScript = `
      for i in {10..0}; do
        say -v "Samantha" "$i"
        sleep 1
      done
    `

    // Use the new PID-based method
    IRRunShellCommand.runAsyncWithPID(countdownShellScript)
      .then((result: any) => {
        p(`Countdown started with PID: ${result.pid}`)
        setCountdownPID(result.pid)
      })
      .catch((error: any) => {
        p(`Failed to start countdown: ${error}`)
      })

    p(`Bun: ${bun}`)
    p(`Node: ${node}`)

    // Test async command
    IRRunShellCommand.runAsync("echo 'Hello from async command!'")
      .then((result: string) => {
        p(`Async result: ${result}`)
      })
      .catch((error: any) => {
        p(`Async error: ${error}`)
      })
  }

  // Test killing the countdown process
  const testKillCountdown = () => {
    if (countdownPID) {
      p(`Killing countdown process with PID: ${countdownPID}`)
      IRRunShellCommand.killProcess(countdownPID)
        .then((result) => {
          p(`Killed countdown process: ${JSON.stringify(result)}`)
          setCountdownPID(null)
        })
        .catch((error) => {
          p(`Failed to kill countdown process: ${error}`)
        })
    } else {
      p("No countdown process running")
    }
  }

  // Test killall functionality
  const testKillAllSay = () => {
    p("Killing all 'say' processes...")
    IRRunShellCommand.killAllProcesses("say")
      .then((result) => {
        p(`Killed all say processes: ${JSON.stringify(result)}`)
        setCountdownPID(null)
      })
      .catch((error) => {
        p(`Failed to kill say processes: ${error}`)
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
              <View style={[$dot, nodeVersion ? $dotGreen : $dotRed]} />
              <Text style={$statusText}>Node {nodeVersion}</Text>
            </View>
            <View style={$divider} />
            <View style={$statusItem}>
              <View style={[$dot, bunVersion ? $dotGreen : $dotRed]} />
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

          {/* Countdown Status */}
          {countdownPID && (
            <View style={$countdownStatus}>
              <Text style={$countdownText}>Countdown running (PID: {countdownPID})</Text>
            </View>
          )}

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
            {countdownPID && (
              <View style={$testCard}>
                <View style={[$testAccentBar, { backgroundColor: colors.red }]} />
                <View style={$testCardContent}>
                  <TouchableOpacity style={$button} onPress={testKillCountdown}>
                    <Text style={$buttonText}>🛑 Kill</Text>
                  </TouchableOpacity>
                  <View style={$testCardText}>
                    <Text style={$testLabel}>Kill Countdown Process</Text>
                    <Text style={$testDesc}>Kills the countdown process by PID</Text>
                  </View>
                </View>
              </View>
            )}
            <View style={$testCard}>
              <View style={[$testAccentBar, { backgroundColor: colors.red }]} />
              <View style={$testCardContent}>
                <TouchableOpacity style={$button} onPress={testKillAllSay}>
                  <Text style={$buttonText}>🛑 Kill All</Text>
                </TouchableOpacity>
                <View style={$testCardText}>
                  <Text style={$testLabel}>Kill All Say Processes</Text>
                  <Text style={$testDesc}>Uses killall to stop all say processes</Text>
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

const $countdownStatus: ViewStyle = {
  backgroundColor: colors.orangeLight,
  padding: 12,
  borderRadius: 8,
  marginBottom: 24,
  borderLeftWidth: 4,
  borderLeftColor: colors.orange,
}
const $countdownText: TextStyle = {
  fontSize: 14,
  color: colors.orange,
  fontWeight: "600",
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
