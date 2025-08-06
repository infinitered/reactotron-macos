/* @turbomodule IRRandom.getUUID(): string
#import <Foundation/Foundation.h>

- (NSString *)getUUID {
  return [[NSUUID UUID] UUIDString];
}
*/

import IRRandom from "./NativeIRRandom"

export function getUUID(): string {
  return IRRandom.getUUID()
}
