#pragma once

#include "..\..\..\windows\reactotron\codegen\react\components\AppSpec\IRPassthrough.g.h"
#include <winrt/Microsoft.ReactNative.Composition.Experimental.h>
#include <winrt/Microsoft.UI.h>
#include <winrt/Microsoft.UI.Windowing.h>
#include <winrt/Microsoft.UI.Input.h>


namespace winrt::reactotron::implementation
{

    void RegisterIRPassthroughNativeComponent(
        winrt::Microsoft::ReactNative::IReactPackageBuilder const &packageBuilder) noexcept;

    struct IRPassthroughView : winrt::implements<IRPassthroughView, winrt::IInspectable>,
                                reactotronCodegen::BaseIRPassthrough<IRPassthroughView>
    {
        IRPassthroughView();
        ~IRPassthroughView();

        winrt::Microsoft::UI::Composition::Visual CreateVisual(
            const winrt::Microsoft::ReactNative::ComponentView &view) noexcept override;
        void Initialize(const winrt::Microsoft::ReactNative::ComponentView & /*view*/) noexcept override;
        void UnmountChildComponentView(const winrt::Microsoft::ReactNative::ComponentView &view,
                                     const winrt::Microsoft::ReactNative::UnmountChildComponentViewArgs &args) noexcept override;


    private:
        winrt::Microsoft::ReactNative::ComponentView::LayoutMetricsChanged_revoker m_layoutMetricChangedRevoker;
        winrt::Microsoft::ReactNative::ComponentView m_view{nullptr};

        static std::vector<IRPassthroughView*> s_instances;
        static void UpdateAllPassthroughRegions() noexcept;

        winrt::Windows::Graphics::RectInt32 GetPassthroughRect() const noexcept;

        // Debug logging helper
        static void DebugLog(const std::string& message) noexcept;
    };

} // namespace winrt::reactotron::implementation