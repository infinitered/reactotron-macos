#include "pch.h"
#include "IRKeyboard.windows.h"

#include <windows.h>
#include <string>
#include <unordered_map>
#include <winrt/Microsoft.UI.Input.h>
#include <winrt/Microsoft.UI.Content.h>

namespace {
    // Bit tested by GetKeyState for "currently down".
    constexpr auto KEYBOARD_STATE_PRESSED = 0x8000;

    // Global WinAppSDK input state. Keep lifetimes/threading aligned with RNW's UI thread.
    winrt::reactotron::implementation::IRKeyboard* g_keyboardInstance = nullptr;
    winrt::Microsoft::UI::Input::InputKeyboardSource g_keyboardSource{ nullptr };
    winrt::Microsoft::UI::Content::ContentIsland g_contentIsland{ nullptr };
    winrt::event_token g_keyDownToken{};
    winrt::event_token g_keyUpToken{};

    inline bool IsKeyPressed(int vk) noexcept { return (GetKeyState(vk) & KEYBOARD_STATE_PRESSED) != 0; }

    // Virtual-key → label. These labels are consumed cross-platform; changing them can break shortcuts.
    const std::unordered_map<DWORD, std::string> VirtualKeyNames = {
        // Navigation / editing
        {VK_BACK,"Backspace"},{VK_TAB,"Tab"},{VK_RETURN,"\r"},{VK_ESCAPE,"\u001b"},
        {VK_SPACE,"Space"},{VK_DELETE,"Delete"},{VK_HOME,"Home"},{VK_END,"End"},
        {VK_PRIOR,"PageUp"},{VK_NEXT,"PageDown"},{VK_INSERT,"Insert"},

        // Arrows
        {VK_LEFT,"ArrowLeft"},{VK_UP,"ArrowUp"},{VK_RIGHT,"ArrowRight"},{VK_DOWN,"ArrowDown"},

        // Function keys
        {VK_F1,"F1"},{VK_F2,"F2"},{VK_F3,"F3"},{VK_F4,"F4"},{VK_F5,"F5"},{VK_F6,"F6"},
        {VK_F7,"F7"},{VK_F8,"F8"},{VK_F9,"F9"},{VK_F10,"F10"},{VK_F11,"F11"},{VK_F12,"F12"},

        // Numpad digits
        {VK_NUMPAD0,"0"},{VK_NUMPAD1,"1"},{VK_NUMPAD2,"2"},{VK_NUMPAD3,"3"},{VK_NUMPAD4,"4"},
        {VK_NUMPAD5,"5"},{VK_NUMPAD6,"6"},{VK_NUMPAD7,"7"},{VK_NUMPAD8,"8"},{VK_NUMPAD9,"9"},

        // Modifiers normalized to single labels
        {VK_CONTROL,"Control"},{VK_LCONTROL,"Control"},{VK_RCONTROL,"Control"},
        {VK_MENU,"Alt"},{VK_LMENU,"Alt"},{VK_RMENU,"Alt"},
        {VK_SHIFT,"Shift"},{VK_LSHIFT,"Shift"},{VK_RSHIFT,"Shift"},
        {VK_LWIN,"Meta"},{VK_RWIN,"Meta"},
    };

    // VK → human label or character(s). Order matters: table → ASCII A-Z/0-9 → ToUnicode → "Unknown".
    std::string TranslateVirtualKeyToString(DWORD vk) noexcept {
        if (const auto it = VirtualKeyNames.find(vk); it != VirtualKeyNames.end()) return it->second;

        if ((vk >= 'A' && vk <= 'Z') || (vk >= '0' && vk <= '9')) return std::string(1, static_cast<char>(vk));

        BYTE keyboardState[256];
        GetKeyboardState(keyboardState);

        WCHAR unicodeBuffer[8] = {};
        const UINT scanCode = MapVirtualKeyExW(vk, MAPVK_VK_TO_VSC, GetKeyboardLayout(0));
        const int result = ToUnicode(vk, scanCode, keyboardState, unicodeBuffer, 8, 0);

        if (result > 0) {
            char utf8[16] = {};
            WideCharToMultiByte(CP_UTF8, 0, unicodeBuffer, result, utf8, 16, nullptr, nullptr);
            return std::string(utf8);
        }
        return "Unknown";
    }

