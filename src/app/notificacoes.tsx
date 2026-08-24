import React from 'react';
import { useRouter } from 'expo-router';
import { AppText, Button, Card, EmptyState, ErrorState, LoadingState, Screen } from '@/components/ui';
import { useSession } from '@/features/auth/session-context';
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from '@/features/notifications/hooks';
import { relativeDate } from '@/lib/format';
import { colors } from '@/lib/theme';

/** Central de notificações do MVP (RF-016), sem push nem infraestrutura extra. */
export default function NotificationsScreen() {
  const { user } = useSession();
  const router = useRouter();
  const notificationsQuery = useNotifications(user?.id);
  const markAll = useMarkAllNotificationsRead(user?.id);

  const notifications = notificationsQuery.data ?? [];
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <Screen>
      <AppText variant="small" muted>
        {unread > 0 ? `${unread} não lidas` : 'Tudo em dia'}
      </AppText>
      {notificationsQuery.isLoading ? <LoadingState /> : null}
      {notificationsQuery.isError ? (
        <ErrorState onRetry={() => void notificationsQuery.refetch()} />
      ) : null}

      {unread > 0 ? (
        <Button
          label="Marcar todas como lidas"
          variant="secondary"
          loading={markAll.isPending}
          onPress={() => markAll.mutate()}
        />
      ) : null}

      {!notificationsQuery.isLoading && notifications.length === 0 ? (
        <EmptyState
          title="Nenhuma notificação"
          message="Avisamos você aqui quando surgir uma vaga compatível ou quando alguém responder."
        />
      ) : null}

      {notifications.map((notification) => (
        <Card
          key={notification.id}
          onPress={
            notification.link
              ? () => router.push(notification.link as never)
              : undefined
          }
          accessibilityLabel={notification.title}
          style={notification.read ? undefined : { borderColor: colors.primary }}
        >
          <AppText variant="bodyStrong">{notification.title}</AppText>
          <AppText variant="small" muted>
            {notification.body}
          </AppText>
          <AppText variant="caption" muted>
            {relativeDate(notification.createdAt)}
          </AppText>
        </Card>
      ))}
    </Screen>
  );
}
