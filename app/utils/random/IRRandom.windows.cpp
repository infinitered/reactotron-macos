//
//  IRRandom.cpp
//  Reactotron-Windows
//
//  Windows TurboModule implementation of random/UUID functionality
//

#include "pch.h"
#include "IRRandom.windows.h"

namespace winrt::reactotron::implementation
{
    IRRandom::IRRandom() noexcept
    {
        // TurboModule initialization
    }

    std::string IRRandom::getUUID() noexcept
    {
        // TODO: Generate UUID on Windows using CoCreateGuid or similar
        return "00000000-0000-0000-0000-000000000000";
    }
}