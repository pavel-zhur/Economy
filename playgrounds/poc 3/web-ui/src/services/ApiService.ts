import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ChatRequest {
  message: string;
  session_id?: string;
  use_workflow?: boolean;
}

export interface ChatResponse {
  success: boolean;
  ai_response: string;
  sql_generated?: string;
  execution_result?: any;
  workflow_id?: string;
  error?: string;
  session_id: string;
}

export interface SystemStatus {
  success: boolean;
  status: string;
  components: {
    database: string;
    ai_agent: string;
    restack: string;
  };
  timestamp: string;
  version: string;
  error?: string;
}

export interface SchemaInfo {
  success: boolean;
  schema_info?: {
    tables: Record<string, any>;
    total_tables: number;
  };
  error?: string;
}

export interface ConversationHistory {
  success: boolean;
  conversations: Array<{
    user_message: string;
    ai_response: string;
    sql_generated?: string;
    execution_result?: any;
    created_at?: string;
    workflow_id?: string;
  }>;
  error?: string;
}

export interface WorkflowStatus {
  success: boolean;
  workflow_id: string;
  status: string;
  details?: any;
  error?: string;
}

class ApiServiceClass {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:8000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error);
        
        if (error.response) {
          // Server responded with error status
          throw new Error(`API Error: ${error.response.status} - ${error.response.data?.detail || error.message}`);
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('API Error: No response from server. Please check if the AI service is running.');
        } else {
          // Something else happened
          throw new Error(`API Error: ${error.message}`);
        }
      }
    );
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response: AxiosResponse<ChatResponse> = await this.client.post(
        '/api/v1/chat',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Chat API call failed:', error);
      throw error;
    }
  }

  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const response: AxiosResponse<SystemStatus> = await this.client.get(
        '/api/v1/status'
      );
      return response.data;
    } catch (error) {
      console.error('System status API call failed:', error);
      throw error;
    }
  }

  async getSchemaInfo(): Promise<SchemaInfo> {
    try {
      const response: AxiosResponse<SchemaInfo> = await this.client.get(
        '/api/v1/schema'
      );
      return response.data;
    } catch (error) {
      console.error('Schema info API call failed:', error);
      throw error;
    }
  }

  async getConversationHistory(sessionId: string, limit: number = 50): Promise<ConversationHistory> {
    try {
      const response: AxiosResponse<ConversationHistory> = await this.client.get(
        `/api/v1/conversations/${sessionId}?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Conversation history API call failed:', error);
      throw error;
    }
  }

  async getWorkflowStatus(workflowId: string): Promise<WorkflowStatus> {
    try {
      const response: AxiosResponse<WorkflowStatus> = await this.client.get(
        `/api/v1/workflows/${workflowId}/status`
      );
      return response.data;
    } catch (error) {
      console.error('Workflow status API call failed:', error);
      throw error;
    }
  }

  async executeSQL(sql: string, sessionId?: string): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/sql/execute', {
        sql,
        session_id: sessionId,
      });
      return response.data;
    } catch (error) {
      console.error('SQL execution API call failed:', error);
      throw error;
    }
  }

  async migrateSchema(description: string, sessionId?: string, autoExecute: boolean = false): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/schema/migrate', {
        description,
        session_id: sessionId,
        auto_execute: autoExecute,
      });
      return response.data;
    } catch (error) {
      console.error('Schema migration API call failed:', error);
      throw error;
    }
  }

  // Health check endpoint
  async healthCheck(): Promise<any> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check API call failed:', error);
      throw error;
    }
  }
}

export const ApiService = new ApiServiceClass();