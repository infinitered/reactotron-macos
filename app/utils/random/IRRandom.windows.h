#pragma once
#include "NativeModules.h"

namespace winrt::reactotron::implementation
{
    REACT_MODULE(IRRandom)
    struct IRRandom
    {
        IRRandom() noexcept;

        REACT_SYNC_METHOD(getUUID)
        std::string getUUID() noexcept;
    };
}