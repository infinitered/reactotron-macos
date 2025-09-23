#include "pch.h"

#include "IRPassthroughView.windows.h"
#include <algorithm>
#include <windows.h>

namespace winrt::reactotron::implementation {

std::vector<IRPassthroughView*> IRPassthroughView::s_instances;

IRPassthroughView::IRPassthroughView() {
  s_instances.push_back(this);
}

IRPassthroughView::~IRPassthroughView() {
  auto it = std::find(s_instances.begin(), s_instances.end(), this);
  if (it != s_instances.end()) {
    s_instances.erase(it);
    UpdateAllPassthroughRegions();
  }
}

void RegisterIRPassthroughNativeComponent(
    winrt::Microsoft::ReactNative::IReactPackageBuilder const &packageBuilder) noexcept {
  reactotronCodegen::RegisterIRPassthroughNativeComponent<IRPassthroughView>(
      packageBuilder,
      [](const winrt::Microsoft::ReactNative::Composition::IReactCompositionViewComponentBuilder &builder) {
        // Disable default border handling to prevent visual clipping issues
        builder.SetViewFeatures(
            winrt::Microsoft::ReactNative::Composition::ComponentViewFeatures::Default &
            ~winrt::Microsoft::ReactNative::Composition::ComponentViewFeatures::NativeBorder);
      });
}

winrt::Microsoft::UI::Composition::Visual IRPassthroughView::CreateVisual(
    const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
  auto compositor = view.as<winrt::Microsoft::ReactNative::Composition::ComponentView>().Compositor();

  m_visual = compositor.CreateSpriteVisual();
  m_view = view;

  // Create visual that can be styled from React Native
  return m_visual;
}

void IRPassthroughView::Initialize(const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
  m_view = view;

  m_layoutMetricChangedRevoker = view.LayoutMetricsChanged(
      winrt::auto_revoke,
      [wkThis = get_weak()](
          const winrt::IInspectable & /*sender*/, const winrt::Microsoft::ReactNative::LayoutMetricsChangedArgs &args) {
        if (auto strongThis = wkThis.get()) {
          auto visual = strongThis->m_visual;

          // Manually position visual since we disabled default border handling
          visual.Size(
              {args.NewLayoutMetrics().Frame.Width * args.NewLayoutMetrics().PointScaleFactor,
               args.NewLayoutMetrics().Frame.Height * args.NewLayoutMetrics().PointScaleFactor});
          visual.Offset({
              args.NewLayoutMetrics().Frame.X * args.NewLayoutMetrics().PointScaleFactor,
              args.NewLayoutMetrics().Frame.Y * args.NewLayoutMetrics().PointScaleFactor,
              0.0f,
          });

          // Update passthrough regions for title bar interaction
          UpdateAllPassthroughRegions();
        }
      });
}



winrt::Windows::Graphics::RectInt32 IRPassthroughView::GetPassthroughRect() const noexcept {
  if (!m_visual || !m_view) {
    return { 0, 0, 0, 0 };
  }

  auto size = m_visual.Size();
  auto offset = m_visual.Offset();

  // Get rectangle coordinates for passthrough regions
  return {
    static_cast<int32_t>(offset.x),
    static_cast<int32_t>(offset.y),
    static_cast<int32_t>(size.x),
    static_cast<int32_t>(size.y)
  };
}

void IRPassthroughView::UpdateAllPassthroughRegions() noexcept {
  try {
    // Find the main window for our process using more reliable enumeration
    HWND hwnd = nullptr;
    EnumWindows([](HWND h, LPARAM p) -> BOOL {
      DWORD pid = 0;
      GetWindowThreadProcessId(h, &pid);
      if (pid == GetCurrentProcessId() && IsWindowVisible(h) && !GetParent(h)) {
        *reinterpret_cast<HWND*>(p) = h;
        return FALSE; // Stop enumeration
      }
      return TRUE; // Continue enumeration
    }, reinterpret_cast<LPARAM>(&hwnd));

    if (!hwnd) {
      return; // No main window found
    }

    // Convert HWND to AppWindow
    auto windowId = winrt::Microsoft::UI::GetWindowIdFromWindow(hwnd);
    auto appWindow = winrt::Microsoft::UI::Windowing::AppWindow::GetFromWindowId(windowId);
    if (!appWindow) {
      return;
    }

    auto nonClientInputSrc = winrt::Microsoft::UI::Input::InputNonClientPointerSource::GetForWindowId(appWindow.Id());
    if (!nonClientInputSrc) {
      return;
    }

    // Collect rectangles from all PassthroughView instances
    std::vector<winrt::Windows::Graphics::RectInt32> passthroughRects;

    for (auto* instance : s_instances) {
      if (instance && instance->m_visual && instance->m_view) {
        try {
          auto rect = instance->GetPassthroughRect();
          if (rect.Width > 0 && rect.Height > 0) {
            passthroughRects.push_back(rect);
          }
        } catch (...) {
          #ifdef _DEBUG
            OutputDebugStringA("[IRPassthroughView] Exception accessing instance during rect collection\n");
          #endif
        }
      }
    }

    // Configure passthrough regions for interactive elements
    nonClientInputSrc.SetRegionRects(
      winrt::Microsoft::UI::Input::NonClientRegionKind::Passthrough,
      passthroughRects
    );

  } catch (...) {
    #ifdef _DEBUG
        OutputDebugStringA("[IRPassthroughView] Exception in UpdateAllPassthroughRegions\n");
    #endif
  }
}

} // namespace winrt::reactotron::implementation