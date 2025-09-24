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
  // WARNING: This destructor is rarely called in React Native Windows Fabric due to component lifecycle issues.
  // The proper cleanup happens in UnmountChildComponentView() instead.
  // Keep this as a safety fallback in case the lifecycle method isn't called.
  auto it = std::find(s_instances.begin(), s_instances.end(), this);
  if (it != s_instances.end()) {
    s_instances.erase(it);
    DebugLog("Destructor fallback cleanup - this should rarely happen");
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

  // Subscribe to layout changes to keep Windows passthrough regions in sync with React Native layout
  m_layoutMetricChangedRevoker = view.LayoutMetricsChanged(
      winrt::auto_revoke,
      [wkThis = get_weak()](
          const winrt::IInspectable & /*sender*/, const winrt::Microsoft::ReactNative::LayoutMetricsChangedArgs &args) {
        if (auto strongThis = wkThis.get()) {
          UpdateAllPassthroughRegions();
        }
      });
}

void IRPassthroughView::UnmountChildComponentView(const winrt::Microsoft::ReactNative::ComponentView &view,
                                                const winrt::Microsoft::ReactNative::UnmountChildComponentViewArgs &args) noexcept {
  // CRITICAL: This is the proper React Native Windows Fabric lifecycle method for component cleanup.
  // Unlike C++ destructors, this method is reliably called when React Native unmounts components.
  if (view == m_view) {
    // Remove this instance from the global instances list and update Windows passthrough regions
    auto it = std::find(s_instances.begin(), s_instances.end(), this);
    if (it != s_instances.end()) {
      s_instances.erase(it);
      DebugLog("Component unmounted - cleaned up passthrough region");
      UpdateAllPassthroughRegions();
    }
  }
}



winrt::Windows::Graphics::RectInt32 IRPassthroughView::GetPassthroughRect() const noexcept {
  if (!m_view) {
    return { 0, 0, 0, 0 };
  }

  try {
    // Get component position and size from React Native layout system
    auto layoutMetrics = m_view.LayoutMetrics();
    auto frame = layoutMetrics.Frame;
    auto scale = layoutMetrics.PointScaleFactor;

    // Convert React Native coordinates to Windows screen coordinates for passthrough regions
    return {
      static_cast<int32_t>(frame.X * scale),
      static_cast<int32_t>(frame.Y * scale),
      static_cast<int32_t>(frame.Width * scale),
      static_cast<int32_t>(frame.Height * scale)
    };
  } catch (...) {
    DebugLog("Exception getting passthrough rect - component may be unmounted");
    return { 0, 0, 0, 0 };
  }
}

void IRPassthroughView::UpdateAllPassthroughRegions() noexcept {
  try {
    // Find the main application window by enumerating all windows for this process
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
      DebugLog("Application window not found");
      return;
    }

    // Get Windows App SDK components needed for passthrough region management
    auto windowId = winrt::Microsoft::UI::GetWindowIdFromWindow(hwnd);
    auto appWindow = winrt::Microsoft::UI::Windowing::AppWindow::GetFromWindowId(windowId);
    if (!appWindow) {
      DebugLog("Failed to get AppWindow from window handle");
      return;
    }

    auto nonClientInputSrc = winrt::Microsoft::UI::Input::InputNonClientPointerSource::GetForWindowId(appWindow.Id());
    if (!nonClientInputSrc) {
      DebugLog("Failed to get InputNonClientPointerSource");
      return;
    }

    // CRITICAL: Clear only passthrough regions, not all regions (which would break title bar dragging)
    // This prevents accumulation of stale regions from unmounted components
    nonClientInputSrc.ClearRegionRects(winrt::Microsoft::UI::Input::NonClientRegionKind::Passthrough);

    // Collect rectangles from all currently mounted PassthroughView instances
    std::vector<winrt::Windows::Graphics::RectInt32> passthroughRects;
    for (auto* instance : s_instances) {
      if (instance && instance->m_view) {
        auto rect = instance->GetPassthroughRect();
        if (rect.Width > 0 && rect.Height > 0) {
          passthroughRects.push_back(rect);
        }
      }
    }

    // Apply the complete new set of passthrough regions to Windows
    // SetRegionRects replaces ALL existing passthrough regions with this new set
    if (!passthroughRects.empty()) {
      nonClientInputSrc.SetRegionRects(
        winrt::Microsoft::UI::Input::NonClientRegionKind::Passthrough,
        passthroughRects
      );
    }

  } catch (...) {
    DebugLog("Exception in UpdateAllPassthroughRegions");
  }
}

void IRPassthroughView::DebugLog(const std::string& message) noexcept {
#ifdef _DEBUG
  std::string fullMessage = "[IRPassthroughView] " + message + "\n";
  OutputDebugStringA(fullMessage.c_str());
#endif
}

} // namespace winrt::reactotron::implementation