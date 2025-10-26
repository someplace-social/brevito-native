import React from 'react';
import {
    NativeSyntheticEvent,
    StyleProp,
    TextInput,
    TextInputProps,
    TextInputSelectionChangeEventData,
    TextStyle,
} from 'react-native';

// Extend TextInputProps with the missing `selectable` prop to fix the type definition issue.
interface CustomTextInputProps extends TextInputProps {
  selectable?: boolean;
}

interface SelectableTextProps extends CustomTextInputProps {
  value: string;
  style: StyleProp<TextStyle>;
  onSelectionChange: (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => void;
  onPressOut: (event: NativeSyntheticEvent<any>) => void;
}

export function SelectableText({ value, style, onSelectionChange, onPressOut, ...props }: SelectableTextProps) {
  const textInputProps: CustomTextInputProps = {
    value,
    style,
    onSelectionChange,
    onPressOut,
    multiline: true,
    scrollEnabled: false,
    contextMenuHidden: true,
    editable: false,
    selectable: true,
    caretHidden: true,
    ...props,
  };

  return <TextInput {...textInputProps} />;
}