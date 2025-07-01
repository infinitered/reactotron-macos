//
//  IRFontList.mm
//  Reactotron-macOS
//
//  Created by Jamon Holmgren on 4/9/25.
//

#import "IRFontList.h"

@implementation IRFontList

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRFontListSpecJSI>(params);
}

// Below this are the interfaces that can be called from JS.

// Sync example (very fast)
- (NSArray<NSString *> *)getFontListSync {
  return [[NSFontManager sharedFontManager] availableFontFamilies];
}

// Async example (1000x slower)
- (void)getFontList:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  resolve([[NSFontManager sharedFontManager] availableFontFamilies]);
}

@end
