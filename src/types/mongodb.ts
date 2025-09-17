/**
 * TypeScript типы для данных MongoDB
 * Соответствуют структуре данных записываемых из Dify workflow
 */

// Основной интерфейс записи звонка в MongoDB
export interface MongoDBCallRecord {
  _id?: string;
  conversation_id: string;
  created_at: string;
  updated_at: string;
  
  call_metadata: {
    source_file_name: string;
    call_type: string;
    processing_timestamp: string;
    source_type: 'google_drive' | 'local_upload';
  };
  
  transcription: {
    formatted_text: string;
    processing_status: 'success' | 'error';
  };
  
  cqr_analysis: {
    speech: {
      grade: string;
      comment: string;
    };
    greeting: {
      grade: string;
      comment: string;
    };
    initiative: {
      grade: string;
      comment: string;
    };
    programming: {
      grade: string;
      comment: string;
    };
    qualification: {
      grade: string;
      comment: string;
    };
    product_presentation: {
      grade: string;
      comment: string;
    };
    problem_identification: {
      grade: string;
      comment: string;
    };
    pressure_handling: {
      grade: string;
      comment: string;
    };
    next_steps: {
      grade: string;
      comment: string;
    };
  };
  
  additional_analysis: {
    client_warmth: string;
    competitors_mentioned: string;
    client_questions: string;
    client_pains: {
      pain_1: string;
      pain_2: string;
      pain_3: string;
    };
    products_mentioned: string;
  };
  
  communication_standards: {
    obscenities: string;
    first_name_basis: string;
    jokes: string;
  };
  
  final_metrics: {
    cqr_total_weighted_percent: string;
    total_criteria_evaluated: number;
  };
}

// Интерфейс для отображения в UI таблице
export interface CallRecordForUI {
  call_id: string;
  date: string;
  duration_minutes: number;
  status: 'Завершено' | 'Возврат' | 'Отменено' | 'В процессе';
  
  manager_info: {
    name: string;
    email: string;
    avatar: string;
  };
  
