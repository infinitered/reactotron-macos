#import "IRSystemInfo.h"
#import <mach/mach.h>

@interface IRSystemInfo ()

@property (nonatomic, strong) NSTimer *monitoringTimer;

@end

@implementation IRSystemInfo

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRSystemInfoSpecJSI>(params);
}

- (instancetype)init {
  self = [super init];
  if (self) {
    _samplingInterval = 1.0;
  }
  return self;
}

- (void)dealloc {
  [self stopMonitoring];
}

- (void)setSamplingInterval:(NSTimeInterval)samplingInterval {
  _samplingInterval = samplingInterval;

  if (self.monitoringTimer) {
    [self.monitoringTimer invalidate];
    self.monitoringTimer = [NSTimer scheduledTimerWithTimeInterval:_samplingInterval
                                                            target:self
                                                          selector:@selector(logMemoryUsage)
                                                          userInfo:nil
                                                           repeats:YES];
  }
}

- (void)startMonitoring {
  if (self.monitoringTimer) {
    [self.monitoringTimer invalidate];
  }
  dispatch_async(dispatch_get_main_queue(), ^{
    self.monitoringTimer = [NSTimer scheduledTimerWithTimeInterval:self.samplingInterval
                                                            target:self
                                                          selector:@selector(logMemoryUsage)
                                                          userInfo:nil
                                                           repeats:YES];
  });

  NSLog(@"[IRSystemInfo] Started monitoring. (%.2f second interval)", self.samplingInterval);
}

- (void)stopMonitoring {
  if (self.monitoringTimer) {
    [self.monitoringTimer invalidate];
    self.monitoringTimer = nil;
    NSLog(@"[IRSystemInfo] Stopped monitoring.");
  }
}

- (void)logMemoryUsage {
  task_t task = mach_task_self();
  mach_task_basic_info info;
  mach_msg_type_number_t count = MACH_TASK_BASIC_INFO_COUNT;

  if (task_info(task, MACH_TASK_BASIC_INFO, (task_info_t)&info, &count) == KERN_SUCCESS) {
    double rss_mb = (double)info.resident_size / (1024.0 * 1024.0);
    double vsz_mb = (double)info.virtual_size / (1024.0 * 1024.0);
    NSLog(@"[IRSystemInfo] Memory Usage - RSS: %.2f MB, VSZ: %.2f MB", rss_mb, vsz_mb);
    [self emitOnSystemInfo:@{
      @"rss" : [NSNumber numberWithDouble: rss_mb],
      @"vsz" : [NSNumber numberWithDouble: vsz_mb],
    }];

  } else {
    NSLog(@"[IRSystemInfo] Failed to get memory information.");
  }
}

@end
