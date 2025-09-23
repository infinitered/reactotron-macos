/**
 * PassthroughView - Windows Title Bar Click-Through Component
 *
 * Creates regions within the extended title bar that allow mouse clicks to pass through
 * to underlying interactive elements (buttons, inputs, etc.) while keeping the rest of
 * the title bar draggable.
 *
 * This is necessary because Windows title bars with ExtendsContentIntoTitleBar(true)
 * capture all mouse events by default. PassthroughView creates "punch-out" regions
 * using Windows InputNonClientPointerSource passthrough regions.
 *
 * On macOS, this simply returns a regular View since macOS title bars don't intercept
 * mouse events the same way - interactive elements in the title bar work normally.
 *
 * Usage: Wrap interactive elements that need to remain clickable in the title bar area.
 * Example: <PassthroughView><Button>Settings</Button></PassthroughView>
 */
import React from 'react';
import { View, Platform } from 'react-native';
import type { ViewProps } from 'react-native';
import NativePassthroughView from '../../native/IRPassthroughView/IRPassthroughViewNativeComponent';

export interface PassthroughViewProps extends ViewProps { }

export const PassthroughView: React.FC<PassthroughViewProps> = (props) => {
  return Platform.select({
    windows: <NativePassthroughView {...props} />,
    default: <View {...props} />, // macOS and other platforms use regular View
  });
};