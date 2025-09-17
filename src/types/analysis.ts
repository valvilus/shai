// ========================================
// ОСНОВНЫЕ ИНТЕРФЕЙСЫ
// ========================================

export interface MainReport {
  timestamp: string;
  source_file_name: string;
  calltype: string;
  
  // CQR Оценки (0-1)
  cqr_scores: CQRScores;
  
  // Комментарии к оценкам
  cqr_comments: CQRComments;
  
  // Метрики качества
  metrics: QualityMetrics;
  
  // Извлеченные данные
  extracted_data: ExtractedData;
}

// ========================================
// CQR (CALL QUALITY REVIEW) ТИПЫ
// ========================================

export interface CQRScores {
  greeting: number;         // Оценка приветствия
  speech: number;          // Оценка качества речи
  initiative: number;      // Оценка инициативы
  programming: number;     // Оценка программирования
  qualification: number;   // Оценка квалификации
  product: number;        // Оценка презентации продукта
  problem: number;        // Оценка выявления проблемы
  press: number;          // Оценка дожима
  next_step: number;      // Оценка следующего шага
}

export interface CQRComments {
  greeting_comment: string;
  speech_comment: string;
  initiative_comment: string;
  programming_comment: string;
  qualification_comment: string;
  product_comment: string;
  problem_identifying_comment: string;
  press_comment: string;
  next_step_comment: string;
}

// ========================================
// ИНДИВИДУАЛЬНЫЕ CQR АНАЛИЗЫ
// ========================================

export interface GreetingAnalysis {
  greeting_grade: "0" | "0.5" | "1";
  greeting_comment: string;
}

export interface SpeechAnalysis {
  speech_grade: "0" | "0.5" | "1";
  speech_comment: string;
}

export interface InitiativeAnalysis {
  initiative_grade: "0" | "0.5" | "1";
  initiative_comment: string;
}

export interface ProgrammingAnalysis {
  programming_grade: "0" | "0.5" | "1";
  programming_comment: string;
}

export interface QualificationAnalysis {
  qualification_grade: "0" | "0.5" | "1";
  qualification_comment: string;
}

export interface ProductAnalysis {
  product_grade: "0" | "0.5" | "1";
  product_comment: string;
}

export interface ProblemAnalysis {
  problem_identifying_grade: "0" | "0.5" | "1";
  problem_identifying_comment: string;
}

export interface PressAnalysis {
  press_grade: "0" | "0.5" | "1";
  press_comment: string;
}

export interface NextStepAnalysis {
  next_step_grade: "0" | "0.5" | "1";
  next_step_comment: string;
}

// ========================================
// ДОПОЛНИТЕЛЬНЫЕ АНАЛИЗЫ
// ========================================

export interface ClientWarmth {
  client_warmth: "холодный" | "теплый" | "горячий";
  warmth_comment: string;
}

export interface CompetitorAnalysis {
  competitors_mentioned: "да" | "нет";
  competitor_names: string;
  context: string;
}

export interface CommunicationStandards {
  obscenities: string;        // Мат: "нет" или "да: таймкод 00:00:00"
  first_name_basis: string;   // Обращение на "ты": "да" или "нет"
  jokes: string;              // Шутки/юмор: "да" или "нет"
}

export interface ClientQuestions {
  client_questions: string[];
}

export interface QuestionAnswerGrading {
  question_answer_grades: Array<{
    question: string;
    grade: "0" | "0.5" | "1";
    comment: string;
  }>;
}

export interface ClientObjections {
  client_objections: string[];
}

export interface ObjectionHandling {
  objection_grades: Array<{
    objection: string;
    grade: "0" | "0.5" | "1";
    comment: string;
  }>;
}

export interface ObjectionMethods {
  methods_list: string[];
}

export interface DrainObjections {
  drain_objections: string[];
}

export interface CallSummary {
  call_summary: string;
}

export interface ClientPains {
  client_pains: string[];
}

export interface PreviousContacts {
  previous_contacts: string;
}

export interface MentionedProducts {
  mentioned_products: string[];
}

export interface CallType {
  call_type: string;
}

// ========================================
// ФАЗА 1 - БИЗНЕС-ФУНКЦИИ
// ========================================

export interface NextBestAction {
  deal_stage: string;                    // Этап сделки
  priority_level: string;                // Уровень приоритета клиента
  immediate_actions: string[];           // Немедленные действия (в течение дня)
  short_term_actions: string[];          // Краткосрочные действия (2-7 дней)
  timeline: string;                      // Временные рамки
  success_probability: string;           // Вероятность успеха в процентах
  risk_factors: string[];                // Факторы риска
  key_message: string;                   // Ключевое сообщение для клиента
}

