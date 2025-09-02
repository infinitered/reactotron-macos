//
//  IRKeyboard.cpp
//  Reactotron-Windows
//
//  Windows TurboModule implementation of keyboard functionality
//

#include "pch.h"
#include "IRKeyboard.h"

namespace winrt::reactotron::implementation
{
    IRKeyboard::IRKeyboard() noexcept
    {
        // TurboModule initialization
    }

    bool IRKeyboard::ctrl() noexcept
    {
        // TODO: Check if Ctrl key is currently pressed on Windows
        return (GetKeyState(VK_CONTROL) & 0x8000) != 0;
    }

    bool IRKeyboard::alt() noexcept
    {
        // TODO: Check if Alt key is currently pressed on Windows  
        return (GetKeyState(VK_MENU) & 0x8000) != 0;
    }

    bool IRKeyboard::shift() noexcept
    {
        // TODO: Check if Shift key is currently pressed on Windows
        return (GetKeyState(VK_SHIFT) & 0x8000) != 0;
    }

    bool IRKeyboard::cmd() noexcept
    {
        // TODO: Check if Windows key is currently pressed on Windows (equivalent to Cmd on Mac)
        return (GetKeyState(VK_LWIN) & 0x8000) != 0 || (GetKeyState(VK_RWIN) & 0x8000) != 0;
    }

    void IRKeyboard::startListening() noexcept
    {
        // TODO: Implement keyboard event listening for Windows
        // Set up low-level keyboard hook to capture system-wide key events
        // Emit onKeyboardEvent when keys are pressed/released
        m_isListening = true;
    }

    void IRKeyboard::stopListening() noexcept
    {
        // TODO: Stop keyboard event listening and clean up hooks
        m_isListening = false;
    }
}