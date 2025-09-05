//
//  IRFontList.cpp
//  Reactotron-Windows
//
//  Windows TurboModule implementation of font list functionality
//

#include "pch.h"
#include "IRFontList.windows.h"

namespace winrt::reactotron::implementation
{
    IRFontList::IRFontList() noexcept
    {
        // TurboModule initialization
    }

    void IRFontList::getFontList(Microsoft::ReactNative::ReactPromise<Microsoft::ReactNative::JSValue> const &promise) noexcept
    {
        // TODO: Implement font list retrieval for Windows
        // Enumerate system fonts using EnumFontFamiliesEx or similar
        Microsoft::ReactNative::JSValueArray fontList;
        // Add stub fonts for now
        fontList.push_back("Segoe UI");
        fontList.push_back("Consolas");
        fontList.push_back("Arial");

        promise.Resolve(Microsoft::ReactNative::JSValue(std::move(fontList)));
    }

    Microsoft::ReactNative::JSValue IRFontList::getFontListSync() noexcept
    {
        // TODO: Implement synchronous font list retrieval for Windows
        Microsoft::ReactNative::JSValueArray fontList;
        // Add stub fonts for now
        fontList.push_back("Segoe UI");
        fontList.push_back("Consolas");
        fontList.push_back("Arial");

        return Microsoft::ReactNative::JSValue(std::move(fontList));
    }
}