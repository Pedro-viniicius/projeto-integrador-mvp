import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui';
import { useUnreadCount } from '@/features/notifications/hooks';
import { colors, radius, spacing } from '@/lib/theme';

/** Indicador de notificações no cabeçalho (RF-016). */
export function NotificationButton({ userId }: { userId: string | undefined }) {
  const router = useRouter();
  const unread = useUnreadCount(userId);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        unread > 0 ? `Notificações, ${unread} não lidas` : 'Notificações'
      }
      onPress={() => router.push('/notificacoes')}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name="notifications-outline" size={22} color={colors.text} />
      {unread > 0 ? (
        <View style={styles.badge}>
          <AppText variant="caption" color={colors.textInverse}>
            {unread > 9 ? '9+' : unread}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
