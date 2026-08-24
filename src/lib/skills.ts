/**
 * Catálogo de habilidades sugeridas (RN-006).
 *
 * O MVP usa uma lista curta e reconhecível, evitando taxonomias complexas.
 * O trabalhador e o empregador podem adicionar uma habilidade personalizada,
 * que é normalizada (minúscula, sem acento) antes de ser comparada.
 */
export const SUGGESTED_SKILLS = [
  'atendimento',
  'vendas',
  'garçom',
  'cozinha',
  'limpeza',
  'construção',
  'informática',
  'design',
  'fotografia',
  'eventos',
  'administrativo',
  'motorista',
  'estoque',
  'caixa',
  'entregas',
  'recepção',
] as const;

/** Remove acentos, espaços extras e caixa alta para permitir comparação estável. */
export function normalizeSkill(skill: string): string {
  return skill
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** Exibe a habilidade com a primeira letra maiúscula, sem alterar o dado salvo. */
export function displaySkill(skill: string): string {
  const trimmed = skill.trim();
  if (trimmed.length === 0) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
