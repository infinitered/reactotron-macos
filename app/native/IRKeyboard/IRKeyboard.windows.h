#pragma once
#include "..\..\..\windows\reactotron\codegen\NativeIRKeyboardDataTypes.g.h"
#include "..\..\..\windows\reactotron\codegen\NativeIRKeyboardSpec.g.h"
#include "NativeModules.h"

namespace winrt::reactotron::implementation {
REACT_TURBO_MODULE(IRKeyboard)
struct IRKeyboard : reactotronCodegen::IRKeyboardSpec {
  IRKeyboard() noexcept = default;

  REACT_INIT(Initialize)
  void Initialize(
      winrt::Microsoft::ReactNative::ReactContext const &reactContext) noexcept;

  REACT_SYNC_METHOD(ctrl)
  bool ctrl() noexcept;
  REACT_SYNC_METHOD(alt)
  bool alt() noexcept;
  REACT_SYNC_METHOD(shift)
  bool shift() noexcept;
  REACT_SYNC_METHOD(cmd)
  bool cmd() noexcept;

  REACT_METHOD(startListening)
  void startListening() noexcept;
  REACT_METHOD(stopListening)
  void stopListening() noexcept;

  REACT_EVENT(onKeyboardEvent)
  std::function<void(reactotronCodegen::IRKeyboardSpec_KeyboardEvent)>
      onKeyboardEvent;

  // Public members needed for event-driven keyboard capture
  bool m_isListening = false;
  winrt::Microsoft::ReactNative::ReactContext m_reactContext{nullptr};
};
} // namespace winrt::reactotron::implementation
