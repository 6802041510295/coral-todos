import Ionicons from '@expo/vector-icons/Ionicons';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AddTaskModal from './components/AddTaskModal';
import EmptyState from './components/EmptyState';
import TaskCard from './components/TaskCard';
import { COLORS, SHADOW } from './lib/theme';
import { Todo, TodoInput } from './lib/types';

type Filter = 'all' | 'today' | 'active' | 'done';

function localDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function longDate() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

export default function Index() {
  const db = useSQLiteContext();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  async function getTodos() {
    try {
      setLoading(true);
      const results = await db.getAllAsync<Todo>(`
        SELECT * FROM todos
        ORDER BY completed ASC,
          CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END ASC,
          CASE WHEN due_date = '' THEN 1 ELSE 0 END ASC,
          due_date ASC,
          id DESC
      `);
      setTodos(results);
    } catch (err: any) {
      Alert.alert('Cannot read todos', err?.message ?? 'Unknown database error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getTodos();
    const splashTimer = setTimeout(() => setShowSplash(false), 850);
    return () => clearTimeout(splashTimer);
  }, []);

  async function saveTodo(input: TodoInput) {
    try {
      if (editingTodo) {
        await db.runAsync(
          `UPDATE todos
           SET title = ?, note = ?, priority = ?, category = ?, due_date = ?
           WHERE id = ?`,
          [input.title, input.note, input.priority, input.category, input.due_date, editingTodo.id]
        );
      } else {
        await db.runAsync(
          `INSERT INTO todos (title, note, completed, priority, category, due_date, created_at)
           VALUES (?, ?, 0, ?, ?, ?, datetime('now','localtime'))`,
          [input.title, input.note, input.priority, input.category, input.due_date]
        );
      }
      setEditingTodo(null);
      await getTodos();
    } catch (err: any) {
      Alert.alert('Could not save task', err?.message ?? 'Unknown database error');
      throw err;
    }
  }

  async function toggleTodo(todo: Todo) {
    try {
      await db.runAsync('UPDATE todos SET completed = ? WHERE id = ?', [todo.completed ? 0 : 1, todo.id]);
      await getTodos();
    } catch (err: any) {
      Alert.alert('Could not update task', err?.message ?? 'Unknown database error');
    }
  }

  function deleteTodo(todo: Todo) {
    Alert.alert('Delete task?', `“${todo.title}” will be removed permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await db.runAsync('DELETE FROM todos WHERE id = ?', [todo.id]);
            await getTodos();
          } catch (err: any) {
            Alert.alert('Could not delete task', err?.message ?? 'Unknown database error');
          }
        },
      },
    ]);
  }

  function openCreate() {
    setEditingTodo(null);
    setModalVisible(true);
  }

  function openEdit(todo: Todo) {
    setEditingTodo(todo);
    setModalVisible(true);
  }

  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((todo) => todo.completed === 1).length;
    const active = total - done;
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, active, progress };
  }, [todos]);

  const filteredTodos = useMemo(() => {
    const today = localDateString();
    const normalizedQuery = query.trim().toLowerCase();

    return todos.filter((todo) => {
      const matchesQuery =
        !normalizedQuery ||
        todo.title.toLowerCase().includes(normalizedQuery) ||
        todo.note.toLowerCase().includes(normalizedQuery) ||
        todo.category.toLowerCase().includes(normalizedQuery);

      if (!matchesQuery) return false;
      if (filter === 'today') return todo.due_date === today;
      if (filter === 'active') return todo.completed === 0;
      if (filter === 'done') return todo.completed === 1;
      return true;
    });
  }, [todos, query, filter]);

  if (showSplash) {
    return (
      <SafeAreaView style={styles.splash}>
        <View style={styles.splashMark}>
          <Ionicons name="checkmark" size={48} color={COLORS.coral} />
        </View>
        <Text style={styles.splashTitle}>Coral Todos</Text>
        <Text style={styles.splashSubtitle}>Plan less. Finish more.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={filteredTodos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskCard todo={item} onToggle={toggleTodo} onEdit={openEdit} onDelete={deleteTodo} />
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={getTodos} tintColor={COLORS.coral} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>MY DAY</Text>
                <Text style={styles.headerTitle}>Make today count.</Text>
                <Text style={styles.date}>{longDate()}</Text>
              </View>
              <View style={styles.avatar}>
                <Ionicons name="person" size={22} color={COLORS.coralDark} />
              </View>
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroEyebrow}>TODAY'S PROGRESS</Text>
                  <Text style={styles.heroTitle}>
                    {stats.total === 0
                      ? 'Start with one small task.'
                      : stats.active === 0
                        ? 'Everything is done. Nice!'
                        : `${stats.active} task${stats.active === 1 ? '' : 's'} left to finish.`}
                  </Text>
                </View>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressNumber}>{stats.progress}%</Text>
                  <Text style={styles.progressCaption}>done</Text>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${stats.progress}%` }]} />
              </View>

              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.active}</Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.done}</Text>
                  <Text style={styles.statLabel}>Done</Text>
                </View>
              </View>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#A69893" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search your tasks"
                placeholderTextColor="#AFA39E"
                style={styles.searchInput}
              />
              {query ? (
                <Pressable onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#C7BBB6" />
                </Pressable>
              ) : null}
            </View>

            <View style={styles.filterRow}>
              {(['all', 'today', 'active', 'done'] as Filter[]).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[styles.filterChip, filter === item && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
                    {item[0].toUpperCase() + item.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{filter === 'all' ? 'Your tasks' : `${filter[0].toUpperCase()}${filter.slice(1)}`}</Text>
              <Text style={styles.sectionCount}>{filteredTodos.length} items</Text>
            </View>
          </>
        }
        ListEmptyComponent={<EmptyState filtered={query.length > 0 || filter !== 'all'} />}
        ListFooterComponent={<View style={{ height: 118 }} />}
      />

      <View style={styles.bottomBarWrap}>
        <View style={styles.bottomBar}>
          <NavItem icon="home" label="Home" active={filter === 'all'} onPress={() => setFilter('all')} />
          <NavItem icon="calendar-outline" label="Today" active={filter === 'today'} onPress={() => setFilter('today')} />
          <View style={{ width: 70 }} />
          <NavItem icon="checkmark-done-outline" label="Done" active={filter === 'done'} onPress={() => setFilter('done')} />
          <NavItem icon="flash-outline" label="Active" active={filter === 'active'} onPress={() => setFilter('active')} />
        </View>
        <Pressable onPress={openCreate} style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.96 }] }]}>
          <Ionicons name="add" size={32} color={COLORS.white} />
        </Pressable>
      </View>

      <AddTaskModal
        visible={modalVisible}
        editingTodo={editingTodo}
        onClose={() => {
          setModalVisible(false);
          setEditingTodo(null);
        }}
        onSave={saveTodo}
      />
    </SafeAreaView>
  );
}

function NavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.navItem}>
      <Ionicons name={icon} size={20} color={active ? COLORS.coral : '#BCB6B2'} />
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 18 : 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  eyebrow: {
    color: COLORS.coral,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.7,
  },
  headerTitle: {
    color: COLORS.ink,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.7,
    marginTop: 3,
  },
  date: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: COLORS.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD3D5',
  },
  heroCard: {
    backgroundColor: COLORS.coral,
    borderRadius: 30,
    padding: 20,
    marginBottom: 16,
    ...SHADOW,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  heroCopy: { flex: 1 },
  heroEyebrow: {
    color: '#FFD9DB',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '900',
    marginTop: 6,
  },
  progressBadge: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.17)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },
  progressCaption: {
    color: '#FFE7E8',
    fontSize: 10,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    marginTop: 18,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.white,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: '#FFE2E4',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  searchBox: {
    height: 54,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 9,
    borderWidth: 1,
    borderColor: '#F2EAE5',
    ...SHADOW,
  },
  searchInput: {
    flex: 1,
    color: COLORS.ink,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    marginBottom: 20,
  },
  filterChip: {
    flex: 1,
    minHeight: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5ECE7',
  },
  filterChipActive: { backgroundColor: COLORS.ink },
  filterText: {
    color: '#8E817C',
    fontSize: 11,
    fontWeight: '800',
  },
  filterTextActive: { color: COLORS.white },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionCount: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  bottomBarWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: Platform.OS === 'ios' ? 12 : 10,
    height: 82,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomBar: {
    width: '100%',
    height: 66,
    borderRadius: 26,
    backgroundColor: '#111111',
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    ...SHADOW,
  },
  fab: {
    position: 'absolute',
    top: 0,
    width: 66,
    height: 66,
    borderRadius: 24,
    backgroundColor: COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: COLORS.cream,
    shadowColor: COLORS.coralDark,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 9,
  },
  navItem: {
    width: 56,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  navLabel: {
    color: '#9E9996',
    fontSize: 9,
    fontWeight: '700',
  },
  navLabelActive: { color: COLORS.coral },
  splash: {
    flex: 1,
    backgroundColor: COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashMark: {
    width: 92,
    height: 92,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
    ...SHADOW,
  },
  splashTitle: {
    color: COLORS.white,
    fontSize: 31,
    fontWeight: '900',
    marginTop: 24,
    letterSpacing: -0.8,
  },
  splashSubtitle: {
    color: '#FFE1E3',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 5,
  },
});
