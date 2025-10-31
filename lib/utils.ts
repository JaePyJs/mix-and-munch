import { Ingredient } from './types';

export function formatMatchPercentage(value: number): string {
  return `${value}% pantry match`;
}

export function joinList(items: string[], conjunction = 'and'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  const last = items.pop();
  return `${items.join(', ')} ${conjunction} ${last}`;
}

export function resolveIngredientLabel(id: string, list: Ingredient[]): Ingredient | undefined {
  return list.find((item) => item.id === id);
}
