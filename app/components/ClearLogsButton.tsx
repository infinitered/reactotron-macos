import { Button } from "react-native"
import { withGlobal } from "../state/useGlobal"
import { Log } from "../types"
import { useCallback } from "react"

export function ClearLogsButton() {
  // Using withGlobal so we don't rerender when the logs change
  const [_logs, setLogs] = withGlobal<Log[]>("logs", [])
  const clearLogs = useCallback(() => setLogs([]), [setLogs])

  return <Button onPress={clearLogs} title="Clear" />
}