    // KeyDown only: consumers derive state from live modifiers, not event-latched ones.
    void OnKeyDown(winrt::Microsoft::UI::Input::InputKeyboardSource const&,
                   winrt::Microsoft::UI::Input::KeyEventArgs const& args) noexcept {
        if (!g_keyboardInstance || !g_keyboardInstance->m_isListening) return;

        try {
            const auto vk = static_cast<DWORD>(args.VirtualKey());
            reactotronCodegen::IRKeyboardSpec_KeyboardEvent e{};
            e.type = "keydown";
            e.key = TranslateVirtualKeyToString(vk);
            e.characters = e.key;
            e.keyCode = static_cast<double>(vk);

            // Modifier policy: report actual keys pressed
            e.modifiers = reactotronCodegen::IRKeyboardSpec_KeyboardEvent_modifiers{
                IsKeyPressed(VK_CONTROL),  // ctrl
                IsKeyPressed(VK_MENU),      // alt
                IsKeyPressed(VK_SHIFT),     // shift
                IsKeyPressed(VK_LWIN) || IsKeyPressed(VK_RWIN)  // cmd (Windows key)
            };

            if (g_keyboardInstance->onKeyboardEvent) g_keyboardInstance->onKeyboardEvent(std::move(e));
        } catch (...) {
            #ifdef _DEBUG
            OutputDebugStringA("[IRKeyboard] Exception in OnKeyDown");
            #endif
        }
    }

    // Present for completeness and future use. Currently a no-op; subscription remains intentional.
    void OnKeyUp(winrt::Microsoft::UI::Input::InputKeyboardSource const&,
                 winrt::Microsoft::UI::Input::KeyEventArgs const&) noexcept {}

    // Binds to the current island and wires events. Call on the island's UI thread.
    void InitializeKeyboardCapture(winrt::reactotron::implementation::IRKeyboard* instance) noexcept {
        if (!instance || !instance->m_isListening) return;

        try {
            const auto islands = winrt::Microsoft::UI::Content::ContentIsland::FindAllForCurrentThread();
            if (islands.size() == 0) return;

            g_contentIsland = islands[0];
            g_keyboardSource = winrt::Microsoft::UI::Input::InputKeyboardSource::GetForIsland(g_contentIsland);
            if (!g_keyboardSource) return;

            g_keyboardInstance = instance;
            g_keyDownToken = g_keyboardSource.KeyDown({ OnKeyDown });
            g_keyUpToken   = g_keyboardSource.KeyUp({ OnKeyUp });

            // Encourage focus so keystrokes route to the foreground window (best-effort, not guaranteed).
            if (HWND hwnd = GetActiveWindow()) {
                SetForegroundWindow(hwnd);
                SetFocus(hwnd);
                SendMessage(hwnd, WM_SETFOCUS, 0, 0);
            }
        } catch (...) {
            // Non-fatal: input can be retried on the next startListening().
        }
    }
} // namespace

void winrt::reactotron::implementation::IRKeyboard::Initialize(
    winrt::Microsoft::ReactNative::ReactContext const& reactContext) noexcept {
    // ReactContext is used only to marshal to the owning UI dispatcher.
    m_reactContext = reactContext;
}

// These helpers intentionally query live (GetKeyState) modifier state.
bool winrt::reactotron::implementation::IRKeyboard::ctrl()  noexcept { return IsKeyPressed(VK_CONTROL); }
bool winrt::reactotron::implementation::IRKeyboard::alt()   noexcept { return IsKeyPressed(VK_MENU); }
bool winrt::reactotron::implementation::IRKeyboard::shift() noexcept { return IsKeyPressed(VK_SHIFT); }
bool winrt::reactotron::implementation::IRKeyboard::cmd()   noexcept { return IsKeyPressed(VK_LWIN) || IsKeyPressed(VK_RWIN); }

void winrt::reactotron::implementation::IRKeyboard::startListening() noexcept {
    if (m_isListening || !m_reactContext) return;

    m_isListening = true; // matches original timing; some consumers check this before the dispatch posts
    m_reactContext.UIDispatcher().Post([this]() {
        InitializeKeyboardCapture(this);
    });
}

void winrt::reactotron::implementation::IRKeyboard::stopListening() noexcept {
    if (!m_isListening) return;
    m_isListening = false;

    // Remove handlers if present; tokens must be cleared even on exceptions.
    if (g_keyboardSource) {
        try {
            if (g_keyDownToken.value != 0) { g_keyboardSource.KeyDown(g_keyDownToken); g_keyDownToken = {}; }
            if (g_keyUpToken.value   != 0) { g_keyboardSource.KeyUp(g_keyUpToken);     g_keyUpToken   = {}; }
        } catch (...) {
            // Non-fatal cleanup failure; state below still resets.
        }
        g_keyboardSource = nullptr;
    }

    if (g_keyboardInstance == this) g_keyboardInstance = nullptr;
    g_contentIsland = nullptr;
}
