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
@property (nonatomic, strong) NSMutableDictionary<NSString *, NSTask *> *runningTasks;
@property (nonatomic, strong) NSLock *tasksLock;

@end

@implementation IRRunShellCommand RCT_EXPORT_MODULE()

- (instancetype)init {
  self = [super init];
  if (self) {
    _runningTasks = [NSMutableDictionary dictionary];
    _tasksLock = [[NSLock alloc] init];
  }
  return self;
}


// Below this are the interfaces that can be called from JS.

/**
 * Returns the path to the app.
 */
- (NSString *)appPath {
  return [[NSBundle mainBundle] bundlePath] ?: @"";
}

/**
 * Returns the PID of the app.
 */
- (NSNumber *)appPID {
  return [NSNumber numberWithInteger:[[NSProcessInfo processInfo] processIdentifier]];
}

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

/*
 * Executes a shell command asynchronously on a background queue.
 * Captures both stdout and stderr streams, and emits events with their output and completion status.
 */

- (void)runTaskWithCommand:(NSString *)command
                      args:(NSArray<NSString *> *)args
                    taskId:(NSString *)taskId {
  dispatch_async(
    dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
      @autoreleasepool {
        NSTask *task = [NSTask new];
        task.executableURL = [NSURL fileURLWithPath:command];
        task.arguments = args;

        [self.tasksLock lock];
        self.runningTasks[taskId] = task;
        [self.tasksLock unlock];

        NSPipe *outPipe = [NSPipe pipe];
        NSPipe *errPipe = [NSPipe pipe];
        task.standardOutput = outPipe;
        task.standardError = errPipe;

        __block BOOL completed = NO;
        __block NSLock *completionLock = [[NSLock alloc] init];

        auto pump = ^(NSPipe *pipe, NSString *stream) {
          pipe.fileHandleForReading.readabilityHandler = ^(NSFileHandle *h) {
            @autoreleasepool {
              NSData *d = h.availableData;
              if (d.length == 0)
                return;
              NSString *output =
              [[NSString alloc] initWithData:d
                                    encoding:NSUTF8StringEncoding];
              if (output && !completed) {
                dispatch_async(dispatch_get_main_queue(), ^{
                  if (!completed) {
                    [self emitOnShellCommandOutput:@{
                    @"taskId" : taskId,
                    @"output" : output,
                    @"type" : stream
                    }];
                  }
                });
              }
            }
          };
        };

        pump(outPipe, @"stdout");
        pump(errPipe, @"stderr");

        task.terminationHandler = ^(NSTask *t) {
          [completionLock lock];
          if (completed) {
            [completionLock unlock];
            return;
          }
          completed = YES;
          [completionLock unlock];

          // Remove from running tasks
          [self.tasksLock lock];
          [self.runningTasks removeObjectForKey:taskId];
          [self.tasksLock unlock];

          outPipe.fileHandleForReading.readabilityHandler = nil;
          errPipe.fileHandleForReading.readabilityHandler = nil;

          dispatch_async(dispatch_get_main_queue(), ^{
            [self emitOnShellCommandComplete:@{
            @"taskId" : taskId,
            @"exitCode" : @(t.terminationStatus)
            }];
          });
        };

        NSError *err = nil;
        if (![task launchAndReturnError:&err]) {
          [completionLock lock];
          completed = YES;
          [completionLock unlock];

          [self.tasksLock lock];
          [self.runningTasks removeObjectForKey:taskId];
          [self.tasksLock unlock];

          dispatch_async(dispatch_get_main_queue(), ^{
            [self emitOnShellCommandOutput:@{
            @"taskId" : taskId,
            @"output" : err.localizedDescription ?: @"launch error",
            @"type" : @"stderr"
            }];
            [self emitOnShellCommandComplete:@{
            @"taskId" : taskId,
            @"exitCode" : @(-1)
            }];
          });
          return;
        }

        [task waitUntilExit];
      }
    });
}

- (NSNumber *)killTaskWithId:(NSString *)taskId {
  [self.tasksLock lock];
  NSTask *task = self.runningTasks[taskId];
  if (task && task.isRunning) {
    [task terminate];
    [self.tasksLock unlock];
    return @YES;
  }
  [self.tasksLock unlock];
  return @NO;
}

- (void)killAllTasks {
  [self.tasksLock lock];
  NSArray *taskIds = [self.runningTasks allKeys];
  for (NSString *taskId in taskIds) {
    NSTask *task = self.runningTasks[taskId];
    if (task && task.isRunning) {
      [task terminate];
    }
  }
  [self.tasksLock unlock];
}

- (NSArray<NSString *> *)getRunningTaskIds {
  [self.tasksLock lock];
  NSMutableArray *runningIds = [NSMutableArray array];
  for (NSString *taskId in self.runningTasks) {
    NSTask *task = self.runningTasks[taskId];
    if (task && task.isRunning) {
      [runningIds addObject:taskId];
    }
  }
  [self.tasksLock unlock];
  return [runningIds copy];
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

// Required by TurboModules.
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRRunShellCommandSpecJSI>(params);
}

@end
