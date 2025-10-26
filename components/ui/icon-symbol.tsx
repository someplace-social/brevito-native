// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// The keys of this object are valid SF Symbol names.
const MAPPING: Record<string, ComponentProps<typeof MaterialIcons>['name']> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'line.3.horizontal': 'menu',
  'arrow.up.right': 'north-east',
  'arrow.left': 'arrow-back',
  grid: 'apps',
  globe: 'language',
  paintpalette: 'palette',
  xmark: 'close',
  'chevron.down': 'arrow-drop-down',
  checkmark: 'check',
  'xmark.circle': 'error-outline',
};

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  // The weight prop is only used on iOS, so we can omit it from the fallback type.
  // weight?: any;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}