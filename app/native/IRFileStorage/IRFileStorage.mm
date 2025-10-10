//
//  IRFileStorage.mm
//  Reactotron-macOS
//

#import <Foundation/Foundation.h>
#import <AppSpec/AppSpec.h>

@interface IRFileStorage : NativeIRFileStorageSpecBase <NativeIRFileStorageSpec>
@end

@implementation IRFileStorage

RCT_EXPORT_MODULE()

static BOOL ensureDirectoryExists(NSString *path) {
  if (path.length == 0) return NO;
  BOOL isDir = NO;
  NSFileManager *fm = [NSFileManager defaultManager];
  if ([fm fileExistsAtPath:path isDirectory:&isDir]) {
    return isDir;
  }
  NSError *error = nil;
  BOOL ok = [fm createDirectoryAtPath:path withIntermediateDirectories:YES attributes:nil error:&error];
  return ok && error == nil;
}

// Spec methods (sync)
- (NSString *)read:(NSString *)path {
  if (path == nil || path.length == 0) return @"";
  NSData *data = [NSData dataWithContentsOfFile:path];
  if (data == nil) return @"";
  NSString *str = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
  return str ?: @"";
}

- (void)write:(NSString *)path data:(NSString *)data {
  if (path == nil || data == nil) return;
  NSString *dir = [path stringByDeletingLastPathComponent];
  ensureDirectoryExists(dir);
  NSError *err = nil;
  [data writeToFile:path atomically:YES encoding:NSUTF8StringEncoding error:&err];
}

- (void)remove:(NSString *)path {
  if (path == nil) return;
  NSFileManager *fm = [NSFileManager defaultManager];
  if (![fm fileExistsAtPath:path]) return;
  NSError *err = nil;
  [fm removeItemAtPath:path error:&err];
}

- (void)ensureDir:(NSString *)path {
  if (path == nil) return;
  ensureDirectoryExists(path);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRFileStorageSpecJSI>(params);
}

@end


