#import "MyTemplate.h"

@interface MyTemplate ()
// Add any private properties here. Not accessible from JS directly.
@property (nonatomic, strong) NSNumber *someNumber;
@end

@implementation MyTemplate RCT_EXPORT_MODULE()

// Optional constructor, if you need to initialize any private properties
- (instancetype)init {
  self = [super init];
  if (!self) return nil;
  
  // Initialize any private properties here
  self.someNumber = @(123);

  return self;
}

// Add your methods here ************************************************************

// Sync method example -- just call in JS:
//   let res = MyTemplate.getADictionary("someString")
- (NSDictionary *)getADictionary:(NSString *)someString {
  return @{
    @"someString": someString,
    @"someNumber": self.someNumber,
    @"someBool": @(YES)
  };
}

// Async method example -- call in JS:
//   let res = await MyTemplate.getADictionaryAsync("someString")
- (void)getADictionaryAsync: (NSString *)someString resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  resolve(@{
    @"someString": someString,
    @"someNumber": self.someNumber,
    @"someBool": @(YES)
  });

  // Or, if you want to reject:
  // reject(nil, @"Error", nil);

  // Or emit an event in the format `emitOnEventName:eventData`
  // with the shape defined in app/native/specs/NativeMyTemplate.ts
  [self emitOnMyTemplateEvent:@{
    @"message": someString,
    @"timestamp": @(NSDate.date.timeIntervalSince1970)
  }];
}

// End of your methods ************************************************************

// Required by TurboModules.
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeMyTemplateSpecJSI>(params);
}

@end