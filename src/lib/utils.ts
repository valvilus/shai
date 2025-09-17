import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CQRScores } from '@/types/analysis';

// 🎯 Утилита для объединения CSS классов
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 🎯 Утилиты для CQR анализа

/**
 * Получить цвет для CQR оценки
 */
export const getCQRScoreColor = (score: number): string => {
  if (score >= 0.8) return '#10B981'; // green
  if (score >= 0.4) return '#F59E0B'; // amber  
  return '#EF4444'; // red
};

/**
 * Получить статус для CQR оценки
 */
export const getCQRScoreStatus = (score: number): 'good' | 'warning' | 'critical' => {
  if (score >= 0.8) return 'good';
  if (score >= 0.4) return 'warning';
  return 'critical';
};

/**
 * Получить текстовое описание CQR оценки
 */
export const getCQRScoreLabel = (score: number): string => {
  if (score >= 0.8) return 'Отлично';
  if (score >= 0.4) return 'Требует внимания';
  return 'Критично';
};

/**
 * Рассчитать взвешенный CQR балл
 */
export const calculateWeightedCQR = (
  scores: CQRScores, 
  weights?: Partial<Record<keyof CQRScores, number>>
): number => {
  // Стандартные веса (можно кастомизировать)
  const defaultWeights = {
    greeting: 0.08,
    speech: 0.12,
    initiative: 0.15,
    programming: 0.10,
    qualification: 0.15,
    product: 0.12,
    problem: 0.15,
    press: 0.08,
    next_step: 0.05
  };
  
  const finalWeights = { ...defaultWeights, ...weights };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  Object.entries(scores).forEach(([key, score]) => {
    const weight = finalWeights[key as keyof CQRScores] || 0;
    weightedSum += score * weight;
    totalWeight += weight;
  });
  
  return Math.round((weightedSum / totalWeight) * 100);
};

// 🎯 Утилиты для форматирования

/**
 * Форматировать проценты
 */
export const formatPercentage = (value: number, decimals = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Форматировать дату
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
};

/**
 * Форматировать время
 */
export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Форматировать длительность звонка
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 🎯 Утилиты для цветов

/**
 * Получить цвет для теплоты клиента
 */
export const getClientWarmthColor = (warmth: string): string => {
  switch (warmth) {
    case 'горячий': return '#EF4444';
    case 'теплый': return '#F59E0B';
    case 'холодный': return '#3B82F6';
    default: return '#6B7280';
  }
};

/**
 * Получить цвет для вероятности успеха
 */
export const getSuccessProbabilityColor = (probability: string): string => {
  const num = parseInt(probability);
  if (num >= 80) return '#10B981';
  if (num >= 50) return '#F59E0B';
  return '#EF4444';
};

// 🎯 Утилиты для данных

/**
 * Группировать массив по ключу
 */
export const groupBy = <T>(array: T[], keyGetter: (item: T) => string): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyGetter(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Получить уникальные значения из массива
 */
export const getUniqueValues = <T>(array: T[], keyGetter: (item: T) => any): any[] => {
  const seen = new Set();
  return array
    .map(keyGetter)
    .filter(value => {
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
};

/**
 * Рассчитать среднее значение
 */
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
};

/**
 * Рассчитать медиану
 */
export const calculateMedian = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
};

// 🎯 Утилиты для валидации

/**
 * Проверить, является ли строка валидным email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Проверить, является ли строка валидным телефоном
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// 🎯 Утилиты для экспорта

/**
 * Скачать данные как CSV
 */
export const downloadCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Скачать данные как JSON
 */
export const downloadJSON = (data: any, filename: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// 🎯 Утилиты для поиска и фильтрации

/**
 * Поиск по тексту (case-insensitive)
 */
export const searchInText = (text: string, query: string): boolean => {
  return text.toLowerCase().includes(query.toLowerCase());
};

/**
 * Debounce функция
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
