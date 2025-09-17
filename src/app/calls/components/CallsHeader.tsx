'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  XMarkIcon,
  ChevronDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

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

interface CallsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  showColumnControl: boolean;
  setShowColumnControl: (show: boolean) => void;
  advancedFilters: FilterState;
  setAdvancedFilters: (filters: FilterState) => void;
  tableColumns: TableColumn[];
  setTableColumns: (columns: TableColumn[]) => void;
  visibleColumns: TableColumn[];
  dateOptions: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
}

// Компактные Dropdown компоненты
const EnhancedDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  icon: Icon 
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  icon?: React.ComponentType<{ className?: string }>;
}) => {
  return (
    <div className="relative w-auto min-w-40">
      <select
        className="appearance-none w-full px-3 py-3 pl-10 pr-8 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      )}
      <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

// Продвинутая панель фильтров
const AdvancedFiltersPanel = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange 
}: {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}) => {
  if (!isOpen) return null;

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleCommunicationIssue = (issue: string) => {
    const current = filters.communicationIssues;
    const updated = current.includes(issue)
      ? current.filter(i => i !== issue)
      : [...current, issue];
    updateFilter('communicationIssues', updated);
  };

  const resetFilters = () => {
    onFiltersChange({
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Продвинутые фильтры</h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={resetFilters}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Сбросить все
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Теплота клиента */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Теплота клиента
          </label>
          <select
            value={filters.clientWarmth}
            onChange={(e) => updateFilter('clientWarmth', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">Все</option>
            <option value="холодный">Холодный</option>
            <option value="теплый">Теплый</option>
            <option value="горячий">Горячий</option>
          </select>
        </div>

        {/* Тип звонка */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Тип звонка
          </label>
          <select
            value={filters.callType}
            onChange={(e) => updateFilter('callType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">Все типы</option>
            <option value="входящий">Входящий</option>
            <option value="исходящий">Исходящий</option>
            <option value="холодный">Холодный контакт</option>
            <option value="теплый">Теплый лид</option>
            <option value="существующий">Существующий клиент</option>
            <option value="партнер">Партнер</option>
            <option value="VIP">VIP клиент</option>
          </select>
        </div>

        {/* CQR балл */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CQR балл (%)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              max="100"
              value={filters.cqrScoreRange[0]}
              onChange={(e) => updateFilter('cqrScoreRange', [parseInt(e.target.value) || 0, filters.cqrScoreRange[1]])}
              className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
              placeholder="От"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.cqrScoreRange[1]}
              onChange={(e) => updateFilter('cqrScoreRange', [filters.cqrScoreRange[0], parseInt(e.target.value) || 100])}
              className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
              placeholder="До"
            />
          </div>
        </div>

        {/* Конкуренты */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Упоминание конкурентов
          </label>
          <select
            value={filters.competitorsMentioned}
            onChange={(e) => updateFilter('competitorsMentioned', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">Неважно</option>
            <option value="да">Да</option>
            <option value="нет">Нет</option>
          </select>
        </div>

        {/* Количество вопросов */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Количество вопросов
          </label>
          <select
            value={filters.questionsCount}
            onChange={(e) => updateFilter('questionsCount', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">Любое</option>
            <option value="0">0 вопросов</option>
            <option value="1-2">1-2 вопроса</option>
            <option value="3-5">3-5 вопросов</option>
            <option value="6+">6+ вопросов</option>
          </select>
        </div>

        {/* Количество возражений */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Количество возражений
          </label>
          <select
            value={filters.objectionsCount}
            onChange={(e) => updateFilter('objectionsCount', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">Любое</option>
            <option value="0">0 возражений</option>
            <option value="1-2">1-2 возражения</option>
            <option value="3-5">3-5 возражений</option>
            <option value="6+">6+ возражений</option>
          </select>
        </div>

        {/* Вероятность успеха */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Вероятность успеха
          </label>
          <select
            value={filters.successProbability}
            onChange={(e) => updateFilter('successProbability', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">Любая</option>
            <option value="low">Низкая (0-30%)</option>
            <option value="medium">Средняя (31-60%)</option>
            <option value="high">Высокая (61-85%)</option>
            <option value="very-high">Очень высокая (86-100%)</option>
          </select>
        </div>

        {/* Приоритет */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Приоритет действий
          </label>
          <select
            value={filters.priority}
            onChange={(e) => updateFilter('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">Любой</option>
            <option value="Низкий">Низкий</option>
            <option value="Средний">Средний</option>
            <option value="Высокий">Высокий</option>
            <option value="Очень высокий">Очень высокий</option>
          </select>
        </div>
      </div>

      {/* Проблемы коммуникации */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Проблемы коммуникации
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'obscenities', label: 'Использование мата' },
            { key: 'first_name_basis', label: 'Обращение на "ты"' },
            { key: 'jokes', label: 'Неуместные шутки' },
          ].map((issue) => (
            <button
              key={issue.key}
              onClick={() => toggleCommunicationIssue(issue.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filters.communicationIssues.includes(issue.key)
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {issue.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Компонент управления колонками
const ColumnControlPanel = ({ 
  isOpen, 
  onClose, 
  columns, 
  onColumnsChange 
}: {
  isOpen: boolean;
  onClose: () => void;
  columns: TableColumn[];
  onColumnsChange: (columns: TableColumn[]) => void;
}) => {
  if (!isOpen) return null;

  const categories = {
    basic: 'Основные данные',
    cqr: 'CQR оценки',
    analysis: 'Анализы',
    metrics: 'Качественные метрики',
    communication: 'Стандарты коммуникации'
  };

  const toggleColumn = (key: string) => {
    const updatedColumns = columns.map(col =>
      col.key === key ? { ...col, visible: !col.visible } : col
    );
    onColumnsChange(updatedColumns);
  };

  const toggleCategory = (category: keyof typeof categories) => {
    const categoryColumns = columns.filter(col => col.category === category);
    const allVisible = categoryColumns.every(col => col.visible);
    
    const updatedColumns = columns.map(col =>
      col.category === category ? { ...col, visible: !allVisible } : col
    );
    onColumnsChange(updatedColumns);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Управление колонками</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <XMarkIcon className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(categories).map(([category, label]) => {
          const categoryColumns = columns.filter(col => col.category === category);
          const allVisible = categoryColumns.every(col => col.visible);
          const someVisible = categoryColumns.some(col => col.visible);

          return (
            <div key={category} className="border border-gray-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => toggleCategory(category as keyof typeof categories)}
                  className={`text-sm font-medium transition-colors ${
                    allVisible ? 'text-gray-900' : someVisible ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {label}
                </button>
                <span className="text-xs text-gray-400">
                  {categoryColumns.filter(col => col.visible).length}/{categoryColumns.length}
                </span>
              </div>
              <div className="space-y-1">
                {categoryColumns.map(column => (
                  <label key={column.key} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={column.visible}
                      onChange={() => toggleColumn(column.key)}
                      className="mr-2 rounded"
                    />
                    <span className={column.visible ? 'text-gray-700' : 'text-gray-400'}>
                      {column.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

const CallsHeader: React.FC<CallsHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  statusFilter,
  setStatusFilter,
  showAdvancedFilters,
  setShowAdvancedFilters,
  showColumnControl,
  setShowColumnControl,
  advancedFilters,
  setAdvancedFilters,
  tableColumns,
  setTableColumns,
  visibleColumns,
  dateOptions,
  statusOptions,
}) => {
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="relative">
        <div className="flex flex-col lg:flex-row items-center justify-between p-6 space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="relative w-full lg:w-96">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по ID, клиенту или менеджеру..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm bg-gray-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
            <div className="min-w-0">
              <EnhancedDropdown
                value={dateFilter}
                onChange={setDateFilter}
                options={dateOptions}
                placeholder="Дата: Все"
                icon={CalendarDaysIcon}
              />
            </div>

            <div className="min-w-0">
              <EnhancedDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                placeholder="Статус: Все"
              />
            </div>

            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`inline-flex items-center px-4 py-3 border rounded-xl transition-colors font-medium whitespace-nowrap ${
                showAdvancedFilters 
                  ? 'border-gray-900 bg-gray-900 text-white' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Фильтры
              {Object.values(advancedFilters).some(value => 
                Array.isArray(value) ? value.length > 0 : value !== 'all' && value !== 'Все' && !(Array.isArray(value) && value[0] === 0 && value[1] === 100)
              ) && (
                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            <button 
              onClick={() => setShowColumnControl(!showColumnControl)}
              className={`inline-flex items-center px-4 py-3 border rounded-xl transition-colors font-medium whitespace-nowrap ${
                showColumnControl 
                  ? 'border-gray-900 bg-gray-900 text-white' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Колонки
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {visibleColumns.length}
              </span>
            </button>
          </div>
        </div>

        {/* Продвинутые фильтры */}
        <AdvancedFiltersPanel
          isOpen={showAdvancedFilters}
          onClose={() => setShowAdvancedFilters(false)}
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
        />

        {/* Управление колонками */}
        <ColumnControlPanel
          isOpen={showColumnControl}
          onClose={() => setShowColumnControl(false)}
          columns={tableColumns}
          onColumnsChange={setTableColumns}
        />
      </div>
    </div>
  );
};

export default CallsHeader;


