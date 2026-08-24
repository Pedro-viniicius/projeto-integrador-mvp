/**
 * Pesos do score de compatibilidade (RN-001).
 *
 * Os quatro critérios somam 1.0. Alterar um peso exige atualizar
 * `docs/ALGORITMO_MATCH.md` e os testes de `src/__tests__/matching.test.ts`.
 */
export const MATCH_WEIGHTS = {
  availability: 0.4,
  skills: 0.35,
  employmentModel: 0.15,
  location: 0.1,
} as const;

/** Score mínimo para uma vaga aparecer no feed do trabalhador (RN-005). */
export const MIN_FEED_SCORE = 40;

/** Faixas de classificação exibidas na interface (RN-002). */
export const MATCH_TIERS = [
  { min: 80, id: 'EXCELLENT', label: 'Excelente compatibilidade' },
  { min: 60, id: 'GOOD', label: 'Boa compatibilidade' },
  { min: 40, id: 'PARTIAL', label: 'Compatibilidade parcial' },
  { min: 0, id: 'LOW', label: 'Baixa compatibilidade' },
] as const;

export type MatchTierId = (typeof MATCH_TIERS)[number]['id'];
