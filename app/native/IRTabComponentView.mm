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

// Custom tab view item that includes a tabId
@implementation IRTabViewItem : NSTabViewItem
@end

@implementation IRTabComponentView {
  NSTabView *_tabView;
}

// Required static method for Fabric.
+ (ComponentDescriptorProvider)componentDescriptorProvider { return concreteComponentDescriptorProvider<IRTabComponentViewComponentDescriptor>(); }

- (instancetype)init
{
  if (!(self = [super init])) return nil;
  
  _tabView = [[NSTabView alloc] init];
  _tabView.tabViewType = NSTopTabsBezelBorder;
  [self addSubview:_tabView];
  
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  // const auto &oldViewProps = *std::static_pointer_cast<IRTabComponentViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<IRTabComponentViewProps const>(props);

  [self updateTabs:newViewProps.tabs];
  [super updateProps:props oldProps:oldProps];
}

- (void)updateTabs:(const std::vector<IRTabComponentViewTabsStruct>)newTabs
{
  // Update existing tabs and add new ones
  int i = 0;
  for (const auto &tab : newTabs) {
    NSString *tabId = [NSString stringWithUTF8String:tab.id.c_str()];
    NSString *tabTitle = [NSString stringWithUTF8String:tab.title.c_str()];
    
    NSInteger existingIndex = [self getIndexForTabId:tabId];
    if (existingIndex < 0) {
      // check for a dummy index instead that we can fill
      existingIndex = [self getIndexForTabId:[NSString stringWithFormat:@"tab-%@", @(i)]];
    }
    if (existingIndex >= 0) {
      // Update existing tab
      NSLog(@"Updating tab: %@ %@", tabId, tabTitle);
      IRTabViewItem *tabItem = (IRTabViewItem *)_tabView.tabViewItems[existingIndex];
      tabItem.tabId = tabId; // just in case
      tabItem.label = tabTitle;
    } else {
      // Add new tab
      [self addTabItem:tabId title:tabTitle];
    }
    i++;
  }
  // Remove old unused tabs
  // [self removeOldTabs:newTabs];
}

- (void)removeOldTabs:(const std::vector<IRTabComponentViewTabsStruct>)newTabs
{
  // Loop through the current views
  for (IRTabViewItem *tabItem in _tabView.tabViewItems) {
    // If this tabId doesn't exist in the newTabs, then remove it from the tabs
    if (![self tabId: tabItem.tabId existsIn:newTabs]) [_tabView removeTabViewItem:tabItem];
  }
}

- (void)addTabItem:(NSString *)tabId title:(NSString *)tabTitle
{
  NSLog(@"Adding tab: %@ %@", tabId, tabTitle);
  IRTabViewItem *tabItem = [[IRTabViewItem alloc] init];
  tabItem.tabId = tabId;
  tabItem.label = tabTitle;
  tabItem.view = [[NSView alloc] init];
  [_tabView addTabViewItem:tabItem];
}

- (NSInteger)getIndexForTabId:(NSString *)tabId
{
  NSInteger existingIndex = -1;
  for (NSInteger i = 0; i < _tabView.tabViewItems.count; i++) {
    IRTabViewItem *tabItem = (IRTabViewItem *)_tabView.tabViewItems[i];
    if ([tabItem.tabId isEqualToString:tabId]) {
      existingIndex = i;
      break;
    }
  }
  return existingIndex;
}

- (bool)tabId:(NSString *)tabId existsIn:(const std::vector<IRTabComponentViewTabsStruct>)newTabsCPP
{
  for (const auto &tab : newTabsCPP) {
    NSString *title = [NSString stringWithUTF8String:tab.id.c_str()];
    if ([tabId isEqualToString: title]) return YES;
  }
  return NO;
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  _tabView.frame = self.bounds;
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)mountChildComponentView:(NSView<RCTComponentViewProtocol>*)childComponentView index:(NSInteger)index {
    NSLog(@"Mounting tab child %@ at %@", childComponentView.reactTag, @(index));
  
    // Make sure we actually have a tab at this index
    if (index >= _tabView.tabViewItems.count) {
      // Go ahead and create a dummy tab there
      NSString *dummyId = [NSString stringWithFormat:@"tab-%@", @(index)];
      NSString *dummyTitle = [NSString stringWithFormat:@"Tab %@", @(index)];
      [self addTabItem:dummyId title:dummyTitle];
    }

    // Find the container view for this tab
    NSView *container = _tabView.tabViewItems[index].view;
    
    // Add the child component view to the container
    [container addSubview:childComponentView];

    // Resize the child component view to fit the container
    childComponentView.frame = container.bounds;
    childComponentView.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
}

- (void)unmountChildComponentView:(NSView<RCTComponentViewProtocol>*)childComponentView index:(NSInteger)_index {
    [childComponentView removeFromSuperview];
}
#pragma clang diagnostic pop

@end 
