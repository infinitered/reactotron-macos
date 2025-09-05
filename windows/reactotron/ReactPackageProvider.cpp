#include "pch.h"
#include "ReactPackageProvider.h"
#include "NativeModules.h"

#include "IRNativeModules.g.h"

using namespace winrt::Microsoft::ReactNative;

namespace winrt::reactotron::implementation
{

    void ReactPackageProvider::CreatePackage(IReactPackageBuilder const &packageBuilder) noexcept
    {
        AddAttributedModules(packageBuilder, true);
        RegisterAllFabricComponents(packageBuilder);
    }

} // namespace winrt::reactotron::implementation