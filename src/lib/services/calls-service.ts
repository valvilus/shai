/**
 * Сервис для работы с данными звонков
 * Маппинг MongoDB данных в формат UI
 */

import { mongoDBApi } from '../api/mongodb-client';
import type { 
  MongoDBCallRecord, 
  CallRecordForUI, 
  CallsStats,
  PaginatedCallsResponse,
  CallsSearchParams,
} from '../../types/mongodb';
import { 
  determineCallStatus, 
  estimateCallDuration, 
  generateManagerInfo, 
  generateClientInfo 
} from '../../types/mongodb';

// Маппинг оценок CQR
const CQR_GRADE_MAPPING: Record<string, number> = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  '-1': -1
};

// Маппинг теплоты клиента
const CLIENT_WARMTH_MAPPING: Record<string, 'холодный' | 'теплый' | 'горячий'> = {
  'холодный': 'холодный',
  'теплый': 'теплый',
  'горячий': 'горячий',
  'Холодный': 'холодный',
  'Теплый': 'теплый',
  'Горячий': 'горячий',
  'cold': 'холодный',
  'warm': 'теплый',
  'hot': 'горячий'
};

// Маппинг упоминания конкурентов
const COMPETITORS_MAPPING: Record<string, 'да' | 'нет'> = {
  'да': 'да',
  'нет': 'нет',
  'Да': 'да',
  'Нет': 'нет',
  'yes': 'да',
  'no': 'нет',
  '1': 'да',
  '0': 'нет',
  'true': 'да',
  'false': 'нет'
};

class CallsService {
  /**
   * Маппинг MongoDB записи в UI формат
   */
  private mapMongoDBToUI(record: MongoDBCallRecord): CallRecordForUI {
    // Преобразуем CQR оценки из строк в числа
    const cqrScores = {
      greeting: this.parseGrade(record.cqr_analysis.greeting.grade),
      speech: this.parseGrade(record.cqr_analysis.speech.grade),
      initiative: this.parseGrade(record.cqr_analysis.initiative.grade),
      programming: this.parseGrade(record.cqr_analysis.programming.grade),
      qualification: this.parseGrade(record.cqr_analysis.qualification.grade),
      product: this.parseGrade(record.cqr_analysis.product_presentation.grade),
      problem: this.parseGrade(record.cqr_analysis.problem_identification.grade),
      press: this.parseGrade(record.cqr_analysis.pressure_handling.grade),
      next_step: this.parseGrade(record.cqr_analysis.next_steps.grade)
    };

    // Преобразуем стандарты коммуникации в boolean
    const communicationStandards = {
      obscenities: this.parseYesNo(record.communication_standards.obscenities, 'да'),
      first_name_basis: this.parseYesNo(record.communication_standards.first_name_basis, 'да'), 
      jokes: this.parseYesNo(record.communication_standards.jokes, 'да')
    };

    // Парсим клиентские данные
    const clientQuestionsArray = record.additional_analysis.client_questions 
      ? record.additional_analysis.client_questions.split(';').filter(q => q.trim())
      : [];
    
    const clientPainsArray = [
      record.additional_analysis.client_pains.pain_1,
      record.additional_analysis.client_pains.pain_2, 
      record.additional_analysis.client_pains.pain_3
    ].filter(pain => pain && pain.trim());

    // Генерируем вспомогательные данные
    const managerInfo = generateManagerInfo(record);
    const clientInfo = generateClientInfo(record);
    const status = determineCallStatus(record);
    const duration = estimateCallDuration(record);

    // Парсим CQR общий балл
    const cqrTotalPercent = parseFloat(record.final_metrics.cqr_total_weighted_percent) || 0;

    return {
      call_id: record.conversation_id,
      date: record.created_at,
      duration_minutes: duration,
      status,
      manager_info: managerInfo,
      client_info: clientInfo,
      cqr_scores: cqrScores,
      quality_metrics: {
        cqr_total_weighted_percent: cqrTotalPercent,
        client_questions_answer_quality_percent: this.estimateQuestionsQuality(clientQuestionsArray.length),
        objections_handling_quality_percent: this.estimateObjectionsQuality(cqrTotalPercent)
      },
      analysis_data: {
        client_warmth: this.mapClientWarmth(record.additional_analysis.client_warmth),
        call_type: record.call_metadata.call_type || 'Не определен',
        competitors_mentioned: this.mapCompetitorsMentioned(record.additional_analysis.competitors_mentioned),
        client_questions_count: clientQuestionsArray.length,
        client_objections_count: this.estimateObjectionsCount(record.transcription.formatted_text),
        client_pains_count: clientPainsArray.length,
        mentioned_products_count: this.countMentionedProducts(record.additional_analysis.products_mentioned),
        success_probability: this.calculateSuccessProbability(cqrTotalPercent),
        next_best_action_priority: this.calculatePriority(cqrTotalPercent, clientPainsArray.length)
      },
      communication_standards: communicationStandards,
      raw_data: record
    };
  }

  /**
   * Парсинг CQR оценки из строки в число
   */
  private parseGrade(grade: string): number {
    const cleanGrade = grade?.toString().trim() || '0';
    return CQR_GRADE_MAPPING[cleanGrade] ?? 0;
  }

  /**
   * Парсинг да/нет значений
   */
  private parseYesNo(value: string, positiveValue: string): boolean {
    if (!value) return false;
    return value.toLowerCase().includes(positiveValue.toLowerCase());
  }

