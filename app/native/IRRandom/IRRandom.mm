#import "IRRandom.h"
#include <Foundation/Foundation.h>

@implementation IRRandom RCT_EXPORT_MODULE()

// Add your methods here ************************************************************

- (NSNumber *)getRandomNumber {
  return @(arc4random_uniform(100));
}

- (NSString *)getUUID {
  return [[NSUUID UUID] UUIDString];
}

// End of your methods ************************************************************

// Required by TurboModules.
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRRandomSpecJSI>(params);
}

@end
