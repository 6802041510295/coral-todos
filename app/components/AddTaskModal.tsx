import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Category, Priority, Todo, TodoInput } from '../lib/types';
import { COLORS, SHADOW } from '../lib/theme';

type Props = {
  visible: boolean;
  editingTodo: Todo | null;
  onClose: () => void;
  onSave: (input: TodoInput) => Promise<void>;
};

const categories: Category[] = ['Personal', 'Study', 'Work', 'Health'];
const priorities: Priority[] = ['low', 'medium', 'high'];

function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AddTaskModal({ visible, editingTodo, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('Personal');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle(editingTodo?.title ?? '');
    setNote(editingTodo?.note ?? '');
    setPriority(editingTodo?.priority ?? 'medium');
    setCategory(editingTodo?.category ?? 'Personal');
    setDueDate(editingTodo?.due_date ?? '');
  }, [visible, editingTodo]);

  const canSave = useMemo(() => title.trim().length > 0 && !saving, [title, saving]);

  async function submit() {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        note: note.trim(),
        priority,
        category,
        due_date: dueDate.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function setQuickDate(daysFromNow: number) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    setDueDate(toLocalDateString(date));
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.eyebrow}>{editingTodo ? 'UPDATE' : 'NEW TASK'}</Text>
              <Text style={styles.heading}>{editingTodo ? 'Edit your task' : 'What needs doing?'}</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.ink} />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Task title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Finish mobile app assignment"
              placeholderTextColor="#B7AEAA"
              style={styles.input}
              returnKeyType="next"
            />

            <Text style={styles.label}>Note</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add a little detail..."
              placeholderTextColor="#B7AEAA"
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.chipRow}>
              {categories.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[styles.chip, category === item && styles.chipActive]}
                >
                  <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.chipRow}>
              {priorities.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setPriority(item)}
                  style={[styles.priorityChip, priority === item && styles.priorityChipActive]}
                >
                  <View
                    style={[
                      styles.dot,
                      item === 'low' && styles.dotLow,
                      item === 'high' && styles.dotHigh,
                    ]}
                  />
                  <Text style={[styles.priorityText, priority === item && styles.priorityTextActive]}>
                    {item[0].toUpperCase() + item.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Due date</Text>
            <View style={styles.quickDateRow}>
              <Pressable style={styles.quickDate} onPress={() => setQuickDate(0)}>
                <Text style={styles.quickDateText}>Today</Text>
              </Pressable>
              <Pressable style={styles.quickDate} onPress={() => setQuickDate(1)}>
                <Text style={styles.quickDateText}>Tomorrow</Text>
              </Pressable>
              <Pressable style={styles.quickDate} onPress={() => setDueDate('')}>
                <Text style={styles.quickDateText}>No date</Text>
              </Pressable>
            </View>
            <TextInput
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#B7AEAA"
              style={styles.input}
              autoCapitalize="none"
            />

            <Pressable
              disabled={!canSave}
              onPress={submit}
              style={({ pressed }) => [
                styles.saveButton,
                !canSave && styles.saveButtonDisabled,
                pressed && canSave && { opacity: 0.88 },
              ]}
            >
              <Ionicons name={editingTodo ? 'checkmark' : 'add'} size={22} color={COLORS.white} />
              <Text style={styles.saveText}>{saving ? 'Saving...' : editingTodo ? 'Save changes' : 'Add task'}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(25, 18, 18, 0.25)',
  },
  sheet: {
    maxHeight: '91%',
    backgroundColor: COLORS.cream,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    ...SHADOW,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#DDD2CC',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  eyebrow: {
    color: COLORS.coral,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.8,
  },
  heading: {
    color: COLORS.ink,
    fontWeight: '900',
    fontSize: 24,
    marginTop: 3,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#655F5C',
    marginBottom: 8,
    marginTop: 13,
  },
  input: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#F0E8E3',
    paddingHorizontal: 16,
    color: COLORS.ink,
    fontSize: 15,
  },
  textArea: {
    minHeight: 94,
    paddingTop: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#F0E8E3',
  },
  chipActive: {
    backgroundColor: COLORS.coral,
    borderColor: COLORS.coral,
  },
  chipText: {
    color: '#766E6A',
    fontWeight: '800',
    fontSize: 12,
  },
  chipTextActive: { color: COLORS.white },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#F0E8E3',
  },
  priorityChipActive: {
    borderColor: COLORS.coral,
    backgroundColor: COLORS.blush,
  },
  priorityText: {
    color: '#766E6A',
    fontWeight: '800',
    fontSize: 12,
  },
  priorityTextActive: { color: COLORS.coralDark },
  dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: COLORS.warning },
  dotLow: { backgroundColor: COLORS.success },
  dotHigh: { backgroundColor: COLORS.danger },
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  quickDate: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.coralSoft,
  },
  quickDateText: {
    color: COLORS.coralDark,
    fontSize: 12,
    fontWeight: '800',
  },
  saveButton: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: COLORS.coral,
    marginTop: 24,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: { opacity: 0.45 },
  saveText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
  },
});
