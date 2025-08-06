/* @turbomodule IRRandom.getUUID(): string
#import <Foundation/Foundation.h>

- (NSString *)getUUID {
  return [[NSUUID UUID] UUIDString];
}
*/

import IRRandom from "./NativeIRRandom"

export function getUUID2(): string {
  return IRRandom.getUUID()
}

import IRExperimental from "../native/IRExperimental/NativeIRExperimental"

export function getUUID(): string {
  const uuid = TestRandom.getUUID()

  const uuid2 = invokeObjC(`[[NSUUID UUID] UUIDString]`)
  console.tron.log("uuid2", uuid2, uuid)

  return uuid
}

type ObjCArg = string | ObjCInput | ObjCLiteralArray
type ObjCLiteralArray = ["@", ...string[]]
type ObjCInput = [ObjCArg, string, ObjCArg[]]

export function invokeObjC(input: ObjCInput | string): string {
  console.tron.log("input", input)
  if (typeof input === "string") {
    input = objcToArrayStructure(input)
    console.tron.log("Parsed structure:", JSON.stringify(input, null, 2))
  }
  const jsonString = JSON.stringify(input)
  console.tron.log("JSON being sent:", jsonString)
  const result = IRExperimental.invokeObjC(jsonString)
  console.tron.log("Result:", result)
  return result
}

function objcToArrayStructure(input: string): ObjCInput {
  // Parse nested Objective-C method calls like "[[NSUUID UUID] UUIDString]"
  // into array structure: [["NSUUID", "UUID", []], "UUIDString", []]

  input = input.trim()
  if (!input.startsWith("[") || !input.endsWith("]")) {
    throw new Error("Invalid Objective-C code: must be wrapped in brackets")
  }

  // Remove outer brackets
  input = input.slice(1, -1).trim()

  // Check for invalid semicolon usage (outside of strings)
  if (containsSemicolonOutsideStrings(input)) {
    throw new Error(
      "Invalid Objective-C syntax: semicolons are not supported in method call expressions",
    )
  }

  // Find the main method call structure
  let depth = 0
  let receiverEnd = -1

  for (let i = 0; i < input.length; i++) {
    if (input[i] === "[") depth++
    else if (input[i] === "]") depth--
    else if (depth === 0 && input[i] === " ") {
      receiverEnd = i
      break
    }
  }

  if (receiverEnd === -1) {
    throw new Error("Invalid Objective-C code: no method found")
  }

  const receiverPart = input.slice(0, receiverEnd).trim()
  const methodPart = input.slice(receiverEnd + 1).trim()

  // Parse receiver (could be a class name, nested method call, or array literal)
  let receiver: ObjCArg
  if (receiverPart.startsWith("@[")) {
    // Array literal
    receiver = parseArrayLiteral(receiverPart)
  } else if (receiverPart.startsWith("[")) {
    // Nested method call
    receiver = objcToArrayStructure(receiverPart)
  } else {
    // Class name
    receiver = receiverPart
  }

  // Parse method name and arguments
  const { methodName, args } = parseMethodAndArgs(methodPart)

  return [receiver, methodName, args]
}

function containsSemicolonOutsideStrings(input: string): boolean {
  let inString = false
  let escapeNext = false

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (escapeNext) {
      escapeNext = false
      continue
    }

    if (char === "\\") {
      escapeNext = true
      continue
    }

    if (char === '"' && !escapeNext) {
      inString = !inString
      continue
    }

    if (!inString && char === ";") {
      return true
    }
  }

  return false
}

function parseArrayLiteral(input: string): ObjCLiteralArray {
  // Parse @[@"Apple", @"Banana", @"Cherry"] into ["@", "Apple", "Banana", "Cherry"]
  if (!input.startsWith("@[") || !input.endsWith("]")) {
    throw new Error("Invalid array literal format")
  }

  const content = input.slice(2, -1).trim()
  if (!content) {
    return ["@"]
  }

  const elements: string[] = []
  let depth = 0
  let start = 0
  let inString = false
  let escapeNext = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]

    if (escapeNext) {
      escapeNext = false
      continue
    }

    if (char === "\\") {
      escapeNext = true
      continue
    }

    if (char === '"' && !escapeNext) {
      inString = !inString
      continue
    }

    if (!inString) {
      if (char === "[") depth++
      else if (char === "]") depth--
      else if (char === "," && depth === 0) {
        const element = content.slice(start, i).trim()
        elements.push(parseStringLiteral(element))
        start = i + 1
      }
    }
  }

  // Add the last element
  const lastElement = content.slice(start).trim()
  if (lastElement) {
    elements.push(parseStringLiteral(lastElement))
  }

  return ["@", ...elements]
}

function parseStringLiteral(input: string): string {
  input = input.trim()
  if (input.startsWith('@"') && input.endsWith('"')) {
    return input.slice(2, -1)
  }
  return input
}

function parseMethodAndArgs(methodPart: string): { methodName: string; args: ObjCArg[] } {
  // Handle method calls with complex arguments
  const colonIndex = methodPart.indexOf(":")

  if (colonIndex === -1) {
    // No arguments
    return { methodName: methodPart.trim(), args: [] }
  }

  const methodName = methodPart.slice(0, colonIndex + 1)
  const argsString = methodPart.slice(colonIndex + 1).trim()

  const args: ObjCArg[] = []
  if (argsString) {
    args.push(...parseArguments(argsString))
  }

  return { methodName, args }
}

function parseArguments(argsString: string): ObjCArg[] {
  // For simple cases like stringWithString:@"Hello", there's just one argument
  const trimmed = argsString.trim()
  if (!trimmed) {
    return []
  }

  // For now, handle the simple case of a single argument
  // TODO: Handle multiple arguments separated by commas
  return [parseArgument(trimmed)]
}

function parseArgument(arg: string): ObjCArg {
  arg = arg.trim()

  if (arg.startsWith('@"') && arg.endsWith('"')) {
    // String literal
    return arg.slice(2, -1)
  } else if (arg.startsWith("@[")) {
    // Array literal
    return parseArrayLiteral(arg)
  } else if (arg.startsWith("[")) {
    // Nested method call
    return objcToArrayStructure(arg)
  }

  return arg
}
