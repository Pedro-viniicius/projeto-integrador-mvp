import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/query-keys';
import { api, type CreateJobInput } from '@/services';
import type { JobStatus } from '@/types/domain';

export function useOpenJobs() {
  return useQuery({
    queryKey: queryKeys.openJobs,
    queryFn: () => api.listOpenJobs(),
  });
}

export function useJob(jobId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.job(jobId ?? ''),
    queryFn: () => api.getJob(jobId as string),
    enabled: Boolean(jobId),
  });
}

export function useEmployerJobs(employerId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.employerJobs(employerId ?? ''),
    queryFn: () => api.listJobsByEmployer(employerId as string),
    enabled: Boolean(employerId),
  });
}

export function useCreateJob(employerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJobInput) => api.createJob(employerId as string, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.openJobs });
      if (employerId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.employerJobs(employerId) });
      }
    },
  });
}

export function useUpdateJobStatus(employerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: JobStatus }) =>
      api.updateJobStatus(jobId, status),
    onSuccess: (job) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.openJobs });
      void queryClient.invalidateQueries({ queryKey: queryKeys.job(job.id) });
      if (employerId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.employerJobs(employerId) });
      }
    },
  });
}
