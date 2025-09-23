import type { ViewProps } from "react-native"
import type { BubblingEventHandler } from "react-native/Libraries/Types/CodegenTypes"

// For React Native 0.80, use this:
// import { codegenNativeComponent } from "react-native"
// For React Native 0.78, use this:
import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent"

export interface NativeProps extends ViewProps {
    // Add Passthrough specific props here if needed
}

export default codegenNativeComponent<NativeProps>("IRPassthrough")