/**
 * MongoDB API Client
 * Клиент для подключения к MongoDB API на VDS
 */

const API_BASE_URL = 'http://79.174.83.146:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class MongoDBApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      console.log(`🔗 API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log(`✅ API Response: ${response.status}`, data);
      
      return {
        data,
        status: 'success'
      };
    } catch (error) {
      console.error('❌ API Error:', error);
      
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      };
    }
  }

  /**
   * Проверка состояния API
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; database: string }>> {
    return this.request('/health');
  }

  /**
   * Получить все записи звонков
   */
  async getAllCalls(): Promise<ApiResponse<any[]>> {
    return this.request('/calls');
  }

  /**
   * Получить записи звонков с пагинацией
   */
  async getCalls(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.dateFrom) searchParams.append('date_from', params.dateFrom);
    if (params?.dateTo) searchParams.append('date_to', params.dateTo);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/calls?${queryString}` : '/calls';
    
    return this.request(endpoint);
  }

  /**
   * Получить конкретный звонок по ID
   */
  async getCallById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/calls/${encodeURIComponent(id)}`);
  }

  /**
   * Поиск звонков
   */
  async searchCalls(query: string): Promise<ApiResponse<any[]>> {
    return this.request(`/calls/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Получить статистику
   */
  async getStats(): Promise<ApiResponse<{
    total_calls: number;
    avg_cqr_score: number;
    calls_by_status: Record<string, number>;
    calls_by_date: Array<{ date: string; count: number }>;
  }>> {
    return this.request('/stats');
  }
}

// Создаем экземпляр клиента
export const mongoDBApi = new MongoDBApiClient();

// Экспортируем класс для создания дополнительных экземпляров если нужно
export default MongoDBApiClient;
