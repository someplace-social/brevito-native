import 'react-native';

declare module 'react-native' {
  interface TextInputProps {
    selectable?: boolean;
  }
}