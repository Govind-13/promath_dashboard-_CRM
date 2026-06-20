import type { College } from '../types/college.types';
import Papa from 'papaparse';
import readXlsxFile from 'read-excel-file/browser';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_ROWS = 5000;

export const COLLEGE_UPLOAD_HEADERS = [
  'College Name',
  'College Type',
  'Academic Year',
  'Contact Name',
  'Contact Designation',
  'Phone',
  'Email',
  'Location',
  'Total Students',
] as const;

const SAMPLE_UPLOAD_ROW = {
  'College Name': 'Sample Engineering College',
  'College Type': 'Autonomous',
  'Academic Year': '2026-27',
  'Contact Name': 'Dr. Kumar',
  'Contact Designation': 'Principal',
  Phone: '9876543210',
  Email: 'principal@example.com',
  Location: 'Chennai',
  'Total Students': '1200',
};

const COL_MAP: Record<string, keyof College> = {
  'college name': 'name',
  name: 'name',
  college: 'name',
  type: 'college_type',
  'college type': 'college_type',
  'academic year': 'academic_year',
  year: 'academic_year',
  contact: 'contact_name',
  'contact name': 'contact_name',
  designation: 'contact_designation',
  'contact designation': 'contact_designation',
  phone: 'phone',
  mobile: 'phone',
  email: 'email',
  location: 'location',
  city: 'location',
  'total students': 'total_students',
  students: 'total_students',
};

function mapRows(rows: Record<string, unknown>[]): Partial<College>[] {
  if (rows.length > MAX_ROWS) throw new Error(`Import is limited to ${MAX_ROWS} rows`);
  return rows.flatMap(row => {
    const college: Partial<College> = {};
    for (const [column, value] of Object.entries(row)) {
      const field = COL_MAP[column.toLowerCase().trim()];
      if (field && value !== undefined && value !== null && value !== '') {
        (college as Record<string, unknown>)[field] = String(value).trim();
      }
    }
    return college.name ? [college] : [];
  });
}

async function parseCsv(file: File) {
  return new Promise<Record<string, unknown>[]>((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: result => {
        if (result.errors.length) {
          reject(new Error(result.errors[0].message));
          return;
        }
        resolve(result.data);
      },
      error: error => reject(error),
    });
  });
}

async function parseXlsx(file: File) {
  const rows = await readXlsxFile(file);
  if (!rows.length) return [];
  const headers = rows[0].map(value => String(value ?? '').trim());
  return rows.slice(1).map(row =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])),
  );
}

export async function parseExcelFile(file: File): Promise<Partial<College>[]> {
  if (file.size > MAX_FILE_BYTES) throw new Error('File must be 10 MB or smaller');
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension !== 'xlsx' && extension !== 'csv') {
    throw new Error('Only .xlsx and .csv files are supported');
  }
  const rows = extension === 'csv' ? await parseCsv(file) : await parseXlsx(file);
  return mapRows(rows);
}

export function downloadCollegeUploadTemplate() {
  const csv = Papa.unparse({
    fields: [...COLLEGE_UPLOAD_HEADERS],
    data: [SAMPLE_UPLOAD_ROW],
  });
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'promath_college_upload_template.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
