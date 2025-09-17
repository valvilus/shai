'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  PhoneIcon,
  EyeIcon,
  EllipsisVerticalIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  PlusCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BellIcon,
  ChevronDownIcon,
  FunnelIcon,
  EyeSlashIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { CallRecordForUI } from '../../types/mongodb';
import { useCallsData, useCallData } from '../../hooks/calls/useCallsData';
import { 
  CallsLoadingState, 
  CallsErrorState, 
  CallsEmptyState, 
  ApiStatusIndicator,
  RefreshIndicator,
  CallsStatsDisplay 
} from '../../components/calls/CallsDataStates';
import { useColumnResize } from '@/hooks/useColumnResize';
import { ResizeHandle } from '@/components/ResizeHandle';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import AppLayout from '@/components/layout/AppLayout';
import CallsHeader from './components/CallsHeader';


// Интерфейс для фильтров
interface FilterState {
  dateRange: string;
  status: string;
  clientWarmth: string;
  callType: string;
  cqrScoreRange: [number, number];
  competitorsMentioned: string;
  communicationIssues: string[];
  questionsCount: string;
  objectionsCount: string;
  successProbability: string;
  priority: string;
}

// Интерфейс для управления колонками
interface TableColumn {
  key: string;
  label: string;
  visible: boolean;
  sortable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  category: 'basic' | 'cqr' | 'analysis' | 'metrics' | 'communication';
}

// Все возможные колонки таблицы с компактными размерами
const ALL_TABLE_COLUMNS: TableColumn[] = [
  // Основные данные
  { key: 'call_id', label: 'ID', visible: true, sortable: true, width: 40, minWidth: 35, maxWidth: 80, category: 'basic' },
  { key: 'manager', label: 'Менеджер', visible: true, sortable: true, width: 140, minWidth: 60, maxWidth: 200, category: 'basic' },
  { key: 'client', label: 'Клиент', visible: true, sortable: true, width: 160, minWidth: 80, maxWidth: 250, category: 'basic' },
  { key: 'date', label: 'Дата', visible: true, sortable: true, width: 55, minWidth: 45, maxWidth: 90, category: 'basic' },
  { key: 'duration', label: 'Время', visible: true, sortable: true, width: 40, minWidth: 35, maxWidth: 80, category: 'basic' },
  { key: 'status', label: 'Статус', visible: true, sortable: true, width: 60, minWidth: 45, maxWidth: 100, category: 'basic' },
  
  // CQR оценки
  { key: 'cqr_total', label: 'CQR Общий', visible: true, sortable: true, width: 80, minWidth: 60, maxWidth: 120, category: 'cqr' },
  { key: 'cqr_greeting', label: 'Приветствие', visible: true, sortable: true, width: 90, minWidth: 70, maxWidth: 130, category: 'cqr' },
  { key: 'cqr_speech', label: 'Качество речи', visible: true, sortable: true, width: 100, minWidth: 80, maxWidth: 150, category: 'cqr' },
  { key: 'cqr_initiative', label: 'Инициатива', visible: true, sortable: true, width: 90, minWidth: 70, maxWidth: 130, category: 'cqr' },
  { key: 'cqr_programming', label: 'Программирование', visible: true, sortable: true, width: 110, minWidth: 90, maxWidth: 160, category: 'cqr' },
  { key: 'cqr_qualification', label: 'Квалификация', visible: true, sortable: true, width: 100, minWidth: 80, maxWidth: 150, category: 'cqr' },
  { key: 'cqr_product', label: 'Продукт', visible: false, sortable: true, width: 80, minWidth: 60, maxWidth: 120, category: 'cqr' },
  { key: 'cqr_problem', label: 'Проблема', visible: false, sortable: true, width: 90, minWidth: 70, maxWidth: 130, category: 'cqr' },
  { key: 'cqr_press', label: 'Давление', visible: false, sortable: true, width: 80, minWidth: 60, maxWidth: 120, category: 'cqr' },
  { key: 'cqr_next_step', label: 'След. шаг', visible: false, sortable: true, width: 90, minWidth: 70, maxWidth: 130, category: 'cqr' },
  
  // Анализы
  { key: 'client_warmth', label: 'Теплота клиента', visible: true, sortable: true, width: 110, minWidth: 80, maxWidth: 150, category: 'analysis' },
  { key: 'call_type', label: 'Тип звонка', visible: true, sortable: true, width: 130, minWidth: 100, maxWidth: 180, category: 'analysis' },
  { key: 'competitors', label: 'Конкуренты', visible: false, sortable: true, width: 90, minWidth: 70, maxWidth: 130, category: 'analysis' },
  { key: 'questions_count', label: 'Кол-во вопросов', visible: false, sortable: true, width: 100, minWidth: 80, maxWidth: 140, category: 'analysis' },
  { key: 'objections_count', label: 'Кол-во возражений', visible: false, sortable: true, width: 110, minWidth: 90, maxWidth: 160, category: 'analysis' },
  { key: 'pains_count', label: 'Кол-во болей', visible: false, sortable: true, width: 100, minWidth: 80, maxWidth: 140, category: 'analysis' },
  { key: 'products_count', label: 'Кол-во продуктов', visible: false, sortable: true, width: 110, minWidth: 90, maxWidth: 150, category: 'analysis' },
  { key: 'success_probability', label: 'Вероятность успеха', visible: false, sortable: true, width: 120, minWidth: 100, maxWidth: 170, category: 'analysis' },
  { key: 'priority', label: 'Приоритет', visible: false, sortable: true, width: 90, minWidth: 70, maxWidth: 130, category: 'analysis' },
  
  // Качественные метрики
  { key: 'questions_quality', label: 'Качество ответов', visible: false, sortable: true, width: 120, minWidth: 100, maxWidth: 170, category: 'metrics' },
  { key: 'objections_quality', label: 'Качество возражений', visible: false, sortable: true, width: 130, minWidth: 110, maxWidth: 180, category: 'metrics' },
  
  // Стандарты коммуникации
  { key: 'obscenities', label: 'Мат', visible: false, sortable: true, width: 60, minWidth: 50, maxWidth: 90, category: 'communication' },
  { key: 'first_name_basis', label: 'Обращение на "ты"', visible: false, sortable: true, width: 110, minWidth: 90, maxWidth: 150, category: 'communication' },
  { key: 'jokes', label: 'Шутки', visible: false, sortable: true, width: 70, minWidth: 60, maxWidth: 110, category: 'communication' },
];



