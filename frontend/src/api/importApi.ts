import { apiClient } from './client';

export interface ExcelImportRecord {
  _id: string;
  fileName: string;
  importedBy: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors?: string[];
  createdAt: string;
}

export const importApi = {
  create: (fileName: string, rows: Record<string, unknown>[]) =>
    apiClient<ExcelImportRecord>('/imports/excel', {
      method: 'POST',
      body: JSON.stringify({ fileName, rows }),
    }),
  list: () => apiClient<ExcelImportRecord[]>('/imports'),
};
