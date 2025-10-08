#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTDevloadingViewSetEnabled.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>
#import "WindowSetup.h"

@implementation AppDelegate {
  NSTask *_reactotronTask;
}

#pragma mark - Reactotron Server Management

- (NSString *)findNodeBinary
{
  // Use login shell approach to honor nvm/asdf/etc.
  NSTask *which = [[NSTask alloc] init];
  which.launchPath = @"/usr/bin/env";
  which.arguments = @[ @"bash", @"-lc", @"command -v node || true" ];

  NSPipe *pipe = [NSPipe pipe];
  which.standardOutput = pipe;

  [which launch];
  [which waitUntilExit];

  NSData *data = [[pipe fileHandleForReading] readDataToEndOfFile];
  NSString *path = [[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]
                    stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];

  if (path.length > 0) {
    NSLog(@"Found node at: %@", path);
    return path;
  }
  
  NSLog(@"Node not found in shell path, using /usr/bin/env as fallback");
  return @"/usr/bin/env"; // fallback; will run "env node" below
}

- (void)startReactotronServerWithPort:(NSString *)port
{
  if (_reactotronTask) {
    NSLog(@"Reactotron server already running");
    return;
  }

  NSString *node = [self findNodeBinary];

  NSURL *scriptURL =
    [[NSBundle mainBundle] URLForResource:@"standalone-server.bundle" withExtension:@"js"];
  if (!scriptURL) {
    NSLog(@"⚠️  standalone-server.bundle.js not found in bundle. Run 'npm run bundle-server' to generate it.");
    return;
  }

  NSLog(@"Found server script at: %@", scriptURL.path);

  _reactotronTask = [[NSTask alloc] init];
  
  // Launch node directly with arguments (avoid shell -c for security)
  if ([node isEqualToString:@"/usr/bin/env"]) {
    _reactotronTask.launchPath = node;
    _reactotronTask.arguments = @[ @"node", scriptURL.path, @"--port", port ?: @"9292" ];
  } else {
    _reactotronTask.launchPath = node;
    _reactotronTask.arguments = @[ scriptURL.path, @"--port", port ?: @"9292" ];
  }

  // Give the script a sane CWD (app bundle directory)
  _reactotronTask.currentDirectoryPath = [[[NSBundle mainBundle] bundleURL] path];

  // Capture output for debugging
  NSPipe *outputPipe = [NSPipe pipe];
  NSPipe *errorPipe = [NSPipe pipe];
  _reactotronTask.standardOutput = outputPipe;
  _reactotronTask.standardError = errorPipe;

  // Log server output
  outputPipe.fileHandleForReading.readabilityHandler = ^(NSFileHandle *file) {
    NSData *data = [file availableData];
    if (data.length > 0) {
      NSString *output = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
      NSLog(@"[Reactotron Server] %@", [output stringByTrimmingCharactersInSet:[NSCharacterSet newlineCharacterSet]]);
    }
  };

  errorPipe.fileHandleForReading.readabilityHandler = ^(NSFileHandle *file) {
    NSData *data = [file availableData];
    if (data.length > 0) {
      NSString *output = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
      NSLog(@"[Reactotron Server Error] %@", [output stringByTrimmingCharactersInSet:[NSCharacterSet newlineCharacterSet]]);
    }
  };

  __weak __typeof__(self) weakSelf = self;
  _reactotronTask.terminationHandler = ^(NSTask *task) {
    NSLog(@"Reactotron server exited with status: %d", task.terminationStatus);
    __typeof__(self) strongSelf = weakSelf;
    if (strongSelf) {
      strongSelf->_reactotronTask = nil;
    }
  };

  @try {
    [_reactotronTask launch];
    NSLog(@"✅ Reactotron server started on port %@", port ?: @"9292");
  } @catch (NSException *exception) {
    NSLog(@"❌ Failed to start Reactotron server: %@", exception.reason);
    _reactotronTask = nil;
  }
}

- (void)stopReactotronServer
{
  if (_reactotronTask && _reactotronTask.isRunning) {
    NSLog(@"Stopping Reactotron server...");
    [_reactotronTask terminate];
  }
  _reactotronTask = nil;
}

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

  // Start the bundled Reactotron server
  // You can change the port here or make it a user preference
  [self startReactotronServerWithPort:@"9292"];
}

- (void)applicationWillTerminate:(NSNotification *)notification
{
  [self stopReactotronServer];
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
