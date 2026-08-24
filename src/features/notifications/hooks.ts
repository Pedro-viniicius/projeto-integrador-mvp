import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/query-keys';
import { api, type MatchNotificationInput } from '@/services';

export function useNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.notifications(userId ?? ''),
    queryFn: () => api.listNotifications(userId as string),
    enabled: Boolean(userId),
  });
}

export function useUnreadCount(userId: string | undefined): number {
  const { data } = useNotifications(userId);
  return (data ?? []).filter((item) => !item.read).length;
}

export function useMarkAllNotificationsRead(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.markAllNotificationsRead(userId as string),
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId) });
      }
    },
  });
}

export function usePushMatchNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matches: MatchNotificationInput[]) =>
      api.pushMatchNotifications(userId as string, matches),
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId) });
      }
    },
  });
}
