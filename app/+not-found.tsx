import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/lib/theme';
import { Button } from '@/components/Button';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lost in the flow</Text>
      <Text style={styles.sub}>This screen doesn't exist.</Text>
      <Link href="/" asChild>
        <Button title="Back to Home" variant="primary" size="lg" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.lg },
  title: { ...Typography.h1, color: Colors.textPrimary },
  sub: { ...Typography.body, color: Colors.textSecondary },
});
