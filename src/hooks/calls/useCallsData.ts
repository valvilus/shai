/**
 * React hook для работы с данными звонков
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { callsService } from '../../lib/services/calls-service';
import type { CallRecordForUI, CallsSearchParams, CallsStats } from '../../types/mongodb';

export interface UseCallsDataReturn {
  // Данные
  calls: CallRecordForUI[];
  totalCalls: number;
  currentPage: number;
  totalPages: number;
  stats: CallsStats | null;
  
  // Состояния загрузки
  isLoading: boolean;
  isLoadingStats: boolean;
  isRefreshing: boolean;
  
  // Ошибки
  error: string | null;
  statsError: string | null;
  
  // Методы
  loadCalls: (params?: CallsSearchParams) => Promise<void>;
  refreshCalls: () => Promise<void>;
  loadStats: () => Promise<void>;
  clearError: () => void;
  
  // Состояние подключения
  isApiHealthy: boolean;
  checkApiHealth: () => Promise<void>;
}

export function useCallsData(initialParams: CallsSearchParams = {}) {
  // Состояние данных
  const [calls, setCalls] = useState<CallRecordForUI[]>([]);
  const [totalCalls, setTotalCalls] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialParams.page || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<CallsStats | null>(null);
  
  // Состояния загрузки
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Ошибки
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  // Состояние API
  const [isApiHealthy, setIsApiHealthy] = useState(true);
  
  // Параметры поиска
  const [searchParams, setSearchParams] = useState<CallsSearchParams>(initialParams);

  /**
   * Проверка здоровья API
   */
  const checkApiHealth = useCallback(async () => {
    try {
      const { isHealthy } = await callsService.healthCheck();
      setIsApiHealthy(isHealthy);
      
      if (!isHealthy) {
        setError('API недоступен. Проверьте подключение к серверу.');
      }
    } catch (err) {
      setIsApiHealthy(false);
      setError('Не удается подключиться к API сервера');
    }
  }, []);

  /**
   * Загрузка звонков
   */
  const loadCalls = useCallback(async (params: CallsSearchParams = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const mergedParams = { ...searchParams, ...params };
      setSearchParams(mergedParams);
      
      console.log('🔄 Loading calls with params:', mergedParams);
      
      const response = await callsService.getCalls(mergedParams);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log('✅ Loaded calls:', response.data.length);
      
      setCalls(response.data);
      setTotalCalls(response.total);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      
      // Если данных нет, проверяем здоровье API
      if (response.data.length === 0 && response.total === 0) {
        await checkApiHealth();
      }
      
    } catch (err) {
      console.error('❌ Error loading calls:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      setCalls([]);
      setTotalCalls(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, checkApiHealth]);

  /**
   * Обновление данных
   */
  const refreshCalls = useCallback(async () => {
    setIsRefreshing(true);
    await loadCalls(searchParams);
    setIsRefreshing(false);
  }, [loadCalls, searchParams]);

  /**
   * Загрузка статистики
   */
  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    
    try {
      console.log('🔄 Loading stats...');
      
      const response = await callsService.getStats();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log('✅ Loaded stats:', response.data);
      setStats(response.data);
      
    } catch (err) {
      console.error('❌ Error loading stats:', err);
      setStatsError(err instanceof Error ? err.message : 'Ошибка загрузки статистики');
      setStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  /**
   * Очистка ошибок
   */
  const clearError = useCallback(() => {
    setError(null);
    setStatsError(null);
  }, []);

  /**
   * Поиск звонков
   */
  const searchCalls = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Searching calls:', query);
      
      const response = await callsService.searchCalls(query);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log('✅ Found calls:', response.data.length);
      
      setCalls(response.data);
      setTotalCalls(response.data.length);
      setCurrentPage(1);
      setTotalPages(1);
      
    } catch (err) {
      console.error('❌ Error searching calls:', err);
      setError(err instanceof Error ? err.message : 'Ошибка поиска');
      setCalls([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Автоматическая загрузка при монтировании
   */
  useEffect(() => {
    loadCalls(initialParams);
    loadStats();
    checkApiHealth();
  }, []); // Загружаем только при монтировании

  /**
   * Мемоизированные вычисления
   */
  const memoizedStats = useMemo(() => stats, [stats]);
  const memoizedCalls = useMemo(() => calls, [calls]);

  return {
    // Данные
    calls: memoizedCalls,
    totalCalls,
    currentPage,
    totalPages,
    stats: memoizedStats,
    
    // Состояния загрузки
    isLoading,
    isLoadingStats,
    isRefreshing,
    
    // Ошибки
    error,
    statsError,
    
    // Методы
    loadCalls,
    refreshCalls,
    loadStats,
    clearError,
    searchCalls,
    
    // Состояние подключения
    isApiHealthy,
    checkApiHealth,
  };
}

/**
 * Hook для работы с конкретным звонком
 */
export function useCallData(callId: string | null) {
  const [call, setCall] = useState<CallRecordForUI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCall = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading call:', id);
      
      const response = await callsService.getCallById(id);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log('✅ Loaded call:', response.data);
      setCall(response.data);
      
    } catch (err) {
      console.error('❌ Error loading call:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки звонка');
      setCall(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (callId) {
      loadCall(callId);
    } else {
      setCall(null);
      setError(null);
    }
  }, [callId, loadCall]);

  return {
    call,
    isLoading,
    error,
    loadCall,
    clearError: () => setError(null)
  };
}
