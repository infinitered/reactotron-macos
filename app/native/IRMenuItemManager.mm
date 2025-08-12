#import "IRMenuItemManager.h"
#include <Foundation/Foundation.h>
#import <Cocoa/Cocoa.h>
#import <React/RCTUtils.h>

static NSString * const separatorTag = @"IRMenuItemSeparator";

@implementation IRMenuItemManager {
}

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRMenuItemManagerSpecJSI>(params);
}

#pragma mark - API

- (NSArray<NSString *> *)getAvailableMenus {
  __block NSMutableArray<NSString *> *menuNames;
  dispatch_sync(dispatch_get_main_queue(), ^{
    menuNames = [NSMutableArray array];
    NSMenu *mainMenu = [NSApp mainMenu];
    for (NSMenuItem *item in mainMenu.itemArray) {
      if (item.title.length > 0) [menuNames addObject:item.title];
    }
  });
  return [menuNames copy];
}

- (NSArray *)getMenuStructure {
  __block NSMutableArray *result = [NSMutableArray array];

  dispatch_sync(dispatch_get_main_queue(), ^{
    NSMenu *mainMenu = [NSApp mainMenu];
    for (NSMenuItem *menuItem in mainMenu.itemArray) {
      if (menuItem.title.length == 0 || !menuItem.submenu) continue;

      NSDictionary *entry = @{
        @"title": menuItem.title,
        @"items": [self nodesFromMenu:menuItem.submenu parentPath:@[menuItem.title]]
      };
      [result addObject:entry];
    }
  });

  // Return shape - Array<{ title, items: MenuNode[] }>
  return [result copy];
}

- (void)createMenu:(NSString *)menuName
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    NSMenuItem *existing = [self findTopLevelMenuByTitle:menuName];
    if (existing) {
      resolve(@{@"success": @YES, @"existed": @YES, @"menuName": existing.title ?: menuName});
      return;
    }
    (void)[self ensureMenuPath:@[menuName]];
    resolve(@{@"success": @YES, @"existed": @NO, @"menuName": menuName});
  });
}

- (void)addMenuItemAtPath:(NSArray<NSString *> *)parentPath
                    title:(NSString *)title
            keyEquivalent:(NSString *)keyEquivalent
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    NSMenuItem *parentMenuItem = [self ensureMenuPath:parentPath];
    if (!parentMenuItem || !parentMenuItem.submenu) {
      reject(@"MENU_NOT_FOUND", @"Parent menu not found or has no submenu",
             nil); return;
    }

    if ([[title stringByTrimmingCharactersInSet:[NSCharacterSet
                                                 whitespaceAndNewlineCharacterSet]] isEqualToString:@"---"]) { NSMenuItem *sep =
      [NSMenuItem separatorItem]; sep.representedObject = separatorTag;
      [parentMenuItem.submenu addItem:sep];
      resolve(@{@"success": @YES, @"actualParent": parentPath});
      return;
    }

    NSMenuItem *newItem = [[NSMenuItem alloc] initWithTitle:title
                                                     action:@selector(menuItemPressed:) keyEquivalent:@""]; newItem.target = self;
    [self applyShortcut:keyEquivalent toItem:newItem];
    [parentMenuItem.submenu addItem:newItem];

    resolve(@{@"success": @YES, @"actualParent": parentPath});
  });
}

- (void)insertMenuItemAtPath:(NSArray<NSString *> *)parentPath
                       title:(NSString *)title
                     atIndex:(double)index
               keyEquivalent:(NSString *)keyEquivalent
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    NSMenuItem *parentMenuItem = [self ensureMenuPath:parentPath];
    if (!parentMenuItem || !parentMenuItem.submenu) {
      reject(@"MENU_NOT_FOUND", @"Parent menu not found or has no submenu", nil);
      return;
    }

    NSInteger actual = MAX(0, MIN((NSInteger)index, parentMenuItem.submenu.itemArray.count));

    if ([[title stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] isEqualToString:@"---"]) {
      NSMenuItem *sep = [NSMenuItem separatorItem];
      sep.representedObject = separatorTag;
      [parentMenuItem.submenu insertItem:sep atIndex:actual];
      resolve(@{@"success": @YES, @"actualIndex": @(actual), @"actualParent": parentPath});
      return;
    }

    NSMenuItem *newItem = [[NSMenuItem alloc] initWithTitle:title action:@selector(menuItemPressed:) keyEquivalent:@""];
    newItem.target = self;
    [self applyShortcut:keyEquivalent toItem:newItem];
    [parentMenuItem.submenu insertItem:newItem atIndex:actual];

    resolve(@{@"success": @YES, @"actualIndex": @(actual), @"actualParent": parentPath});
  });
}

