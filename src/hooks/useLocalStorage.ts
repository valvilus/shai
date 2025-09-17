import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Состояние для хранения значения
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      // Получаем элемент из localStorage
      const item = window.localStorage.getItem(key);
      // Парсим JSON или возвращаем initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Возвращаем обёрнутую версию функции setState
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Позволяем value быть функцией, чтобы иметь тот же API, что и useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Сохраняем в состояние
      setStoredValue(valueToStore);
      // Сохраняем в localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error); 
    }
  };

  return [storedValue, setValue];
}