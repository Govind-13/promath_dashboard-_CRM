import React, { useMemo, useState } from 'react';
import type { AppData, College } from '../../types/college.types';
import { STAGES } from '../../constants/stages';
import { getStageIdx, getProgress, formatDate, greeting } from '../../utils/college';
import { HeaderCard } from '../HeaderCard';
import { StatCard } from '../StatCard';
import { SearchInput } from '../SearchInput';
import { KanbanBoard } from '../KanbanBoard';
import { NotificationPanel } from '../NotificationPanel';

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
  updateCollege: _,
  markNotifRead,
  deleteNotif: _deleteNotif,
}) => {
  const [query, setQuery] = useState('');
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
  const activePipeline = colleges.filter(college => getProgress(college) < 100).length;
  const mouSigned = colleges.filter(college => college.stages.mou_signing?.status === 'completed').length;
  const inImplementation = colleges.filter(college => STAGES[getStageIdx(college)]?.group === 'Implementation').length;
  const liveColleges = colleges.filter(college => getProgress(college) === 100).length;

  const kanbanData = GROUPS.map(group => {
    if (group === 'Complete') {
      return { group, colleges: filteredColleges.filter(college => getProgress(college) === 100) };
    }
    const stageIds = STAGES.filter(stage => stage.group === group).map(stage => stage.id);
    return {
      group,
      colleges: filteredColleges.filter(college =>
        getProgress(college) < 100 && stageIds.includes(STAGES[getStageIdx(college)]?.id),
      ),
    };
  });

  const unreadNotifs = data.notifications
    .filter(notification => notification.role === 'admin' && !notification.read)
    .slice(0, 5);

  const displayName = userName?.split(' ')[0] || 'Harsha';
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
    { label: 'Total Colleges', value: colleges.length, icon: '🏛️' },
    { label: 'Active Pipeline', value: activePipeline, icon: '📈' },
    { label: 'MOUs Signed', value: mouSigned, icon: '📄' },
    { label: 'In Implementation', value: inImplementation, icon: '⚡' },
    { label: 'Live Colleges', value: liveColleges, icon: '✅' },
    { label: 'Pipeline Value', value: pipelineValue, icon: '💰' },
  ];
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
          <StatCard key={stat.label} {...stat} />
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
                  <td><span className="pill pill-primary">{getProgress(college) === 100 ? 'Complete' : STAGES[getStageIdx(college)]?.group}</span></td>
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
    </div>
  );
};

export default AdminDash;
