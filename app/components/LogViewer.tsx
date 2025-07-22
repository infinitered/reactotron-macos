import { FlatList } from "react-native"
import { useGlobal } from "../state/useGlobal"
import type { Log } from "../types"
import LogItem from "./LogItem"

export function LogViewer() {
  const [logs] = useGlobal<Log[]>("logs", [])
  return (
    <FlatList<Log>
      data={logs}
      renderItem={({ item }) => <LogItem item={item} />}
      keyExtractor={(item) => item.messageId.toString()}
    />
  )
}
