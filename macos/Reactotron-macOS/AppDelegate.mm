#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTDevloadingViewSetEnabled.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>
#import "WindowSetup.h"

@implementation AppDelegate

#pragma mark - Application Lifecycle

- (void)applicationDidFinishLaunching:(NSNotification *)notification
{
  self.moduleName = @"Reactotron";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  
  // Sometimes the "loading bar" gets stuck on and you have to kill the app to fix it;
  // by turning it off here, we avoid that issue
  RCTDevLoadingViewSetEnabled(false);

  // Enable Fabric views
  self.dependencyProvider = [RCTAppDependencyProvider new];

  [super applicationDidFinishLaunching:notification];
  
  // Configure window chrome before RN mounts
  IRConfigureWindow(self.window);
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
#ifdef RN_FABRIC_ENABLED
  return true;
#else
  return false;
#endif
}

@end
