import { SEPARATOR, type SystemMenuListEntry } from "./types"

export const PATH_SEPARATOR = " > "

export const parsePathKey = (key: string): string[] =>
  key
    .split(PATH_SEPARATOR)
    .map((s) => s.trim())
    .filter(Boolean)

export const joinPath = (p: string[]) => p.join(PATH_SEPARATOR)

export const isSeparator = (e: SystemMenuListEntry): e is typeof SEPARATOR => e === SEPARATOR