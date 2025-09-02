#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

// Check if NO_COLOR is set
const nc = (t) => (process.env.NO_COLOR ? "" : t)

// Color constants for console output
const red = nc("\x1b[31m")
const green = nc("\x1b[32m")
const yellow = nc("\x1b[33m")
const blue = nc("\x1b[34m")
const dkgray = nc("\x1b[90m")
const x = "\x1b[0m"

// Print colored output
function printSuccess(message) {
  console.log(` ${green}✓${x}${dkgray} ${message}${x}`)
}

function printError(message) {
  console.log(` ${red}✗${x}${dkgray} ${message}${x}`)
}

function printWarning(message) {
  console.log(` ${yellow}⚠${x}${dkgray} ${message}${x}`)
}

function printInfo(message) {
  console.log(` ${blue}ℹ${x}${dkgray} ${message}${x}`)
}

function printStep(message) {
  console.log(` ${dkgray}→${x}${dkgray} ${message}${x}`)
}

// Parse turbomodule comment and extract module info
function parseTurboModuleComment(filePath) {
  const content = fs.readFileSync(filePath, "utf8")

  // Extract the @turbomodule line
  const lines = content.split("\n")
  const turbomoduleLine = lines.find((line) => line.trim().startsWith("/* @turbomodule"))
  if (!turbomoduleLine) return null

  // Parse: @turbomodule ModuleName.methodName(args): returnType
  const pattern = /^\/\* @turbomodule ([A-Za-z0-9]+)\.(.+)$/
  const match = turbomoduleLine.match(pattern)

  if (!match) return null

  const fullSignature = match[2]
  return { moduleName: match[1], fullSignature: fullSignature }
}

// Extract native code from comment block
function extractNativeCode(filePath) {
  const content = fs.readFileSync(filePath, "utf8")
  const lines = content.split("\n")

  let inComment = false
  let nativeCode = []
  let foundTurboModule = false

  for (const line of lines) {
    if (line.trim().toLowerCase().startsWith("/* @turbomodule")) {
      inComment = true
      foundTurboModule = true
      continue
    }

    if (inComment && line.trim().startsWith("*/")) break
    if (inComment && foundTurboModule) nativeCode.push(line)
  }

  return nativeCode.join("\n")
}

// Generate native files from turbomodule comment
function generateNativeFiles(filePath, destinationPath, moduleInfo) {
  const { moduleName, fullSignature } = moduleInfo

  // Extract native code
  const nativeCode = extractNativeCode(filePath)

  // Replace the headers section with any lines that start with #import
  const nativeLines = nativeCode.split("\n")
  const headers = nativeLines.filter((line) => line.trim().startsWith("#import")).join("\n")

  // Replace the method section with our extracted native code, minus the headers
  const filteredNativeCode = nativeLines
    .filter((line) => !line.trim().startsWith("#import"))
    .join("\n")

  // Generate .mm file using template
  const mmFile = path.join(destinationPath, `${moduleName}.mm`)
  const mmContent = `#import "${moduleName}.h"
${headers}

@implementation ${moduleName} RCT_EXPORT_MODULE()

${filteredNativeCode}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::Native${moduleName}SpecJSI>(params);
}
@end`

  fs.writeFileSync(mmFile, mmContent)
  printSuccess(`Generated ${mmFile}`)

  // Generate Native TypeScript file using template
  const nativeTsFile = path.join(path.dirname(filePath), `Native${moduleName}.ts`)
  const tsTemplate = `import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"
export interface Spec extends TurboModule {
  ${fullSignature}
}
export default TurboModuleRegistry.getEnforcing<Spec>("${moduleName}")`

  fs.writeFileSync(nativeTsFile, tsTemplate)
  printSuccess(`Generated ${nativeTsFile}`)
}

// Generate turbomodules from package.json
function generateTurboModules() {
  printInfo("Generating turbomodules from package.json")

  // Read package.json
  const packageJsonPath = path.join(process.cwd(), "package.json")
  if (!fs.existsSync(packageJsonPath)) {
    printError("package.json not found")
    process.exit(1)
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

  const { generateTurboModules } = packageJson

  if (!generateTurboModules) {
    printError("`generateTurboModules` not found in package.json")
    process.exit(1)
  }

  // Get turbomodules array
  const turbomodules = generateTurboModules.files || []

  // Get the destination path from package.json
  const destinationPath = generateTurboModules.destinationPath

  if (turbomodules.length === 0) {
    printWarning("No files found in `generateTurboModules.files` in package.json")
    printWarning("Skipping turbomodule generation.")
    return
  }

  if (!destinationPath) {
    printWarning("`generateTurboModules.destinationPath` not found in package.json")
    printWarning("Skipping turbomodule generation.")
    return
  }

  printStep(`Found ${turbomodules.length} turbomodule(s) to process`)

  let processed = 0
  let errors = 0

  for (const filePath of turbomodules) {
    if (!fs.existsSync(filePath)) {
      printError(`File not found: ${filePath}`)
      errors++
      continue
    }

    printStep(`Processing ${filePath}`)

    // Parse turbomodule comment
    const moduleInfo = parseTurboModuleComment(filePath)
    if (!moduleInfo) {
      printError(`Invalid @turbomodule comment in ${filePath}`)
      errors++
      continue
    }

    // Generate native files
    generateNativeFiles(filePath, destinationPath, moduleInfo)
    processed++
  }

  if (errors > 0) {
    printWarning(`Completed with ${errors} error(s)`)
  } else {
    printSuccess(`Successfully processed ${processed} turbomodule(s)`)
  }
}

// Main function
function main() {
  const command = process.argv[2]

  if (command === "generate") {
    generateTurboModules()
  } else {
    printError(`Unknown command: ${command}`)
    process.exit(1)
  }
}

// Run automatically if called directly
if (require.main === module) main()
module.exports = { generateTurboModules }
