import { ScrollView, Text } from "react-native"
import { useGlobal } from "../state/useGlobal"

export function LogViewer() {
  const [logs] = useGlobal("logs", [])

  return (
    <ScrollView>
      {logs.map((log, index) => (
        <Text key={index}>{log.message[0]}</Text>
      ))}
    </ScrollView>
  )
}
