import { getUUID } from "../utils/random/getUUID"
import { deleteGlobal, withGlobal } from "./useGlobal"
import { CommandType } from "reactotron-core-contract"
import type { StateSubscription, TimelineItem, CustomCommand } from "../types"
import { withGlobal } from "./useGlobal"
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
  const [, setActiveClientId] = withGlobal("activeClientId", "")
  const [_timelineItems, setTimelineItems] = withGlobal<TimelineItem[]>("timelineItems", [])
  const [_stateSubscriptionsByClientId, setStateSubscriptionsByClientId] = withGlobal<{
    [clientId: string]: StateSubscription[]
  }>("stateSubscriptionsByClientId", {})
  const [_customCommands, setCustomCommands] = withGlobal<CustomCommand[]>("custom-commands", [], {
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
        setActiveClientId(clientId)
      }

      // Store the client data in global state
      const [_, setClientData] = withGlobal(`client-${clientId}`, {})
      setClientData(data?.conn)
    }

    if (data.type === "connectedClients") {
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

      if (data.cmd.type === CommandType.CustomCommandRegister) {
        console.log("custom.command.register", data.cmd.payload)
        const payload = data.cmd.payload
        const customCommand: CustomCommand = {
          id: `${data.cmd.clientId}-${payload.id}`,
          command: payload.command,
          title: payload.title,
          description: payload.description,
          args: payload.args,
          clientId: data.cmd.clientId,
        }
        setCustomCommands((prev) => {
          // Check if command already exists for this client
          const existingIndex = prev.findIndex((cmd) => cmd.id === customCommand.id)
          if (existingIndex !== -1) {
            // Update existing command
            const updated = [...prev]
            updated[existingIndex] = customCommand
            return updated
          }
          // Add new command
          return [...prev, customCommand]
        })
        return
      }

      if (data.cmd.type === CommandType.CustomCommandUnregister) {
        console.log("custom.command.unregister", data.cmd)
        const payload = data.cmd.payload
        const commandId = `${data.cmd.clientId}-${payload.id}`
        setCustomCommands((prev) => prev.filter((cmd) => cmd.id !== commandId))
        return
      }
    }

    console.log(data)
  }

  // Clean up after disconnect
  ws.socket.onclose = () => {
    console.tron.log("Reactotron server disconnected")
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
    setCustomCommands([])
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

export function sendToCore(message: string | object, payload?: object) {
  if (!_sendToClient) throw new Error("sendToClient not initialized. Call connectToServer() first.")
  _sendToClient("reactotron.sendToCore", { type: message, ...payload })
}
