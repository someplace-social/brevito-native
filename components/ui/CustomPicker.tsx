import { Colors } from '@/constants/Colors';
import React, { useState } from 'react';
import {
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { IconSymbol } from './icon-symbol';

type PickerItem = {
  label: string;
  value: string;
};

type CustomPickerProps = {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
};

export function CustomPicker({ label, selectedValue, onValueChange, items }: CustomPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedLabel = items.find((item) => item.value === selectedValue)?.label;

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.pickerButtonText}>{selectedLabel}</Text>
        <IconSymbol name="chevron.down" size={20} color={Colors.dark.mutedForeground} />
      </TouchableOpacity>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
            </View>
            {items.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={styles.optionButton}
                onPress={() => handleSelect(item.value)}>
                <Text style={styles.optionText}>{item.label}</Text>
                {selectedValue === item.value && (
                  <IconSymbol name="checkmark" size={20} color={Colors.dark.primary} />
                )}
              </TouchableOpacity>
            ))}
          </SafeAreaView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: Colors.dark.foreground,
    fontSize: 16,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 6,
    backgroundColor: Colors.dark.card,
  },
  pickerButtonText: {
    color: Colors.dark.foreground,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  modalTitle: {
    color: Colors.dark.foreground,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  optionText: {
    color: Colors.dark.foreground,
    fontSize: 16,
  },
});