Pod::Spec.new do |s|
  s.name         = "IRNativeModules"
  s.version      = "1.0.0"
  s.summary      = "Colocated native modules for Reactotron"
  s.description  = "A unified podspec for all colocated native modules in the Reactotron app"
  s.homepage     = "https://github.com/infinitered/reactotron-macos"
  s.license      = "MIT"
  s.authors      = { "Infinite Red" => "hello@infinite.red" }
  s.source       = { :path => "." }
  s.platform     = :osx, "11.0"
  s.requires_arc = true

  # Include all native modules and generated files
  s.source_files = [
    "app/native/**/*.{h,m,mm,c,cpp,swift}",
    "app/utils/experimental/*.{h,m,mm,swift}",
    "macos/build/generated/colocated/**/*.{h,m,mm,c,cpp,swift}"
  ]

  # Exclude problematic files if needed
  # s.exclude_files = []

  s.dependency 'React-Core'
  s.dependency 'ReactCodegen'
  s.dependency 'React-Fabric'
  s.dependency 'RCT-Folly'
  s.dependency 'Yoga'

  # Compiler configuration for React Native Fabric components
  # This configuration is required for native modules that use Fabric (React Native's new architecture)
  # and matches the settings used by React Native itself.
  #
  # Folly Configuration Flags:
  # - FOLLY_NO_CONFIG: Use Folly in "no-config" mode, which is optimized for mobile platforms
  # - FOLLY_MOBILE=1: Enable mobile-specific optimizations in Folly library
  # - FOLLY_USE_LIBCPP=1: Use libc++ standard library instead of libstdc++ (required on Apple platforms)
  # - FOLLY_CFG_NO_COROUTINES: Disable C++20 coroutine support in Folly to avoid missing header issues
  #   (React Native's Folly distribution doesn't include coroutine headers like folly/coro/Coroutine.h)
  #
  # Warning Suppression Flags:
  # - Wno-comma: Suppress comma operator warnings that are common in React Native C++ code
  # - Wno-shorten-64-to-32: Suppress warnings about implicit conversions from 64-bit to 32-bit integers
  #
  # References:
  # - Folly documentation: https://github.com/facebook/folly
  # - React Native New Architecture: https://reactnative.dev/docs/the-new-architecture/landing-page
  s.compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32 -DFOLLY_CFG_NO_COROUTINES'
  
  s.pod_target_xcconfig = {
    # C++20 is required for React Native Fabric components
    # Fabric uses modern C++ features like concepts, ranges, and advanced template metaprogramming
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20',
    
    # Header search paths for React Native Fabric dependencies
    # These paths are necessary for compiling Fabric components and TurboModules
    'HEADER_SEARCH_PATHS' => '"$(PODS_ROOT)/boost" "$(PODS_ROOT)/RCT-Folly" "$(PODS_ROOT)/DoubleConversion" "$(PODS_CONFIGURATION_BUILD_DIR)/ReactCodegen" "$(PODS_ROOT)/React-Fabric" "$(PODS_ROOT)/Headers/Private/React-Fabric" "$(PODS_ROOT)/Headers/Private/Yoga"'
  }
end
