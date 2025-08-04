#import "IRRandom.h"

@implementation IRRandom

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRRandomSpecJSI>(params);
}

// Sync method example
RCT_EXPORT_METHOD(getValue:(RCTResponseSenderBlock)callback)
{
  callback(@[@"Hello from IRRandom!"]);
}

// Async method example
RCT_EXPORT_METHOD(performAsyncTask:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    // Simulate async work
    [NSThread sleepForTimeInterval:0.1];
    
    resolve(@{@"result": @"Async task completed"});
  });
}

// Event emitter example
RCT_EXPORT_METHOD(startEventStream)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [self emitOnIRRandomEvent:@{
      @"message": @"Event from IRRandom",
      @"timestamp": @([[NSDate date] timeIntervalSince1970])
    }];
  });
}

@end
