//
//  IRRunShellCommand.mm
//  Reactotron-macOS
//
//  Created by Jamon Holmgren on 4/9/25.
//

#import "IRRunShellCommand.h"

@implementation IRRunShellCommand

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRRunShellCommandSpecJSI>(params);
}

// Below this are the interfaces that can be called from JS.

- (void)runAsync:(NSString *)command resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  // send back "Testing " + command
  resolve([NSString stringWithFormat:@"Testing %@", command]);
}

- (NSString *)runSync:(NSString *)command {
  return [NSString stringWithFormat:@"Testing %@", command];
}

@end
