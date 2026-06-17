import React, { useState, useEffect, useCallback } from 'react';
import type { AppData, College, Notification } from '../types/college.types';
import { ROLES } from '../constants/roles';
import { storage } from '../services/api';
import { sampleData, sampleNotifs } from '../data/sample';
import { newCollege, getProgress, greeting } from '../utils/college';
import AdminDash from '../components/dashboard/AdminDash';
import ContentDash from '../components/dashboard/ContentDash';
import ImplDash from '../components/dashboard/ImplDash';
import BillingDash from '../components/dashboard/BillingDash';
import ProposalGenerator from '../components/dashboard/ProposalGenerator';
import EngageDash from '../components/dashboard/EngageDash';
import AllColleges from '../components/colleges/AllColleges';
import Detail from '../components/colleges/Detail';
import AddModal from '../components/colleges/AddModal';

const STORAGE_KEY = 'promath_crm_v13';

type View = 'dashboard' | 'colleges' | 'detail' | 'proposals';

const App: React.FC = () => {
  const [role, setRole] = useState('');
  const [data, setData] = useState<AppData>({ colleges: [], notifications: [] });
  const [view, setView] = useState<View>('dashboard');
  const [selectedId, setSelectedId] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    storage.get(STORAGE_KEY).then(res => {
      if (res?.value) {
        const parsed = JSON.parse(res.value);
        setData({
          colleges: parsed.colleges || [],
          notifications: parsed.notifications || [],
        });
      } else {
        setData({ colleges: sampleData(), notifications: sampleNotifs() });
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((d: AppData) => {
    storage.set(STORAGE_KEY, JSON.stringify(d));
  }, []);

  useEffect(() => {
    if (loaded) persist(data);
  }, [data, loaded, persist]);

  const updateCollege = (id: string, fn: (c: College) => College) => {
    setData(d => ({
      ...d,
      colleges: d.colleges.map(c => c.id === id ? fn(c) : c),
    }));
  };

  const addCollege = (partial: Partial<College>) => {
    const c = newCollege(partial);
    setData(d => ({ ...d, colleges: [...d.colleges, c] }));
  };

  const addColleges = (partials: Partial<College>[]) => {
    const newOnes = partials.map(p => newCollege(p));
    setData(d => ({ ...d, colleges: [...d.colleges, ...newOnes] }));
  };

  const deleteCollege = (id: string) => {
    setData(d => ({ ...d, colleges: d.colleges.filter(c => c.id !== id) }));
    if (selectedId === id) setView('colleges');
  };

  const addNotif = (n: Notification) => {
    setData(d => ({ ...d, notifications: [...d.notifications, n] }));
  };

  const markNotifRead = (id: string) => {
    setData(d => ({
      ...d,
      notifications: d.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
  };

  const selectCollege = (id: string) => {
    setSelectedId(id);
    setView('detail');
  };

  const selectedCollege = data.colleges.find(c => c.id === selectedId);

  if (!loaded) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--font-ui)' }}>Loading...</div>;
  }

  if (!role) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontFamily: 'var(--font-heading)', color: 'var(--accent)', margin: 0 }}>Promath CRM</h1>
            <p style={{ color: '#6B7280', marginTop: 8 }}>Select your role to continue</p>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {Object.entries(ROLES).map(([key, r]) => (
              <button
                key={key}
                className="role-card"
                onClick={() => setRole(key)}
                style={{ borderLeft: `4px solid ${r.color}` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{r.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{r.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const roleInfo = ROLES[role];
  const navItems: { id: View | 'proposals'; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'colleges', label: 'Colleges', icon: '🏫' },
  ];
  if (role === 'billing') {
    navItems.push({ id: 'proposals', label: 'Proposals', icon: '📄' });
  }

  const renderDashboard = () => {
    switch (role) {
      case 'admin': return <AdminDash data={data} onSelect={selectCollege} updateCollege={updateCollege} markNotifRead={markNotifRead} />;
      case 'content': return <ContentDash data={data} onSelect={selectCollege} />;
      case 'implementation': return <ImplDash data={data} onSelect={selectCollege} />;
      case 'billing': return <BillingDash />;
      case 'engagement': return <EngageDash data={data} onSelect={selectCollege} updateCollege={updateCollege} />;
      default: return <div>Unknown role</div>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 style={{ fontSize: 18, fontFamily: 'var(--font-heading)', color: '#fff', margin: 0 }}>Promath CRM</h2>
        </div>
        <div className="sidebar-role" style={{ background: roleInfo.bg, color: roleInfo.color }}>
          <span>{roleInfo.icon}</span> {roleInfo.label}
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? 'nav-item-active' : ''}`}
              onClick={() => setView(item.id as View)}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: 16 }}>
          <button className="btn btn-secondary" style={{ width: '100%', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => { setRole(''); setView('dashboard'); }}>
            Switch Role
          </button>
        </div>
      </aside>

      <main className="main-content">
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
            addNotif={addNotif}
          />
        )}
        {view === 'proposals' && <ProposalGenerator data={data} />}
      </main>

      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onAdd={addCollege}
        />
      )}
    </div>
  );
};

export default App;
