#pragma once
#include "NativeModules.h"

namespace winrt::reactotron::implementation
{
    REACT_MODULE(IRMenuItemManager)
    struct IRMenuItemManager
    {
        IRMenuItemManager() noexcept;

        REACT_SYNC_METHOD(getAvailableMenus)
        Microsoft::ReactNative::JSValue getAvailableMenus() noexcept;

        REACT_SYNC_METHOD(getMenuStructure)
        Microsoft::ReactNative::JSValue getMenuStructure() noexcept;

        REACT_METHOD(createMenu)
        void createMenu(std::string menuName, Microsoft::ReactNative::ReactPromise<Microsoft::ReactNative::JSValue> const& promise) noexcept;

        REACT_METHOD(addMenuItemAtPath)
        void addMenuItemAtPath(Microsoft::ReactNative::JSValue parentPath, std::string const& title, std::string const& keyEquivalent, Microsoft::ReactNative::ReactPromise<Microsoft::ReactNative::JSValue> const& promise) noexcept;

        REACT_METHOD(insertMenuItemAtPath)
        void insertMenuItemAtPath(Microsoft::ReactNative::JSValue parentPath, std::string const& title, int atIndex, std::string const& keyEquivalent, Microsoft::ReactNative::ReactPromise<Microsoft::ReactNative::JSValue> const& promise) noexcept;

        REACT_METHOD(removeMenuItemAtPath)
        void removeMenuItemAtPath(Microsoft::ReactNative::JSValue path, Microsoft::ReactNative::ReactPromise<Microsoft::ReactNative::JSValue> const& promise) noexcept;

        REACT_METHOD(setMenuItemEnabledAtPath)
        void setMenuItemEnabledAtPath(Microsoft::ReactNative::JSValue path, bool enabled, Microsoft::ReactNative::ReactPromise<Microsoft::ReactNative::JSValue> const& promise) noexcept;

        REACT_EVENT(onMenuItemPressed)
        std::function<void(Microsoft::ReactNative::JSValue)> onMenuItemPressed;
    };
}