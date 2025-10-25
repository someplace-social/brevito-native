import { Colors } from '@/constants/Colors';
import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

type ToggleProps = {
  children: React.ReactNode;
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function Toggle({ children, pressed, onPressedChange, disabled, style, textStyle }: ToggleProps) {
  return (
    <Pressable
      onPress={() => onPressedChange(!pressed)}
      disabled={disabled}
      style={({ pressed: isPressed }) => [
        styles.toggle,
        pressed && styles.togglePressed,
        disabled && styles.toggleDisabled,
        isPressed && styles.toggleIsPressed,
        style,
      ]}>
      <Text style={[styles.text, pressed && styles.textPressed, textStyle]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: 'transparent',
  },
  togglePressed: {
    backgroundColor: Colors.dark.accent,
  },
  toggleIsPressed: {
    opacity: 0.7,
  },
  toggleDisabled: {
    opacity: 0.5,
  },
  text: {
    color: Colors.dark.foreground,
    fontSize: 16,
  },
  textPressed: {
    color: Colors.dark.accentForeground,
  },
});