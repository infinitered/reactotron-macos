#pragma once
#include "NativeModules.h"

namespace winrt::reactotron::implementation
{
    REACT_MODULE(IRRunShellCommand)
    struct IRRunShellCommand
    {
        IRRunShellCommand() noexcept;

        REACT_SYNC_METHOD(appPath)
        std::string appPath() noexcept;

        REACT_SYNC_METHOD(appPID)
        int appPID() noexcept;

        REACT_METHOD(runAsync)
        void runAsync(std::string const& command, Microsoft::ReactNative::ReactPromise<std::string> const& promise) noexcept;

        REACT_SYNC_METHOD(runSync)
        std::string runSync(std::string const& command) noexcept;

        REACT_METHOD(runCommandOnShutdown)
        void runCommandOnShutdown(std::string const& command) noexcept;

        REACT_METHOD(runTaskWithCommand)
        void runTaskWithCommand(std::string const& command, Microsoft::ReactNative::JSValue const& args, std::string const& taskId) noexcept;

        REACT_SYNC_METHOD(getRunningTaskIds)
        Microsoft::ReactNative::JSValue getRunningTaskIds() noexcept;

        REACT_SYNC_METHOD(killTaskWithId)
        bool killTaskWithId(std::string const& taskId) noexcept;

        REACT_METHOD(killAllTasks)
        void killAllTasks() noexcept;

        REACT_EVENT(onShellCommandOutput)
        std::function<void(Microsoft::ReactNative::JSValue)> onShellCommandOutput;

        REACT_EVENT(onShellCommandComplete)
        std::function<void(Microsoft::ReactNative::JSValue)> onShellCommandComplete;
    };
}