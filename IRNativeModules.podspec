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
    "app/**/*.{h,m,mm,c,cpp,swift}",
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

   # Compiler configuration for React Native Fabric components. Folly documentation: https://github.com/facebook/folly
  s.compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32 -DFOLLY_CFG_NO_COROUTINES'
  
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20',
    'HEADER_SEARCH_PATHS' => '"$(PODS_ROOT)/boost" "$(PODS_ROOT)/RCT-Folly" "$(PODS_ROOT)/DoubleConversion" "$(PODS_CONFIGURATION_BUILD_DIR)/ReactCodegen" "$(PODS_ROOT)/React-Fabric" "$(PODS_ROOT)/Headers/Private/React-Fabric" "$(PODS_ROOT)/Headers/Private/Yoga"'
  }
end
