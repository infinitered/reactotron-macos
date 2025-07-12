import type { ClientData } from "../types"
import { useGlobal } from "../state/useGlobal"
import { Tab } from "./Tab"

export function ClientTab({ clientId }: { clientId: string }) {
  const [clientData] = useGlobal<ClientData>(`client-${clientId}`, {})

  const label: string = clientData?.name ?? clientId

  return <Tab id={clientId} tabgroup="activeClientId" label={label} />
}
