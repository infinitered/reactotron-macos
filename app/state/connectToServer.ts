import { TimelineItem } from "../types"
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
 * - timelineIds: string[]
 * - timeline-{id}: TimelineItem
 *
 * This state is *not* persisted across app restarts.
 *
 * @param props.port - The port to connect to.
 */
export function connectToServer(props: { port: number } = { port: 9292 }): Unsubscribe {
  const [_c, setIsConnected] = withGlobal("isConnected", false)
  const [_e, setError] = withGlobal<Error | null>("error", null)
  const [clientIds, setClientIds] = withGlobal<string[]>("clientIds", [])
  const [_timelineItems, setTimelineItems] = withGlobal<TimelineItem[]>("timelineItems", [], {
    persist: true,
  })

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
        const id = `${data.cmd.clientId}-${data.cmd.messageId}`
        const timelineItem: TimelineItem = {
          id,
          type: data.cmd.type,
          important: data.cmd.important,
          connectionId: data.cmd.connectionId,
          messageId: data.cmd.messageId,
          date: data.cmd.date,
          deltaTime: data.cmd.deltaTime,
          clientId: data.cmd.clientId,
          payload: data.cmd.payload,
        }

        console.tron.log("timelineItem", timelineItem)

        // Add to timeline IDs
        setTimelineItems((prev) => {
          // Mutating existing array is faster, and we don't care if it's not a copy.
          prev.unshift(timelineItem)
          return prev
        })
      } else {
        console.tron.log("unknown command", data.cmd)
      }
    }

    if (__DEV__) {
      console.tron.log(data)
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
