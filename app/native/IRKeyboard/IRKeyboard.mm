//
//  IRKeyboard.mm
//  Reactotron-macOS
//
//  Created by Jamon Holmgren on 4/9/25.
//

#import "IRKeyboard.h"

@interface IRKeyboard ()
// Private properties
@property (nonatomic, strong) id keyDownMonitor;
@property (nonatomic, strong) id keyUpMonitor;
@property (nonatomic, strong) id modifierFlagsMonitor;
@end

@implementation IRKeyboard RCT_EXPORT_MODULE()

- (instancetype)init {
  self = [super init];
  if (self) {
    self.keyDownMonitor = nil;
    self.keyUpMonitor = nil;
    self.modifierFlagsMonitor = nil;
  }
  return self;
}

- (NSDictionary *)keyboardEventFromEvent:(NSEvent *)event withType:(NSString *)type {
  return @{
    @"type": type,
    @"key": event.charactersIgnoringModifiers ?: @"",
    @"characters": event.characters ?: @"",
    @"keyCode": @(event.keyCode),
    @"modifiers": @{
      @"ctrl": @(event.modifierFlags & NSEventModifierFlagControl),
      @"alt": @(event.modifierFlags & NSEventModifierFlagOption),
      @"shift": @(event.modifierFlags & NSEventModifierFlagShift),
      @"cmd": @(event.modifierFlags & NSEventModifierFlagCommand)
    }
  };
}

// Below this are the interfaces that can be called from JS.

- (NSNumber *)ctrl {
  return [NSNumber numberWithInt:([NSEvent modifierFlags] & NSEventModifierFlagControl)];
}

- (NSNumber *)alt {
  return [NSNumber numberWithInt:([NSEvent modifierFlags] & NSEventModifierFlagOption)];
}

- (NSNumber *)shift {
  return [NSNumber numberWithInt:([NSEvent modifierFlags] & NSEventModifierFlagShift)];
}

- (NSNumber *)cmd {
  return [NSNumber numberWithInt:([NSEvent modifierFlags] & NSEventModifierFlagCommand)];
}

/*
when hitting a modifier key, we get this
Event: NSEvent: type=FlagsChanged loc=(0,748) time=1139752.5 flags=0x20102 win=0x146111a10 winNum=93927 ctxt=0x0 keyCode=56
*/

/**
 * Starts listening for keyboard events.
 */
- (void)startListening {
  self.keyDownMonitor = [NSEvent addLocalMonitorForEventsMatchingMask:NSEventMaskKeyDown handler:^NSEvent *(NSEvent *event) {
    NSDictionary *keyboardEvent = [self keyboardEventFromEvent:event withType:@"keydown"];
    [self emitOnKeyboardEvent:keyboardEvent];
    return event;
  }];
  
  self.keyUpMonitor = [NSEvent addLocalMonitorForEventsMatchingMask:NSEventMaskKeyUp handler:^NSEvent *(NSEvent *event) {
    NSDictionary *keyboardEvent = [self keyboardEventFromEvent:event withType:@"keyup"];
    [self emitOnKeyboardEvent:keyboardEvent];
    return event;
  }];

  self.modifierFlagsMonitor = [NSEvent addLocalMonitorForEventsMatchingMask:NSEventMaskFlagsChanged handler:^NSEvent *(NSEvent *event) {
    // Is "modifierKeyChanged" the right event type?
    NSDictionary *keyboardEvent = @{
      @"type": @"modifierKeyChanged",
      @"key": @"",
      @"characters": @"",
      @"keyCode": @(0),
      @"modifiers": @{
        @"ctrl": @(event.modifierFlags & NSEventModifierFlagControl),
        @"alt": @(event.modifierFlags & NSEventModifierFlagOption),
        @"shift": @(event.modifierFlags & NSEventModifierFlagShift),
        @"cmd": @(event.modifierFlags & NSEventModifierFlagCommand)
      }
    };
    [self emitOnKeyboardEvent:keyboardEvent];
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
  if (self.modifierFlagsMonitor) {
    [NSEvent removeMonitor:self.modifierFlagsMonitor];
    self.modifierFlagsMonitor = nil;
  }
}


// Required by TurboModules.
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRKeyboardSpecJSI>(params);
}

@end
