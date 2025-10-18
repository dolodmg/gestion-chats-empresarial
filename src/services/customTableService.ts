import api from './api';

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

  async createRecord(tableId: string, data: Record<string, any>): Promise<TableRecord> {
    const response = await api.post(`/custom-tables/${tableId}/records`, data);
    return response.data;
  },

  async updateRecord(
    tableId: string,
    recordId: string,
    data: Record<string, any>
  ): Promise<TableRecord> {
    const response = await api.put(`/custom-tables/${tableId}/records/${recordId}`, data);
    return response.data;
  },

  async deleteRecord(tableId: string, recordId: string): Promise<void> {
    await api.delete(`/custom-tables/${tableId}/records/${recordId}`);
  }
};