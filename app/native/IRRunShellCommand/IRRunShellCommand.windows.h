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
        void runAsync(std::string command, Microsoft::ReactNative::ReactPromise<std::string> const &promise) noexcept;

        REACT_SYNC_METHOD(runSync)
        std::string runSync(std::string command) noexcept;

        REACT_METHOD(runCommandOnShutdown)
        void runCommandOnShutdown(std::string command) noexcept;

        REACT_METHOD(runTaskWithCommand)
        void runTaskWithCommand(std::string command, Microsoft::ReactNative::JSValue args, std::string taskId) noexcept;

        REACT_SYNC_METHOD(getRunningTaskIds)
        Microsoft::ReactNative::JSValue getRunningTaskIds() noexcept;

        REACT_SYNC_METHOD(killTaskWithId)
        bool killTaskWithId(std::string taskId) noexcept;

        REACT_METHOD(killAllTasks)
        void killAllTasks() noexcept;

        REACT_EVENT(onShellCommandOutput)
        std::function<void(Microsoft::ReactNative::JSValue)> onShellCommandOutput;

        REACT_EVENT(onShellCommandComplete)
        std::function<void(Microsoft::ReactNative::JSValue)> onShellCommandComplete;
    };
}