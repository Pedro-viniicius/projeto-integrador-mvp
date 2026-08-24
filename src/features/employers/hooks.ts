import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type EmployerProfileInput } from '@/services';

export function useSaveEmployerProfile(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EmployerProfileInput) => api.saveEmployerProfile(userId as string, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
