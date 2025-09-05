#pragma once

#include "..\..\..\windows\reactotron\codegen\react\components\AppSpec\IRTabComponentView.g.h"
#include <winrt/Microsoft.ReactNative.Composition.Experimental.h>

namespace winrt::reactotron::implementation
{

    void RegisterIRTabNativeComponent(
        winrt::Microsoft::ReactNative::IReactPackageBuilder const &packageBuilder) noexcept;

    struct IRTabComponentView : winrt::implements<IRTabComponentView, winrt::IInspectable>,
                                reactotronCodegen::BaseIRTabComponentView<IRTabComponentView>
    {
        winrt::Microsoft::UI::Composition::Visual CreateVisual(
            const winrt::Microsoft::ReactNative::ComponentView &view) noexcept override;
        void Initialize(const winrt::Microsoft::ReactNative::ComponentView & /*view*/) noexcept override;

    private:
        winrt::Microsoft::ReactNative::ComponentView::LayoutMetricsChanged_revoker m_layoutMetricChangedRevoker;
        winrt::Microsoft::UI::Composition::SpriteVisual m_visual{nullptr};
    };

} // namespace winrt::reactotron::implementation