#import "IRMenuItemManager.h"
#include <Foundation/Foundation.h>
#import <Cocoa/Cocoa.h>
#import <React/RCTUtils.h>

@implementation IRMenuItemManager {
  NSMutableDictionary<NSString *, NSMenuItem *> *_menuItems;
}

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRMenuItemManagerSpecJSI>(params);
}

- (instancetype)init {
  self = [super init];
  if (self) {
    _menuItems = [NSMutableDictionary dictionary];
  }
  return self;
}

- (NSArray<NSString *> *)getAvailableMenus {
  __block NSMutableArray<NSString *> *menuNames;
  dispatch_sync(dispatch_get_main_queue(), ^{
    menuNames = [NSMutableArray array];
    NSMenu *mainMenu = [NSApp mainMenu];
    for (NSMenuItem *item in mainMenu.itemArray) {
      if (item.title && item.title.length > 0) {
        [menuNames addObject:item.title];
      }
    }
  });
  return [menuNames copy];
}

- (NSMenuItem *)findMenuByName:(NSString *)menuName {
  NSMenuItem *menuItem = nil;
  NSMenu *mainMenu = [NSApp mainMenu];

  for (NSMenuItem *item in mainMenu.itemArray) {
    if ([item.title localizedCaseInsensitiveCompare:menuName] == NSOrderedSame ||
        [item.title localizedCaseInsensitiveContainsString:menuName]) {
      menuItem = item;
      break;
    }
  }

  return menuItem;
}

- (void)addMenuItem:(NSString *)menuItemId
              title:(NSString *)title
           menuName:(NSString *)menuName
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    NSMenuItem *targetMenuItem = [self findMenuByName:menuName];

    if (targetMenuItem && targetMenuItem.submenu) {
      if (self->_menuItems[menuItemId]) {
        resolve(@{@"success": @NO, @"error": @"Menu item already exists"});
        return;
      }

      NSMenuItem *newItem = [[NSMenuItem alloc] initWithTitle:title
                                                       action:@selector(menuItemPressed:)
                                                keyEquivalent:@""];
      newItem.target = self;
      newItem.representedObject = menuItemId;
      [targetMenuItem.submenu addItem:newItem];
      self->_menuItems[menuItemId] = newItem;
      resolve(@{@"success": @YES, @"actualMenuName": targetMenuItem.title});
    } else {
      reject(@"MENU_NOT_FOUND", [NSString stringWithFormat:@"Menu '%@' not found. Available menus: %@", menuName, [[self getAvailableMenus] componentsJoinedByString:@", "]], nil);
    }
  });
}

- (void)addMenuItemWithOptions:(NSString *)menuItemId
                         title:(NSString *)title
                      menuName:(NSString *)menuName
                 keyEquivalent:(NSString *)keyEquivalent
            addSeparatorBefore:(BOOL)addSeparatorBefore
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    NSMenuItem *targetMenuItem = [self findMenuByName:menuName];

    if (targetMenuItem && targetMenuItem.submenu) {
      if (self->_menuItems[menuItemId]) {
        resolve(@{@"success": @NO, @"error": @"Menu item already exists"});
        return;
      }

      if (addSeparatorBefore) {
        [targetMenuItem.submenu addItem:[NSMenuItem separatorItem]];
      }

      NSMenuItem *newItem = [[NSMenuItem alloc] initWithTitle:title
                                                       action:@selector(menuItemPressed:)
                                                keyEquivalent:keyEquivalent ?: @""];
      newItem.target = self;
      newItem.representedObject = menuItemId;
      [targetMenuItem.submenu addItem:newItem];
      self->_menuItems[menuItemId] = newItem;
      resolve(@{@"success": @YES, @"actualMenuName": targetMenuItem.title});
    } else {
      reject(@"MENU_NOT_FOUND", [NSString stringWithFormat:@"Menu '%@' not found. Available menus: %@", menuName, [[self getAvailableMenus] componentsJoinedByString:@", "]], nil);
    }
  });
}

- (void)createMenu:(NSString *)menuName
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    NSMenuItem *existingMenu = [self findMenuByName:menuName];
    if (existingMenu) {
      resolve(@{@"success": @YES, @"existed": @YES, @"menuName": existingMenu.title});
      return;
    }

    NSMenu *mainMenu = [NSApp mainMenu];
    NSMenuItem *newMenuItem = [[NSMenuItem alloc] initWithTitle:menuName action:nil keyEquivalent:@""];
    NSMenu *submenu = [[NSMenu alloc] initWithTitle:menuName];
    newMenuItem.submenu = submenu;

    NSInteger insertIndex = MAX(0, mainMenu.itemArray.count - 1);
    [mainMenu insertItem:newMenuItem atIndex:insertIndex];

    resolve(@{@"success": @YES, @"existed": @NO, @"menuName": menuName});
  });
}

