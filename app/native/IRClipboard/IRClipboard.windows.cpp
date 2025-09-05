//
//  IRClipboard.cpp
//  Reactotron-Windows
//
//  Windows TurboModule implementation of clipboard functionality
//

#include "pch.h"
#include "IRClipboard.windows.h"

namespace winrt::reactotron::implementation
{
    IRClipboard::IRClipboard() noexcept
    {
        // TurboModule initialization
    }

    std::string IRClipboard::getString() noexcept
    {
        // TODO: Implement clipboard get functionality for Windows
        // Use GetClipboardData with CF_TEXT format
        return "";
    }

    void IRClipboard::setString(std::string text) noexcept
    {
        // TODO: Implement clipboard set functionality for Windows
        // Use SetClipboardData with CF_TEXT format
    }
}