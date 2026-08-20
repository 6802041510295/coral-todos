import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Todo } from '../lib/types';
import { COLORS, SHADOW } from '../lib/theme';

type Props = {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
};

const priorityLabel = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export default function TaskCard({ todo, onToggle, onEdit, onDelete }: Props) {
  const done = todo.completed === 1;
  const dueLabel = todo.due_date ? todo.due_date : 'No date';

  return (
    <View style={[styles.card, done && styles.cardDone]}>
      <Pressable
        onPress={() => onToggle(todo)}
        style={({ pressed }) => [styles.checkButton, pressed && styles.pressed]}
        hitSlop={8}
      >
        <View style={[styles.checkbox, done && styles.checkboxDone]}>
          {done ? <Ionicons name="checkmark" size={16} color={COLORS.white} /> : null}
        </View>
      </Pressable>

      <Pressable style={styles.main} onPress={() => onEdit(todo)}>
        <Text numberOfLines={2} style={[styles.title, done && styles.titleDone]}>
          {todo.title}
        </Text>
        {todo.note ? (
          <Text numberOfLines={2} style={styles.note}>
            {todo.note}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Ionicons name="folder-open-outline" size={13} color={COLORS.coralDark} />
            <Text style={styles.metaText}>{todo.category}</Text>
          </View>
          <View style={styles.metaPill}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.coralDark} />
            <Text style={styles.metaText}>{dueLabel}</Text>
          </View>
          <View
            style={[
              styles.priorityDot,
              todo.priority === 'high' && styles.priorityHigh,
              todo.priority === 'low' && styles.priorityLow,
            ]}
          />
          <Text style={styles.priorityText}>{priorityLabel[todo.priority]}</Text>
        </View>
      </Pressable>

      <View style={styles.actions}>
        <Pressable onPress={() => onEdit(todo)} style={styles.iconButton} hitSlop={8}>
          <Ionicons name="create-outline" size={19} color={COLORS.ink} />
        </Pressable>
        <Pressable onPress={() => onDelete(todo)} style={styles.iconButton} hitSlop={8}>
          <Ionicons name="trash-outline" size={19} color={COLORS.danger} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F4ECE7',
    ...SHADOW,
  },
  cardDone: {
    backgroundColor: '#FAF7F4',
    shadowOpacity: 0.03,
  },
  checkButton: {
    paddingTop: 2,
    paddingRight: 12,
  },
  pressed: { opacity: 0.65 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxDone: {
    backgroundColor: COLORS.coral,
    borderColor: COLORS.coral,
  },
  main: { flex: 1 },
  title: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  titleDone: {
    color: '#A19B98',
    textDecorationLine: 'line-through',
  },
  note: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 11,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: COLORS.blush,
  },
  metaText: {
    fontSize: 11,
    color: '#8A6265',
    fontWeight: '700',
  },
  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: COLORS.warning,
    marginLeft: 3,
  },
  priorityHigh: { backgroundColor: COLORS.danger },
  priorityLow: { backgroundColor: COLORS.success },
  priorityText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    marginLeft: 8,
    gap: 4,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9F7',
  },
});
