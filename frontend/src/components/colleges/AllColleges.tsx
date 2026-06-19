import { useMemo, useState } from 'react';
import type { College, AppData } from '../../types/college.types';
import { STAGES } from '../../constants/stages';
import CollegeTable from './CollegeTable';
import { SearchInput } from '../SearchInput';
import { EmptyState } from '../States';
import { BulkUploadModal } from '../BulkUploadModal';

interface Props {
  role: string;
  data: AppData;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onBulkAdd: (colleges: Partial<College>[], fileName: string) => Promise<void>;
  onDelete: (id: string) => void;
  updateCollege: (id: string, fn: (c: College) => College) => void;
}

const STAGE_GROUPS = ['All', 'Discovery', 'Deal', 'Content', 'Implementation', 'Onboarding'];

const AllColleges: React.FC<Props> = ({ role, data, onSelect, onAdd, onBulkAdd, onDelete, updateCollege }) => {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [uploadMsg, setUploadMsg] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const filtered = useMemo(() => {
    let list = data.colleges;
    if (role === 'content') {
      list = list.filter(college => college.stages.syllabus_submission?.status === 'completed');
    } else if (role === 'implementation') {
      list = list.filter(college =>
        college.stages.student_data?.status !== 'not_started' ||
        college.stages.license_creation?.status !== 'not_started',
      );
    } else if (role === 'engagement') {
      list = list.filter(college =>
        college.stages.impl_feedback?.status !== 'not_started' ||
        college.stages.orientation?.status !== 'not_started',
      );
    }

    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter(college =>
        [college.name, college.contact_name, college.location]
          .some(value => value.toLowerCase().includes(query)),
      );
    }

    if (groupFilter !== 'All' && role === 'admin') {
      const groupStageIds = STAGES.filter(stage => stage.group === groupFilter).map(stage => stage.id);
      list = list.filter(college => {
        const currentIndex = STAGES.findIndex(stage => college.stages[stage.id]?.status !== 'completed');
        const currentStage = STAGES[currentIndex === -1 ? STAGES.length - 1 : currentIndex];
        return groupStageIds.includes(currentStage.id);
      });
    }
    return list;
  }, [data.colleges, role, search, groupFilter]);

  const handleBulkUpload = async (rows: Partial<College>[], fileName: string) => {
    await onBulkAdd(rows, fileName);
    setUploadMsg(`${rows.length} colleges uploaded successfully`);
    window.setTimeout(() => setUploadMsg(''), 4000);
  };

  return (
    <div className="fade-in page-stack">
      <div className="page-heading">
        <div>
          <h2>All Colleges ({filtered.length})</h2>
          <p>Search, filter, update, and manage college pipeline records.</p>
        </div>
        {role === 'admin' && (
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={() => setShowUpload(true)}>⇧ Excel Upload</button>
            <button className="btn btn-primary" onClick={onAdd}>+ Add College</button>
          </div>
        )}
      </div>

      {uploadMsg && <div className="inline-alert success">{uploadMsg}</div>}

      <div className="filter-bar">
        <SearchInput
          className="filter-search"
          placeholder="Search by name, contact, or location..."
          value={search}
          onChange={setSearch}
        />
        {role === 'admin' && (
          <div className="filter-pills">
            {STAGE_GROUPS.map(group => (
              <button
                key={group}
                className={`btn ${groupFilter === group ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setGroupFilter(group)}
              >
                {group}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="⌕" title="No colleges found" message="Try adjusting your search or stage filters." />
      ) : (
        <CollegeTable
          colleges={filtered}
          onSelect={onSelect}
          updateCollege={role === 'admin' ? updateCollege : undefined}
          onDelete={role === 'admin' ? onDelete : undefined}
        />
      )}

      {showUpload && <BulkUploadModal onClose={() => setShowUpload(false)} onUpload={handleBulkUpload} />}
    </div>
  );
};

export default AllColleges;
