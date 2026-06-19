import React, { useCallback, useEffect, useState } from 'react';
import type { AppData, College, StageStatus } from '../types/college.types';
import { ROLES } from '../constants/roles';
import { authApi, type AuthUser, type UserRole } from '../api/authApi';
import { collegeApi, collegeRecordToUi, collegeUiToInput } from '../api/collegeApi';
import { stageApi, stageRecordToUi } from '../api/stageApi';
import { notificationApi, notificationRecordToUi } from '../api/notificationApi';
import { importApi } from '../api/importApi';
import { isConflictError } from '../api/client';
import { STAGES } from '../constants/stages';
import { Login } from '../components/Login';
import AdminDash from '../components/dashboard/AdminDash';
import ContentDash from '../components/dashboard/ContentDash';
import ImplDash from '../components/dashboard/ImplDash';
import BillingDash from '../components/dashboard/BillingDash';
import ProposalGenerator from '../components/dashboard/ProposalGenerator';
import EngageDash from '../components/dashboard/EngageDash';
import AllColleges from '../components/colleges/AllColleges';
import Detail from '../components/colleges/Detail';
import AddModal from '../components/colleges/AddModal';
import { AppLayout } from '../layouts/AppLayout';
import { LoadingState } from '../components/States';
import { WorkspaceSelect } from '../components/WorkspaceSelect';

type View = 'dashboard' | 'colleges' | 'detail' | 'proposals';

