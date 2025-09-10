export function formatTime(date: Date | number) {
  try {
    const dateObj = date instanceof Date ? date : new Date(date)

    // Windows-safe date formatting - avoid toLocaleTimeString()
    const hours = dateObj.getHours().toString().padStart(2, "0")
    const minutes = dateObj.getMinutes().toString().padStart(2, "0")
    const seconds = dateObj.getSeconds().toString().padStart(2, "0")
    const ms = dateObj.getMilliseconds().toString().padStart(3, "0")

    return `${hours}:${minutes}:${seconds}.${ms}`
  } catch (error) {
    return "Invalid Date"
  }
}
