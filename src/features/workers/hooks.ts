import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/query-keys';
import { api, type WorkerProfileInput } from '@/services';

export function useActiveWorkers() {
  return useQuery({
    queryKey: queryKeys.activeWorkers,
    queryFn: () => api.listActiveWorkers(),
  });
}

export function useWorkerProfile(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workerProfile(userId ?? ''),
    queryFn: () => api.getWorkerProfile(userId as string),
    enabled: Boolean(userId),
  });
}

/** Telefone do candidato, liberado apenas após o aceite (RN-008). */
export function useWorkerContact(
  workerId: string | undefined,
  employerId: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['worker-contact', workerId, employerId],
    queryFn: () => api.getWorkerContact(workerId as string, employerId as string),
    enabled: enabled && Boolean(workerId) && Boolean(employerId),
  });
}

export function useSaveWorkerProfile(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkerProfileInput) => api.saveWorkerProfile(userId as string, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.activeWorkers });
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.workerProfile(userId) });
      }
    },
  });
}
