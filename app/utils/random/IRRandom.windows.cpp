//
//  IRRandom.cpp
//  Reactotron-Windows
//
//  Windows TurboModule implementation of random/UUID functionality
//

#include "pch.h"
#include "IRRandom.windows.h"
#include <combaseapi.h>
#include <sstream>
#include <iomanip>

namespace winrt::reactotron::implementation
{
    IRRandom::IRRandom() noexcept
    {
        // TurboModule initialization
    }

    std::string IRRandom::getUUID() noexcept
    {
        GUID guid;
        HRESULT result = CoCreateGuid(&guid);

        if (FAILED(result))
        {
            return "00000000-0000-0000-0000-000000000000";
        }

        std::ostringstream stream;
        stream << std::hex << std::uppercase << std::setfill('0')
               << std::setw(8) << guid.Data1 << "-"
               << std::setw(4) << guid.Data2 << "-"
               << std::setw(4) << guid.Data3 << "-"
               << std::setw(2) << static_cast<unsigned>(guid.Data4[0])
               << std::setw(2) << static_cast<unsigned>(guid.Data4[1]) << "-"
               << std::setw(2) << static_cast<unsigned>(guid.Data4[2])
               << std::setw(2) << static_cast<unsigned>(guid.Data4[3])
               << std::setw(2) << static_cast<unsigned>(guid.Data4[4])
               << std::setw(2) << static_cast<unsigned>(guid.Data4[5])
               << std::setw(2) << static_cast<unsigned>(guid.Data4[6])
               << std::setw(2) << static_cast<unsigned>(guid.Data4[7]);

        return stream.str();
    }
}