#pragma once
#include "NativeModules.h"

namespace winrt::reactotron::implementation
{
    REACT_MODULE(IRFileStorage)
    struct IRFileStorage
    {
        IRFileStorage() noexcept = default;

        REACT_SYNC_METHOD(read)
        std::string read(std::string path) noexcept;

        REACT_METHOD(write)
        void write(std::string path, std::string data) noexcept;

        REACT_METHOD(remove)
        void remove(std::string path) noexcept;

        REACT_METHOD(ensureDir)
        void ensureDir(std::string path) noexcept;
    };
}


