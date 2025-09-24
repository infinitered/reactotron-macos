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
  reactotronCodegen::RegisterIRPassthroughNativeComponent<IRPassthroughView>(packageBuilder, nullptr);
}

winrt::Microsoft::UI::Composition::Visual IRPassthroughView::CreateVisual(
    const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
  // React Native Windows requires a visual for the component tree
  auto compositor = view.as<winrt::Microsoft::ReactNative::Composition::ComponentView>().Compositor();
  auto visual = compositor.CreateSpriteVisual();
  m_view = view;
  return visual;
}

void IRPassthroughView::Initialize(const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
  m_view = view;

  m_layoutMetricChangedRevoker = view.LayoutMetricsChanged(
      winrt::auto_revoke,
      [wkThis = get_weak()](
          const winrt::IInspectable & /*sender*/, const winrt::Microsoft::ReactNative::LayoutMetricsChangedArgs &args) {
        if (auto strongThis = wkThis.get()) {
          // Update passthrough regions whenever component layout changes
          UpdateAllPassthroughRegions();
        }
      });
}



winrt::Windows::Graphics::RectInt32 IRPassthroughView::GetPassthroughRect() const noexcept {
  if (!m_view) {
    return { 0, 0, 0, 0 };
  }

  // Get component position and size from React Native layout system
  auto layoutMetrics = m_view.LayoutMetrics();
  auto frame = layoutMetrics.Frame;
  auto scale = layoutMetrics.PointScaleFactor;

  // Convert to screen coordinates for Windows passthrough regions
  return {
    static_cast<int32_t>(frame.X * scale),
    static_cast<int32_t>(frame.Y * scale),
    static_cast<int32_t>(frame.Width * scale),
    static_cast<int32_t>(frame.Height * scale)
  };
}

void IRPassthroughView::UpdateAllPassthroughRegions() noexcept {
  try {
    // Find the application window using process enumeration
    HWND hwnd = nullptr;
    EnumWindows([](HWND h, LPARAM p) -> BOOL {
      DWORD pid = 0;
      GetWindowThreadProcessId(h, &pid);
      if (pid == GetCurrentProcessId() && IsWindowVisible(h) && !GetParent(h)) {
        *reinterpret_cast<HWND*>(p) = h;
        return FALSE;
      }
      return TRUE;
    }, reinterpret_cast<LPARAM>(&hwnd));

    if (!hwnd) {
      return;
    }

    // Get Windows App SDK window components
    auto windowId = winrt::Microsoft::UI::GetWindowIdFromWindow(hwnd);
    auto appWindow = winrt::Microsoft::UI::Windowing::AppWindow::GetFromWindowId(windowId);
    if (!appWindow) {
      return;
    }

    auto nonClientInputSrc = winrt::Microsoft::UI::Input::InputNonClientPointerSource::GetForWindowId(appWindow.Id());
    if (!nonClientInputSrc) {
      return;
    }

    // Collect all PassthroughView rectangles
    std::vector<winrt::Windows::Graphics::RectInt32> passthroughRects;

    for (auto* instance : s_instances) {
      if (instance && instance->m_view) {
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

    // Apply passthrough regions to Windows title bar
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