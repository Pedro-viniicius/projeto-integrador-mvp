import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Screen,
  SkeletonList,
} from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import { useMarkAllNotificationsRead, useNotifications } from '@/features/notifications/hooks';
import { relativeDate } from '@/lib/format';
import { colors, radius, spacing } from '@/lib/theme';
import type { NotificationType } from '@/types/domain';

const ICONS: Record<NotificationType, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  NEW_MATCH: { icon: 'sparkles-outline', color: colors.primary },
  NEW_INTEREST: { icon: 'person-add-outline', color: colors.info },
  APPLICATION_ACCEPTED: { icon: 'checkmark-circle', color: colors.success },
  APPLICATION_REJECTED: { icon: 'close-circle-outline', color: colors.textSubtle },
};

/** Central de notificações (RF-016), sem push nem infraestrutura extra. */
export default function NotificationsScreen() {
  const { user } = useSession();
  const router = useRouter();
  const notificationsQuery = useNotifications(user?.id);
  const markAll = useMarkAllNotificationsRead(user?.id);

  const notifications = notificationsQuery.data ?? [];
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <Screen width="reading" bottomInset={spacing.giant}>
      <PageHeader
        title="Notificações"
        subtitle={unread > 0 ? `${unread} não lidas` : 'Tudo em dia'}
        action={
          unread > 0 ? (
            <Button
              label="Marcar todas como lidas"
              variant="secondary"
              icon="checkmark-done"
              loading={markAll.isPending}
              onPress={() => markAll.mutate()}
            />
          ) : undefined
        }
      />

      {notificationsQuery.isLoading ? <SkeletonList count={3} label="Carregando notificações" /> : null}
      {notificationsQuery.isError ? (
        <ErrorState onRetry={() => void notificationsQuery.refetch()} />
      ) : null}

      {!notificationsQuery.isLoading && notifications.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="Nenhuma notificação"
          message="Avisamos você aqui quando surgir uma vaga compatível ou quando alguém responder."
        />
      ) : null}

      {notifications.map((notification) => {
        const visual = ICONS[notification.type];
        return (
          <Card
            key={notification.id}
            padding="lg"
            onPress={notification.link ? () => router.push(notification.link as never) : undefined}
            accessibilityLabel={`${notification.title}. ${notification.body}`}
            style={notification.read ? undefined : styles.unread}
          >
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: `${visual.color}14` }]}>
                <Ionicons name={visual.icon} size={19} color={visual.color} />
              </View>
              <View style={styles.grow}>
                <AppText variant="bodyStrong">{notification.title}</AppText>
                <AppText variant="small" muted>
                  {notification.body}
                </AppText>
                <AppText variant="caption" subtle>
                  {relativeDate(notification.createdAt)}
                </AppText>
              </View>
              {notification.read ? null : <View style={styles.dot} />}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  unread: { borderColor: colors.primaryBorder, backgroundColor: colors.primarySubtle },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: { flex: 1, gap: 2 },
  dot: {
    width: 9,
    height: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    marginTop: spacing.sm,
  },
});
