#pragma once
#include "NativeModules.h"
#include "..\..\..\..\windows\reactotron\codegen\NativeIRKeyboardDataTypes.g.h"
#include "..\..\..\..\windows\reactotron\codegen\NativeIRKeyboardSpec.g.h"

namespace winrt::reactotron::implementation
{
    REACT_MODULE(IRKeyboard, L"IRKeyboard")
    struct IRKeyboard
    {
        IRKeyboard() noexcept = default;

        REACT_SYNC_METHOD(ctrl)
        bool ctrl() noexcept;
        REACT_SYNC_METHOD(alt)
        bool alt() noexcept;
        REACT_SYNC_METHOD(shift)
        bool shift() noexcept;
        REACT_SYNC_METHOD(cmd)
        bool cmd() noexcept;

        REACT_METHOD(startListening)
        void startListening() noexcept;
        REACT_METHOD(stopListening)
        void stopListening() noexcept;

        REACT_EVENT(onKeyboardEvent)
        std::function<void(reactotronCodegen::IRKeyboardSpec_KeyboardEvent)> onKeyboardEvent;

    private:
        bool m_isListening = false;
        HHOOK m_keyboardHook = nullptr;
    };
}
