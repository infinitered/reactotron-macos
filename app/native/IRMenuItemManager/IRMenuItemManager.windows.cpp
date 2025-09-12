//
//  IRMenuItemManager.cpp
//  Reactotron-Windows
//
//  Windows TurboModule implementation of menu item management
//

#include "pch.h"
#include "IRMenuItemManager.windows.h"

using winrt::reactotron::implementation::IRMenuItemManager;

namespace winrt::reactotron::implementation
{
    void IRMenuItemManager::createMenu(std::string menuName,
                                       ::React::ReactPromise<CreateRet> &&result) noexcept
    {
        // THE PROBLEM: onMenuItemPressed is nullptr/undefined at runtime
        if (onMenuItemPressed)
        {
            PressEvent evt{};
            evt.menuPath = {"Test", "Event"};
            onMenuItemPressed(evt);
        }

        CreateRet ret{};
        ret.success = true;
        ret.existed = false;
        ret.menuName = menuName;
        result.Resolve(std::move(ret));
    }

} // namespace winrt::reactotron::implementation
