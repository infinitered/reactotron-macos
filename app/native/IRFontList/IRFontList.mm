//
//  IRFontList.mm
//  Reactotron-macOS
//
//  Created by Jamon Holmgren on 4/9/25.
//
#import <Cocoa/Cocoa.h>
#import "IRFontList.h"

@implementation IRFontList RCT_EXPORT_MODULE()

// Add your methods here *******************************************************

// Sync example (very fast)
- (NSArray<NSString *> *)getFontListSync {
  return [[NSFontManager sharedFontManager] availableFontFamilies];
}

// Async example (slower)
- (void)getFontList:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  resolve([[NSFontManager sharedFontManager] availableFontFamilies]);
}

// End ************************************************************************

// Required by TurboModules.
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRFontListSpecJSI>(params);
}

@end
