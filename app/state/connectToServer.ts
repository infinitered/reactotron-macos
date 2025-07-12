import { withGlobal } from "./useGlobal"

type Unsubscribe = () => void

let _sendToClient: (message: string | object, payload?: object, clientId?: string) => void

const ws: { socket: WebSocket | null } = { socket: null }

/**
 * Connects to the reactotron-core-server via websocket.
 *
 * Populates the following global state:
 * - isConnected: boolean
 * - error: Error | null
 * - clientIds: string[]
 * - logs: any[]
 *
 * This state is *not* persisted across app restarts.
 *
 * @param props.port - The port to connect to.
 */
export function connectToServer(props: { port: number } = { port: 9292 }): Unsubscribe {
  const [_c, setIsConnected] = withGlobal("isConnected", false)
  const [_e, setError] = withGlobal<Error | null>("error", null)
  const [clientIds, setClientIds] = withGlobal<string[]>("clientIds", [])
  const [_l, setLogs] = withGlobal<any[]>("logs", [])

  ws.socket = new WebSocket(`ws://localhost:${props.port}`)
  if (!ws.socket) throw new Error("Failed to connect to Reactotron server")

  ws.socket.onopen = () => {
    // Tell the server we are a Reactotron app, not a React client.
    ws.socket?.send(
      JSON.stringify({
        type: "reactotron.subscribe",
        payload: {
          name: "TODO -- Add Name Here?",
        },
      }),
    )
  }
  ws.socket.onerror = (event) => setError(new Error(`WebSocket error: ${event.message}`))

  ws.socket.onmessage = (event) => {
    const data = JSON.parse(event.data)

    if (data.type === "reactotron.connected") setIsConnected(true)

    if (data.type === "connectionEstablished") {
      const clientId = data?.conn?.clientId
      if (!clientIds.includes(clientId)) {
        setClientIds((prev) => [...prev, clientId])
      }

      // Store the client data in global state
      const [_, setClientData] = withGlobal(`client-${clientId}`, {})
      setClientData(data?.conn)
    }

    if (data.type === "command") {
      if (data.cmd.type === "clear") setLogs([])
      if (data.cmd.type === "log") setLogs((prev) => [...prev, data.cmd])
    }

    if (__DEV__) {
      console.tron.logImportant({
        type: "recievedAnyMessage",
        data,
      })
    }
  }

  ws.socket.onclose = () => {
    console.tron.log("Reactotron server disconnected")
    setIsConnected(false)
    setClientIds([])
  }

  _sendToClient = (message: string | object, payload?: object, clientId?: string) => {
    if (!ws) {
      console.tron.log("Not connected to Reactotron server")
    } else {
      ws.socket?.send(JSON.stringify({ type: message, payload, clientId }))
    }
  }

  return () => {
    ws.socket?.close()
    ws.socket = null
  }
}

export function sendToClient(message: string | object, payload?: object, clientId?: string) {
  if (!_sendToClient) throw new Error("sendToClient not initialized ... did you call useServer?")
  _sendToClient(message, payload, clientId)
}
