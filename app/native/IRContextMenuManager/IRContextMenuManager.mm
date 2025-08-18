#import "IRContextMenuManager.h"
#import <Cocoa/Cocoa.h>
#import <React/RCTUtils.h>

static NSString * const kSeparatorString = @"menu-item-separator";

@implementation IRContextMenuManager

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRContextMenuManagerSpecJSI>(params);
}

#pragma mark - API

- (void)showContextMenu:(NSArray *)items {
  RCTExecuteOnMainQueue(^{
    [self presentContextMenuWithItems:items];
  });
}

#pragma mark - Helpers

- (void)presentContextMenuWithItems:(NSArray *)items {
  NSMenu *menu = [[NSMenu alloc] initWithTitle:@""];

  [self buildMenu:menu fromEntries:items path:@[]];

  NSEvent *event = [NSEvent mouseEventWithType:NSEventTypeRightMouseDown
    location:[self currentMouseLocation]
    modifierFlags:0
    timestamp:[[NSProcessInfo processInfo] systemUptime]
    windowNumber:[[NSApp keyWindow] windowNumber]
    context:nil
    eventNumber:0
    clickCount:1
    pressure:1.0
  ];

  [NSMenu popUpContextMenu:menu withEvent:event forView:[[NSApp keyWindow] contentView]];
}

- (NSPoint)currentMouseLocation {
  NSPoint screenPoint = [NSEvent mouseLocation];
  
  // Convert screen -> window coordinates for the key window
  NSWindow *window = [NSApp keyWindow];
  if (!window) {
    return screenPoint; // best effort
  }
  
  NSRect screenRect = NSMakeRect(screenPoint.x, screenPoint.y, 0, 0);
  NSPoint windowPoint = [window convertRectFromScreen:screenRect].origin;
  return windowPoint;
}

- (void)buildMenu:(NSMenu *)menu fromEntries:(NSArray *)entries path:(NSArray<NSString *> *)path {
  for (id entry in entries) {
    if ([entry isKindOfClass:[NSString class]] && [(NSString *)entry isEqualToString:kSeparatorString]) {
      [menu addItem:[NSMenuItem separatorItem]];
      continue;
    }

    if (![entry isKindOfClass:[NSDictionary class]]) continue;
    NSDictionary *item = (NSDictionary *)entry;
    NSString *label = item[@"label"] ?: @"";
    BOOL enabled = item[@"enabled"] != nil ? [item[@"enabled"] boolValue] : YES;
    BOOL checked = item[@"checked"] != nil ? [item[@"checked"] boolValue] : NO;
    NSString *shortcut = item[@"shortcut"] ?: @"";
    NSArray *children = item[@"children"];

    NSMenuItem *menuItem = [[NSMenuItem alloc] initWithTitle:label action:enabled ? @selector(_ir_menuItemPressed:) : nil keyEquivalent:@""];
    menuItem.target = enabled ? self : nil;
    menuItem.enabled = enabled;
    menuItem.state = checked ? NSControlStateValueOn : NSControlStateValueOff;
    if (shortcut.length > 0) {
      [self applyShortcut:shortcut toItem:menuItem];
    }

    NSArray<NSString *> *currentPath = label ? [path arrayByAddingObject:label] : [path copy];
    menuItem.representedObject = currentPath;

    if ([children isKindOfClass:[NSArray class]] && children.count > 0) {
      NSMenu *submenu = [[NSMenu alloc] initWithTitle:label];
      [self buildMenu:submenu fromEntries:children path:currentPath];
      menuItem.submenu = submenu;
    }

    [menu addItem:menuItem];
  }
}

- (NSString *)keyEquivalentForKeyName:(NSString *)keyName {
  // Map common key names to their NSMenuItem key equivalents
  static NSDictionary *keyMap = nil;
  if (!keyMap) {
    keyMap = @{
      @"enter": @"\r",
      @"return": @"\r", 
      @"space": @" ",
      @"tab": @"\t",
      @"delete": @"\x08",
      @"backspace": @"\x08",
      @"escape": @"\x1b",
      @"esc": @"\x1b",
      @"up": @"\uF700",
      @"down": @"\uF701", 
      @"left": @"\uF702",
      @"right": @"\uF703",
      @"f1": @"\uF704",
      @"f2": @"\uF705",
      @"f3": @"\uF706",
      @"f4": @"\uF707",
      @"f5": @"\uF708",
      @"f6": @"\uF709",
      @"f7": @"\uF70A",
      @"f8": @"\uF70B",
      @"f9": @"\uF70C",
      @"f10": @"\uF70D",
      @"f11": @"\uF70E",
      @"f12": @"\uF70F"
    };
  }
  
  // Check if it's a special key
  NSString *mapped = keyMap[keyName];
  if (mapped) return mapped;

  // For single character keys, return as-is if it's a valid single character
  if (keyName.length == 1) return keyName;
  
  // Return empty string for unknown keys
  return @"";
}

- (void)applyShortcut:(NSString *)shortcut toItem:(NSMenuItem *)item {
  if (shortcut.length == 0) return;
  NSArray<NSString *> *parts = [[shortcut lowercaseString] componentsSeparatedByString:@"+"]; 
  if (parts.count == 0) return;

  NSString *keyName = [parts lastObject] ?: @"";
  NSEventModifierFlags mask = 0;
  for (NSString *p in parts) {
    if ([p isEqualToString:@"cmd"] || [p isEqualToString:@"command"]) mask |= NSEventModifierFlagCommand;
    else if ([p isEqualToString:@"shift"]) mask |= NSEventModifierFlagShift;
    else if ([p isEqualToString:@"alt"] || [p isEqualToString:@"option"]) mask |= NSEventModifierFlagOption;
    else if ([p isEqualToString:@"ctrl"] || [p isEqualToString:@"control"]) mask |= NSEventModifierFlagControl;
  }
  
  // Map key names to actual key equivalents
  NSString *keyEquivalent = [self keyEquivalentForKeyName:keyName];
  if (keyEquivalent.length > 0) {
    item.keyEquivalent = keyEquivalent;
    item.keyEquivalentModifierMask = mask;
  }
}

- (void)_ir_menuItemPressed:(NSMenuItem *)sender {
  NSArray<NSString *> *path = sender.representedObject;
  if (![path isKindOfClass:[NSArray class]]) return;
  [self emitOnContextMenuItemPressed:@{ @"menuPath": path }];
}

@end


