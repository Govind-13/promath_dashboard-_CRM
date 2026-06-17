import React, { useState } from 'react';
import type { College } from '../../types/college.types';

interface Props {
  onClose: () => void;
  onAdd: (data: Partial<College>) => void;
}

const AddModal: React.FC<Props> = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: '', college_type: '', academic_year: '', contact_name: '',
    contact_designation: '', phone: '', email: '', location: '', total_students: '',
  });
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('College name is required'); return; }
    setError('');
    onAdd(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New College</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label className="label">College Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter college name" autoFocus />
              {error && <span style={{ color: '#DC2626', fontSize: 12 }}>{error}</span>}
            </div>
            <div className="field">
              <label className="label">College Type</label>
              <select className="input" value={form.college_type} onChange={e => set('college_type', e.target.value)}>
                <option value="">Select type</option>
                <option>Government</option>
                <option>Private</option>
                <option>Autonomous</option>
                <option>Deemed</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Academic Year</label>
              <select className="input" value={form.academic_year} onChange={e => set('academic_year', e.target.value)}>
                <option value="">Select year</option>
                <option>2024-25</option>
                <option>2025-26</option>
                <option>2026-27</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Contact Name</label>
              <input className="input" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Contact person" />
            </div>
            <div className="field">
              <label className="label">Contact Designation</label>
              <input className="input" value={form.contact_designation} onChange={e => set('contact_designation', e.target.value)} placeholder="Designation" />
            </div>
            <div className="field">
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Phone number" />
            </div>
            <div className="field">
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email address" />
            </div>
            <div className="field">
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="City" />
            </div>
            <div className="field">
              <label className="label">Total Students</label>
              <input className="input" value={form.total_students} onChange={e => set('total_students', e.target.value)} placeholder="Number of students" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add College</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModal;