export interface MeetingBrief {
  client_profile: string;                // Профиль клиента
  interaction_history: string;           // История взаимодействий и инсайты
  meeting_strategy: string;              // Стратегия проведения встречи
  discussion_questions: string[];        // Ключевые вопросы для обсуждения
  meeting_materials: string[];           // Материалы, необходимые к встрече
  success_metrics: string;               // Метрики успеха встречи
}

export interface ErrorAnalysis {
  critical_errors: string[];             // Критические ошибки менеджера
  missed_opportunities: string[];        // Упущенные возможности
  improvement_recommendations: Array<{   // Рекомендации по улучшению
    area: string;                        // Область улучшения
    current_issue: string;               // Текущая проблема
    recommendation: string;              // Рекомендация
    example_phrase: string;              // Пример фразы
  }>;
  strengths: string[];                   // Сильные стороны менеджера
  coaching_focus: string;                // Приоритетная область для коучинга
  practice_exercises: string[];          // Практические упражнения
}

// ========================================
// АГРЕГИРОВАННЫЕ ТИПЫ
// ========================================

export interface QualityMetrics {
  client_questions_answer_quality_percent: number;    // Качество ответов на вопросы (%)
  objections_handling_quality_percent: number;        // Качество обработки возражений (%)
  cqr_total_weighted_percent: number;                 // Общий взвешенный балл CQR (%)
}

export interface ExtractedData {
  pains: string[];          // Боли клиента
  products: string[];       // Упомянутые продукты
}

// ========================================
// ЭКСПОРТ И ХРАНЕНИЕ
// ========================================

export interface ConversationRecord {
  conversation_id: string;              // ID беседы
  timestamp: string;                    // Временная метка
  source_file_name: string;             // Имя файла
  
  // Полный отчет (JSON)
  report_json: string;                  // JSON строка с полным отчетом
  
  // CQR метрики
  cqr_total_weighted_percent: number;   // Общий CQR балл
  
  // Бизнес-функции (Фаза 1)
  next_best_action: NextBestAction;     // Следующие действия
  meeting_brief: MeetingBrief;          // Бриф встречи
  error_analysis: ErrorAnalysis;        // Анализ ошибок
  
  // Google Sheets данные
  sheet_headers: string[];              // Заголовки для экспорта
  sheet_row: string[];                  // Строка данных для экспорта
}

// ========================================
// ДАШБОРД И UI ТИПЫ
// ========================================

export interface DashboardData {
  overview: {
    cqr_total_score: number;
    call_type: string;
    client_warmth: string;
    success_probability: string;
  };
  
  cqr_analysis: {
    scores: CQRScores;
    comments: CQRComments;
    weighted_total: number;
  };
  
  business_insights: {
    next_best_action: NextBestAction;
    meeting_brief: MeetingBrief;
    error_analysis: ErrorAnalysis;
  };
  
  quality_metrics: {
    questions_quality: number;
    objections_quality: number;
    communication_standards: CommunicationStandards;
  };
  
  extracted_insights: {
    client_pains: string[];
    mentioned_products: string[];
    competitor_analysis: CompetitorAnalysis;
    call_summary: string;
  };
}

// ========================================
// ВРЕМЕННЫЕ РЯДЫ ДЛЯ ТРЕНДОВ
// ========================================

export interface TimeSeriesData {
  date: string;
  cqr_total: number;
  greeting: number;
  speech: number;
  initiative: number;
  programming: number;
  qualification: number;
  product: number;
  problem: number;
  press: number;
  next_step: number;
}

// ========================================
// КОНСТАНТЫ
// ========================================

export const CQR_CRITERIA = [
  'greeting',
  'speech', 
  'initiative',
  'programming',
  'qualification',
  'product',
  'problem',
  'press',
  'next_step'
] as const;

export const CQR_CRITERIA_LABELS = {
  greeting: 'Приветствие',
  speech: 'Качество речи',
  initiative: 'Инициатива', 
  programming: 'Программирование',
  qualification: 'Квалификация',
  product: 'Продукт',
  problem: 'Выявление проблемы',
  press: 'Дожим',
  next_step: 'Следующий шаг'
} as const;

export const CLIENT_WARMTH_COLORS = {
  'холодный': '#3B82F6',  // blue
  'теплый': '#F59E0B',    // amber
  'горячий': '#EF4444'    // red
} as const;

export const CQR_SCORE_COLORS = {
  critical: '#EF4444',    // red (0-0.3)
  warning: '#F59E0B',     // amber (0.4-0.7)  
  good: '#10B981'         // green (0.8-1.0)
} as const;
