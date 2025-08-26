#import <Cocoa/Cocoa.h>

NS_ASSUME_NONNULL_BEGIN

// One-time window configuration (titlebar style and traffic light position).
// Header-only implementation so it can be used without adding a new build file.
//
// Summary:
// - Enable full-size content titlebar for a unified look
// - Position traffic lights relative to the titlebar container's top-left
// - Preserve native spacing between buttons
// - Lock intrinsic sizes to prevent future layout passes from squishing them

// Finds the private titlebar container by walking up from a standard button.
static inline NSView *_IRTitlebarContainer(NSWindow *w) {
  NSView *btn = [w standardWindowButton:NSWindowCloseButton];
  return btn ? (btn.superview.superview ?: btn.superview) : nil;
}

// One-time window chrome configuration (run before RN mounts).
static inline void IRConfigureWindow(NSWindow * _Nullable window) {
  if (!window) return;

  // Enable full-size content titlebar (content underlays titlebar).
  window.titleVisibility = NSWindowTitleHidden;
  window.titlebarAppearsTransparent = YES;
  window.styleMask |= NSWindowStyleMaskFullSizeContentView;
  if (@available(macOS 11.0, *)) {
    window.toolbarStyle = NSWindowToolbarStyleUnified;
    window.titlebarSeparatorStyle = NSTitlebarSeparatorStyleAutomatic;
  }

  // Desired traffic light position (from the titlebar container's top-left).
  const CGFloat x = 11.0;
  const CGFloat y = 11.0;

  NSView *tb = _IRTitlebarContainer(window);
  if (!tb) return;

  NSButton *closeB = [window standardWindowButton:NSWindowCloseButton];
  NSButton *miniB  = [window standardWindowButton:NSWindowMiniaturizeButton];
  NSButton *zoomB  = [window standardWindowButton:NSWindowZoomButton];
  if (!closeB || !miniB || !zoomB) return;

  // Preserve current native horizontal spacing between the buttons.
  const CGFloat dx1 = NSMinX(miniB.frame) - NSMinX(closeB.frame);
  const CGFloat dx2 = NSMinX(zoomB.frame) - NSMinX(miniB.frame);

  // Remove any previous constraints we might have applied.
  auto removeConstraintsFor = ^(NSView *v) {
    NSMutableArray<NSLayoutConstraint *> *toRemove = [NSMutableArray array];
    for (NSLayoutConstraint *c in v.constraints) {
      if (c.firstItem == v || c.secondItem == v) [toRemove addObject:c];
    }
    for (NSLayoutConstraint *c in tb.constraints) {
      if (c.firstItem == v || c.secondItem == v) {
        [toRemove addObject:c];
      }
    }
    for (NSLayoutConstraint *c in toRemove) {
      [c setActive:NO];
      if ([v.constraints containsObject:c]) [v removeConstraint:c];
      if ([tb.constraints containsObject:c]) [tb removeConstraint:c];
    }
  };

  removeConstraintsFor(closeB);
  removeConstraintsFor(miniB);
  removeConstraintsFor(zoomB);

  // Opt into Auto Layout for these views.
  closeB.translatesAutoresizingMaskIntoConstraints = NO;
  miniB.translatesAutoresizingMaskIntoConstraints  = NO;
  zoomB.translatesAutoresizingMaskIntoConstraints  = NO;

  // Pin close button to top-left; keep others offset by native spacing.
  NSLayoutConstraint *c1 = [closeB.leadingAnchor constraintEqualToAnchor:tb.leadingAnchor constant:x];
  NSLayoutConstraint *c2 = [closeB.topAnchor constraintEqualToAnchor:tb.topAnchor constant:y];
  NSLayoutConstraint *m1 = [miniB.leadingAnchor constraintEqualToAnchor:closeB.leadingAnchor constant:dx1];
  NSLayoutConstraint *m2 = [miniB.topAnchor constraintEqualToAnchor:closeB.topAnchor];
  NSLayoutConstraint *z1 = [zoomB.leadingAnchor constraintEqualToAnchor:miniB.leadingAnchor constant:dx2];
  NSLayoutConstraint *z2 = [zoomB.topAnchor constraintEqualToAnchor:closeB.topAnchor];

  // Lock intrinsic sizes so buttons never get squished by later layout passes.
  NSSize closeSize = closeB.intrinsicContentSize;
  NSSize miniSize  = miniB.intrinsicContentSize;
  NSSize zoomSize  = zoomB.intrinsicContentSize;
  NSLayoutConstraint *cw = [closeB.widthAnchor constraintEqualToConstant:closeSize.width];
  NSLayoutConstraint *ch = [closeB.heightAnchor constraintEqualToConstant:closeSize.height];
  NSLayoutConstraint *mw = [miniB.widthAnchor  constraintEqualToConstant:miniSize.width];
  NSLayoutConstraint *mh = [miniB.heightAnchor constraintEqualToConstant:miniSize.height];
  NSLayoutConstraint *zw = [zoomB.widthAnchor  constraintEqualToConstant:zoomSize.width];
  NSLayoutConstraint *zh = [zoomB.heightAnchor constraintEqualToConstant:zoomSize.height];

  [NSLayoutConstraint activateConstraints:@[c1, c2, m1, m2, z1, z2, cw, ch, mw, mh, zw, zh]];
}

NS_ASSUME_NONNULL_END


