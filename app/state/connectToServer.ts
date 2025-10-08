import { getUUID } from "../utils/random/getUUID"
import { deleteGlobal, withGlobal } from "./useGlobal"
import { CommandType } from "reactotron-core-contract"
import type { StateSubscription, TimelineItem } from "../types"
import { isSafeKey, sanitizeValue } from "../utils/sanitize"

type UnsubscribeFn = () => void
type SendToClientFn = (message: string | object, payload?: object, clientId?: string) => void
type WebSocketState = { socket: WebSocket | null }

let _sendToClient: SendToClientFn
const ws: WebSocketState = { socket: null }

export const getReactotronAppId = () => {
  const [reactotronAppId] = withGlobal("reactotronAppId", getUUID(), { persist: true })
  return reactotronAppId
}

let reconnectAttempts = 0
let reconnectTimeout: NodeJS.Timeout | null = null
const MAX_RECONNECT_ATTEMPTS = 10
const INITIAL_RECONNECT_DELAY = 1000 // 1 second

/**
 * Connects to the reactotron-core-server via websocket.
 *
 * Populates the following global state:
 * - isConnected: boolean
 * - connectionStatus: string (Connecting, Connected, Disconnected, Retrying...)
 * - error: Error | null
 * - clientIds: string[]
 * - timelineItems: TimelineItem[]
 *
 * @param props.port - The port to connect to. Defaults to 9292.
 */
