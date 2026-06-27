import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CUR = 'S$';

/** Format a SGD price the Carouza way: "S$10". */
export function price(value: number, currency = 'SGD'): string {
  const symbol = currency === 'SGD' ? CUR : currency + ' ';
  return `${symbol}${value.toLocaleString('en-SG')}`;
}
