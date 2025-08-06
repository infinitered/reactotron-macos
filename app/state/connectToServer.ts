import { getUUID } from "../utils/random/getUUID"
import { TimelineItem } from "../types"
import { withGlobal } from "./useGlobal"

type UnsubscribeFn = () => void
type SendToClientFn = (message: string | object, payload?: object, clientId?: string) => void
type WebSocketState = { socket: WebSocket | null }

let _sendToClient: SendToClientFn
const ws: WebSocketState = { socket: null }

export const getReactotronAppId = () => {
  const [reactotronAppId] = withGlobal("reactotronAppId", getUUID(), { persist: true })
  return reactotronAppId
}

/**
 * Connects to the reactotron-core-server via websocket.
 *
 * Populates the following global state:
 * - isConnected: boolean
 * - error: Error | null
 * - clientIds: string[]
 * - timelineItems: TimelineItem[]
 *
 * @param props.port - The port to connect to. Defaults to 9292.
 */
export function connectToServer(props: { port: number } = { port: 9292 }): UnsubscribeFn {
  const reactotronAppId = getReactotronAppId()
  const [_c, setIsConnected] = withGlobal("isConnected", false)
  const [_e, setError] = withGlobal<Error | null>("error", null)
  const [clientIds, setClientIds] = withGlobal<string[]>("clientIds", [])
  const [_timelineItems, setTimelineItems] = withGlobal<TimelineItem[]>("timelineItems", [], {
    persist: true,
  })

  ws.socket = new WebSocket(`ws://localhost:${props.port}`)
  if (!ws.socket) throw new Error("Failed to connect to Reactotron server")

  // Tell the server we are a Reactotron app, not a React client.
  ws.socket.onopen = () => {
    ws.socket?.send(
      JSON.stringify({
        type: "reactotron.subscribe",
        payload: {
          id: reactotronAppId,
        },
      }),
    )
  }

  // Handle errors
  ws.socket.onerror = (event) => setError(new Error(`WebSocket error: ${event.message}`))

  // Handle messages coming from the server, intended to be sent to the client or Reactotron app.
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

    if (data.type === "connectedClients") {
      data.clients.forEach((client: any) => {
        // Store the client data in global state
        const clientId = client.clientId
        const [_, setClientData] = withGlobal(`client-${clientId}`, {})
        setClientData(client)
      })
      setClientIds(data.clients.map((client: any) => client.clientId))
    }

    if (data.type === "command") {
      if (data.cmd.type === "clear") setTimelineItems([])

      if (data.cmd.type === "log" || data.cmd.type === "api.response") {
        // Add a unique ID to the timeline item
        data.cmd.id = `${data.cmd.clientId}-${data.cmd.messageId}`

        // Add to timeline IDs
        setTimelineItems((prev) => {
          prev.unshift(data.cmd) // mutating is faster
          return prev // don't worry, it'll still rerender
        })
      } else {
        console.tron.log("unknown command", data.cmd)
      }
    }

    console.tron.log(data)
  }

  // Clean up after disconnect
  ws.socket.onclose = () => {
    console.tron.log("Reactotron server disconnected")
    setIsConnected(false)
    setClientIds([])
  }

  // Send a message to the server (which will be forwarded to the client)
  _sendToClient = (message: string | object, payload?: object, clientId?: string) => {
    if (!ws?.socket) return console.tron.log("Not connected to Reactotron server")
    ws.socket.send(JSON.stringify({ type: message, payload, clientId }))
  }

  return () => {
    ws.socket?.close()
    ws.socket = null
  }
}

export function sendToClient(message: string | object, payload?: object, clientId?: string) {
  if (!_sendToClient) throw new Error("sendToClient not initialized. Call connectToServer() first.")
  _sendToClient(message, payload, clientId)
}
