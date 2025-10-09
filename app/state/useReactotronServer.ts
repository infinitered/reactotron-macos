import { useEffect, useRef } from "react"
import IRRunShellCommand, {
  type ShellCommandOutputEvent,
  type ShellCommandCompleteEvent,
} from "../native/IRRunShellCommand/NativeIRRunShellCommand"
import IRReactotronServer from "../native/IRReactotronServer/NativeIRReactotronServer"

const SERVER_TASK_ID = "reactotron-server"
const DEFAULT_PORT = "9292"

/**
 * Hook to manage the Reactotron server lifecycle.
 * Starts the server when the component mounts and stops it when it unmounts.
 */
export function useReactotronServer(port: string = DEFAULT_PORT) {
  const serverStartedRef = useRef(false)

  useEffect(() => {
    // Prevent double-start in development mode (React strict mode)
    if (serverStartedRef.current) {
      return
    }

    const startServer = () => {
      try {
        // Get the bundled server path
        const bundlePath = IRReactotronServer.getBundlePath()
        if (!bundlePath) {
          console.error(
            "❌ Reactotron server bundle not found. Run 'npm run bundle-server' to generate it.",
          )
          return
        }

        // Get the user's shell for proper PATH resolution
        const shellPath = IRRunShellCommand.getUserShell()
        console.log(`Starting Reactotron server with shell: ${shellPath}`)

        // Start the server using runTaskWithCommand with shell support
        IRRunShellCommand.runTaskWithCommand("node", [bundlePath, "--port", port], {
          shell: shellPath,
          shellArgs: ["-l", "-i"], // Login shell flags to load PATH
          taskId: SERVER_TASK_ID,
        })

        serverStartedRef.current = true
        console.log(`✅ Reactotron server starting on port ${port}`)
      } catch (error) {
        console.error("❌ Failed to start Reactotron server:", error)
      }
    }

    // Subscribe to server output events
    const outputSubscription = IRRunShellCommand.onShellCommandOutput(
      (event: ShellCommandOutputEvent) => {
        if (event.taskId === SERVER_TASK_ID) {
          const prefix = event.type === "stderr" ? "[Server Error]" : "[Server]"
          console.log(`${prefix} ${event.output.trim()}`)
        }
      },
    )

    // Subscribe to server completion events
    const completeSubscription = IRRunShellCommand.onShellCommandComplete(
      (event: ShellCommandCompleteEvent) => {
        if (event.taskId === SERVER_TASK_ID) {
          console.log(`Reactotron server exited with code: ${event.exitCode}`)
          serverStartedRef.current = false
        }
      },
    )

    // Start the server
    startServer()

    // Cleanup function
    return () => {
      outputSubscription.remove()
      completeSubscription.remove()

      // Kill the server task when the component unmounts
      if (serverStartedRef.current) {
        console.log("Stopping Reactotron server...")
        IRRunShellCommand.killTaskWithId(SERVER_TASK_ID)
        serverStartedRef.current = false
      }
    }
  }, [port])
}
