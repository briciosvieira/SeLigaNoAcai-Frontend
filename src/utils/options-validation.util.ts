import type { OptionGroup } from '@/types/product.types';

export function validateSelectedOptions(
  groups: OptionGroup[],
  selectedOptionsByGroup: Record<string, string[]>,
): string | null {
  for (const group of groups) {
    if (!group.isActive) continue;
    const selected = selectedOptionsByGroup[group.id] ?? [];

    if (selected.length < group.minSelected) {
      const label = group.minSelected === 1 ? 'opção' : 'opções';
      return `Escolha pelo menos ${group.minSelected} ${label} em "${group.name}".`;
    }

    if (selected.length > group.maxSelected) {
      const label = group.maxSelected === 1 ? 'opção' : 'opções';
      return `Escolha no máximo ${group.maxSelected} ${label} em "${group.name}".`;
    }
  }

  return null;
}
