import React, { useState, useMemo } from 'react';
import type { College, AppData } from '../../types/college.types';
import { STAGES } from '../../constants/stages';
import CollegeTable from './CollegeTable';

interface Props {
  role: string;
  data: AppData;
  onSelect: (id: string) => void;
  onAdd: () => void;
  updateCollege: (id: string, fn: (c: College) => College) => void;
}

const STAGE_GROUPS = ['All', 'Discovery', 'Deal', 'Content', 'Implementation', 'Onboarding'];

const AllColleges: React.FC<Props> = ({ role, data, onSelect, onAdd, updateCollege }) => {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');

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

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>All Colleges ({filtered.length})</h2>
        {role === 'admin' && (
          <button className="btn btn-primary" onClick={onAdd}>+ Add College</button>
        )}
      </div>

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
        <CollegeTable colleges={filtered} onSelect={onSelect} updateCollege={role === 'admin' ? updateCollege : undefined} />
      )}
    </div>
  );
};

export default AllColleges;
