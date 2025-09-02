//
//  IRSystemInfo.cpp
//  Reactotron-Windows
//
//  Windows TurboModule implementation of system info monitoring
//

#include "pch.h"
#include "IRSystemInfo.h"

namespace winrt::reactotron::implementation
{
    IRSystemInfo::IRSystemInfo() noexcept
    {
        // TurboModule initialization
    }

    void IRSystemInfo::startMonitoring() noexcept
    {
        // TODO: Start monitoring Windows system info (CPU, memory usage)
        // Use GetProcessMemoryInfo and GetProcessTimes APIs
        // Emit onSystemInfo events with rss, vsz, cpu data periodically
        m_isMonitoring = true;
    }

    void IRSystemInfo::stopMonitoring() noexcept
    {
        // TODO: Stop system monitoring and clean up timers
        m_isMonitoring = false;
    }
}