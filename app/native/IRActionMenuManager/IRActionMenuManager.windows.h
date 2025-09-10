#pragma once
#include "NativeModules.h"

namespace winrt::reactotron::implementation
{
    REACT_MODULE(IRActionMenuManager)
    struct IRActionMenuManager
    {
        IRActionMenuManager() noexcept;

        REACT_METHOD(showActionMenu)
        void showActionMenu(Microsoft::ReactNative::JSValue items) noexcept;

        REACT_EVENT(onActionMenuItemPressed)
        std::function<void(Microsoft::ReactNative::JSValue)> onActionMenuItemPressed;
    };
}