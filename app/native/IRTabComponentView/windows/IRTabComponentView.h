#pragma once
#include "winrt/Microsoft.ReactNative.h"
#include "NativeModules.h"

namespace winrt::reactotron::implementation
{
    struct IRTabComponentView : winrt::Microsoft::ReactNative::implementation::ComponentViewT<IRTabComponentView>
    {
        IRTabComponentView(winrt::Microsoft::ReactNative::CreateComponentViewArgs const& args);

        static void RegisterComponent(winrt::Microsoft::ReactNative::IReactPackageBuilder const& packageBuilder) noexcept;
        
        // Component lifecycle
        void UpdateProps(winrt::Microsoft::ReactNative::IComponentProps const& props, winrt::Microsoft::ReactNative::IComponentProps const& oldProps) noexcept;
        void UpdateEventEmitter(winrt::Microsoft::ReactNative::IComponentEventEmitter const& eventEmitter) noexcept;
        void UpdateState(winrt::Microsoft::ReactNative::IComponentState const& state, winrt::Microsoft::ReactNative::IComponentState const& oldState) noexcept;
        void UpdateLayoutMetrics(winrt::Microsoft::ReactNative::LayoutMetrics const& layoutMetrics, winrt::Microsoft::ReactNative::LayoutMetrics const& oldLayoutMetrics) noexcept;
        void FinalizeUpdates() noexcept;

    private:
        winrt::Microsoft::ReactNative::IComponentEventEmitter m_eventEmitter{ nullptr };
        // TODO: Add Windows-specific UI controls for tab view
    };
}