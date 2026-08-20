import { Stack } from 'expo-router';
import { SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './lib/theme';

async function migrateDbIfNeeded(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'medium',
      category TEXT NOT NULL DEFAULT 'Personal',
      due_date TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Keeps the app compatible with the original classroom table
  // (id, title, completed) without deleting existing records.
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(todos)');
  const names = new Set(columns.map((column) => column.name));

  if (!names.has('note')) {
    await db.execAsync("ALTER TABLE todos ADD COLUMN note TEXT NOT NULL DEFAULT '';");
  }
  if (!names.has('priority')) {
    await db.execAsync("ALTER TABLE todos ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium';");
  }
  if (!names.has('category')) {
    await db.execAsync("ALTER TABLE todos ADD COLUMN category TEXT NOT NULL DEFAULT 'Personal';");
  }
  if (!names.has('due_date')) {
    await db.execAsync("ALTER TABLE todos ADD COLUMN due_date TEXT NOT NULL DEFAULT '';");
  }
  if (!names.has('created_at')) {
    await db.execAsync("ALTER TABLE todos ADD COLUMN created_at TEXT NOT NULL DEFAULT '';");
  }
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="todos.db" onInit={migrateDbIfNeeded}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.cream },
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </SQLiteProvider>
  );
}
