//
//  IRClipboard.mm
//  Reactotron-macOS
//
//  Created by Sean Barker on 8/11/25
//

#import <Cocoa/Cocoa.h>
#import "IRClipboard.h"

@implementation IRClipboard RCT_EXPORT_MODULE()

// Sync: get current clipboard string
- (NSString *)getString {
  NSPasteboard *pasteboard = [NSPasteboard generalPasteboard];
  NSString *string = [pasteboard stringForType:NSPasteboardTypeString];
  return string ?: @"";
}

// Void: set clipboard string
- (void)setString:(NSString *)text {
  if (text == nil) { return; }
  NSPasteboard *pasteboard = [NSPasteboard generalPasteboard];
  [pasteboard clearContents];
  [pasteboard setString:text forType:NSPasteboardTypeString];
}

// Required by TurboModules.
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRClipboardSpecJSI>(params);
}

@end

