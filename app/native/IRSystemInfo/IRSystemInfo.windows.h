#pragma once
#include "NativeModules.h"

namespace winrt::reactotron::implementation
{
    REACT_MODULE(IRSystemInfo)
    struct IRSystemInfo
    {
        IRSystemInfo() noexcept;

        REACT_METHOD(startMonitoring)
        void startMonitoring() noexcept;

        REACT_METHOD(stopMonitoring)
        void stopMonitoring() noexcept;

        REACT_EVENT(onSystemInfo)
        std::function<void(Microsoft::ReactNative::JSValue)> onSystemInfo;

    private:
        bool m_isMonitoring = false;
    };
}