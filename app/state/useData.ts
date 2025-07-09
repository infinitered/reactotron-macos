import { useEffect, useRef, useState } from "react"

export function useData(props: { port: number } = { port: 9292 }) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:${props.port}`)
    ws.current.onopen = () => {
      setIsConnected(true)
    }
    ws.current.onerror = (event) => {
      setError(new Error(`WebSocket error: ${event.message}`))
    }
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (__DEV__) {
        console.tron.log(data)
      }
    }
    ws.current.onclose = () => {
      setIsConnected(false)
    }

    return () => {
      ws.current?.close()
      ws.current = null
    }
  }, [props.port, ws])

  return { isConnected, error }
}