  client_info: {
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  
  // CQR оценки (преобразованные в числа 0-1)
  cqr_scores: {
    greeting: number;
    speech: number;
    initiative: number;
    programming: number;
    qualification: number;
    product: number;
    problem: number;
    press: number;
    next_step: number;
  };
  
  // Метрики качества
  quality_metrics: {
    cqr_total_weighted_percent: number;
    client_questions_answer_quality_percent: number;
    objections_handling_quality_percent: number;
  };
  
  // Данные анализа
  analysis_data: {
    client_warmth: 'холодный' | 'теплый' | 'горячий';
    call_type: string;
    competitors_mentioned: 'да' | 'нет';
    client_questions_count: number;
    client_objections_count: number;
    client_pains_count: number;
    mentioned_products_count: number;
    success_probability: string;
    next_best_action_priority: 'Низкий' | 'Средний' | 'Высокий' | 'Очень высокий';
  };
  
  // Стандарты коммуникации
  communication_standards: {
    obscenities: boolean;
    first_name_basis: boolean;
    jokes: boolean;
  };
  
  // Исходные данные из MongoDB для детального просмотра
  raw_data: MongoDBCallRecord;
}

// Интерфейс для статистики
export interface CallsStats {
  total_calls: number;
  avg_cqr_score: number;
  calls_by_status?: Record<string, number>;
  calls_by_date: Array<{
    date: string;
    count: number;
  }>;
}

// Интерфейс для пагинации
export interface PaginatedCallsResponse {
  data: MongoDBCallRecord[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Интерфейс для параметров поиска
export interface CallsSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  clientWarmth?: string;
  callType?: string;
  cqrScoreMin?: number;
  cqrScoreMax?: number;
}

// Вспомогательные типы для маппинга
export type CQRGrade = '0' | '0.5' | '1' | '-1';
export type ClientWarmthType = 'холодный' | 'теплый' | 'горячий' | 'Холодный' | 'Теплый' | 'Горячий';
export type CompetitorsMentioned = 'да' | 'нет' | 'Да' | 'Нет';

// Константы для маппинга
export const CQR_GRADE_MAPPING: Record<string, number> = {
  '0': 0,
  '0.5': 0.5,
  '1': 1,
  '-1': -1,
  // Fallback для невалидных значений
  '': 0
};

export const CLIENT_WARMTH_MAPPING: Record<string, 'холодный' | 'теплый' | 'горячий'> = {
  'холодный': 'холодный',
  'теплый': 'теплый', 
  'горячий': 'горячий',
  'Холодный': 'холодный',
  'Теплый': 'теплый',
  'Горячий': 'горячий',
  // Fallback
  '': 'холодный'
};

export const COMPETITORS_MAPPING: Record<string, 'да' | 'нет'> = {
  'да': 'да',
  'нет': 'нет',
  'Да': 'да',
  'Нет': 'нет',
  // Fallback
  '': 'нет'
};

// Функция для определения статуса звонка на основе данных
export function determineCallStatus(record: MongoDBCallRecord): 'Завершено' | 'Возврат' | 'Отменено' | 'В процессе' {
  // Логика определения статуса на основе данных
  const cqrScore = parseFloat(record.final_metrics.cqr_total_weighted_percent) || 0;
  
  if (cqrScore < 0) {
    return 'Отменено';
  } else if (cqrScore < 30) {
    return 'Возврат';
  } else {
    return 'Завершено';
  }
}

// Функция для определения длительности звонка (мок на основе данных)
export function estimateCallDuration(record: MongoDBCallRecord): number {
  // Примерная оценка длительности на основе длины транскрипции
  const textLength = record.transcription.formatted_text?.length || 0;
  
  // Примерно 150 слов в минуту речи, 5 символов на слово
  const estimatedWords = textLength / 5;
  const estimatedMinutes = Math.max(1, Math.round(estimatedWords / 150));
  
  return Math.min(estimatedMinutes, 120); // Макс 2 часа
}

// Функция для генерации данных менеджера (временно)
export function generateManagerInfo(record: MongoDBCallRecord) {
  // Временные данные менеджера до интеграции с реальными данными
  const managers = [
    { name: 'Анна Петрова', email: 'anna.petrova@company.com', avatar: 'АП' },
    { name: 'Дмитрий Сидоров', email: 'dmitry.sidorov@company.com', avatar: 'ДС' },
    { name: 'Мария Иванова', email: 'maria.ivanova@company.com', avatar: 'МИ' },
    { name: 'Алексей Козлов', email: 'alexey.kozlov@company.com', avatar: 'АК' },
    { name: 'Елена Морозова', email: 'elena.morozova@company.com', avatar: 'ЕМ' }
  ];
  
  // Выбираем менеджера на основе хеша conversation_id
  const hash = record.conversation_id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return managers[Math.abs(hash) % managers.length];
}

// Функция для генерации данных клиента (временно)
export function generateClientInfo(record: MongoDBCallRecord) {
  // Временные данные клиента
  const companies = [
    'ООО "Технологии Будущего"',
    'ЗАО "Инновационные Решения"', 
    'ООО "Цифровой Прогресс"',
    'ИП Сидоров А.В.',
    'ООО "Современные Системы"'
  ];
  
  const firstNames = ['Иван', 'Петр', 'Сергей', 'Анна', 'Мария', 'Елена', 'Дмитрий'];
  const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Козлов', 'Морозов', 'Соколов'];
  
  const hash = record.conversation_id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const companyIndex = Math.abs(hash) % companies.length;
  const nameIndex = Math.abs(hash * 2) % firstNames.length;
  const lastNameIndex = Math.abs(hash * 3) % lastNames.length;
  
  const firstName = firstNames[nameIndex];
  const lastName = lastNames[lastNameIndex];
  const fullName = `${firstName} ${lastName}`;
  
  return {
    name: fullName,
    company: companies[companyIndex],
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companies[companyIndex].toLowerCase().replace(/[^a-zа-я]/g, '')}.ru`,
    phone: `+7 (${900 + Math.abs(hash) % 100}) ${100 + Math.abs(hash * 4) % 900}-${10 + Math.abs(hash * 5) % 90}-${10 + Math.abs(hash * 6) % 90}`
  };
}