const CallStatusBadge = ({ status }: { status: string }) => {
  let colorClass = '';
  
  switch (status) {
    case 'Завершено':
      colorClass = 'inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200';
      break;
    case 'Возврат':
      colorClass = 'inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200';
      break;
    case 'Отменено':
      colorClass = 'inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200';
      break;
    default:
      colorClass = 'inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200';
  }

  return (
    <span className={colorClass}>
      <div className="w-2 h-2 rounded-full bg-current"></div>
      {status}
    </span>
  );
};

// Компонент заголовка колонки с изменением размера
const ResizableColumnHeader = ({ 
  column, 
  onResize 
}: { 
  column: TableColumn; 
  onResize: (key: string, width: number) => void; 
}) => {
  const { width, isResizing, handleMouseDown } = useColumnResize({
    initialWidth: column.width || 80,
    minWidth: column.minWidth || 30,
    maxWidth: column.maxWidth || 500,
    onResize: (newWidth) => onResize(column.key, newWidth)
  });

  return (
    <th
      key={column.key}
      className="group relative px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-r border-gray-200 last:border-r-0 bg-gray-50 select-none"
      style={{ width: `${width}px` }}
    >
      <div className="flex items-center justify-between pr-1">
        <span className="truncate">{column.label}</span>
    </div>
      <ResizeHandle onMouseDown={handleMouseDown} isResizing={isResizing} />
    </th>
  );
};

