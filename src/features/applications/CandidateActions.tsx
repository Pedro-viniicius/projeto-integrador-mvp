import React from 'react';
import { View } from 'react-native';
import { ContactButton } from '@/components/ContactButton';
import { AppText, Button } from '@/components/ui';
import { useUpdateApplicationStatus } from '@/features/applications/hooks';
import { useWorkerContact } from '@/features/workers/hooks';
import { spacing } from '@/lib/theme';
import type { Application, Job, WorkerProfile } from '@/types/domain';

interface CandidateActionsProps {
  application: Application;
  worker: WorkerProfile;
  job: Job;
  employerId: string;
}

/**
 * Avaliação do candidato pelo empregador (RF-015).
 * Aceitar libera o contato direto; recusar apenas encerra aquela candidatura.
 */
export function CandidateActions({
  application,
  worker,
  job,
  employerId,
}: CandidateActionsProps) {
  const updateStatus = useUpdateApplicationStatus();
  const unlocked = application.status === 'ACCEPTED' || application.status === 'CONTACTED';
  const contactQuery = useWorkerContact(worker.userId, employerId, unlocked);

  if (application.status === 'REJECTED') {
    return (
      <AppText variant="small" muted>
        Você recusou esta candidatura.
      </AppText>
    );
  }

  if (unlocked) {
    return (
      <View style={{ gap: spacing.sm }}>
        <AppText variant="small">
          Contato liberado. Combine os detalhes diretamente com o candidato.
        </AppText>
        <ContactButton
          phone={contactQuery.data ?? null}
          message={`Olá, ${worker.fullName}! Sou do ${job.employerName} e vi seu interesse na vaga "${job.title}" no Paraíso Empregos.`}
          onContacted={() =>
            application.status === 'ACCEPTED'
              ? updateStatus.mutate({ applicationId: application.id, status: 'CONTACTED' })
              : undefined
          }
        />
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <Button
        label="Aceitar candidato"
        loading={updateStatus.isPending}
        onPress={() =>
          updateStatus.mutate({ applicationId: application.id, status: 'ACCEPTED' })
        }
      />
      <Button
        label="Recusar"
        variant="secondary"
        onPress={() =>
          updateStatus.mutate({ applicationId: application.id, status: 'REJECTED' })
        }
      />
    </View>
  );
}
