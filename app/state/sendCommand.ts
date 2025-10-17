import { sendToClient } from "./connectToServer"
import { withGlobal } from "./useGlobal"

/**
 * Sends a command to the connected React Native client.
 * This is used to trigger actions in the client app, such as opening files in the editor.
 *
 * @param type - The command type (e.g., "editor.open")
 * @param payload - The command payload
 * @param clientId - Optional client ID. If not provided, uses the active client.
 */
export function sendCommand(type: string, payload: any, clientId?: string) {
  // If no clientId is provided, use the active client
  const activeClientId = clientId || withGlobal("activeClientId", "")[0]

  if (!activeClientId) {
    console.warn("No active client to send command to")
    return
  }

  sendToClient(type, payload, activeClientId)
}