- (void)insertMenuItem:(NSString *)menuItemId
                 title:(NSString *)title
              menuName:(NSString *)menuName
               atIndex:(double)index
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    NSMenuItem *targetMenuItem = [self findMenuByName:menuName];

    if (targetMenuItem && targetMenuItem.submenu) {
      if (self->_menuItems[menuItemId]) {
        resolve(@{@"success": @NO, @"error": @"Menu item already exists"});
        return;
      }

      NSMenuItem *newItem = [[NSMenuItem alloc] initWithTitle:title
                                                       action:@selector(menuItemPressed:)
                                                keyEquivalent:@""];
      newItem.target = self;
      newItem.representedObject = menuItemId;

      NSInteger actualIndex = MAX(0, MIN(index, targetMenuItem.submenu.itemArray.count));
      [targetMenuItem.submenu insertItem:newItem atIndex:actualIndex];
      self->_menuItems[menuItemId] = newItem;
      resolve(@{@"success": @YES, @"actualIndex": @(actualIndex)});
    } else {
      reject(@"MENU_NOT_FOUND", [NSString stringWithFormat:@"Menu '%@' not found", menuName], nil);
    }
  });
}

- (void)removeMenuItemByName:(NSString *)menuName
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    NSMenu *mainMenu = [NSApp mainMenu];
    NSMenuItem *menuItem = [self findMenuByName:menuName];
    if (menuItem) {
      [mainMenu removeItem:menuItem];
      resolve(@{ @"success": @YES });
    } else {
      resolve(@{ @"success": @NO, @"error": @"Menu not found" });
    }
  });
}

- (void)removeMenuItemById:(NSString *)menuItemId
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    NSMenuItem *item = self->_menuItems[menuItemId];
    if (item && item.menu) {
      [item.menu removeItem:item];
      [self->_menuItems removeObjectForKey:menuItemId];
      resolve(@{@"success": @YES});
    } else {
      resolve(@{@"success": @NO, @"error": @"Menu item not found"});
    }
  });
}

- (void)setMenuItemEnabled:(NSString *)menuItemId
                   enabled:(BOOL)enabled
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  RCTExecuteOnMainQueue(^{
    NSMenuItem *item = self->_menuItems[menuItemId];
    if (item) {
      item.enabled = enabled;

      // TODO: still can select. fix it.
      if (!enabled) {
        NSDictionary *attrs = @{NSForegroundColorAttributeName : [NSColor disabledControlTextColor]};
        item.attributedTitle = [[NSAttributedString alloc] initWithString:item.title attributes:attrs];
      }
      resolve(@{@"success": @YES});
    } else {
      resolve(@{@"success": @NO, @"error": @"Menu item not found"});
    }
  });
}

- (NSArray<NSString *> *)getAllMenuItems {
  __block NSArray<NSString *> *result;
  dispatch_sync(dispatch_get_main_queue(), ^{
    result = [self->_menuItems allKeys] ?: @[];
  });
  return result;
}

- (NSDictionary *)getMenuStructure {
  __block NSMutableArray *result = [NSMutableArray array];

  dispatch_sync(dispatch_get_main_queue(), ^{
    NSMenu *mainMenu = [NSApp mainMenu];

    for (NSMenuItem *menuItem in mainMenu.itemArray) {
      if (menuItem.title && menuItem.submenu) {
        NSMutableArray *items = [NSMutableArray array];
        for (NSMenuItem *subItem in menuItem.submenu.itemArray) {
          if (subItem.title && !subItem.isSeparatorItem) {
            [items addObject:@{
              @"title": subItem.title,
              @"enabled": @(subItem.enabled),
              @"id": subItem.representedObject ?: [NSNull null]
            }];
          }
        }
        [result addObject:@{
          @"title": menuItem.title,
          @"items": items
        }];
      }
    }
  });
  return [result copy];
}

- (void)menuItemPressed:(NSMenuItem *)sender {
  NSString *menuItemId = (NSString *)sender.representedObject;
  if (menuItemId) {
    [self emitOnMenuItemPressed:@{
      @"menuItemId": menuItemId
    }];
  }
}

- (BOOL)validateMenuItem:(NSMenuItem *)menuItem {
  NSString *itemId = menuItem.representedObject;

  return YES;
}

@end
