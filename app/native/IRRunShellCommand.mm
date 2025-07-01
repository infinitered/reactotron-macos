//
//  IRRunShellCommand.mm
//  Reactotron-macOS
//
//  Created by Jamon Holmgren on 4/9/25.
//

#import "IRRunShellCommand.h"

@implementation IRRunShellCommand

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRRunShellCommandSpecJSI>(params);
}

// Below this are the interfaces that can be called from JS.

- (void)runAsync:(NSString *)command resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    @try {
      NSString *output = [self _run:command];
      dispatch_async(dispatch_get_main_queue(), ^{
        resolve(output);
      });
    } @catch (NSException *exception) {
      dispatch_async(dispatch_get_main_queue(), ^{
        reject(@"command_error", exception.reason, nil);
      });
    }
  });
}

- (NSString *)runSync:(NSString *)command {
  return [self _run_c:command];
}

// More reliable, but slowwwwww
- (NSString *)_run:(NSString *)command {
  NSTask *task = [[NSTask alloc] init];
  [task setLaunchPath:@"/bin/zsh"];
  [task setArguments:@[@"-c", command]];
  
  NSPipe *pipe = [NSPipe pipe];
  [task setStandardOutput:pipe];
  [task setStandardError:pipe];
  
  NSFileHandle *file = [pipe fileHandleForReading];
  
  [task launch];
  
  NSData *data = [file readDataToEndOfFile];
  [file closeFile];
  
  [task waitUntilExit];
  
  NSString *output = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
  return output ?: @"";
}

// Blazing fast, watch out for sharp edges
- (NSString *)_run_c:(NSString *)command {
  FILE *pipe = popen([command UTF8String], "r");
  if (!pipe) return @"";
  
  NSMutableString *output = [NSMutableString string];
  char buffer[128];
  
  while (fgets(buffer, sizeof(buffer), pipe) != NULL) {
    [output appendString:[NSString stringWithUTF8String:buffer]];
  }

  pclose(pipe);
  return output;
}

@end
