//
//  IRRunShellCommand.mm
//  Reactotron-macOS
//
//  Created by Jamon Holmgren on 4/9/25.
//

#import "IRRunShellCommand.h"
#import <objc/runtime.h>

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

- (void)runTaskWithCommand:(NSString *)command
                arguments:(NSArray<NSString *> *)arguments
                 callback:(void (^)(NSString *output, NSString *typeOfOutput))callback
               completion:(void (^)(int terminationStatus))completion {
  // Create a background thread to run the task
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    @autoreleasepool {
      // Create the NSTask
      NSTask *task = [[NSTask alloc] init];
      task.launchPath = command;
      task.arguments = arguments;

      // Create pipes for stdout and stderr
      NSPipe *stdoutPipe = [NSPipe pipe];
      NSPipe *stderrPipe = [NSPipe pipe];
      task.standardOutput = stdoutPipe;
      task.standardError = stderrPipe;

      // Set up termination handler
      task.terminationHandler = ^(NSTask *terminatedTask) {
        if (completion) {
          dispatch_async(dispatch_get_main_queue(), ^{
            completion(terminatedTask.terminationStatus);
          });
        }
      };

      // Read stdout asynchronously
      [[stdoutPipe fileHandleForReading] setReadabilityHandler:^(NSFileHandle *fileHandle) {
        NSData *data = [fileHandle availableData];
        if (data.length > 0) {
          NSString *output = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
          if (callback) {
            dispatch_async(dispatch_get_main_queue(), ^{
              callback(output, @"stdout");
            });
          }
        }
      }];

      // Read stderr asynchronously
      [[stderrPipe fileHandleForReading] setReadabilityHandler:^(NSFileHandle *fileHandle) {
        NSData *data = [fileHandle availableData];
        if (data.length > 0) {
          NSString *output = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
          if (callback) {
            dispatch_async(dispatch_get_main_queue(), ^{
              callback(output, @"stderr");
            });
          }
        }
      }];

      // Launch the task
      @try {
        [task launch];
        [task waitUntilExit]; // Wait for the task to finish
      } @catch (NSException *exception) {
        NSLog(@"Failed to launch task: %@", exception);
        if (completion) {
          dispatch_async(dispatch_get_main_queue(), ^{
            completion(-1); // Indicate failure
          });
        }
      }

      // Clean up
      [[stdoutPipe fileHandleForReading] setReadabilityHandler:nil];
      [[stderrPipe fileHandleForReading] setReadabilityHandler:nil];
    }
  });
}


@end