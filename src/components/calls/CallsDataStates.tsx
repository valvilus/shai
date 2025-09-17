/**
 * Компоненты для отображения состояний данных звонков
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  WifiIcon,
  ArrowPathIcon,
  PhoneIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline';

// Компонент загрузки
export const CallsLoadingState = ({ message = 'Загрузка звонков...' }: { message?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-12 px-4"
  >
    <div className="relative">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      <PhoneIcon className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
    </div>
    <p className="mt-4 text-sm text-gray-600 font-medium">{message}</p>
    <p className="mt-1 text-xs text-gray-400">Получение данных из MongoDB...</p>
  </motion.div>
);

// Компонент ошибки
export const CallsErrorState = ({ 
  error, 
  onRetry, 
  isApiHealthy = true 
}: { 
  error: string; 
  onRetry: () => void;
  isApiHealthy?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-12 px-4"
  >
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
      {isApiHealthy ? (
        <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
      ) : (
        <SignalSlashIcon className="w-8 h-8 text-red-600" />
      )}
    </div>
    
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {isApiHealthy ? 'Ошибка загрузки данных' : 'Нет подключения к серверу'}
    </h3>
    
    <p className="text-sm text-gray-600 text-center max-w-md mb-4">
      {error}
    </p>
    
    {!isApiHealthy && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 max-w-md">
        <div className="flex items-start">
          <WifiIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-xs text-yellow-800">
            <p className="font-medium">Проверьте:</p>
            <ul className="mt-1 space-y-1">
              <li>• Запущен ли API сервер на VDS</li>
              <li>• Доступен ли порт 8000</li>
              <li>• Работает ли MongoDB</li>
            </ul>
          </div>
        </div>
      </div>
    )}
    
    <button
      onClick={onRetry}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
    >
      <ArrowPathIcon className="w-4 h-4 mr-2" />
      Повторить попытку
    </button>
  </motion.div>
);

// Компонент пустого состояния
export const CallsEmptyState = ({ 
  onRefresh,
  hasFilters = false 
}: { 
  onRefresh: () => void;
  hasFilters?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-12 px-4"
  >
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
      <PhoneIcon className="w-8 h-8 text-gray-400" />
    </div>
    
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {hasFilters ? 'Ничего не найдено' : 'Нет данных о звонках'}
    </h3>
    
    <p className="text-sm text-gray-600 text-center max-w-md mb-4">
      {hasFilters 
        ? 'Попробуйте изменить параметры поиска или очистить фильтры'
        : 'Данные появятся здесь после обработки звонков в Dify workflow'
      }
    </p>
    
    <button
      onClick={onRefresh}
      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
    >
      <ArrowPathIcon className="w-4 h-4 mr-2" />
      Обновить
    </button>
  </motion.div>
);

// Компонент статуса API
export const ApiStatusIndicator = ({ 
  isHealthy, 
  onCheck 
}: { 
  isHealthy: boolean;
  onCheck: () => void;
}) => (
  <div className="flex items-center space-x-2">
    <button
      onClick={onCheck}
      className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
        isHealthy
          ? 'bg-green-50 text-green-700 hover:bg-green-100'
          : 'bg-red-50 text-red-700 hover:bg-red-100'
      }`}
      title="Проверить состояние API"
    >
      <div 
        className={`w-2 h-2 rounded-full ${
          isHealthy ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span>{isHealthy ? 'API онлайн' : 'API недоступен'}</span>
    </button>
  </div>
);

// Компонент индикатора обновления
export const RefreshIndicator = ({ isRefreshing }: { isRefreshing: boolean }) => {
  if (!isRefreshing) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2"
    >
      <ArrowPathIcon className="w-4 h-4 animate-spin" />
      <span className="text-sm font-medium">Обновление...</span>
    </motion.div>
  );
};

// Компонент статистики загрузки
export const CallsStatsDisplay = ({ 
  stats, 
  isLoading, 
  error 
}: { 
  stats: any;
  isLoading: boolean;
  error?: string | null;
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-600">Ошибка загрузки статистики</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Статистика</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total_calls}</div>
          <div className="text-xs text-gray-500">Всего звонков</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.avg_cqr_score}%</div>
          <div className="text-xs text-gray-500">Средний CQR</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.calls_by_date?.length || 0}
          </div>
          <div className="text-xs text-gray-500">Дней активности</div>
        </div>
      </div>
    </div>
  );
};