const errorMessage = (error: unknown) =>
  isConflictError(error)
    ? 'This record was updated by another user. Please refresh before saving.'
    : error instanceof Error
      ? error.message
      : 'Something went wrong. Please try again.';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [data, setData] = useState<AppData>({ colleges: [], notifications: [] });
  const [view, setView] = useState<View>('dashboard');
  const [selectedId, setSelectedId] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState('');
  const [workspaceRole, setWorkspaceRole] = useState<UserRole | null>(null);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setLoaded(false);
    setSelectedId('');
    setView('dashboard');
    setWorkspaceRole(null);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener('promath:unauthorized', onUnauthorized);
    return () => window.removeEventListener('promath:unauthorized', onUnauthorized);
  }, [logout]);

  useEffect(() => {
    authApi.me()
      .then(setUser)
      .catch(() => {
        authApi.logout();
        setUser(null);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const loadData = useCallback(async () => {
    setLoaded(false);
    setError('');
    try {
      const [collegeRecords, notificationRecords] = await Promise.all([
        collegeApi.list(),
        notificationApi.list(),
      ]);
      const colleges = await Promise.all(
        collegeRecords.map(async record => {
          const college = collegeRecordToUi(record);
          const stages = await stageApi.list(record._id);
          for (const stage of stages) college.stages[stage.stageName] = stageRecordToUi(stage);
          return college;
        }),
      );
      setData({
        colleges,
        notifications: notificationRecords.map(notificationRecordToUi),
      });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const updateCollege = async (id: string, fn: (college: College) => College) => {
    const current = data.colleges.find(college => college.id === id);
    if (!current) return;
    const next = fn(current);
    setData(previous => ({
      ...previous,
      colleges: previous.colleges.map(college => college.id === id ? next : college),
    }));
    try {
      const record = await collegeApi.update(id, collegeUiToInput(next));
      const saved = collegeRecordToUi(record);
      saved.stages = next.stages;
      saved.engagement_journey = next.engagement_journey;
      saved.automation_journey = next.automation_journey;
      saved.automation_journey_progress = next.automation_journey_progress;
      saved.academic_year = next.academic_year;
      saved.total_students = next.total_students;
      setData(previous => ({
        ...previous,
        colleges: previous.colleges.map(college => college.id === id ? saved : college),
      }));
      setError('');
    } catch (err) {
      setError(errorMessage(err));
      await loadData();
    }
  };

  const addCollege = async (partial: Partial<College>) => {
    try {
      const record = await collegeApi.create(collegeUiToInput(partial));
      setData(previous => ({
        ...previous,
        colleges: [...previous.colleges, collegeRecordToUi(record)],
      }));
      setError('');
    } catch (err) {
      setError(errorMessage(err));
      throw err;
    }
  };

  const addColleges = async (partials: Partial<College>[], fileName: string) => {
    try {
      await importApi.create(fileName, partials as Record<string, unknown>[]);
      await importApi.list();
      const records = await Promise.all(partials.map(partial => collegeApi.create(collegeUiToInput(partial))));
      setData(previous => ({
        ...previous,
        colleges: [...previous.colleges, ...records.map(collegeRecordToUi)],
      }));
      setError('');
    } catch (err) {
      setError(errorMessage(err));
      throw err;
    }
  };

  const deleteCollege = async (id: string) => {
    try {
      await collegeApi.delete(id);
      setData(previous => ({
        ...previous,
        colleges: previous.colleges.filter(college => college.id !== id),
      }));
      if (selectedId === id) setView('colleges');
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const saveStage = async (
    collegeId: string,
    stageId: string,
    stageData: Record<string, unknown>,
    status: StageStatus,
  ) => {
    const college = data.colleges.find(item => item.id === collegeId);
    if (!college) return;
    const existing = college.stages[stageId];
    const stageIndex = STAGES.findIndex(stage => stage.id === stageId);
    const input = {
      stageName: stageId,
      stageIndex,
      status,
      remarks: JSON.stringify(stageData),
      completedAt: status === 'completed' ? new Date().toISOString() : undefined,
    };
    try {
      const record = existing?.id
        ? await stageApi.update(collegeId, existing.id, input)
        : await stageApi.create(collegeId, input);
      setData(previous => ({
        ...previous,
        colleges: previous.colleges.map(item =>
          item.id === collegeId
            ? { ...item, stages: { ...item.stages, [stageId]: stageRecordToUi(record) } }
            : item,
        ),
      }));
      if (user?.role === 'admin' && status === 'completed') {
        const stage = STAGES.find(item => item.id === stageId);
        const notification = await notificationApi.create({
          title: 'Stage completed',
          message: `${college.name}: ${stage?.label || stageId} completed`,
          targetRole: stage?.team || '',
          type: 'stage',
        });
        setData(previous => ({
          ...previous,
          notifications: [notificationRecordToUi(notification), ...previous.notifications],
        }));
      }
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const markNotifRead = async (id: string) => {
    try {
      const record = await notificationApi.markRead(id);
      const updated = notificationRecordToUi(record);
      setData(previous => ({
        ...previous,
        notifications: previous.notifications.map(notification => notification.id === id ? updated : notification),
      }));
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const deleteNotif = async (id: string) => {
    try {
      await notificationApi.delete(id);
      setData(previous => ({
        ...previous,
        notifications: previous.notifications.filter(notification => notification.id !== id),
      }));
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const selectCollege = (id: string) => {
    setSelectedId(id);
    setView('detail');
  };

  const handleLogin = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setUser(response.user);
    setView('dashboard');
    setWorkspaceRole(null);
  };

  if (!authChecked || (user && !loaded)) {
    return <div className="login-container"><LoadingState title="Loading Promath CRM..." message="Preparing your workspace." /></div>;
  }

  if (!user) return <Login onLogin={handleLogin} />;

  const availableRoles: UserRole[] = user.role === 'admin'
    ? ['admin', 'content', 'implementation', 'engagement', 'billing']
    : [user.role];

  if (!workspaceRole) {
    return (
      <WorkspaceSelect
        userName={user.name}
        roles={availableRoles}
        onSelect={selectedRole => {
          setWorkspaceRole(selectedRole);
          setView('dashboard');
        }}
        onLogout={logout}
      />
    );
  }

  const role = workspaceRole;
  const roleInfo = ROLES[role];
  const selectedCollege = data.colleges.find(college => college.id === selectedId);
  const canUseBilling = role === 'admin' || role === 'billing';
  const navItems: { id: View; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'colleges', label: role === 'admin' ? 'All Colleges' : 'My Assignments' },
  ];
  if (canUseBilling) navItems.push({ id: 'proposals', label: 'Proposals' });

  const renderDashboard = () => {
    switch (role) {
      case 'admin': return <AdminDash data={data} userName={user.name} onSelect={selectCollege} onAdd={() => setShowAdd(true)} updateCollege={updateCollege} markNotifRead={markNotifRead} deleteNotif={deleteNotif} />;
      case 'content': return <ContentDash data={data} onSelect={selectCollege} />;
      case 'implementation': return <ImplDash data={data} onSelect={selectCollege} />;
      case 'billing': return <BillingDash />;
      case 'engagement': return <EngageDash data={data} onSelect={selectCollege} updateCollege={updateCollege} />;
      default: return <div>Unknown role</div>;
    }
  };

  const sidebarItems = navItems.map(item => ({
    ...item,
    icon: item.id === 'dashboard' ? '▥' : item.id === 'colleges' ? '♜' : '▤',
  }));
  const unreadForRole = data.notifications.filter(notification => notification.role === role && !notification.read).length;

  return (
    <AppLayout
      userName={user.name || roleInfo.label}
      roleLabel={roleInfo.label}
      roleIcon={roleInfo.icon}
      items={sidebarItems}
      activeView={view}
      unread={unreadForRole}
      onNavigate={id => setView(id as View)}
      onSwitchWorkspace={() => {
        setSelectedId('');
        setView('dashboard');
        setWorkspaceRole(null);
      }}
      onLogout={logout}
    >
        {error && (
          <div className="inline-alert error" style={{ marginBottom: 16 }}>
            {error}
            <button className="btn-icon" style={{ float: 'right' }} onClick={() => setError('')} title="Dismiss">x</button>
          </div>
        )}
        {view === 'dashboard' && renderDashboard()}
        {view === 'colleges' && (
          <AllColleges
            role={role}
            data={data}
            onSelect={selectCollege}
            onAdd={() => setShowAdd(true)}
            onBulkAdd={addColleges}
            onDelete={deleteCollege}
            updateCollege={updateCollege}
          />
        )}
        {view === 'detail' && selectedCollege && (
          <Detail
            college={selectedCollege}
            role={role}
            onBack={() => setView('colleges')}
            updateCollege={updateCollege}
            saveStage={saveStage}
          />
        )}
        {view === 'proposals' && canUseBilling && <ProposalGenerator data={data} />}
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={addCollege} />}
    </AppLayout>
  );
};

export default App;
