/**
 * This component initiates the server connection and stores the state.
 * You can access the server state from any component by using the proper
 * global state.
 *
 * Global state provided is in the useServer hook.
 */
import { useServer } from "./useServer"

export function ServerState() {
  useServer()

  return null
}
