//
//  IRSystemMenuManager.cpp
//  Reactotron-Windows
//
//  Windows TurboModule implementation of menu item management
//

#include "pch.h"
#include "IRSystemMenuManager.windows.h"

using winrt::reactotron::implementation::IRSystemMenuManager;

namespace winrt::reactotron::implementation
{
    void IRSystemMenuManager::createMenu(std::string menuName,
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
