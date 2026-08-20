import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../lib/theme';

export default function EmptyState({ filtered = false }: { filtered?: boolean }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBubble}>
        <Ionicons name={filtered ? 'search-outline' : 'sparkles-outline'} size={30} color={COLORS.coral} />
      </View>
      <Text style={styles.title}>{filtered ? 'Nothing matches' : 'Your day is clear'}</Text>
      <Text style={styles.subtitle}>
        {filtered ? 'Try another search or filter.' : 'Tap the coral + button to add your first task.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 30,
  },
  iconBubble: {
    width: 66,
    height: 66,
    borderRadius: 24,
    backgroundColor: COLORS.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 5,
  },
});
