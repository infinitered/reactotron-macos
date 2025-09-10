#include "pch.h"
#include "IRKeyboard.windows.h"
#include <windows.h>

using namespace winrt::reactotron::implementation;

namespace
{
    inline bool IsKeyDown(int vk) noexcept { return (GetKeyState(vk) & 0x8000) != 0; }
}

bool IRKeyboard::ctrl() noexcept { return IsKeyDown(VK_CONTROL); }
bool IRKeyboard::alt() noexcept { return IsKeyDown(VK_MENU); }
bool IRKeyboard::shift() noexcept { return IsKeyDown(VK_SHIFT); }
bool IRKeyboard::cmd() noexcept { return IsKeyDown(VK_LWIN) || IsKeyDown(VK_RWIN); }

void IRKeyboard::startListening() noexcept
{
    m_isListening = true;

    // Emit a synthetic event to verify wiring
    reactotronCodegen::IRKeyboardSpec_KeyboardEvent evt{};
    evt.type = "keydown";
    evt.key = "A";
    evt.characters = "a";
    evt.keyCode = 65;
    evt.modifiers = reactotronCodegen::IRKeyboardSpec_KeyboardEvent_modifiers{ctrl(), alt(), shift(), cmd()};

    if (onKeyboardEvent)
        onKeyboardEvent(std::move(evt));
}

void IRKeyboard::stopListening() noexcept { m_isListening = false; }
