//
//  IRNode.mm
//  Reactotron-macOS
//
//  Created by Jamon Holmgren on 4/9/25.
//

#import "IRNode.h"
#import "ProcessUtils.h"
#import <objc/runtime.h>

@implementation IRNode

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRNodeSpecJSI>(params);
}

// Below this are the interfaces that can be called from JS.

/**
 * Method for starting a node process.
 * @return The process ID of the node process.
 */
- (int)runNode:(NSString *)command getPID:(nonnull pid_t *)outPID resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  return 0;
}

/**
 * Test method for returning a function that is called from Objective-C repeatedly.
 * @param callback The callback function to call several times.
 */
- (void)testCallback:(nonnull RCTResponseSenderBlock)callback {
  callback(@[[NSNull null], @"Hello from Objective-C"]);
  callback(@[[NSNull null], @"Hello2 from Objective-C"]);
  callback(@[[NSNull null], @"Hello3 from Objective-C"]);
  callback(@[[NSNull null], @"Hello4 from Objective-C"]);
  callback(@[[NSNull null], @"Hello5 from Objective-C"]);
  callback(@[[NSNull null], @"Hello6 from Objective-C"]);
  callback(@[[NSNull null], @"Hello7 from Objective-C"]);
  callback(@[[NSNull null], @"Hello8 from Objective-C"]);
}

@end
