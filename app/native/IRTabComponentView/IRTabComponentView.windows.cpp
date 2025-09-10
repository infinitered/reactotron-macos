#include "pch.h"
#include "IRTabComponentView.windows.h"

using namespace winrt::Microsoft::ReactNative;

namespace winrt::reactotron::implementation
{

    void RegisterIRTabNativeComponent(
        winrt::Microsoft::ReactNative::IReactPackageBuilder const &packageBuilder) noexcept
    {
        reactotronCodegen::RegisterIRTabComponentViewNativeComponent<IRTabComponentView>(
            packageBuilder,
            nullptr);
    }

    winrt::Microsoft::UI::Composition::Visual IRTabComponentView::CreateVisual(
        const winrt::Microsoft::ReactNative::ComponentView &view) noexcept
    {
        auto compositor = view.as<winrt::Microsoft::ReactNative::Composition::ComponentView>().Compositor();
        m_visual = compositor.CreateSpriteVisual();
        return m_visual;
    }

    void IRTabComponentView::Initialize(
        const winrt::Microsoft::ReactNative::ComponentView & /*view*/) noexcept
    {
        // TODO: Initialize Windows tab control
    }

} // namespace winrt::reactotron::implementation