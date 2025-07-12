import { FlatList, Text } from "react-native"
import { useGlobal } from "../state/useGlobal"
import { LogEntry } from "../types"

export function LogViewer() {
  const [logs] = useGlobal<LogEntry[]>("logs", [])

  return (
    <FlatList<LogEntry>
      data={logs}
      renderItem={({ item }) => <LogEntryView entry={item} />}
      keyExtractor={(item) => item.messageId.toString()}
    />
  )
}

function LogEntryView({ entry }: { entry: LogEntry }) {
  return <Text>{entry.payload.message[0]}</Text>
}
