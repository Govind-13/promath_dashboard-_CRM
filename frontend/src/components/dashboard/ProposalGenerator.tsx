import React, { useState, useEffect } from 'react';
import type { ProposalDoc } from '../../types/billing.types';
import type { AppData } from '../../types/college.types';
import { billingApi, billingRecordToUi, billingUiToInput } from '../../api/billingApi';

const FEATURE_OPTIONS = [
  'Full syllabus coverage',
  'Unit-wise practice questions',
  'Mock tests & previous year papers',
  'Video explanations',
  'AI-powered doubt solving',
  'Faculty dashboard & analytics',
  'Student progress tracking',
  'Leaderboard & gamification',
  'Mobile app access',
  'Offline access support',
  'WhatsApp integration',
  'Custom branding',
];

interface Props {
  data: AppData;
}

const ProposalGenerator: React.FC<Props> = ({ data }) => {
  const [proposals, setProposals] = useState<ProposalDoc[]>([]);
  const [editing, setEditing] = useState<ProposalDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    billingApi.list()
      .then(records => setProposals(records.map(billingRecordToUi)))
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load proposals'))
      .finally(() => setLoading(false));
  }, []);

  const startNew = () => {
    setEditing({
      id: Date.now().toString(),
      college_id: '', college_name: '', contact_name: '', location: '',
      students: 0, price_per_student: 450, total_value: 0,
      academic_year: '2025-26', features: ['Full syllabus coverage', 'Unit-wise practice questions', 'Mock tests & previous year papers'],
      notes: '', created_at: new Date().toISOString(),
    });
  };

  const prefillFromCollege = (collegeId: string) => {
    if (!editing) return;
    const c = data.colleges.find(x => x.id === collegeId);
    if (!c) return;
    const pricingData = c.stages.pricing_negotiation?.data || {};
    const students = Number(c.total_students) || 0;
    const price = Number(pricingData.agreed_price) || editing.price_per_student;
    setEditing({
      ...editing,
      college_id: c.id, college_name: c.name, contact_name: c.contact_name,
      location: c.location, students, price_per_student: price, total_value: students * price,
    });
  };

  const toggleFeature = (f: string) => {
    if (!editing) return;
    const features = editing.features.includes(f) ? editing.features.filter(x => x !== f) : [...editing.features, f];
    setEditing({ ...editing, features });
  };

  const save = async () => {
    if (!editing) return;
    try {
      const exists = proposals.some(proposal => proposal.id === editing.id);
      const record = exists
        ? await billingApi.update(editing.id, billingUiToInput(editing))
        : await billingApi.create(billingUiToInput(editing));
      const saved = billingRecordToUi(record);
      setProposals(current => exists
        ? current.map(proposal => proposal.id === editing.id ? saved : proposal)
        : [...current, saved]);
      setEditing(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save proposal');
    }
  };

  const deleteProposal = async (id: string) => {
    try {
      await billingApi.delete(id);
      setProposals(current => current.filter(proposal => proposal.id !== id));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete proposal');
    }
  };

  const download = (p: ProposalDoc) => {
    const featList = p.features.map(f => `  - ${f}`).join('\n');
    const txt = `PROPOSAL\n${'='.repeat(40)}\n\nCollege: ${p.college_name}\nContact: ${p.contact_name}\nLocation: ${p.location}\nAcademic Year: ${p.academic_year}\n\nStudents: ${p.students}\nPrice per Student: Rs. ${p.price_per_student}\nTotal Value: Rs. ${p.total_value.toLocaleString('en-IN')}\n\nFeatures:\n${featList}\n\nNotes: ${p.notes}\n\nGenerated: ${new Date(p.created_at).toLocaleDateString('en-IN')}`;
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `proposal_${p.college_name.replace(/\s+/g, '_')}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  if (editing) {
    return (
      <div className="fade-in">
        <button className="btn btn-secondary" onClick={() => setEditing(null)} style={{ marginBottom: 16 }}>← Back</button>
        <h2>Proposal Builder</h2>
        {error && <div style={{ color: '#991B1B', background: '#FEF2F2', border: '1px solid #FECACA', padding: 10, marginBottom: 16 }}>{error}</div>}

        <div className="field" style={{ marginBottom: 16 }}>
          <label className="label">Prefill from College</label>
          <select className="input" value={editing.college_id} onChange={e => prefillFromCollege(e.target.value)}>
            <option value="">Select a college...</option>
            {data.colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div className="field">
            <label className="label">College Name</label>
            <input className="input" value={editing.college_name} onChange={e => setEditing({ ...editing, college_name: e.target.value })} />
          </div>
          <div className="field">
            <label className="label">Contact</label>
            <input className="input" value={editing.contact_name} onChange={e => setEditing({ ...editing, contact_name: e.target.value })} />
          </div>
          <div className="field">
            <label className="label">Location</label>
            <input className="input" value={editing.location} onChange={e => setEditing({ ...editing, location: e.target.value })} />
          </div>
          <div className="field">
            <label className="label">Academic Year</label>
            <select className="input" value={editing.academic_year} onChange={e => setEditing({ ...editing, academic_year: e.target.value })}>
              <option>2024-25</option><option>2025-26</option><option>2026-27</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Students</label>
            <input className="input" type="number" value={editing.students} onChange={e => {
              const s = Number(e.target.value);
              setEditing({ ...editing, students: s, total_value: s * editing.price_per_student });
            }} />
          </div>
          <div className="field">
            <label className="label">Price per Student (Rs.)</label>
            <input className="input" type="number" value={editing.price_per_student} onChange={e => {
              const p = Number(e.target.value);
              setEditing({ ...editing, price_per_student: p, total_value: editing.students * p });
            }} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#6B7280' }}>Total Value</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>
            Rs. {editing.total_value.toLocaleString('en-IN')}
          </div>
        </div>

        <h4>Features</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {FEATURE_OPTIONS.map(f => (
            <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={editing.features.includes(f)} onChange={() => toggleFeature(f)} />
              {f}
            </label>
          ))}
        </div>

        <div className="field">
          <label className="label">Additional Notes</label>
          <textarea className="input" rows={3} value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-primary" onClick={save}>Save Proposal</button>
          <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Proposals ({proposals.length})</h2>
        <button className="btn btn-primary" onClick={startNew}>+ New Proposal</button>
      </div>

      {error && <div style={{ color: '#991B1B', background: '#FEF2F2', border: '1px solid #FECACA', padding: 10, marginBottom: 16 }}>{error}</div>}
      {loading ? (
        <div className="empty-state">Loading proposals...</div>
      ) : proposals.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 8 }}>📄</div>
          <div>No proposals yet</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {proposals.map(p => (
            <div key={p.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong style={{ fontSize: 15 }}>{p.college_name}</strong>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>{p.contact_name} | {p.location} | {p.academic_year}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                    {p.features.slice(0, 4).map(f => <span key={f} className="pill" style={{ fontSize: 11 }}>{f}</span>)}
                    {p.features.length > 4 && <span className="pill" style={{ fontSize: 11 }}>+{p.features.length - 4} more</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
                    Rs. {p.total_value.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{p.students} students @ Rs.{p.price_per_student}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 8, justifyContent: 'flex-end' }}>
                    <button className="btn-icon" onClick={() => setEditing({ ...p })} title="Edit">✏️</button>
                    <button className="btn-icon" onClick={() => download(p)} title="Download">⬇️</button>
                    <button className="btn-icon" onClick={() => deleteProposal(p.id)} title="Delete">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProposalGenerator;
