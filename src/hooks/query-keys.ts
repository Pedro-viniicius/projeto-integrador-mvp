/** Chaves centralizadas do TanStack Query, para invalidação previsível. */
export const queryKeys = {
  openJobs: ['jobs', 'open'] as const,
  job: (jobId: string) => ['jobs', 'detail', jobId] as const,
  employerJobs: (employerId: string) => ['jobs', 'employer', employerId] as const,
  activeWorkers: ['workers', 'active'] as const,
  workerProfile: (userId: string) => ['workers', 'detail', userId] as const,
  workerApplications: (workerId: string) => ['applications', 'worker', workerId] as const,
  employerApplications: (employerId: string) => ['applications', 'employer', employerId] as const,
  jobApplications: (jobId: string) => ['applications', 'job', jobId] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
};
