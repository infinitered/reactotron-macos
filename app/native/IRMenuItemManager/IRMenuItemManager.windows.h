#pragma once

#include <NativeModules.h>
#include <winrt/Microsoft.ReactNative.h>

// Generated (DataTypes before Spec)
#include "..\..\..\windows\reactotron\codegen\NativeIRMenuItemManagerDataTypes.g.h"
#include "..\..\..\windows\reactotron\codegen\NativeIRMenuItemManagerSpec.g.h"

namespace winrt::reactotron::implementation
{
    REACT_TURBO_MODULE(IRMenuItemManager)
    struct IRMenuItemManager : reactotronCodegen::IRMenuItemManagerSpec
    {
        // Only the essential types needed for the event
        using PressEvent = reactotronCodegen::IRMenuItemManagerSpec_MenuItemPressedEvent;
        using CreateRet = reactotronCodegen::IRMenuItemManagerSpec_createMenu_returnType;

        // One simple method to test event emission
        REACT_METHOD(createMenu)
        void createMenu(std::string menuName, ::React::ReactPromise<CreateRet> &&result) noexcept;

        // --- THE ISSUE: This event is undefined in JavaScript ---
        REACT_EVENT(onMenuItemPressed)
        std::function<void(PressEvent)> onMenuItemPressed;
    };

} // namespace winrt::reactotron::implementation
