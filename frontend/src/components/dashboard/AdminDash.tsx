import React, { useMemo, useState } from 'react';
import type { AppData, College } from '../../types/college.types';
import { STAGES } from '../../constants/stages';
import { getStageIdx, getProgress, formatDate, greeting } from '../../utils/college';
import { HeaderCard } from '../HeaderCard';
import { StatCard } from '../StatCard';
import { SearchInput } from '../SearchInput';
import { KanbanBoard } from '../KanbanBoard';
import { NotificationPanel } from '../NotificationPanel';
import { Modal } from '../Modal';

interface Props {
  data: AppData;
  userName: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  updateCollege: (id: string, fn: (c: College) => College) => void;
  markNotifRead: (id: string) => void;
  deleteNotif: (id: string) => void;
}

const GROUPS = ['Discovery', 'Deal', 'Content', 'Implementation', 'Onboarding', 'Complete'];

const AdminDash: React.FC<Props> = ({
  data,
  userName,
  onSelect,
  onAdd,
  updateCollege,
  markNotifRead,
  deleteNotif: _deleteNotif,
}) => {
  const [query, setQuery] = useState('');
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const colleges = data.colleges;

  const filteredColleges = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return colleges;
    return colleges.filter(college =>
      [college.name, college.contact_name, college.location, college.email]
        .some(value => value?.toLowerCase().includes(term)),
    );
  }, [colleges, query]);

  const totalValue = colleges.reduce((sum, college) => {
    const value = Number(college.stages.pricing_negotiation?.data?.total_value) || 0;
    return sum + value;
  }, 0);
  const getPipelineGroup = (college: College) => {
    if (GROUPS.includes(college.pipeline_stage || '')) return college.pipeline_stage || 'Discovery';
    return getProgress(college) === 100 ? 'Complete' : STAGES[getStageIdx(college)]?.group || 'Discovery';
  };

  const activePipeline = colleges.filter(college => getPipelineGroup(college) !== 'Complete').length;
  const mouSigned = colleges.filter(college => college.stages.mou_signing?.status === 'completed').length;
  const inImplementation = colleges.filter(college => getPipelineGroup(college) === 'Implementation').length;
  const liveColleges = colleges.filter(college => getPipelineGroup(college) === 'Complete').length;

  const kanbanData = GROUPS.map(group => {
    return {
      group,
      colleges: filteredColleges.filter(college => getPipelineGroup(college) === group),
    };
  });

  const moveCollege = (collegeId: string, targetGroup: string) => {
    const college = colleges.find(item => item.id === collegeId);
    if (!college || getPipelineGroup(college) === targetGroup) return;
    updateCollege(collegeId, current => ({ ...current, pipeline_stage: targetGroup }));
  };

  const unreadNotifs = data.notifications
    .filter(notification => notification.role === 'admin' && !notification.read)
    .slice(0, 5);

  const displayName = userName?.toLowerCase().includes('promath')
    ? 'Harsha'
    : userName?.split(' ')[0] || 'Harsha';
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const pipelineValue = totalValue >= 100000
    ? `₹${(totalValue / 100000).toFixed(1)}L`
    : `₹${totalValue.toLocaleString('en-IN')}`;

  const stats = [
    { label: 'Total Colleges', value: colleges.length, icon: '🏛️', colleges },
    {
      label: 'Active Pipeline',
      value: activePipeline,
      icon: '📈',
      colleges: colleges.filter(college => getPipelineGroup(college) !== 'Complete'),
    },
    {
      label: 'MOUs Signed',
      value: mouSigned,
      icon: '📄',
      colleges: colleges.filter(college => college.stages.mou_signing?.status === 'completed'),
    },
    {
      label: 'In Implementation',
      value: inImplementation,
      icon: '⚡',
      colleges: colleges.filter(college => getPipelineGroup(college) === 'Implementation'),
    },
    {
      label: 'Live Colleges',
      value: liveColleges,
      icon: '✅',
      colleges: colleges.filter(college => getPipelineGroup(college) === 'Complete'),
    },
    {
      label: 'Pipeline Value',
      value: pipelineValue,
      icon: '💰',
      colleges: colleges.filter(college => Number(college.stages.pricing_negotiation?.data?.total_value) > 0),
    },
  ];
  const selectedStatData = stats.find(stat => stat.label === selectedStat);
  const recentColleges = [...colleges]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  return (
    <div className="admin-dashboard fade-in page-stack">
      <HeaderCard
        title={`${greeting()}, ${displayName}`}
        subtitle={today}
        action={<button className="btn btn-primary" onClick={onAdd}>+ Add College</button>}
      />

      <SearchInput
        className="dashboard-search"
        value={query}
        onChange={setQuery}
        placeholder="Search colleges by name, contact, or location..."
      />

      <section className="dashboard-stats grid-6">
        {stats.map(stat => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            onClick={() => setSelectedStat(stat.label)}
          />
        ))}
      </section>

      <section className="dashboard-workspace">
        <div className="pipeline-panel card">
          <div className="panel-heading">
            <h2>Sales Pipeline</h2>
            <p>Colleges grouped by current stage</p>
          </div>
          <KanbanBoard
            columns={kanbanData.map(item => ({ title: item.group, colleges: item.colleges }))}
            onSelect={onSelect}
            onMove={moveCollege}
          />
        </div>

        <aside className="updates-panel card">
          <NotificationPanel notifications={unreadNotifs} onRead={markNotifRead} />
        </aside>
      </section>

      <section className="recent-activity card">
        <div className="panel-heading">
          <h2>Recent Activity</h2>
          <p>Recently added colleges and their current pipeline status</p>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>College</th>
                <th>Type</th>
                <th>Location</th>
                <th>Stage</th>
                <th>Progress</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {recentColleges.map(college => (
                <tr key={college.id} onClick={() => onSelect(college.id)}>
                  <td><strong>{college.name}</strong></td>
                  <td>{college.college_type || '—'}</td>
                  <td>{college.location || '—'}</td>
                  <td><span className="pill pill-primary">{getPipelineGroup(college)}</span></td>
                  <td>
                    <div className="progress-wrap">
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${getProgress(college)}%` }} /></div>
                      <span className="mono">{getProgress(college)}%</span>
                    </div>
                  </td>
                  <td>{formatDate(college.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedStatData && (
        <Modal
          title={selectedStatData.label}
          subtitle={`${selectedStatData.colleges.length} college${selectedStatData.colleges.length === 1 ? '' : 's'}`}
          onClose={() => setSelectedStat(null)}
          size="md"
        >
          {selectedStatData.colleges.length === 0 ? (
            <div className="empty-state">
              <div className="state-icon">⌕</div>
              <div className="state-title">No colleges found</div>
              <p>This card does not have matching colleges yet.</p>
            </div>
          ) : (
            <div className="stat-college-list">
              {selectedStatData.colleges.map(college => {
                const value = Number(college.stages.pricing_negotiation?.data?.total_value) || 0;
                const badge = selectedStatData.label === 'Pipeline Value' && value > 0
                  ? `₹${value.toLocaleString('en-IN')}`
                  : getPipelineGroup(college);

                return (
                  <button
                    key={college.id}
                    type="button"
                    className="stat-college-item"
                    onClick={() => {
                      setSelectedStat(null);
                      onSelect(college.id);
                    }}
                  >
                    <span>
                      <strong>{college.name}</strong>
                      <small>{college.location || college.college_type || 'No location added'}</small>
                    </span>
                    <span className="pill pill-primary">{badge}</span>
                  </button>
                );
              })}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default AdminDash;
