import type { ViewProps } from "react-native"

// For React Native 0.80, use this:
// import { codegenNativeComponent } from "react-native"
// For React Native 0.78, use this:
import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent"

export interface NativeProps extends ViewProps {}

export default codegenNativeComponent<NativeProps>("IRPassthrough")
