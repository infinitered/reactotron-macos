#import "IRReactotronServer.h"

@implementation IRReactotronServer RCT_EXPORT_MODULE()

/**
 * Returns the path to the bundled Reactotron server script.
 */
- (NSString *)getBundlePath {
  NSURL *bundleURL = [[NSBundle mainBundle] URLForResource:@"standalone-server.bundle" withExtension:@"js"];
  if (bundleURL) {
    NSLog(@"✓ Found Reactotron server bundle at: %@", bundleURL.path);
    return bundleURL.path;
  }
  
  NSLog(@"⚠️ Reactotron server bundle not found in main bundle");
  return nil;
}

// Required by TurboModules.
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRReactotronServerSpecJSI>(params);
}

@end

