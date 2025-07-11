#import <Foundation/Foundation.h>
#import <AppSpec/AppSpec.h>

NS_ASSUME_NONNULL_BEGIN

@interface IRSystemInfo : NativeIRSystemInfoSpecBase <NativeIRSystemInfoSpec>

@property (nonatomic, assign) NSTimeInterval samplingInterval;

@end

NS_ASSUME_NONNULL_END
