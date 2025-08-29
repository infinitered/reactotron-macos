import { useCallback } from "react"
import { useGlobal } from "./useGlobal"

export function useSidebar() {
  const [isOpen, setIsOpen] = useGlobal<boolean>("sidebar-open", false, { persist: true })

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [setIsOpen])

  const openSidebar = useCallback(() => {
    setIsOpen(true)
  }, [setIsOpen])

  const closeSidebar = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  return {
    isOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar,
  }
}