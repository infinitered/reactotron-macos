import type { ViewProps } from "react-native"
import type { BubblingEventHandler } from "react-native/Libraries/Types/CodegenTypes"

// For React Native 0.80, use this:
// import { codegenNativeComponent } from "react-native"
// For React Native 0.78, use this:
import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent"

type TabConfig = {
  id: string
  title: string
  icon?: string // Optional icon name/path
}

type TabSelectionEvent = {
  selectedTabId: string
}

export interface NativeProps extends ViewProps {
  tabs: TabConfig[]
  selectedTabId?: string
  onTabSelected?: BubblingEventHandler<TabSelectionEvent> | null
}

export default codegenNativeComponent<NativeProps>("IRTabComponentView")
