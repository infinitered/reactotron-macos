#import "IRTabComponentView.h"
#import <memory>
#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>
#import <react/renderer/components/AppSpec/ComponentDescriptors.h>
#import <react/renderer/components/AppSpec/EventEmitters.h>
#import <react/renderer/components/AppSpec/Props.h>
#import <react/renderer/components/AppSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface IRTabComponentView () <RCTIRTabComponentViewViewProtocol>
@end

@implementation IRTabComponentView {
  NSTextField *_label;
}

// Required static method for Fabric.
+ (ComponentDescriptorProvider)componentDescriptorProvider { return concreteComponentDescriptorProvider<IRTabComponentViewComponentDescriptor>(); }

- (instancetype)init
{
  if (self = [super init]) {
    // Create a simple text label
    _label = [[NSTextField alloc] init];
    _label.stringValue = @"LET'S GO CUSTOM FABRIC VIEW";
    _label.alignment = NSTextAlignmentCenter;
    _label.font = [NSFont systemFontOfSize:26];
    _label.textColor = [NSColor blackColor];
    _label.backgroundColor = [NSColor clearColor];
    _label.bordered = NO;
    _label.editable = NO;
    _label.selectable = NO;
    
    [self addSubview:_label];
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  NSLog(@"IRTabComponentView: updateProps called");
  
  // const auto &oldViewProps = *std::static_pointer_cast<IRTabComponentViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<IRTabComponentViewProps const>(props);

  // Log the props we receive
  NSLog(@"IRTabComponentView: tabs count = %zu", newViewProps.tabs.size());
  NSLog(@"IRTabComponentView: selectedTabId = %s", newViewProps.selectedTabId.c_str());
  
  // Update label text to show we received props
  // Unclear whether we need the dispatch_async here?
  dispatch_async(dispatch_get_main_queue(), ^{
    NSString *labelText = [NSString stringWithFormat:@"IT WORKS (%@ tabs)", [NSString stringWithFormat:@"%i", (int)self.bounds.size.width]];
    self->_label.stringValue = labelText;
  });

  [super updateProps:props oldProps:oldProps];
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  
  NSLog(@"IRTabComponentView: layoutSubviews called, bounds = %@", NSStringFromRect(self.bounds));
  
  // Center the label in the view
  [self performOnMainThread:@selector(layoutLabel)];
}

- (void)layoutLabel
{
  NSRect bounds = self.bounds;
  NSRect labelFrame = [_label.stringValue
    boundingRectWithSize:NSMakeSize(CGFLOAT_MAX, CGFLOAT_MAX)
    options:NSStringDrawingUsesLineFragmentOrigin
    attributes:@{NSFontAttributeName: _label.font}
  ];
  
  labelFrame.origin.x = (bounds.size.width - labelFrame.size.width) / 2;
  labelFrame.origin.y = (bounds.size.height - labelFrame.size.height) / 2;
  
  _label.frame = labelFrame;
}

// Ensure a method is called on the main thread
- (void)performOnMainThread:(SEL)selector {
    if ([NSThread isMainThread]) {
      [self performSelector:selector];
    } else {
      dispatch_async(dispatch_get_main_queue(), ^{
        [self performSelector:selector];
      });
    }
}

@end 
