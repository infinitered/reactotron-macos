#pragma once
#include "NativeModules.h"

namespace winrt::reactotron::implementation
{
    REACT_MODULE(IRExperimental)
    struct IRExperimental
    {
        IRExperimental() noexcept;

        REACT_SYNC_METHOD(invokeObjC)
        std::string invokeObjC(std::string const& input) noexcept;
    };
}