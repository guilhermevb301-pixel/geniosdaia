import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Time unit types and formatting utilities
export type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks';

const timeUnitLabels: Record<TimeUnit, { singular: string; plural: string; short: string }> = {
  minutes: { singular: 'minuto', plural: 'minutos', short: 'min' },
  hours: { singular: 'hora', plural: 'horas', short: 'h' },
  days: { singular: 'dia', plural: 'dias', short: 'd' },
  weeks: { singular: 'semana', plural: 'semanas', short: 'sem' },
};

export function formatEstimatedTime(
  value: number | null | undefined, 
  unit: TimeUnit = 'minutes'
): string {
  if (!value) return '';
  
  const label = timeUnitLabels[unit] || timeUnitLabels.minutes;
  return `${value} ${value === 1 ? label.singular : label.plural}`;
}

export function formatEstimatedTimeShort(
  value: number | null | undefined, 
  unit: TimeUnit = 'minutes'
): string {
  if (!value) return '';
  
  const shorts: Record<TimeUnit, string> = {
    minutes: 'min',
    hours: 'h',
    days: 'd',
    weeks: 'sem',
  };
  
  return `${value}${shorts[unit]}`;
}
