//
//  IRClipboard.cpp
//  Reactotron-Windows
//
//  Windows TurboModule implementation of clipboard functionality
//

#include "pch.h"
#include "IRClipboard.windows.h"

namespace winrt::reactotron::implementation
{
    IRClipboard::IRClipboard() noexcept
    {
        // TurboModule initialization
    }

    std::string IRClipboard::getString() noexcept
    {
        if (!OpenClipboard(nullptr))
        {
            return "";
        }

        HANDLE hData = GetClipboardData(CF_TEXT);
        if (hData == nullptr)
        {
            CloseClipboard();
            return "";
        }

        char* pszText = static_cast<char*>(GlobalLock(hData));
        if (pszText == nullptr)
        {
            CloseClipboard();
            return "";
        }

        std::string text(pszText);
        GlobalUnlock(hData);
        CloseClipboard();

        return text;
    }

    void IRClipboard::setString(std::string text) noexcept
    {
        if (!OpenClipboard(nullptr))
        {
            return;
        }

        EmptyClipboard();

        size_t textLength = text.length() + 1;
        HGLOBAL hClipboardData = GlobalAlloc(GMEM_DDESHARE, textLength);
        if (hClipboardData == nullptr)
        {
            CloseClipboard();
            return;
        }

        char* pchData = static_cast<char*>(GlobalLock(hClipboardData));
        if (pchData == nullptr)
        {
            GlobalFree(hClipboardData);
            CloseClipboard();
            return;
        }

        strcpy_s(pchData, textLength, text.c_str());
        GlobalUnlock(hClipboardData);

        if (SetClipboardData(CF_TEXT, hClipboardData) == nullptr)
        {
            GlobalFree(hClipboardData);
        }

        CloseClipboard();
    }
}