import type { College } from '../types/college.types';
import * as XLSX from 'xlsx';

const COL_MAP: Record<string, keyof College> = {
  'college name': 'name',
  'name': 'name',
  'college': 'name',
  'type': 'college_type',
  'college type': 'college_type',
  'academic year': 'academic_year',
  'year': 'academic_year',
  'contact': 'contact_name',
  'contact name': 'contact_name',
  'designation': 'contact_designation',
  'contact designation': 'contact_designation',
  'phone': 'phone',
  'mobile': 'phone',
  'email': 'email',
  'location': 'location',
  'city': 'location',
  'total students': 'total_students',
  'students': 'total_students',
};

export async function parseExcelFile(file: File): Promise<Partial<College>[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (rows.length === 0) return [];

  const headerMap: Record<string, keyof College> = {};
  for (const key of Object.keys(rows[0])) {
    const normalized = key.toLowerCase().trim();
    if (COL_MAP[normalized]) {
      headerMap[key] = COL_MAP[normalized];
    }
  }

  const results: Partial<College>[] = [];
  for (const row of rows) {
    const college: Partial<College> = {};
    for (const [excelCol, field] of Object.entries(headerMap)) {
      const val = row[excelCol];
      if (val !== undefined && val !== null && val !== '') {
        (college as Record<string, unknown>)[field] = String(val).trim();
      }
    }
    if (college.name) results.push(college);
  }

  return results;
}
