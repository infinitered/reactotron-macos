#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTDevloadingViewSetEnabled.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>
#import "WindowSetup.h"
#import <pwd.h>

@implementation AppDelegate {
  NSTask *_reactotronTask;
}

#pragma mark - Shell Utilities

- (NSString *)getUserShell
{
  // Get user's default shell from system
  struct passwd *pw = getpwuid(getuid());
  if (pw && pw->pw_shell) {
    return [NSString stringWithUTF8String:pw->pw_shell];
  }
  
  // Fallback to zsh (macOS default)
  return @"/bin/zsh";
}

- (void)runCommandInUserShell:(NSString *)command
{
  NSString *shellPath = [self getUserShell];
  
  NSTask *task = [[NSTask alloc] init];
  [task setLaunchPath:shellPath];
  
  // Use login (-l) and interactive (-i) flags to load user's shell configuration
  // This ensures we get PATH from ~/.zprofile, ~/.zshrc, etc.
  [task setArguments:@[@"-l", @"-i", @"-c", command]];
  
  // Capture output
  NSPipe *outputPipe = [NSPipe pipe];
  NSPipe *errorPipe = [NSPipe pipe];
  [task setStandardOutput:outputPipe];
  [task setStandardError:errorPipe];
  
  NSLog(@"Running command with shell (%@): %@", shellPath, command);
  
  @try {
    [task launch];
    [task waitUntilExit];
    
    // Read output
    NSData *outputData = [[outputPipe fileHandleForReading] readDataToEndOfFile];
    NSData *errorData = [[errorPipe fileHandleForReading] readDataToEndOfFile];
    
    NSString *output = [[NSString alloc] initWithData:outputData encoding:NSUTF8StringEncoding];
    NSString *error = [[NSString alloc] initWithData:errorData encoding:NSUTF8StringEncoding];
    
    int status = [task terminationStatus];
    
    if (status == 0 && output.length > 0) {
      NSLog(@"Command output: %@", [output stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]]);
    } else if (error.length > 0) {
      NSLog(@"Command error: %@", error);
    }
  } @catch (NSException *exception) {
    NSLog(@"Error running command: %@", exception.reason);
  }
}

#pragma mark - Reactotron Server Management

- (void)startReactotronServerWithPort:(NSString *)port
{
  if (_reactotronTask) {
    NSLog(@"Reactotron server already running");
    return;
  }

  NSURL *scriptURL =
    [[NSBundle mainBundle] URLForResource:@"standalone-server.bundle" withExtension:@"js"];
  if (!scriptURL) {
    NSLog(@"⚠️  standalone-server.bundle.js not found in bundle. Run 'npm run bundle-server' to generate it.");
    return;
  }

  NSLog(@"Found server script at: %@", scriptURL.path);

  // Get user's shell to properly load their environment (nvm, asdf, etc.)
  NSString *shellPath = [self getUserShell];
  NSString *serverPort = port ?: @"9292";
  
  // Build the command to run through the user's shell
  // Using login (-l) and interactive (-i) flags ensures PATH is loaded from shell config
  NSString *command = [NSString stringWithFormat:@"node '%@' --port %@", scriptURL.path, serverPort];
  
  _reactotronTask = [[NSTask alloc] init];
  [_reactotronTask setLaunchPath:shellPath];
  [_reactotronTask setArguments:@[@"-l", @"-i", @"-c", command]];

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
    NSLog(@"✅ Reactotron server starting with shell (%@) on port %@", shellPath, serverPort);
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
