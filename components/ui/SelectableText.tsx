import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextStyle, View } from 'react-native';

type SelectableTextProps = {
  text: string;
  onWordSelect: (word: string, ref: React.RefObject<View | null>) => void;
  style: TextStyle;
};

// Simple regex to remove common punctuation from the end of a word.
const cleanWord = (word: string) => {
  return word.replace(/[.,!?;:"“'”)]+$/, '');
};

export function SelectableText({ text, onWordSelect, style }: SelectableTextProps) {
  const wordRefs = useRef<Array<React.RefObject<View>>>([]);

  const words = text.split(/(\s+)/); // Split by space, keeping spaces

  return (
    <View style={styles.container}>
      {words.map((word, index) => {
        if (!wordRefs.current[index]) {
          wordRefs.current[index] = React.createRef<View>();
        }
        const isWhitespace = /^\s+$/.test(word);
        if (isWhitespace) {
          return (
            <Text key={index} style={style}>
              {word}
            </Text>
          );
        }
        return (
          <Pressable
            key={index}
            onPress={() => {
              const cleaned = cleanWord(word);
              if (cleaned) {
                onWordSelect(cleaned, wordRefs.current[index]);
              }
            }}>
            <View ref={wordRefs.current[index]}>
              <Text style={style}>{word}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});