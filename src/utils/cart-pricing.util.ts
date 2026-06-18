import type { OptionGroup } from '@/types/product.types';

export function calculateOptionsTotal(
  groups: OptionGroup[],
  selectedOptionsByGroup: Record<string, string[]>,
): number {
  let total = 0;

  for (const group of groups) {
    const selectedIds = selectedOptionsByGroup[group.id] ?? [];

    for (const option of group.options ?? []) {
      if (selectedIds.includes(option.id)) {
        const price = Number(option.additionalPrice ?? 0);
        total += Number.isFinite(price) ? price : 0;
      }
    }
  }

  return total;
}
