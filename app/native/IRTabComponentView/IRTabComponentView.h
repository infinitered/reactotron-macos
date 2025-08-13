#import <React/RCTViewComponentView.h>
#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface IRTabComponentView : RCTViewComponentView
@property (nonatomic, strong) NSString *tabId;
@end

@interface IRTabViewItem : NSTabViewItem
@property (nonatomic, strong) NSString *tabId;
@end

NS_ASSUME_NONNULL_END
