#pragma once
#include "NativeModules.h"
#include "winrt/Microsoft.ReactNative.h"

#include "../../app/native/IRActionMenuManager/windows/IRActionMenuManager.h"
#include "../../app/native/IRClipboard/windows/IRClipboard.h"
#include "../../app/native/IRFontList/windows/IRFontList.h"
#include "../../app/native/IRKeyboard/windows/IRKeyboard.h"
#include "../../app/native/IRMenuItemManager/windows/IRMenuItemManager.h"
#include "../../app/native/IRRunShellCommand/windows/IRRunShellCommand.h"
#include "../../app/native/IRSystemInfo/windows/IRSystemInfo.h"
#include "../../app/native/IRTabComponentView/windows/IRTabComponentView.h"

namespace winrt::reactotron::implementation
{
    struct ReactPackageProvider : winrt::implements<ReactPackageProvider, winrt::Microsoft::ReactNative::IReactPackageProvider>
    {
        void CreatePackage(winrt::Microsoft::ReactNative::IReactPackageBuilder const& packageBuilder) noexcept;
    };
}