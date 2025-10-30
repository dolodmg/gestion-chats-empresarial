import api from './api';

export interface CreateTableData {
  tableName: string;
  description?: string;
  clientId: string; 
  collectionName: string; 
  fields: TableField[]; 
}


export interface TableField {
  name: string;
  type: string;
  label: string;
  required: boolean;
}

export interface CustomTable {
  _id: string;
  tableName: string;
  description: string;
  fields: TableField[];
  clientId?: string; 
}

export interface TableRecord {
  _id: string;
  [key: string]: any;
  createdAt: string;
}

export interface TableDataResponse {
  success: boolean;
  data: TableRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const customTableService = {
  async createTable(data: CreateTableData): Promise<CustomTable> {
    if (!data.fields) data.fields = [];
    const response = await api.post('/custom-tables', data);
    return response.data.table || response.data;
  },

  async deleteTable(tableId: string): Promise<void> {
    await api.delete(`/custom-tables/${tableId}`);
  },
  
  async getTables(clientId?: string): Promise<CustomTable[]> {
    const params = clientId ? { clientId } : {};
    const response = await api.get('/custom-tables', { params });
    return response.data.tables;
  },

  async getTableData(
    tableId: string,
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<TableDataResponse> {
    const params = { page, limit, ...(search && { search }) };
    const response = await api.get(`/custom-tables/${tableId}/data`, { params });
    return response.data;
  },

  async updateTableData(
    tableId: string,
    data: {
      tableName?: string;
      description?: string;
      fields?: TableField[];
    }
  ): Promise<CustomTable> {
    const response = await api.put(`/custom-tables/${tableId}`, data);
    return response.data.table;
  },

  async createRecord(tableId: string, data: Record<string, any>): Promise<TableRecord> {
    const response = await api.post(`/custom-tables/${tableId}/data`, data);
    return response.data.record;
  },

  async updateRecord(
    tableId: string,
    recordId: string,
    data: Record<string, any>
  ): Promise<TableRecord> {
    const response = await api.put(`/custom-tables/${tableId}/data/${recordId}`, data);
    return response.data.record;
  },

  async deleteRecord(tableId: string, recordId: string): Promise<void> {
    await api.delete(`/custom-tables/${tableId}/data/${recordId}`);
  }
};