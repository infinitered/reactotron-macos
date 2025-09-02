#import "IRSystemInfo.h"
#import <mach/mach.h>

// Private properties
@interface IRSystemInfo ()
@property (nonatomic, strong) NSTimer *monitoringTimer;
@property (nonatomic, assign) NSTimeInterval samplingInterval;
@end

// The actual implementation of IRSystemInfo.
@implementation IRSystemInfo RCT_EXPORT_MODULE()

// Constructor
- (instancetype)init {
  self = [super init];
  if (!self) return nil;
  
  _samplingInterval = 1.0;
  return self;
}

- (void)dealloc {
  [self stopMonitoring];
}

- (void)setSamplingInterval:(NSTimeInterval)samplingInterval {
  _samplingInterval = samplingInterval;
  if (!self.monitoringTimer) return;
  
  [self.monitoringTimer invalidate];
  self.monitoringTimer = [NSTimer
    scheduledTimerWithTimeInterval: _samplingInterval
    target: self
    selector: @selector(monitorAllSystemInfo)
    userInfo: nil
    repeats: YES
  ];
}

- (void)startMonitoring {
  if (self.monitoringTimer) {
    [self.monitoringTimer invalidate];
    self.monitoringTimer = nil;
  }

  dispatch_async(dispatch_get_main_queue(), ^{
    self.monitoringTimer = [NSTimer
      scheduledTimerWithTimeInterval: self.samplingInterval
      target: self
      selector: @selector(monitorAllSystemInfo)
      userInfo: nil
      repeats: YES
    ];
  });

  NSLog(@"[IRSystemInfo] Started monitoring. (%.2f second interval)", self.samplingInterval);
}

- (void)stopMonitoring {
  if (!self.monitoringTimer) return;
  
  [self.monitoringTimer invalidate];
  self.monitoringTimer = nil;
  NSLog(@"[IRSystemInfo] Stopped monitoring.");
}

- (void)monitorAllSystemInfo {
  NSDictionary *mem = [self getMemoryUsage];
  NSNumber *cpu = [self getCPUUsage];

  [self emitOnSystemInfo:@{
    @"rss": mem[@"rss"],
    @"vsz": mem[@"vsz"],
    @"cpu": cpu,
  }];
}

- (nullable NSDictionary<NSString*, NSNumber*> *)getMemoryUsage {
  task_t task = mach_task_self();
  mach_task_basic_info info;
  mach_msg_type_number_t count = MACH_TASK_BASIC_INFO_COUNT;
  kern_return_t kern_return = task_info(task, MACH_TASK_BASIC_INFO, (task_info_t)&info, &count);

  if (kern_return != KERN_SUCCESS) {
    NSLog(@"[IRSystemInfo] Failed to get memory information.");
    return nil;
  }

  double rss_mb = (double)info.resident_size / (1024.0 * 1024.0);
  double vsz_mb = (double)info.virtual_size / (1024.0 * 1024.0);

  NSLog(@"[IRSystemInfo] Memory Usage - RSS: %.2f MB, VSZ: %.2f MB", rss_mb, vsz_mb);

  NSDictionary<NSString *, NSNumber *> *result = @{
    @"rss" : @(rss_mb),
    @"vsz" : @(vsz_mb)
  };

  return result;
}

- (NSNumber *)getCPUUsage {
  task_t task = mach_task_self();
  thread_array_t threads;
  mach_msg_type_number_t count;

  if (task_threads(task, &threads, &count) != KERN_SUCCESS) {
    NSLog(@"IRSystemInfo: Failed to get thread information");
    return @0.0;
  }

  double totalCPU = 0.0;

  for (mach_msg_type_number_t i = 0; i < count; i++) {
    thread_basic_info_data_t info;
    mach_msg_type_number_t infoCount = THREAD_BASIC_INFO_COUNT;

    if (thread_info(threads[i], THREAD_BASIC_INFO, (thread_info_t)&info, &infoCount) == KERN_SUCCESS) {
      if (!(info.flags & TH_FLAGS_IDLE)) {
        // TEST
        NSLog(@"thread %i, %.2f%%", i, (double)info.cpu_usage / TH_USAGE_SCALE * 100.0);
        totalCPU += (double)info.cpu_usage / TH_USAGE_SCALE * 100.0;
      }
    }
  }

  for (mach_msg_type_number_t i = 0; i < count; i++) {
    mach_port_deallocate(mach_task_self(), threads[i]);
  }
  vm_deallocate(mach_task_self(), (vm_offset_t)threads, count * sizeof(thread_t));

  NSLog(@"[IRSystemInfo] CPU Usage: %.2f%%", totalCPU);

  return [NSNumber numberWithDouble:totalCPU];
}

// Required by TurboModules.
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRSystemInfoSpecJSI>(params);
}

@end
