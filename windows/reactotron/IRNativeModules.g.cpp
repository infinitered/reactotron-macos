#include "pch.h"
#include "IRNativeModules.g.h"

namespace winrt::reactotron::implementation {
    void RegisterAllFabricComponents(winrt::Microsoft::ReactNative::IReactPackageBuilder const& packageBuilder) noexcept {
        // Auto-generated Fabric component registrations
        RegisterIRTabNativeComponent(packageBuilder);
    }
}
