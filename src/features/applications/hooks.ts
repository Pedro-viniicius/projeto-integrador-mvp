import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/query-keys';
import { api } from '@/services';
import type { ApplicationStatus } from '@/types/domain';

export function useWorkerApplications(workerId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workerApplications(workerId ?? ''),
    queryFn: () => api.listApplicationsByWorker(workerId as string),
    enabled: Boolean(workerId),
  });
}

export function useEmployerApplications(employerId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.employerApplications(employerId ?? ''),
    queryFn: () => api.listApplicationsByEmployer(employerId as string),
    enabled: Boolean(employerId),
  });
}

export function useJobApplications(jobId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.jobApplications(jobId ?? ''),
    queryFn: () => api.listApplicationsByJob(jobId as string),
    enabled: Boolean(jobId),
  });
}

/** RF-013: trabalhador demonstra interesse em uma vaga. */
export function useRegisterInterest(workerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, matchScore }: { jobId: string; matchScore: number }) =>
      api.registerInterest(jobId, workerId as string, matchScore),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/** RF-015: empregador aceita, recusa ou marca contato feito. */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: ApplicationStatus;
    }) => api.updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