- (void)removeMenuItemAtPath:(NSArray<NSString *> *)path
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    if (path.count == 0) {
      resolve(@{@"success": @NO, @"error": @"Empty path"});
      return;
    }

    // If last segment is "---", clear the separators under the parent
    NSString *last = [path lastObject];
    if ([last isEqualToString:@"---"]) {
      if (path.count < 2) {
        resolve(@{@"success": @NO, @"error": @"Need a parent path to remove separators"});
        return;
      }
      NSArray<NSString *> *parentPath = [path subarrayWithRange:NSMakeRange(0, path.count - 1)];
      NSMenuItem *parentMenuItem = [self ensureMenuPath:parentPath];
      if (!parentMenuItem || !parentMenuItem.submenu) {
        resolve(@{@"success": @NO, @"error": @"Parent menu not found or has no submenu"});
        return;
      }
      NSMenu *submenu = parentMenuItem.submenu;
      NSMutableArray<NSMenuItem *> *toRemove = [NSMutableArray array];
      for (NSMenuItem *it in submenu.itemArray) {
        if (it.isSeparatorItem && [it.representedObject isKindOfClass:[NSString class]] &&
            [(NSString *)it.representedObject isEqualToString:separatorTag]) {
          [toRemove addObject:it];
        }
      }
      for (NSMenuItem *sep in toRemove) {
        [submenu removeItem:sep];
      }
      resolve(@{@"success": @YES, @"removed": @(toRemove.count)});
      return;
    }

    // Remove top-level menu
    if (path.count == 1) {
      NSMenu *mainMenu = [NSApp mainMenu];
      NSMenuItem *top = [self findTopLevelMenuByTitle:path.firstObject];
      if (top) {
        [mainMenu removeItem:top];
        resolve(@{@"success": @YES});
      } else {
        resolve(@{@"success": @NO, @"error": @"Menu not found"});
      }
      return;
    }

    // Remove submenu item
    NSMenuItem *leaf = [self findMenuItemByExactPath:path];
    if (leaf && leaf.menu) {
      [leaf.menu removeItem:leaf];
      resolve(@{@"success": @YES});
    } else {
      resolve(@{@"success": @NO, @"error": @"Menu item not found"});
    }
  });
}

- (void)setMenuItemEnabledAtPath:(NSArray<NSString *> *)path
                         enabled:(BOOL)enabled
                         resolve:(RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    NSMenuItem *item = [self findMenuItemByExactPath:path];
    if (item) {
      item.enabled = enabled;
      resolve(@{@"success": @YES});
    } else {
      resolve(@{@"success": @NO, @"error": @"Menu item not found"});
    }
  });
}

#pragma mark - Helpers

- (NSMenuItem *)findTopLevelMenuByTitle:(NSString *)title {
  NSMenu *mainMenu = [NSApp mainMenu];
  for (NSMenuItem *item in mainMenu.itemArray) {
    if ([item.title localizedCaseInsensitiveCompare:title] == NSOrderedSame) return item;
  }
  return nil;
}

- (NSMenuItem *)findChild:(NSMenu *)menu title:(NSString *)title {
  for (NSMenuItem *it in menu.itemArray) {
    if ([it.title localizedCaseInsensitiveCompare:title] == NSOrderedSame) return it;
  }
  return nil;
}

- (NSMenuItem *)ensureMenuPath:(NSArray<NSString *> *)path {
  NSMenu *mainMenu = [NSApp mainMenu];
  if (!mainMenu) return nil;

  NSMenuItem *currentMenuItem = nil;
  NSMenu *currentMenu = mainMenu;

  for (NSUInteger i = 0; i < path.count; i++) {
    NSString *segment = path[i];
    NSMenuItem *existing = (currentMenu == mainMenu)
      ? [self findTopLevelMenuByTitle:segment]
      : [self findChild:currentMenu title:segment];

    if (!existing) {
      NSMenuItem *newItem = [[NSMenuItem alloc] initWithTitle:segment action:nil keyEquivalent:@""];
      NSMenu *submenu = [[NSMenu alloc] initWithTitle:segment];
      newItem.submenu = submenu;

      if (currentMenu == mainMenu) {
        NSInteger insertIndex = MAX(0, mainMenu.itemArray.count - 1); // before "Help", so special lol
        [mainMenu insertItem:newItem atIndex:insertIndex];
      } else {
        [currentMenu addItem:newItem];
      }
      existing = newItem;
    }

    currentMenuItem = existing;
    currentMenu = existing.submenu ?: currentMenu;
  }

  return currentMenuItem;
}

