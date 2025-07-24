//
//  IRRunShellCommand.mm
//  Reactotron-macOS
//
//  Created by Jamon Holmgren on 4/9/25.
//

#import "IRKeyboard.h"

@interface IRKeyboard ()
// Private properties
@property (nonatomic, strong) id keyDownMonitor;
@property (nonatomic, strong) id keyUpMonitor;
@end

@implementation IRKeyboard

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRKeyboardSpecJSI>(params);
}

- (instancetype)init {
  self = [super init];
  if (self) {
    self.keyDownMonitor = nil;
    self.keyUpMonitor = nil;
  }
  return self;
}


// Below this are the interfaces that can be called from JS.

/**
 * Starts listening for keyboard events.
 */
- (void)startListening {
  self.keyDownMonitor = [NSEvent addLocalMonitorForEventsMatchingMask:NSEventMaskKeyDown handler:^NSEvent *(NSEvent *event) {
    NSLog(@"Key pressed: %@", event.characters);
    if ([event.characters isEqualToString:@"a"]) return nil;
    return event;
  }];
  
  self.keyUpMonitor = [NSEvent addLocalMonitorForEventsMatchingMask:NSEventMaskKeyUp handler:^NSEvent *(NSEvent *event) {
    NSLog(@"Key released: %@", event.characters);
    return event;
  }];
}

- (void)stopListening {
  if (self.keyDownMonitor) {
    [NSEvent removeMonitor:self.keyDownMonitor];
    self.keyDownMonitor = nil;
  }
  if (self.keyUpMonitor) {
    [NSEvent removeMonitor:self.keyUpMonitor];
    self.keyUpMonitor = nil;
  }
}

@end
