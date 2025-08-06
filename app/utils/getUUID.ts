/* @turbomodule TestRandom.getUUID(): string
#import <Foundation/Foundation.h>
- (NSString *)getUUID {
  return [[NSUUID UUID] UUIDString];
}
*/

import TestRandom from "./NativeTestRandom"

export function getUUID(): string {
  return TestRandom.getUUID()
}
