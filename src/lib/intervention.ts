import type { QuickActionType } from './types';

export function outcomeForAction(type: QuickActionType): 'defended' | 'scammed' | null {
  if (type === 'unsafe') return 'scammed';
  if (type === 'report') return 'defended';
  return null;
}

export function isSoftRisky(type: QuickActionType): boolean {
  return type === 'risky';
}
