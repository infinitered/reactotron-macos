import { Snapshot } from "app/types"
import { useGlobal } from "./useGlobal"

export function useSnapshots() {
  const [snapshots, setSnapshots] = useGlobal<Snapshot[]>("snapshots", [])
  return { snapshots, setSnapshots }
}