  /**
   * Маппинг теплоты клиента
   */
  private mapClientWarmth(warmth: string): 'холодный' | 'теплый' | 'горячий' {
    const cleanWarmth = warmth?.toString().trim() || '';
    return CLIENT_WARMTH_MAPPING[cleanWarmth] ?? 'холодный';
  }

  /**
   * Маппинг упоминания конкурентов
   */
  private mapCompetitorsMentioned(competitors: string): 'да' | 'нет' {
    const cleanCompetitors = competitors?.toString().trim() || '';
    return COMPETITORS_MAPPING[cleanCompetitors] ?? 'нет';
  }

  /**
   * Подсчет упомянутых продуктов
   */
  private countMentionedProducts(products: string): number {
    if (!products || products === 'Нет данных') return 0;
    
    // Простой подсчет по запятым и точкам с запятой
    return products.split(/[,;]/).filter(p => p.trim()).length;
  }

  /**
   * Оценка количества возражений по тексту
   */
  private estimateObjectionsCount(text: string): number {
    if (!text) return 0;
    
    const objectionWords = ['но', 'однако', 'хотя', 'не согласен', 'не подходит', 'дорого', 'не нужно'];
    let count = 0;
    
    objectionWords.forEach(word => {
      const matches = text.toLowerCase().match(new RegExp(word, 'g'));
      if (matches) count += matches.length;
    });
    
    return Math.min(count, 10); // Максимум 10
  }

  /**
   * Оценка качества ответов на вопросы
   */
  private estimateQuestionsQuality(questionsCount: number): number {
    if (questionsCount === 0) return 0;
    if (questionsCount <= 2) return 85;
    if (questionsCount <= 5) return 70;
    return 60;
  }

  /**
   * Оценка качества работы с возражениями
   */
  private estimateObjectionsQuality(cqrScore: number): number {
    return Math.round(cqrScore * 0.8); // 80% от общего CQR
  }

  /**
   * Расчет вероятности успеха
   */
  private calculateSuccessProbability(cqrScore: number): string {
    if (cqrScore >= 80) return '90%';
    if (cqrScore >= 60) return '70%';
    if (cqrScore >= 40) return '50%';
    if (cqrScore >= 20) return '30%';
    return '10%';
  }

  /**
   * Расчет приоритета
   */
  private calculatePriority(cqrScore: number, painsCount: number): 'Низкий' | 'Средний' | 'Высокий' | 'Очень высокий' {
    const score = cqrScore + (painsCount * 10);
    
    if (score >= 80) return 'Очень высокий';
    if (score >= 60) return 'Высокий';
    if (score >= 40) return 'Средний';
    return 'Низкий';
  }

  /**
   * Получить все звонки с пагинацией
   */
  async getCalls(params: CallsSearchParams = {}): Promise<{
    data: CallRecordForUI[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    error?: string;
  }> {
    try {
      const response = await mongoDBApi.getCalls(params);
      
      if (response.status === 'error') {
        return {
          data: [],
          total: 0,
          page: params.page || 1,
          limit: params.limit || 25,
          totalPages: 0,
          error: response.error
        };
      }

      const paginatedResponse = response.data as unknown as PaginatedCallsResponse;
      
      // Маппим данные в UI формат
      const mappedData = paginatedResponse.data.map(record => this.mapMongoDBToUI(record));

      return {
        data: mappedData,
        total: paginatedResponse.total,
        page: paginatedResponse.page,
        limit: paginatedResponse.limit,
        totalPages: paginatedResponse.total_pages
      };
    } catch (error) {
      console.error('❌ Error in getCalls:', error);
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        limit: params.limit || 25,
        totalPages: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Получить звонок по ID
   */
  async getCallById(id: string): Promise<{
    data: CallRecordForUI | null;
    error?: string;
  }> {
    try {
      const response = await mongoDBApi.getCallById(id);
      
      if (response.status === 'error') {
        return {
          data: null,
          error: response.error
        };
      }

      const record = response.data as MongoDBCallRecord;
      const mappedData = this.mapMongoDBToUI(record);

      return {
        data: mappedData
      };
    } catch (error) {
      console.error('❌ Error in getCallById:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Поиск звонков
   */
  async searchCalls(query: string): Promise<{
    data: CallRecordForUI[];
    error?: string;
  }> {
    try {
      const response = await mongoDBApi.searchCalls(query);
      
      if (response.status === 'error') {
        return {
          data: [],
          error: response.error
        };
      }

      const records = response.data as MongoDBCallRecord[];
      const mappedData = records.map(record => this.mapMongoDBToUI(record));

      return {
        data: mappedData
      };
    } catch (error) {
      console.error('❌ Error in searchCalls:', error);
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Получить статистику
   */
  async getStats(): Promise<{
    data: CallsStats | null;
    error?: string;
  }> {
    try {
      const response = await mongoDBApi.getStats();
      
      if (response.status === 'error') {
        return {
          data: null,
          error: response.error
        };
      }

      return {
        data: response.data as CallsStats
      };
    } catch (error) {
      console.error('❌ Error in getStats:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Проверка работоспособности API
   */
  async healthCheck(): Promise<{
    isHealthy: boolean;
    error?: string;
  }> {
    try {
      const response = await mongoDBApi.healthCheck();
      
      return {
        isHealthy: response.status === 'success'
      };
    } catch (error) {
      console.error('❌ Error in healthCheck:', error);
      return {
        isHealthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Экспортируем экземпляр сервиса
export const callsService = new CallsService();

// Экспортируем класс для тестирования
export default CallsService;
