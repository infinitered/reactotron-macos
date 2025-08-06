#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

// Color constants for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
  reset: "\x1b[0m",
}

// Print colored output
function printSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`)
}

function printError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`)
}

function printWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`)
}

function printInfo(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`)
}

function printStep(message) {
  console.log(`${colors.magenta}→${colors.reset} ${message}`)
}

// Parse turbomodule comment and extract module info
function parseTurbomoduleComment(filePath) {
  const content = fs.readFileSync(filePath, "utf8")

  // Extract the @turbomodule line
  const lines = content.split("\n")
  const turbomoduleLine = lines.find((line) => line.trim().startsWith("/* @turbomodule"))

  if (!turbomoduleLine) {
    return null
  }

  // Parse: @turbomodule ModuleName.methodName(): returnType
  const pattern = /^\/\* @turbomodule ([A-Za-z0-9]+)\.([A-Za-z0-9]+)\(\): ([A-Za-z0-9]+)/
  const match = turbomoduleLine.match(pattern)

  if (!match) {
    return null
  }

  return {
    moduleName: match[1],
    methodName: match[2],
    returnType: match[3],
  }
}

// Extract native code from comment block
function extractNativeCode(filePath) {
  const content = fs.readFileSync(filePath, "utf8")
  const lines = content.split("\n")

  let inComment = false
  let nativeCode = []
  let foundTurbomodule = false

  for (const line of lines) {
    if (line.trim().startsWith("/* @turbomodule")) {
      inComment = true
      foundTurbomodule = true
      continue
    }

    if (inComment && line.trim().startsWith("*/")) {
      break
    }

    if (inComment && foundTurbomodule) {
      nativeCode.push(line)
    }
  }

  return nativeCode.join("\n")
}

// Generate native files from turbomodule comment
function generateNativeFiles(filePath, moduleInfo) {
  const { moduleName, methodName, returnType } = moduleInfo

  // Get directory of the TypeScript file
  const dirPath = path.dirname(filePath)

  // Extract native code
  const nativeCode = extractNativeCode(filePath)

  // Generate .mm file using template
  const mmFile = path.join(dirPath, `${moduleName}.mm`)
  const mmTemplate = `#import "${moduleName}.h"
// HEADERS_HERE

@implementation ${moduleName} RCT_EXPORT_MODULE()

// METHODS_HERE

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::Native${moduleName}SpecJSI>(params);
}
@end`

  // Replace the headers section with any lines that start with #import
  const nativeLines = nativeCode.split("\n")
  const headers = nativeLines.filter((line) => line.trim().startsWith("#import")).join("\n")

  let mmContent = mmTemplate
  if (headers) {
    mmContent = mmContent.replace("// HEADERS_HERE", headers)
  } else {
    mmContent = mmContent.replace("// HEADERS_HERE", "")
  }

  // Replace the method section with our extracted native code, minus the headers
  const filteredNativeCode = nativeLines
    .filter((line) => !line.trim().startsWith("#import"))
    .join("\n")

  const methodStartIndex = mmContent.indexOf("// METHODS_HERE")
  if (methodStartIndex !== -1) {
    const beforeMethods = mmContent.substring(0, methodStartIndex)
    const afterMethods = mmContent.substring(methodStartIndex + "// METHODS_HERE".length)
    mmContent = beforeMethods + filteredNativeCode + afterMethods
  }

  fs.writeFileSync(mmFile, mmContent)
  printSuccess(`Generated ${mmFile}`)

  // Generate Native TypeScript file using template
  const nativeTsFile = path.join(dirPath, `Native${moduleName}.ts`)
  const tsTemplate = `import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"
export interface Spec extends TurboModule {
  ${methodName}(): Promise<${returnType}>
}
export default TurboModuleRegistry.getEnforcing<Spec>("${moduleName}")`

  fs.writeFileSync(nativeTsFile, tsTemplate)
  printSuccess(`Generated ${nativeTsFile}`)
}

// Apply turbomodules from package.json
function applyTurbomodules() {
  printInfo("Applying turbomodules from package.json")

  // Read package.json
  const packageJsonPath = path.join(process.cwd(), "package.json")
  if (!fs.existsSync(packageJsonPath)) {
    printError("package.json not found")
    process.exit(1)
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

  // Get turbomodules array
  const turbomodules = packageJson.turbomodules || []

  if (turbomodules.length === 0) {
    printWarning("No turbomodules found in package.json")
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
    const moduleInfo = parseTurbomoduleComment(filePath)
    if (!moduleInfo) {
      printError(`Invalid @turbomodule comment in ${filePath}`)
      errors++
      continue
    }

    // Generate native files
    generateNativeFiles(filePath, moduleInfo)
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

  if (command === "apply") {
    applyTurbomodules()
  } else {
    printError(`Unknown command: ${command}`)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { applyTurbomodules }
