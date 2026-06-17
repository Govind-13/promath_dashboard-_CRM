import React, { useState, useMemo, useRef } from 'react';
import type { College, AppData } from '../../types/college.types';
import { STAGES } from '../../constants/stages';
import CollegeTable from './CollegeTable';
import { parseExcelFile } from '../../utils/excel';

interface Props {
  role: string;
  data: AppData;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onBulkAdd: (colleges: Partial<College>[]) => void;
  onDelete: (id: string) => void;
  updateCollege: (id: string, fn: (c: College) => College) => void;
}

const STAGE_GROUPS = ['All', 'Discovery', 'Deal', 'Content', 'Implementation', 'Onboarding'];

const AllColleges: React.FC<Props> = ({ role, data, onSelect, onAdd, onBulkAdd, onDelete, updateCollege }) => {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [uploadMsg, setUploadMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let list = data.colleges;

    if (role === 'content') {
      list = list.filter(c => c.stages.syllabus_submission?.status === 'completed');
    } else if (role === 'implementation') {
      list = list.filter(c =>
        c.stages.student_data?.status !== 'not_started' ||
        c.stages.license_creation?.status !== 'not_started'
      );
    } else if (role === 'engagement') {
      list = list.filter(c =>
        c.stages.impl_feedback?.status !== 'not_started' ||
        c.stages.orientation?.status !== 'not_started'
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.contact_name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    }

    if (groupFilter !== 'All' && role === 'admin') {
      const groupStageIds = STAGES.filter(s => s.group === groupFilter).map(s => s.id);
      list = list.filter(c => {
        const currentIdx = STAGES.findIndex(s => {
          const sd = c.stages[s.id];
          return !sd || sd.status !== 'completed';
        });
        const currentStage = STAGES[currentIdx === -1 ? STAGES.length - 1 : currentIdx];
        return groupStageIds.includes(currentStage.id);
      });
    }

    return list;
  }, [data.colleges, role, search, groupFilter]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseExcelFile(file);
      if (rows.length === 0) {
        setUploadMsg('No valid rows found in file');
      } else {
        onBulkAdd(rows);
        setUploadMsg(`${rows.length} colleges uploaded successfully`);
      }
    } catch (err) {
      setUploadMsg('Error reading file: ' + (err instanceof Error ? err.message : 'unknown'));
    }
    if (fileRef.current) fileRef.current.value = '';
    setTimeout(() => setUploadMsg(''), 4000);
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>All Colleges ({filtered.length})</h2>
        {role === 'admin' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
              📤 Excel Upload
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFileUpload} />
            <button className="btn btn-primary" onClick={onAdd}>+ Add College</button>
          </div>
        )}
      </div>

      {uploadMsg && (
        <div style={{ padding: '10px 16px', marginBottom: 16, borderRadius: 8, background: uploadMsg.includes('Error') || uploadMsg.includes('No valid') ? '#FEE2E2' : '#D1FAE5', color: uploadMsg.includes('Error') || uploadMsg.includes('No valid') ? '#991B1B' : '#065F46', fontSize: 14 }}>
          {uploadMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Search by name, contact, or location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {role === 'admin' && (
          <div style={{ display: 'flex', gap: 4 }}>
            {STAGE_GROUPS.map(g => (
              <button
                key={g}
                className={`btn ${groupFilter === g ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 12, padding: '6px 12px' }}
                onClick={() => setGroupFilter(g)}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏫</div>
          <div>No colleges found</div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>Try adjusting your search or filters</div>
        </div>
      ) : (
        <CollegeTable
          colleges={filtered}
          onSelect={onSelect}
          updateCollege={role === 'admin' ? updateCollege : undefined}
          onDelete={role === 'admin' ? onDelete : undefined}
        />
      )}
    </div>
  );
};

export default AllColleges;
