/* @turbomodule TestRandom.getUUID(): string
#import <Foundation/Foundation.h>

- (NSString *)getUUID {
  return [[NSUUID UUID] UUIDString];
}
*/

import TestRandom from "./NativeTestRandom"
import IRRandom from "../native/IRRandom/NativeIRRandom"

export function getUUID(): string {
  const start = performance.now()
  const uuid = TestRandom.getUUID()
  const end = performance.now()

  const start2 = performance.now()
  const uuid2 = IRRandom.invokeObjC(JSON.stringify([["NSUUID", "UUID", []], "UUIDString", []]))
  const end2 = performance.now()

  const start3 = performance.now()
  const text3 = invokeObjC([
    ["NSString", "alloc", []],
    "initWithFormat:arguments:",
    ["Hello, %@", ["@", "Jamon"]],
  ])
  const end3 = performance.now()

  console.tron.log(`TestRandom.getUUID() took ${end - start}ms`, uuid)
  console.tron.log(`IRRandom.invokeObjC() took ${end2 - start2}ms`, uuid2)
  console.tron.log(`IRRandom.invokeObjC() took ${end3 - start3}ms`, text3)
  return text3
}

type ObjCArg = string | ObjCInput | ObjCLiteralArray
type ObjCLiteralArray = ["@", ...string[]]
type ObjCInput = [ObjCArg, string, ObjCArg[]]

export function invokeObjC(input: ObjCInput): string {
  return IRRandom.invokeObjC(JSON.stringify(input))
}
