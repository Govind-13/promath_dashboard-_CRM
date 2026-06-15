import { useState, useEffect } from 'react';
import { College, Notification, UserRole } from './types';
import { ROLES, STAGES, ROLE_OPTIONS } from './constants';
import { CollegeTable } from './components/college/CollegeTable';
import { CollegeDetail } from './components/college/CollegeDetail';
import { EngagementDashboard } from './components/engagement/EngagementDashboard';
import { BillingDashboard } from './components/billing/BillingDashboard';

export default function App() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'colleges' | 'engagement' | 'billing'>('colleges');
  const [loading, setLoading] = useState(true);

  // Add College Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newColForm, setNewColForm] = useState({
    name: '',
    location: '',
    contact_name: '',
    email: '',
    phone: '',
    total_students: '120',
  });

  // Load backend seed data on launch
  useEffect(() => {
    Promise.all([
      fetch('/api/colleges').then(res => res.json()),
      fetch('/api/notifications').then(res => res.json())
    ])
      .then(([colList, notifList]) => {
        setColleges(colList);
        setNotifications(notifList);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data from server APIs:', err);
        setLoading(false);
      });
  }, []);

  // Update helper that submits modifications immediately back to Express backend server
  const updateCollege = (id: string, updateFn: (college: College) => College) => {
    setColleges(prev => {
      const updated = prev.map(c => {
        if (c.id === id) {
          const fresh = updateFn(c);
          fetch(`/api/colleges/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fresh)
          }).catch(err => console.error('Failed rest-sync for college update', err));
          return fresh;
        }
        return c;
      });
      return updated;
    });
  };

  const addCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColForm.name || !newColForm.location) {
      alert('College Name and Location are required!');
      return;
    }
    const slug = newColForm.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newCol: College = {
      id: "col_" + Date.now(),
      name: newColForm.name,
      location: newColForm.location,
      contact_name: newColForm.contact_name,
      email: newColForm.email,
      phone: newColForm.phone,
      total_students: parseInt(newColForm.total_students) || 0,
      deal_value: 0,
      lead_owner: role?.name || 'Unassigned',
      created_at: new Date().toISOString(),
      stages: {
        intro_meeting: { status: 'pending', date: '', cost: '', notes: '' },
        syllabus_submission: { status: 'pending', date: '', cost: '', notes: '' },
        mou_signing: { status: 'pending', date: '', cost: '', notes: '' },
        license_creation: { status: 'pending', date: '', cost: '', notes: '' },
        orientation: { status: 'pending', date: '', cost: '', notes: '' },
      },
    };

    fetch('/api/colleges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCol)
    })
      .then(res => res.json())
      .then(savedCol => {
        setColleges(prev => [savedCol, ...prev]);
        setShowAddModal(false);
        setNewColForm({
          name: '',
          location: '',
          contact_name: '',
          email: '',
          phone: '',
          total_students: '120',
        });
      })
      .catch(err => console.error('Failed to create college on server', err));
  };

  const deleteCollege = (id: string) => {
    if (!confirm('Are you absolutely sure you want to remove this college from the directory?')) return;
    fetch(`/api/colleges/${id}`, { method: 'DELETE' })
      .then(() => {
        setColleges(prev => prev.filter(c => c.id !== id));
        if (selectedCollegeId === id) setSelectedCollegeId(null);
      })
      .catch(err => console.error('Failed to delete college', err));
  };

  const addNotification = (text: string, category: string, collegeName?: string) => {
    const notif: Notification = {
      id: "not_" + Date.now(),
      text,
      college: collegeName || null,
      category,
      created_at: new Date().toISOString().slice(0, 10),
      read: false,
    };
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notif)
    })
      .then(res => res.json())
      .then(saved => {
        setNotifications(prev => [saved, ...prev]);
      })
      .catch(err => console.error('Error adding system notification:', err));
  };

  const markNotifRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      fetch(`/api/notifications/${id}/read`, { method: 'POST' })
        .catch(err => console.error('Error toggling read state', err));
      return updated;
    });
  };

  const clearNotification = (id: string) => {
    fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      .then(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      })
      .catch(err => console.error('Error deleting notification', err));
  };

  const handleRoleSelect = (r: UserRole) => {
    setRole(r);
  };

  if (!role) {
    return (
      <div className="login-screen min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center p-6 text-[var(--ink)]">
        <div style={{ maxWidth: '440px', width: '100%', marginBottom: '40px', textAlign: 'center' }}>
          <div className="text-[var(--accent)] font-bold text-3xl tracking-tight mb-2 font-sans uppercase">
            Maths.Engineering
          </div>
          <p className="text-sm font-semibold text-[var(--muted)] leading-relaxed">
            Promath B2B CRM — Administrative portal, academic campaign dispatches & invoicing.
          </p>
        </div>

        <div className="card bg-white p-8 rounded-2xl border border-[var(--border)] shadow-lg w-full max-w-sm">
          <div className="serif text-xl font-bold mb-6 text-center text-gray-800">
            Sign In with Role Delegation
          </div>
          <div className="grid gap-3">
            {ROLE_OPTIONS.map(r => (
              <button
                key={r.id}
                onClick={() => handleRoleSelect(r)}
                className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-[var(--surface-alt)] hover:border-[var(--accent)] transition flex items-center gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl">
                  {r.name === 'Admin' ? '🛡️' : r.name === 'Sales Portal' ? '💼' : '📣'}
                </div>
                <div>
                  <div className="font-bold text-sm text-[var(--ink)]">{r.name}</div>
                  <div className="text-[11px] text-[var(--muted)] mt-0.5 font-medium">
                    {r.permissions.join(', ')}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="text-center text-[10.5px] text-[var(--muted)] mt-6 leading-normal">
            For development review. Permissions and endpoints access-authorizations are dynamically set based on selected scope.
          </div>
        </div>
      </div>
    );
  }

  const matchesFilter = (c: College) => {
    // If Sales role: Can view everything but highlights operations they own
    // If Comm role: Highlights campaign items
    return true;
  };

  const filteredColleges = colleges.filter(matchesFilter);
  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Sidebar navigation */}
      <nav className="w-[250px] bg-white border-r border-[#E2E8F0] flex flex-col justify-between shrink-0 h-screen sticky top-0">
        <div>
          <div className="p-5 border-b border-[#F1F5F9] flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white font-bold flex items-center justify-center text-sm shadow-indigo-100 shadow-md">
              M
            </div>
            <div>
              <div className="font-bold text-xs tracking-wide text-[var(--ink)] uppercase">
                Promath CRM
              </div>
              <div className="text-[10px] text-[var(--muted)] font-bold mt-0.5 uppercase tracking-wider">
                Maths.Engineering
              </div>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-1">
            <button
              onClick={() => {
                setActiveTab('colleges');
                setSelectedCollegeId(null);
              }}
              className={`p-3 rounded-lg text-left text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition ${activeTab === 'colleges' && !selectedCollegeId ? 'bg-[#EEF2F6] text-[var(--accent)]' : 'text-gray-600 hover:bg-[#F8FAFC]'}`}
            >
              💼 Colleges Directory
            </button>
            <button
              onClick={() => {
                setActiveTab('engagement');
                setSelectedCollegeId(null);
              }}
              className={`p-3 rounded-lg text-left text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition ${activeTab === 'engagement' ? 'bg-[#EEF2F6] text-[var(--accent)]' : 'text-gray-600 hover:bg-[#F8FAFC]'}`}
            >
              📣 Outreach & LMS Telemetry
            </button>
            <button
              onClick={() => {
                setActiveTab('billing');
                setSelectedCollegeId(null);
              }}
              className={`p-3 rounded-lg text-left text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition ${activeTab === 'billing' ? 'bg-[#EEF2F6] text-[var(--accent)]' : 'text-gray-600 hover:bg-[#F8FAFC]'}`}
            >
              🧾 Billing, Quotes & PDF
            </button>
          </div>
        </div>

        {/* User context card */}
        <div className="p-4 border-t border-[#F1F5F9] bg-[#FBFCFE]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
              {role.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate text-[var(--ink)]">{role.name}</div>
              <div className="text-[9.5px] text-[#039855] font-bold mt-0.5">Authorised Mode</div>
            </div>
          </div>
          <button
            onClick={() => {
              setRole(null);
              setSelectedCollegeId(null);
              setActiveTab('colleges');
            }}
            className="w-full text-center py-2 border rounded-lg bg-white hover:bg-red-50 hover:text-red-600 text-[10.5px] font-bold text-[var(--muted)] cursor-pointer mt-3 transition border-gray-200"
          >
            ↪ Disconnect Portal
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {/* Top bar rail */}
        <header className="h-[64px] bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            {selectedCollegeId && (
              <button
                onClick={() => setSelectedCollegeId(null)}
                className="py-1 px-3 border rounded-lg hover:bg-gray-50 text-[11px] font-semibold text-[var(--muted)] flex items-center gap-1 cursor-pointer transition border-gray-200"
              >
                ← Back to Directory
              </button>
            )}
            <span className="text-[11.5px] bg-[#EEF4FF] text-[var(--accent)] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider">
              {role.name} Active Profile
            </span>
          </div>

          {/* Quick notification pull down dropdown or alerts checklist */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="relative w-8 h-8 rounded-lg hover:bg-[#F2F4F7] flex items-center justify-center text-sm cursor-pointer border border-[#E2E8F0] bg-white">
                🔔
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white font-bold text-[9px] flex items-center justify-center">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>
              {/* Dropdown tray */}
              <div className="absolute right-0 top-9 w-[300px] bg-white border rounded-xl shadow-lg p-3 hidden group-hover:block hover:block z-30">
                <div className="flex justify-between items-center mb-2 pb-2 border-b">
                  <span className="font-bold text-xs">Campaign Outreach Triggers</span>
                  <span className="text-[10px] font-bold text-[var(--muted)]">{unreadNotifs.length} alerts</span>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }} className="grid gap-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-4 text-[11px] text-[var(--muted)]">No alerts currently flagged.</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{ opacity: n.read ? 0.6 : 1 }} className="p-2 bg-gray-50 rounded-lg text-[11px] border border-gray-100 flex flex-col justify-between">
                        <div className="font-semibold text-gray-800">{n.text}</div>
                        {n.college && <div className="text-[9.5px] text-[var(--accent)] font-bold mt-1">College: {n.college}</div>}
                        <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-gray-100/10">
                          <span className="text-[9px] text-gray-400 font-medium">{n.created_at}</span>
                          <div className="flex gap-2">
                            {!n.read && (
                              <button onClick={() => markNotifRead(n.id)} className="text-[9px] font-bold text-[var(--accent)] bg-none border-none cursor-pointer">
                                Mark read
                              </button>
                            )}
                            <button onClick={() => clearNotification(n.id)} className="text-[9px] text-red-500 bg-none border-none cursor-pointer">
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content View Routing */}
        <div className="p-6 md:p-8 flex-1">
          {loading ? (
            <div className="p-16 text-center text-sm font-semibold text-[var(--muted)]">
              Loading Promath CRM telemetry logs...
            </div>
          ) : selectedCollegeId ? (
            <CollegeDetail
              college={colleges.find(c => c.id === selectedCollegeId)!}
              role={role.id}
              onBack={() => setSelectedCollegeId(null)}
              updateCollege={updateCollege}
              addNotif={(notif) => addNotification(notif.message, notif.role)}
            />
          ) : activeTab === 'colleges' ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="font-serif">Partner Colleges Directory</h1>
                  <div className="subtitle font-medium">B2B Sales tracker and curriculum integration stages progress pipeline</div>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="py-2.5 px-5 font-semibold text-white bg-[var(--accent)] hover:opacity-95 shadow-lg shadow-indigo-100 border-0 rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  ➕ Register New Candidate
                </button>
              </div>

              <CollegeTable
                colleges={filteredColleges}
                onSelect={setSelectedCollegeId}
                updateCollege={updateCollege}
              />
            </div>
          ) : activeTab === 'engagement' ? (
            <EngagementDashboard
              data={{ colleges }}
              updateCollege={updateCollege}
            />
          ) : (
            <BillingDashboard
              data={{ colleges }}
              updateCollege={updateCollege}
            />
          )}
        </div>
      </main>

      {/* Register College Dialog Popup Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <span className="font-serif font-bold text-lg text-gray-800">Register College Candidate</span>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full border hover:bg-gray-50 flex items-center justify-center text-sm text-[var(--muted)] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={addCollege} className="grid gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1">College Institution Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., PSNA College of Engineering & Tech"
                  className="w-full py-2 px-3 border rounded-lg text-xs outline-none bg-white font-medium"
                  value={newColForm.name}
                  onChange={e => setNewColForm({ ...newColForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1">Region / Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Dindigul, TN"
                    className="w-full py-2 px-3 border rounded-lg text-xs outline-none bg-white font-medium"
                    value={newColForm.location}
                    onChange={e => setNewColForm({ ...newColForm, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)] uppercase mb-1">Total Student Target</label>
                  <input
                    type="number"
                    placeholder="e.g., 680"
                    className="w-full py-2 px-3 border rounded-lg text-xs outline-none bg-white font-medium"
                    value={newColForm.total_students}
                    onChange={e => setNewColForm({ ...newColForm, total_students: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-2 mt-1">
                <span className="text-[10.5px] font-bold text-[var(--muted)] uppercase block mb-2">Key Academic Contact</span>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Principal/HOD/Representative Name"
                    className="w-full py-2 px-3 border rounded-lg text-xs outline-none bg-white font-medium"
                    value={newColForm.contact_name}
                    onChange={e => setNewColForm({ ...newColForm, contact_name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="email"
                      placeholder="Contact Email Address"
                      className="w-full py-2 px-3 border rounded-lg text-xs outline-none bg-white font-medium"
                      value={newColForm.email}
                      onChange={e => setNewColForm({ ...newColForm, email: e.target.value })}
                    />
                    <input
                      type="tel"
                      placeholder="WhatsApp Mobile"
                      className="w-full py-2 px-3 border rounded-lg text-xs outline-none bg-white font-medium"
                      value={newColForm.phone}
                      onChange={e => setNewColForm({ ...newColForm, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 justify-end mt-4 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 shadow-sm border rounded-xl hover:bg-gray-50 text-xs text-[var(--muted)] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 font-semibold text-white bg-[var(--accent)] hover:opacity-95 shadow-lg shadow-indigo-100 border-0 rounded-xl text-xs cursor-pointer"
                >
                  🚀 Register Candidate Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
