import { useRef, useState } from 'react';
import type { College } from '../types/college.types';
import { parseExcelFile } from '../utils/excel';
import { Modal } from './Modal';

interface BulkUploadModalProps {
  onClose: () => void;
  onUpload: (colleges: Partial<College>[], fileName: string) => Promise<void>;
}

export function BulkUploadModal({ onClose, onUpload }: BulkUploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!file) return setError('Choose an .xlsx or .csv file first.');
    setBusy(true);
    setError('');
    try {
      const rows = await parseExcelFile(file);
      if (!rows.length) throw new Error('No valid college rows were found.');
      await onUpload(rows, file.name);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload file.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Bulk upload colleges" subtitle="Import college records from Excel or CSV." onClose={onClose} size="sm">
      <button className="empty-state" type="button" onClick={() => inputRef.current?.click()} style={{ width: '100%' }}>
        <div className="state-icon">⇧</div>
        <div className="state-title">{file ? file.name : 'Choose Excel or CSV file'}</div>
        <div className="state-message">Supported formats: .xlsx and .csv</div>
      </button>
      <input
        ref={inputRef}
        hidden
        type="file"
        accept=".xlsx,.csv"
        onChange={event => { setFile(event.target.files?.[0] || null); setError(''); }}
      />
      {error && <div className="inline-alert error" style={{ marginTop: 12 }}>{error}</div>}
      <div className="form-actions">
        <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" type="button" disabled={!file || busy} onClick={submit}>
          {busy ? 'Uploading...' : 'Upload Colleges'}
        </button>
      </div>
    </Modal>
  );
}
