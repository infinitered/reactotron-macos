import IRRunShellCommand from "../../specs/NativeIRRunShellCommand"

export async function getAppMemUsage(): Promise<number> {
  const appPID = IRRunShellCommand.appPID()
  const memUsage = await IRRunShellCommand.runAsync(`ps -p ${appPID} -o rss=`)
  return parseInt(memUsage)
}