- (NSMenuItem *)findMenuItemByExactPath:(NSArray<NSString *> *)path {
  NSMenu *mainMenu = [NSApp mainMenu];
  if (!mainMenu || path.count == 0) return nil;

  NSMenu *menu = mainMenu;
  NSMenuItem *current = nil;

  for (NSUInteger i = 0; i < path.count; i++) {
    NSString *seg = path[i];
    if (menu == mainMenu && i == 0) {
      current = [self findTopLevelMenuByTitle:seg];
    } else {
      current = [self findChild:menu title:seg];
    }
    if (!current) return nil;
    menu = current.submenu;
  }
  return current;
}

- (NSArray<NSString *> *)pathForMenuItem:(NSMenuItem *)leaf {
  if (!leaf) return @[];
  NSMutableArray<NSString *> *parts = [NSMutableArray arrayWithCapacity:4];
  if (leaf.title) [parts addObject:leaf.title];

  NSMenu *m = leaf.menu;
  while (m) {
    if (m.supermenu) {
      NSInteger idx = [m.supermenu indexOfItemWithSubmenu:m];
      if (idx >= 0) {
        NSMenuItem *parent = [m.supermenu itemAtIndex:idx];
        if (parent.title) [parts addObject:parent.title];
      }
    }
    // TODO: How should I handle the top level? Events don't emit. Maybe I don't need.
    //else {
    //  if (m.title.length > 0) [parts addObject:m.title];
    //}
    m = m.supermenu;
  }

  return [[parts reverseObjectEnumerator] allObjects];
}

- (void)applyShortcut:(NSString *)shortcut toItem:(NSMenuItem *)item {
  if (shortcut.length == 0) return;
  NSArray<NSString *> *parts = [[shortcut lowercaseString] componentsSeparatedByString:@"+"];
  if (parts.count == 0) return;

  NSString *key = [parts lastObject] ?: @"";
  NSEventModifierFlags mask = 0;
  for (NSString *p in parts) {
    if ([p isEqualToString:@"cmd"] || [p isEqualToString:@"command"]) mask |= NSEventModifierFlagCommand;
    else if ([p isEqualToString:@"shift"]) mask |= NSEventModifierFlagShift;
    else if ([p isEqualToString:@"alt"] || [p isEqualToString:@"option"]) mask |= NSEventModifierFlagOption;
    else if ([p isEqualToString:@"ctrl"] || [p isEqualToString:@"control"]) mask |= NSEventModifierFlagControl;
  }
  item.keyEquivalent = key;
  item.keyEquivalentModifierMask = mask;
}

- (NSDictionary *)nodeFromMenu:(NSMenu *)menu parentPath:(NSArray<NSString *> *)parentPath {
  NSMutableArray *children = [NSMutableArray array];
  for (NSMenuItem *it in menu.itemArray) {
    if (it.isSeparatorItem) continue;

    NSArray<NSString *> *path = ({
      NSMutableArray *m = [parentPath mutableCopy];
      if (it.title) [m addObject:it.title];
      [m copy];
    });

    NSMutableDictionary *node = [@{
      @"title": it.title ?: @"",
      @"enabled": @(it.enabled),
      @"path": path
    } mutableCopy];

    if (it.submenu) {
      node[@"children"] = [self nodesFromMenu:it.submenu parentPath:path];
    }
    [children addObject:node];
  }
  return @{ @"items": children };
}

- (NSArray *)nodesFromMenu:(NSMenu *)menu parentPath:(NSArray<NSString *> *)parentPath {
  NSMutableArray *children = [NSMutableArray array];
  for (NSMenuItem *it in menu.itemArray) {
    if (it.isSeparatorItem) continue;

    NSArray<NSString *> *path = ({
      NSMutableArray *m = [parentPath mutableCopy];
      if (it.title) [m addObject:it.title];
      [m copy];
    });

    NSMutableDictionary *node = [@{
      @"title": it.title ?: @"",
      @"enabled": @(it.enabled),
      @"path": path
    } mutableCopy];

    if (it.submenu) {
      node[@"children"] = [self nodesFromMenu:it.submenu parentPath:path];
    }
    [children addObject:node];
  }
  return [children copy];
}

- (void)menuItemPressed:(NSMenuItem *)sender {
  NSArray<NSString *> *menuPath = [self pathForMenuItem:sender];
  if (menuPath.count > 0) {
    [self emitOnMenuItemPressed:@{ @"menuPath": menuPath }];
  }
}

#pragma mark - protocol

// This is called by AppKit to validate menu items (need this for properly handle the disabled items)
- (BOOL)validateMenuItem:(NSMenuItem *)menuItem {
  return menuItem.enabled;
}

@end
