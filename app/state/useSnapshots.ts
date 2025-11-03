import { Snapshot } from "app/types"
import { useGlobal, withGlobal } from "./useGlobal"
import { sendToCore } from "./connectToServer"

type SnapshotSetter = (value: Snapshot[] | ((prev: Snapshot[]) => Snapshot[])) => void

function buildSnapshotHelpers(setSnapshots: SnapshotSetter) {
  const addSnapshot = ({
    date,
    clientId,
    state,
  }: {
    date: Date | string
    clientId: string
    state: any
  }) => {
    setSnapshots((prev) => {
      // Use the server-provided date to check for duplicates
      const snapshotDate = new Date(date)

      // Check if we already have a snapshot with the same server date and clientId
      const existingSnapshot = prev.find(
        (s) => s.clientId === clientId && new Date(s.date).getTime() === snapshotDate.getTime(),
      )

      if (existingSnapshot) {
        return prev
      }

      // Format the date as "Wednesday @ 5:00:15 PM"
      const dayName = snapshotDate.toLocaleDateString("en-US", { weekday: "long" })
      const timeString = snapshotDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      const snapshotName = `${dayName} @ ${timeString}`

      const newSnapshot: Snapshot = {
        id: `${Date.now()}-${clientId}`,
        name: snapshotName,
        date: snapshotDate,
        state: state,
        clientId: clientId,
      }

      return [...prev, newSnapshot]
    })
  }

  const deleteSnapshot = (snapshotId: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== snapshotId))
  }

  return { addSnapshot, deleteSnapshot }
}

function buildRestoreSnapshot(activeClientId: string) {
  return (snapshot: Snapshot) => {
    if (!snapshot || !snapshot.state) return

    // Use the snapshot's clientId if available, otherwise fall back to the active client
    const targetClientId = snapshot.clientId || activeClientId

    if (!targetClientId) return

    // Send the restore command to the client
    sendToCore("state.restore.request", {
      clientId: targetClientId,
      state: snapshot.state,
    })
  }
}

export function useSnapshots() {
  const [snapshots, setSnapshots] = useGlobal<Snapshot[]>("snapshots", [])
  const [activeClientId] = useGlobal<string>("activeClientId", "")
  const { addSnapshot, deleteSnapshot } = buildSnapshotHelpers(setSnapshots)
  const restoreSnapshot = buildRestoreSnapshot(activeClientId)

  return { snapshots, setSnapshots, addSnapshot, deleteSnapshot, restoreSnapshot }
}

export function withSnapshots() {
  const [snapshots, setSnapshots] = withGlobal<Snapshot[]>("snapshots", [])
  const [activeClientId] = withGlobal<string>("activeClientId", "")
  const { addSnapshot, deleteSnapshot } = buildSnapshotHelpers(setSnapshots)
  const restoreSnapshot = buildRestoreSnapshot(activeClientId)

  return { snapshots, setSnapshots, addSnapshot, deleteSnapshot, restoreSnapshot }
}
