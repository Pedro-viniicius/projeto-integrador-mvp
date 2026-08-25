import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui';
import { useUnreadCount } from '@/features/notifications/hooks';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useInteractionState } from '@/hooks/useInteractionState';
import { colors, radius, spacing, TOUCH_TARGET } from '@/lib/theme';

/**
 * Sino de notificações (RF-016).
 *
 * Só aparece abaixo de 1200px — no desktop, "Notificações" é item da sidebar.
 */
export function NotificationButton({ userId }: { userId: string | undefined }) {
  const router = useRouter();
  const unread = useUnreadCount(userId);
  const { isDesktop } = useBreakpoint();
  const { hovered, focused, handlers } = useInteractionState();

  if (isDesktop) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={unread > 0 ? `Notificações, ${unread} não lidas` : 'Notificações'}
      onPress={() => router.push('/notificacoes')}
      {...handlers}
      style={[styles.button, hovered && styles.hovered, focused && styles.focused]}
    >
      <Ionicons name="notifications-outline" size={21} color={colors.text} />
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
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hovered: { backgroundColor: colors.surfaceAlt, borderColor: colors.borderStrong },
  focused: { borderColor: colors.focus },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
