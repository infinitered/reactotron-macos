#pragma once
#include "NativeModules.h"

namespace winrt::reactotron::implementation
{
    REACT_MODULE(IRFontList)
    struct IRFontList
    {
        IRFontList() noexcept;

        REACT_METHOD(getFontList)
        void getFontList(Microsoft::ReactNative::ReactPromise<Microsoft::ReactNative::JSValue> const& promise) noexcept;

        REACT_SYNC_METHOD(getFontListSync)
        Microsoft::ReactNative::JSValue getFontListSync() noexcept;
    };
}