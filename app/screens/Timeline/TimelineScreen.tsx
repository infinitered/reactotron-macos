// import { View, Text } from "react-native"
import { FlatList } from "react-native"
import { useGlobal } from "../../state/useGlobal"
import { Log } from "../../types"
import { LogItem } from "./LogItem"

export function TimelineScreen() {
  const [logs] = useGlobal<Log[]>("logs", [], { persist: true })
  return (
    <FlatList<Log>
      data={logs}
      renderItem={({ item }) => <LogItem item={item} />}
      keyExtractor={(item) => item.messageId.toString()}
    />
  )
}
