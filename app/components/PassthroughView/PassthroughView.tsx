import React from 'react';
import type { ViewProps } from 'react-native';
import NativePassthroughView from '../../native/IRPassthroughView/IRPassthroughViewNativeComponent';

export interface PassthroughViewProps extends ViewProps { }

export const PassthroughView: React.FC<PassthroughViewProps> = (props) => {
  return <NativePassthroughView {...props} />;
};