// Компонент модального окна с деталями звонка
const CallDetailsModal = ({ 
  call, 
  isOpen, 
  onClose 
}: {
  call: CallRecordForUI | null; 
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !call) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd.MM.yyyy HH:mm', { locale: ru });
    } catch {
      return dateString;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 backdrop-blur-sm bg-white/20"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Детали звонка {call.call_id}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(call.date)} • Длительность: {formatDuration(call.duration_minutes)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
      </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Левая колонка - Основная информация */}
            <div className="space-y-6">
              {/* Основная информация */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PhoneIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Основная информация
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID звонка:</span>
                    <span className="font-medium text-gray-900">{call.call_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Дата и время:</span>
                    <span className="font-medium text-gray-900">{formatDate(call.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Длительность:</span>
                    <span className="font-medium text-gray-900">{formatDuration(call.duration_minutes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Статус:</span>
                    <CallStatusBadge status={call.status} />
                  </div>
                </div>
        </div>

              {/* Информация о менеджере */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-green-600" />
                  Менеджер
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Имя:</span>
                    <span className="font-medium text-gray-900">{call.manager_info.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{call.manager_info.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Аватар:</span>
                    <div className="flex items-center space-x-2">
                      {call.manager_info.avatar.startsWith('http') ? (
                        <img src={call.manager_info.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {call.manager_info.avatar}
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{call.manager_info.avatar}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Информация о клиенте */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Клиент
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Название:</span>
                    <span className="font-medium text-gray-900">{call.client_info.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Компания:</span>
                    <span className="font-medium text-gray-900">{call.client_info.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-blue-600">{call.client_info.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Телефон:</span>
                    <span className="font-medium text-gray-900">{call.client_info.phone}</span>
                  </div>
                </div>
              </div>

              {/* Данные транскрипции */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Транскрипция
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Статус обработки:</span>
                    <span className="font-medium text-green-600">
                      {call.raw_data?.transcription?.processing_status === 'success' ? 'Успешно' : 'Ошибка'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-2">Текст:</span>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {call.raw_data?.transcription?.formatted_text || 'Транскрипция недоступна'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка - Аналитика */}
            <div className="space-y-6">
              {/* CQR Оценки */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                  CQR Оценки
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Приветствие:</span>
                    <span className="font-medium">{Math.round(call.cqr_scores.greeting * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Речь:</span>
                    <span className="font-medium">{Math.round(call.cqr_scores.speech * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Инициатива:</span>
                    <span className="font-medium">{Math.round(call.cqr_scores.initiative * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Программирование:</span>
                    <span className="font-medium">{Math.round(call.cqr_scores.programming * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Квалификация:</span>
                    <span className="font-medium">{Math.round(call.cqr_scores.qualification * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Продукт:</span>
                    <span className="font-medium">{Math.round(call.cqr_scores.product * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Проблема:</span>
                    <span className="font-medium">{Math.round(call.cqr_scores.problem * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Давление:</span>
                    <span className="font-medium">{Math.round(call.cqr_scores.press * 100)}%</span>
                  </div>
                  <div className="col-span-2 flex justify-between">
                    <span className="text-gray-600">След. шаг:</span>
                    <span className="font-medium">{Math.round(call.cqr_scores.next_step * 100)}%</span>
                  </div>
                </div>
              </div>
              
              {/* Метрики качества */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Cog6ToothIcon className="h-5 w-5 mr-2 text-green-600" />
                  Метрики качества
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">CQR общий:</span>
                    <span className="font-bold text-green-600">{call.quality_metrics.cqr_total_weighted_percent}%</span>
              </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Качество ответов:</span>
                    <span className="font-medium">{call.quality_metrics.client_questions_answer_quality_percent}%</span>
            </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Работа с возражениями:</span>
                    <span className="font-medium">{call.quality_metrics.objections_handling_quality_percent}%</span>
                  </div>
                </div>
      </div>

              {/* Анализ звонка */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <EyeIcon className="h-5 w-5 mr-2 text-yellow-600" />
                  Анализ звонка
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Теплота клиента:</span>
                    <span className="font-medium capitalize">{call.analysis_data.client_warmth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Тип звонка:</span>
                    <span className="font-medium">{call.analysis_data.call_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Конкуренты упомянуты:</span>
                    <span className="font-medium">{call.analysis_data.competitors_mentioned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Количество вопросов:</span>
                    <span className="font-medium">{call.analysis_data.client_questions_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Количество возражений:</span>
                    <span className="font-medium">{call.analysis_data.client_objections_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Количество болей:</span>
                    <span className="font-medium">{call.analysis_data.client_pains_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Упомянуто продуктов:</span>
                    <span className="font-medium">{call.analysis_data.mentioned_products_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Вероятность успеха:</span>
                    <span className="font-bold text-blue-600">{call.analysis_data.success_probability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Приоритет:</span>
                    <span className="font-medium">{call.analysis_data.next_best_action_priority}</span>
                  </div>
                </div>
              </div>

              {/* Боли клиента */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-orange-600" />
                  Боли клиента
                </h3>
                <div className="space-y-2">
                  {call.raw_data?.additional_analysis?.client_pains ? (
                    <>
                      {call.raw_data.additional_analysis.client_pains.pain_1 && (
                        <div className="p-2 bg-orange-50 rounded border-l-4 border-orange-400">
                          <p className="text-sm text-orange-800">{call.raw_data.additional_analysis.client_pains.pain_1}</p>
                        </div>
                      )}
                      {call.raw_data.additional_analysis.client_pains.pain_2 && (
                        <div className="p-2 bg-orange-50 rounded border-l-4 border-orange-400">
                          <p className="text-sm text-orange-800">{call.raw_data.additional_analysis.client_pains.pain_2}</p>
                        </div>
                      )}
                      {call.raw_data.additional_analysis.client_pains.pain_3 && (
                        <div className="p-2 bg-orange-50 rounded border-l-4 border-orange-400">
                          <p className="text-sm text-orange-800">{call.raw_data.additional_analysis.client_pains.pain_3}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Боли не выявлены</p>
                  )}
                </div>
              </div>

              {/* Стандарты коммуникации */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BellIcon className="h-5 w-5 mr-2 text-red-600" />
                  Стандарты коммуникации
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ненормативная лексика:</span>
                    <span className={`font-medium ${call.communication_standards.obscenities ? 'text-red-600' : 'text-green-600'}`}>
                      {call.communication_standards.obscenities ? 'Есть' : 'Нет'}
    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Обращение на "ты":</span>
                    <span className={`font-medium ${call.communication_standards.first_name_basis ? 'text-yellow-600' : 'text-green-600'}`}>
                      {call.communication_standards.first_name_basis ? 'Есть' : 'Нет'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Шутки:</span>
                    <span className={`font-medium ${call.communication_standards.jokes ? 'text-blue-600' : 'text-gray-600'}`}>
                      {call.communication_standards.jokes ? 'Есть' : 'Нет'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* CQR Комментарии */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-600" />
                  CQR Комментарии
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Object.entries(call.raw_data?.cqr_analysis || {}).map(([key, analysis]) => (
                    <div key={key} className="border-b border-gray-100 pb-2 last:border-b-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace('_', ' ')}:
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {analysis.grade}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {analysis.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Закрыть
          </button>
      </div>
      </div>
    </div>
  );
};

export default function CallsPage() {
  const router = useRouter();
  
  // Фильтры с localStorage
  const [searchQuery, setSearchQuery] = useLocalStorage('calls-search-query', '');
  const [dateFilter, setDateFilter] = useLocalStorage('calls-date-filter', 'all');
  const [statusFilter, setStatusFilter] = useLocalStorage('calls-status-filter', 'all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showColumnControl, setShowColumnControl] = useState(false);
  const [tableColumns, setTableColumns] = useLocalStorage('calls-table-columns', ALL_TABLE_COLUMNS);
  const [selectedCall, setSelectedCall] = useState<CallRecordForUI | null>(null);
  const [showCallDetails, setShowCallDetails] = useState(false);
  const itemsPerPage = 25;

  // Используем реальные данные из MongoDB
  const {
    calls,
    totalCalls,
    currentPage,
    totalPages,
    stats,
    isLoading,
    isLoadingStats,
    isRefreshing,
    error,
    statsError,
    loadCalls,
    refreshCalls,
    loadStats,
    clearError,
    searchCalls,
    isApiHealthy,
    checkApiHealth
  } = useCallsData({
    page: 1,
    limit: itemsPerPage,
    search: typeof searchQuery === 'string' ? searchQuery : undefined,
    status: typeof statusFilter === 'string' && statusFilter !== 'all' ? statusFilter : undefined
  });

  const [advancedFilters, setAdvancedFilters] = useLocalStorage<FilterState>('calls-advanced-filters', {
    dateRange: 'all',
    status: 'all',
    clientWarmth: 'all',
    callType: 'all',
    cqrScoreRange: [0, 100],
    competitorsMentioned: 'all',
    communicationIssues: [],
    questionsCount: 'all',
    objectionsCount: 'all',
    successProbability: 'all',
    priority: 'all',
  });

  // Получаем только видимые колонки
  const visibleColumns = useMemo(() => {
    if (Array.isArray(tableColumns)) {
      return tableColumns.filter(col => col.visible);
    }
    return [];
  }, [tableColumns]);

  const dateOptions = [
    { value: 'today', label: 'Сегодня' },
    { value: 'last7days', label: 'Последние 7 дней' },
    { value: 'last30days', label: 'Последние 30 дней' },
  ];

  const statusOptions = [
    { value: 'Завершено', label: 'Завершено' },
    { value: 'Возврат', label: 'Возврат' },
    { value: 'Отменено', label: 'Отменено' },
  ];

  // Функция для проверки диапазонов
  const isInRange = (value: number, min: number, max: number) => {
    return value >= min && value <= max;
  };

  // Функция для проверки количества
  const matchesCount = (count: number, filter: string) => {
    if (filter === 'all') return true;
    if (filter === '0') return count === 0;
    if (filter === '1-2') return count >= 1 && count <= 2;
    if (filter === '3-5') return count >= 3 && count <= 5;
    if (filter === '6+') return count >= 6;
    return true;
  };

  // Функция для проверки вероятности успеха
  const matchesSuccessProbability = (probability: string, filter: string) => {
    if (filter === 'all') return true;
    const numValue = parseInt(probability.replace('%', ''));
    if (filter === 'low') return numValue <= 30;
    if (filter === 'medium') return numValue > 30 && numValue <= 60;
    if (filter === 'high') return numValue > 60 && numValue <= 85;
    if (filter === 'very-high') return numValue > 85;
    return true;
  };

  // Обработчики для поиска и фильтрации
  const handleSearch = useCallback((query: string) => {
    if (typeof setSearchQuery === 'function') {
      setSearchQuery(query);
    }
    if (query.trim()) {
      searchCalls(query);
    } else {
      loadCalls({ page: 1, limit: itemsPerPage });
    }
  }, [searchCalls, loadCalls, setSearchQuery]);

  const handlePageChange = useCallback((page: number) => {
    loadCalls({ 
      page, 
      limit: itemsPerPage,
      search: typeof searchQuery === 'string' ? searchQuery || undefined : undefined,
      status: typeof statusFilter === 'string' && statusFilter !== 'all' ? statusFilter : undefined
    });
  }, [loadCalls, searchQuery, statusFilter]);

  const handleStatusFilter = useCallback((status: string) => {
    if (typeof setStatusFilter === 'function') {
      setStatusFilter(status);
    }
    loadCalls({
      page: 1,
      limit: itemsPerPage,
      search: typeof searchQuery === 'string' ? searchQuery || undefined : undefined,
      status: status === 'all' ? undefined : status
    });
  }, [loadCalls, searchQuery, setStatusFilter]);

  const handleRowClick = (callId: string) => {
    const call = calls.find(c => c.call_id === callId);
    if (call) {
      setSelectedCall(call);
      setShowCallDetails(true);
    }
  };

  // Функция для обновления размера колонки
  const handleColumnResize = (columnKey: string, newWidth: number) => {
    if (typeof setTableColumns === 'function') {
      setTableColumns((prevColumns: TableColumn[]) =>
        Array.isArray(prevColumns) ? prevColumns.map(col =>
          col.key === columnKey ? { ...col, width: newWidth } : col
        ) : []
      );
    }
  };

  // Функция для рендеринга содержимого ячейки
  const renderCellContent = (column: TableColumn, call: CallRecordForUI) => {
    switch (column.key) {
      case 'call_id':
        return <span className="font-medium text-gray-900">{call.call_id}</span>;
      
      case 'manager':
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
              {call.manager_info.avatar.startsWith('http') ? (
              <img
                  className="h-full w-full object-cover rounded-full"
                  src={call.manager_info.avatar}
                alt={call.manager_info.name}
              />
              ) : (
                <span className="text-sm font-semibold text-gray-700">
                  {call.manager_info.avatar}
                </span>
              )}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">{call.manager_info.name}</div>
              <div className="text-sm text-gray-500">{call.manager_info.email}</div>
            </div>
          </div>
        );
      
      case 'client':
        return (
          <div>
            <div className="text-sm font-medium text-gray-900">{call.client_info.name}</div>
            <div className="text-sm text-gray-500">{call.client_info.company}</div>
          </div>
        );
      
      case 'date':
        return <span className="text-sm text-gray-500">{format(parseISO(call.date), 'dd.MM.yyyy', { locale: ru })}</span>;
      
      case 'duration':
        return <span className="text-sm text-gray-500 font-medium">{call.duration_minutes}:{String(Math.floor(Math.random() * 60)).padStart(2, '0')}</span>;
      
      case 'status':
        return <CallStatusBadge status={call.status} />;
      
      case 'cqr_total':
        return (
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              call.quality_metrics.cqr_total_weighted_percent >= 80 
                ? 'bg-green-500' 
                : call.quality_metrics.cqr_total_weighted_percent >= 60 
                ? 'bg-yellow-500' 
                : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-semibold text-gray-900">
              {call.quality_metrics.cqr_total_weighted_percent}%
            </span>
          </div>
        );
      
      case 'client_warmth':
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            call.analysis_data.client_warmth === 'горячий' 
              ? 'bg-red-50 text-red-700' 
              : call.analysis_data.client_warmth === 'теплый' 
              ? 'bg-yellow-50 text-yellow-700' 
              : 'bg-blue-50 text-blue-700'
          }`}>
            {call.analysis_data.client_warmth}
          </span>
        );

      // CQR оценки
      case 'cqr_greeting':
        return <span className="text-sm font-medium">{(call.cqr_scores.greeting * 100).toFixed(0)}%</span>;
      case 'cqr_speech':
        return <span className="text-sm font-medium">{(call.cqr_scores.speech * 100).toFixed(0)}%</span>;
      case 'cqr_initiative':
        return <span className="text-sm font-medium">{(call.cqr_scores.initiative * 100).toFixed(0)}%</span>;
      case 'cqr_programming':
        return <span className="text-sm font-medium">{(call.cqr_scores.programming * 100).toFixed(0)}%</span>;
      case 'cqr_qualification':
        return <span className="text-sm font-medium">{(call.cqr_scores.qualification * 100).toFixed(0)}%</span>;
      case 'cqr_product':
        return <span className="text-sm font-medium">{(call.cqr_scores.product * 100).toFixed(0)}%</span>;
      case 'cqr_problem':
        return <span className="text-sm font-medium">{(call.cqr_scores.problem * 100).toFixed(0)}%</span>;
      case 'cqr_press':
        return <span className="text-sm font-medium">{(call.cqr_scores.press * 100).toFixed(0)}%</span>;
      case 'cqr_next_step':
        return <span className="text-sm font-medium">{(call.cqr_scores.next_step * 100).toFixed(0)}%</span>;

      // Анализы
      case 'call_type':
        return <span className="text-sm text-gray-600">{call.analysis_data.call_type}</span>;
      case 'competitors':
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            call.analysis_data.competitors_mentioned === 'да' ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-700'
          }`}>
            {call.analysis_data.competitors_mentioned}
          </span>
        );
      case 'questions_count':
        return <span className="text-sm text-gray-700">{call.analysis_data.client_questions_count}</span>;
      case 'objections_count':
        return <span className="text-sm text-gray-700">{call.analysis_data.client_objections_count}</span>;
      case 'pains_count':
        return <span className="text-sm text-gray-700">{call.analysis_data.client_pains_count}</span>;
      case 'products_count':
        return <span className="text-sm text-gray-700">{call.analysis_data.mentioned_products_count}</span>;
      case 'success_probability':
        return <span className="text-sm font-medium text-gray-900">{call.analysis_data.success_probability}</span>;
      case 'priority':
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            call.analysis_data.next_best_action_priority === 'Очень высокий' ? 'bg-red-50 text-red-700' :
            call.analysis_data.next_best_action_priority === 'Высокий' ? 'bg-orange-50 text-orange-700' :
            call.analysis_data.next_best_action_priority === 'Средний' ? 'bg-yellow-50 text-yellow-700' :
            'bg-gray-50 text-gray-700'
          }`}>
            {call.analysis_data.next_best_action_priority}
          </span>
        );

      // Метрики
      case 'questions_quality':
        return <span className="text-sm font-medium">{call.quality_metrics.client_questions_answer_quality_percent}%</span>;
      case 'objections_quality':
        return <span className="text-sm font-medium">{call.quality_metrics.objections_handling_quality_percent}%</span>;

      // Стандарты коммуникации
      case 'obscenities':
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            call.communication_standards.obscenities ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {call.communication_standards.obscenities ? 'Да' : 'Нет'}
          </span>
        );
      case 'first_name_basis':
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            call.communication_standards.first_name_basis ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
          }`}>
            {call.communication_standards.first_name_basis ? 'Да' : 'Нет'}
          </span>
        );
      case 'jokes':
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            call.communication_standards.jokes ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
          }`}>
            {call.communication_standards.jokes ? 'Да' : 'Нет'}
          </span>
        );

      default:
        return <span className="text-sm text-gray-500">-</span>;
    }
  };

  return (
    <>
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* API Status и Refresh индикатор */}
        <div className="flex items-center justify-between mb-4">
          <ApiStatusIndicator isHealthy={isApiHealthy} onCheck={checkApiHealth} />
          <CallsStatsDisplay stats={stats} isLoading={isLoadingStats} error={statsError} />
        </div>

        {/* CALLS HEADER с фильтрами */}
        <CallsHeader
          searchQuery={typeof searchQuery === 'string' ? searchQuery : ''}
          setSearchQuery={handleSearch}
          dateFilter={typeof dateFilter === 'string' ? dateFilter : 'all'}
          setDateFilter={typeof setDateFilter === 'function' ? setDateFilter : () => {}}
          statusFilter={typeof statusFilter === 'string' ? statusFilter : 'all'}
          setStatusFilter={handleStatusFilter}
          showAdvancedFilters={showAdvancedFilters}
          setShowAdvancedFilters={setShowAdvancedFilters}
          showColumnControl={showColumnControl}
          setShowColumnControl={setShowColumnControl}
          advancedFilters={typeof advancedFilters === 'object' && advancedFilters !== null ? advancedFilters : {
            dateRange: 'all',
            status: 'all',
            clientWarmth: 'all',
            callType: 'all',
            cqrScoreRange: [0, 100],
            competitorsMentioned: 'all',
            communicationIssues: [],
            questionsCount: 'all',
            objectionsCount: 'all',
            successProbability: 'all',
            priority: 'all',
          }}
          setAdvancedFilters={typeof setAdvancedFilters === 'function' ? setAdvancedFilters : () => {}}
          tableColumns={Array.isArray(tableColumns) ? tableColumns : []}
          setTableColumns={typeof setTableColumns === 'function' ? setTableColumns : () => {}}
          visibleColumns={visibleColumns}
          dateOptions={dateOptions}
          statusOptions={statusOptions}
        />

        {/* Основной контент с состояниями */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg flex flex-col">
          {error && !isLoading && (
            <div className="p-4 border-b border-gray-200">
              <CallsErrorState 
                error={error} 
                onRetry={() => {
                  clearError();
                  refreshCalls();
                }} 
                isApiHealthy={isApiHealthy}
              />
            </div>
          )}

          {isLoading ? (
            <CallsLoadingState message="Загрузка звонков из MongoDB..." />
          ) : calls.length === 0 && !error ? (
            <CallsEmptyState 
              onRefresh={refreshCalls}
              hasFilters={!!searchQuery || statusFilter !== 'all'}
            />
          ) : (
            <>
              {/* ТАБЛИЦА */}
              <div 
                id="table-container"
                className="ultimate-scrollbars force-visible-scrollbars flex-1"
                style={{ 
                  height: 'calc(100vh - 400px)',
                  minHeight: '400px',
                  maxHeight: 'calc(100vh - 400px)',
                  overflow: 'auto',
                  overflowX: 'auto',
                  overflowY: 'auto',
                  scrollbarWidth: 'auto',
                  border: '2px solid #e5e7eb',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-20">
                      <tr>
                        {visibleColumns.map((column) => (
                          <ResizableColumnHeader
                            key={column.key}
                            column={column}
                            onResize={handleColumnResize}
                          />
                        ))}
                      <th className="relative px-2 py-2 w-20 bg-gray-50 border-r border-gray-200">
                          <span className="sr-only">Действия</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {calls.map((call, index) => (
                        <motion.tr
                          key={call.call_id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className="group hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleRowClick(call.call_id)}
                        >
                          {visibleColumns.map((column) => (
                            <td
                              key={column.key}
                              className="px-4 py-3 whitespace-nowrap text-sm border-r border-gray-100 last:border-r-0 overflow-hidden"
                              style={{ 
                                width: `${column.width || 120}px`, 
                                minWidth: `${column.width || 120}px`,
                                maxWidth: `${column.width || 120}px`
                              }}
                            >
                              <div className="truncate">
                                {renderCellContent(column, call)}
                              </div>
                            </td>
                          ))}
                        <td className="px-2 py-3 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(call.call_id);
                                }}
                              className="text-gray-400 hover:text-gray-700 p-2 rounded-md border border-transparent hover:border-gray-300 transition-all duration-200 cursor-pointer"
                                title="Посмотреть детали"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => e.stopPropagation()}
                              className="text-gray-400 hover:text-gray-700 p-2 rounded-md border border-transparent hover:border-gray-300 transition-all duration-200 cursor-pointer"
                                title="Опции"
                              >
                                <EllipsisHorizontalIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
              </div>

              {/* Enhanced Pagination */}
              <div className="flex-shrink-0 flex items-center justify-between px-8 py-6 border-t border-gray-100 bg-white">
                <div className="text-sm text-gray-600 font-medium">
                  Показано {Math.min((currentPage - 1) * itemsPerPage + 1, totalCalls)}-
                  {Math.min(currentPage * itemsPerPage, totalCalls)} из {totalCalls} записей
                </div>
                <nav className="flex items-center space-x-1" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="sr-only">Предыдущая</span>
                    <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors rounded-lg ${
                        currentPage === page
                          ? 'z-10 bg-gray-900 text-white border-gray-900 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > 5 && (
                    <>
                      <span className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500">
                        ...
                      </span>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors rounded-lg ${
                          currentPage === totalPages
                            ? 'z-10 bg-gray-900 text-white border-gray-900 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="sr-only">Следующая</span>
                    <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Индикатор обновления */}
      <RefreshIndicator isRefreshing={isRefreshing} />

    </AppLayout>

    {/* Модальное окно с деталями звонка */}
    {showCallDetails && (
      <CallDetailsModal
        call={selectedCall}
        isOpen={showCallDetails}
        onClose={() => {
          setShowCallDetails(false);
          setSelectedCall(null);
        }}
      />
    )}
    </>
  );
}
