import { useCallback, useEffect, useRef } from "react"
import { useGlobal } from "./useGlobal"

interface ServerState {
  isConnected: boolean
  error: Error | null
  sendToClient: (message: string | object, payload?: object, clientId?: string) => void
  clientIds: string[]
}

let _sendToClient: (message: string | object, payload?: object, clientId?: string) => void

/**
 * Connects to the reactotron-core-server via websocket.
 *
 * Populates the following useGlobal state:
 * - isConnected: boolean
 * - error: Error | null
 * - clientIds: string[]
 * - logs: any[]
 *
 * This state is *not* persisted across app restarts.
 *
 * @param props.port - The port to connect to.
 * @returns The server state if you want to use it directly, but prefer
 * using useGlobal instead for fine-grained rerendering.
 */
export function useServer(props: { port: number } = { port: 9292 }): ServerState {
  const [isConnected, setIsConnected] = useGlobal("isConnected", false)
  const [error, setError] = useGlobal<Error | null>("error", null)
  const [clientIds, setClientIds] = useGlobal<string[]>("clientIds", [])
  const [_, setLogs] = useGlobal<any[]>("logs", [])
  const [sendToClient] = useGlobal("sendToClient", () => {})

  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:${props.port}`)
    if (!ws.current) throw new Error("Failed to connect to Reactotron server")

    ws.current.onopen = () => {
      // Tell the server we are a Reactotron app, not a React client.
      ws.current?.send(
        JSON.stringify({
          type: "reactotron.subscribe",
          payload: {
            name: "TODO -- Add Name Here?",
          },
        }),
      )
    }
    ws.current.onerror = (event) => setError(new Error(`WebSocket error: ${event.message}`))

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "reactotron.connected") {
        setIsConnected(true)
      }

      if (data.type === "connectionEstablished") {
        setClientIds((prev) => [...prev, data?.conn?.clientId ?? "Unknown"])
      }

      if (data.type === "command") {
        if (data.cmd.type === "log") {
          setLogs((prev) => [...prev, data.cmd.payload])
        }
      }

      if (__DEV__) {
        console.tron.logImportant({
          type: "recievedAnyMessage",
          data,
        })
      }
    }

    ws.current.onclose = () => {
      console.tron.log("Reactotron server disconnected")
      setIsConnected(false)
      setClientIds([])
    }

    return () => {
      ws.current?.close()
      ws.current = null
    }
  }, [props.port])

  _sendToClient = useCallback(
    (message: string | object, payload?: object, clientId?: string) => {
      if (!ws.current) {
        console.tron.log("Not connected to Reactotron server")
      } else {
        ws.current.send(JSON.stringify({ type: message, payload, clientId }))
      }
    },
    [ws],
  )

  return { isConnected, error, sendToClient: _sendToClient, clientIds }
}

export function sendToClient(message: string | object, payload?: object, clientId?: string) {
  if (!_sendToClient) throw new Error("sendToClient not initialized ... did you call useServer?")
  _sendToClient(message, payload, clientId)
}
