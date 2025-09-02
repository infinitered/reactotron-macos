#pragma once
#include "NativeModules.h"

namespace winrt::reactotron::implementation
{
    REACT_MODULE(IRKeyboard)
    struct IRKeyboard
    {
        IRKeyboard() noexcept;

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
        std::function<void(Microsoft::ReactNative::JSValue)> onKeyboardEvent;

    private:
        bool m_isListening = false;
    };
}