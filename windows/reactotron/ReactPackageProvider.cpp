#include "pch.h"
#include "ReactPackageProvider.h"

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
    void ReactPackageProvider::CreatePackage(winrt::Microsoft::ReactNative::IReactPackageBuilder const& packageBuilder) noexcept
    {
        packageBuilder.AddModule(L"IRActionMenuManager", []() { return winrt::make<winrt::reactotron::implementation::IRActionMenuManager>(); });
        packageBuilder.AddModule(L"IRClipboard", []() { return winrt::make<winrt::reactotron::implementation::IRClipboard>(); });
        packageBuilder.AddModule(L"IRFontList", []() { return winrt::make<winrt::reactotron::implementation::IRFontList>(); });
        packageBuilder.AddModule(L"IRKeyboard", []() { return winrt::make<winrt::reactotron::implementation::IRKeyboard>(); });
        packageBuilder.AddModule(L"IRMenuItemManager", []() { return winrt::make<winrt::reactotron::implementation::IRMenuItemManager>(); });
        packageBuilder.AddModule(L"IRRunShellCommand", []() { return winrt::make<winrt::reactotron::implementation::IRRunShellCommand>(); });
        packageBuilder.AddModule(L"IRSystemInfo", []() { return winrt::make<winrt::reactotron::implementation::IRSystemInfo>(); });
        packageBuilder.AddModule(L"IRTabComponentView", []() { return winrt::make<winrt::reactotron::implementation::IRTabComponentView>(); });
    }
}