#import "MyTemplate.h"

@implementation MyTemplate

RCT_EXPORT_MODULE()

// Required by TurboModules.
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::MyTemplateSpecJSI>(params);
}

// Sync method example. 
RCT_EXPORT_METHOD(getValue:(RCTResponseSenderBlock)callback)
{
  callback(@[@"Hello from MyTemplate!"]);
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
    [self MyTemplateEvent:@{
      @"message": @"Event from MyTemplate",
      @"timestamp": @([[NSDate date] timeIntervalSince1970])
    }];
  });
}

@end