export function connectToServer(props: { port: number } = { port: 9292 }): UnsubscribeFn {
  const reactotronAppId = getReactotronAppId()
  const [_c, setIsConnected] = withGlobal("isConnected", false)
  const [_cs, setConnectionStatus] = withGlobal<string>("connectionStatus", "Connecting...")
  const [_e, setError] = withGlobal<Error | null>("error", null)
  const [clientIds, setClientIds] = withGlobal<string[]>("clientIds", [])
  const [, setActiveClientId] = withGlobal("activeClientId", "")
  const [_timelineItems, setTimelineItems] = withGlobal<TimelineItem[]>("timelineItems", [])
  const [_stateSubscriptionsByClientId, setStateSubscriptionsByClientId] = withGlobal<{
    [clientId: string]: StateSubscription[]
  }>("stateSubscriptionsByClientId", {})

  // Clear any existing reconnect timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }

  setConnectionStatus("Connecting...")
  setError(null)

  try {
    ws.socket = new WebSocket(`ws://localhost:${props.port}`)
  } catch (error) {
    setError(error as Error)
    setConnectionStatus("Failed to connect")
    scheduleReconnect(props)
    return () => {}
  }

  if (!ws.socket) {
    setError(new Error("Failed to create WebSocket"))
    setConnectionStatus("Failed to connect")
    scheduleReconnect(props)
    return () => {}
  }

  // Tell the server we are a Reactotron app, not a React client.
  ws.socket.onopen = () => {
    reconnectAttempts = 0 // Reset on successful connection
    setConnectionStatus("Connected")
    setError(null)
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
  ws.socket.onerror = (event) => {
    const errorMsg = event.message || "Connection failed"
    setError(new Error(`WebSocket error: ${errorMsg}`))
    setConnectionStatus(`Error: ${errorMsg}`)
  }

  // Handle messages coming from the server, intended to be sent to the client or Reactotron app.
  ws.socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    console.tron.log("Received message from server:", data.type)

    if (data.type === "reactotron.connected") {
      console.tron.log("Reactotron app marked as connected")
      setIsConnected(true)
    }

    if (data.type === "connectionEstablished") {
      const clientId = data?.conn?.clientId
      console.tron.log("connectionEstablished event for client:", clientId)
      if (!clientIds.includes(clientId)) {
        setClientIds((prev) => [...prev, clientId])
        setActiveClientId(clientId)
      }

      // Store the client data in global state
      const [_, setClientData] = withGlobal(`client-${clientId}`, {})
      setClientData(data?.conn)
    }

    if (data.type === "connectedClients") {
      console.tron.log(
        "connectedClients event. Count:",
        data.clients?.length,
        "Clients:",
        data.clients,
      )
      let newestClientId = ""
      data.clients.forEach((client: any) => {
        // Store the client data in global state
        const clientId = client.clientId
        const [_, setClientData] = withGlobal(`client-${clientId}`, {})
        setClientData(client)
        if (!clientIds.includes(clientId)) {
          newestClientId = clientId
        }
      })
      setClientIds(data.clients.map((client: any) => client.clientId))

      if (newestClientId) {
        // Set the active client to the newest client
        console.tron.log("Setting active client to:", newestClientId)
        setActiveClientId(newestClientId)
      }
    }

    if (data.type === "command" && data.cmd) {
      if (data.cmd.type === CommandType.Clear) setTimelineItems([])
      if (
        data.cmd.type === CommandType.Log ||
        data.cmd.type === CommandType.ApiResponse ||
        data.cmd.type === CommandType.Display ||
        data.cmd.type === CommandType.StateActionComplete ||
        data.cmd.type === CommandType.Benchmark
      ) {
        // Add a unique ID to the timeline item
        data.cmd.id = `${data.cmd.clientId}-${data.cmd.messageId}`

        // Add to timeline IDs
        setTimelineItems((prev) => {
          // TODO: This does rerender if we're using a flatlist, but not if we're using a legend list.
          // prev.unshift(data.cmd) // mutating is faster
          // return prev // don't worry, it'll still rerender
          return [...prev, data.cmd]
        })
      } else {
        console.tron.log("unknown command", data.cmd)
      }
      if (data.cmd.type === CommandType.StateValuesChange) {
        data.cmd.payload.changes.forEach((change: StateSubscription) => {
          if (!isSafeKey(data.cmd.clientId) || !isSafeKey(change.path)) {
            console.warn(
              "Ignored suspicious property name in state.values.change:",
              data.cmd.clientId,
              change.path,
            )
            return
          }
          setStateSubscriptionsByClientId((prev) => {
            const currentSubscriptions = prev[data.cmd.clientId] || []
            const existingSubscriptionIndex = currentSubscriptions.findIndex(
              (sub) => sub.path === change.path,
            )
            if (existingSubscriptionIndex !== -1) {
              // Create a safe object with only expected properties to prevent prototype pollution
              const existingSubscription = currentSubscriptions[existingSubscriptionIndex]
              currentSubscriptions[existingSubscriptionIndex] = {
                path: existingSubscription.path,
                value: sanitizeValue(change.value),
              }
            } else {
              // Create a safe object with only expected properties to prevent prototype pollution
              const safeChange = {
                path: change.path,
                value: sanitizeValue(change.value),
              }
              currentSubscriptions.push(safeChange)
            }
            return {
              ...prev,
              [data.cmd.clientId]: currentSubscriptions,
            }
          })
        })
        return
      }
    }

    console.log(data)
  }

  // Clean up after disconnect
  ws.socket.onclose = (event) => {
    console.tron.log("Reactotron server disconnected", event.code, event.reason)

    // Clear individual client data
    clientIds.forEach((clientId) => {
      const [_, setClientData] = withGlobal(`client-${clientId}`, {})
      setClientData({})
    })
    deleteGlobal("clientIds")
    setClientIds([])
    setIsConnected(false)
    setActiveClientId("")
    setTimelineItems([])
    setStateSubscriptionsByClientId({})

    // Only attempt reconnect if it wasn't a normal close
    if (event.code !== 1000) {
      setConnectionStatus("Disconnected")
      scheduleReconnect(props)
    } else {
      setConnectionStatus("Disconnected")
    }
  }

  // Send a message to the server (which will be forwarded to the client)
  _sendToClient = (message: string | object, payload?: object, clientId?: string) => {
    if (!ws?.socket) return console.tron.log("Not connected to Reactotron server")
    ws.socket.send(JSON.stringify({ type: message, payload, clientId }))
  }

  return () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    reconnectAttempts = 0
    ws.socket?.close(1000) // Normal closure
    ws.socket = null
  }
}

function scheduleReconnect(props: { port: number }) {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    const [_, setConnectionStatus] = withGlobal<string>("connectionStatus", "")
    setConnectionStatus(`Failed after ${MAX_RECONNECT_ATTEMPTS} attempts`)
    return
  }

  reconnectAttempts++
  const delay = Math.min(INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1), 30000)
  const [_, setConnectionStatus] = withGlobal<string>("connectionStatus", "")
  setConnectionStatus(
    `Retrying in ${Math.round(delay / 1000)}s... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`,
  )

  reconnectTimeout = setTimeout(() => {
    console.tron.log(`Reconnecting... attempt ${reconnectAttempts}`)
    connectToServer(props)
  }, delay)
}

export function manualReconnect() {
  reconnectAttempts = 0
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }
  if (ws.socket) {
    ws.socket.close(1000)
    ws.socket = null
  }
  connectToServer()
}

export function sendToClient(message: string | object, payload?: object, clientId?: string) {
  if (!_sendToClient) throw new Error("sendToClient not initialized. Call connectToServer() first.")
  _sendToClient(message, payload, clientId)
}

export function sendToCore(message: string | object, payload?: object) {
  if (!_sendToClient) throw new Error("sendToClient not initialized. Call connectToServer() first.")
  _sendToClient("reactotron.sendToCore", { type: message, ...payload })
}
