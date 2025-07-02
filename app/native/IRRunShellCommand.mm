//
//  IRRunShellCommand.mm
//  Reactotron-macOS
//
//  Created by Jamon Holmgren on 4/9/25.
//

#import "IRRunShellCommand.h"
// #import "ProcessUtils.h"
#import <objc/runtime.h>

@interface IRRunShellCommand ()

@property (nonatomic, strong) NSMutableArray<NSString *> *shutdownCommands;

@end

@implementation IRRunShellCommand

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRRunShellCommandSpecJSI>(params);
}

// Below this are the interfaces that can be called from JS.

/**
 * This method runs a command and returns the output as a string.
 * It's async, so use it for long-running commands.
 */

- (void)runAsync:(NSString *)command resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    @try {
      NSString *output = [self _run_c:command];
      dispatch_async(dispatch_get_main_queue(), ^{ resolve(output); });
    } @catch (NSException *exception) {
      dispatch_async(dispatch_get_main_queue(), ^{ reject(@"command_error", exception.reason, nil); });
    }
  });
}

// /**
//  * This method runs a command and returns the process ID so it can be killed later.
//  */
// - (void)runAsync:(NSString *)command getPID:(nonnull pid_t *)outPID resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
//   dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
//     @try {
//       // Use popen to get the PID
//       NSString *pidCommand = [NSString stringWithFormat:@"%@ & echo $!", command];
//       FILE *pipe = popen([pidCommand UTF8String], "r");
//       if (!pipe) {
//         dispatch_async(dispatch_get_main_queue(), ^{ reject(@"command_error", @"Failed to start command", nil); });
//         return;
//       }

//       // Get the PID of the child process
//       // pid_t pid = _get_pid(pipe);
//       // if (pid == -1) {
//       //     NSLog(@"Failed to retrieve PID.");
//       // } else {
//       //     NSLog(@"Child process PID: %d", pid);
//       //     if (outPID) {
//       //         *outPID = pid; // Pass the PID back to the caller
//       //     }
//       // }
      
//       char buffer[128];
//       NSString *pidString = @"";
//       if (fgets(buffer, sizeof(buffer), pipe) != NULL) {
//         pidString = [NSString stringWithUTF8String:buffer];
//         pidString = [pidString stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
//       }
//       pclose(pipe);
      
//       if (pidString.length > 0) {
//         dispatch_async(dispatch_get_main_queue(), ^{ 
//           resolve(@{@"pid": pidString, @"command": command}); 
//         });
//       } else {
//         dispatch_async(dispatch_get_main_queue(), ^{ reject(@"command_error", @"Failed to get PID", nil); });
//       }
//     } @catch (NSException *exception) {
//       dispatch_async(dispatch_get_main_queue(), ^{ reject(@"command_error", exception.reason, nil); });
//     }
//   });
// }

- (NSString *)runSync:(NSString *)command {
  return [self _run_c:command];
}

/**
 * This method runs a command and returns the output as a string.
 * It's pretty darn fast, mostly written in C. 
 */
- (NSString *)_run_c:(NSString *)command {
  // Open a pipe to run the command
  FILE *pipe = popen([command UTF8String], "r");
  if (!pipe) return @"";
  
  // Allocate a buffer to store the output
  char *buffer = (char *)malloc(1024);
  // Initial capacity is 1024 bytes, but we'll grow it as needed
  size_t capacity = 1024;
  // Current length
  size_t length = 0;
  
  // TODO: Limit the output to 2MB and then start dropping output from the middle.

  // Temporary 128 byte buffer to read chunks from the output
  char temp_buffer[128];
  
  // loop while the command is running
  while (fgets(temp_buffer, sizeof(temp_buffer), pipe) != NULL) {
    // Get the length of the total output so far
    size_t chunk_len = strlen(temp_buffer);

    // if the current length + the chunk length is greater than the capacity,
    // we double the capacity and reallocate the buffer. This is a simple way to
    // make sure we have enough space to store the output.
    if (length + chunk_len > capacity) {
      capacity *= 2;
      buffer = (char *)realloc(buffer, capacity);
    }

    // Copy the current chunk into the buffer
    memcpy(buffer + length, temp_buffer, chunk_len);

    // Add the length of the current chunk to the total length
    length += chunk_len;
  }
  
  // Close and deallocate the pipe
  pclose(pipe);
  
  // Convert the buffer to an NSString so we can return it
  NSString *result = [[NSString alloc] initWithBytes:buffer length:length encoding:NSUTF8StringEncoding] ?: @"";
  
  // Free the buffer to avoid memory leaks
  free(buffer);
  
  return result;
}

- (void)runCommandOnShutdown:(NSString *)command {
  if (!self.shutdownCommands) {
    self.shutdownCommands = [NSMutableArray array];

    // Register for the NSApplicationWillTerminateNotification
    [[NSNotificationCenter defaultCenter]
      addObserver:self
      selector:@selector(_handleAppTermination:)
      name:NSApplicationWillTerminateNotification
      object:nil
    ];
  }
  [self.shutdownCommands addObject:command];
}

- (void)_handleAppTermination:(NSNotification *)notification {
  // Remove the observer
  [[NSNotificationCenter defaultCenter] removeObserver:self name:NSApplicationWillTerminateNotification object:nil];

  // If there are no shutdown commands, do nothing
  if (!self.shutdownCommands || self.shutdownCommands.count == 0) return;

  // Run all shutdown commands
  for (NSString *command in self.shutdownCommands) {
    NSLog(@"Running shutdown command: %@", command);
    [self _run_c:command];
  }

  // Clear the shutdown commands
  self.shutdownCommands = nil;
}

@end