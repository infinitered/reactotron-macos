#pragma once
#include "NativeModules.h"

namespace winrt::reactotron::implementation
{
    REACT_MODULE(IRClipboard)
    struct IRClipboard
    {
        IRClipboard() noexcept;

        REACT_SYNC_METHOD(getString)
        std::string getString() noexcept;

        REACT_METHOD(setString)
        void setString(std::string const& text) noexcept;
    };
}