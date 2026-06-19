import { useState } from 'react';
import type { College } from '../../types/college.types';
import { Modal } from '../Modal';

interface Props {
  onClose: () => void;
  onAdd: (data: Partial<College>) => Promise<void>;
}

const AddModal: React.FC<Props> = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: '', college_type: '', academic_year: '', contact_name: '',
    contact_designation: '', phone: '', email: '', location: '', total_students: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (key: string, value: string) => setForm(current => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return setError('College name is required');
    setSaving(true);
    setError('');
    try {
      await onAdd(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add college');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Add New College" subtitle="Create a college record and begin tracking its pipeline." onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <div className="field">
            <label className="label">College Name *</label>
            <input className="input" value={form.name} onChange={event => set('name', event.target.value)} placeholder="Enter college name" autoFocus />
            {error && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</span>}
          </div>
          <div className="field">
            <label className="label">College Type</label>
            <select className="input" value={form.college_type} onChange={event => set('college_type', event.target.value)}>
              <option value="">Select type</option>
              <option>Government</option><option>Private</option><option>Autonomous</option><option>Deemed</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Academic Year</label>
            <select className="input" value={form.academic_year} onChange={event => set('academic_year', event.target.value)}>
              <option value="">Select year</option>
              <option>2024-25</option><option>2025-26</option><option>2026-27</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Contact Name</label>
            <input className="input" value={form.contact_name} onChange={event => set('contact_name', event.target.value)} placeholder="Contact person" />
          </div>
          <div className="field">
            <label className="label">Contact Designation</label>
            <input className="input" value={form.contact_designation} onChange={event => set('contact_designation', event.target.value)} placeholder="Designation" />
          </div>
          <div className="field">
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={event => set('phone', event.target.value)} placeholder="Phone number" />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={event => set('email', event.target.value)} placeholder="Email address" />
          </div>
          <div className="field">
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={event => set('location', event.target.value)} placeholder="City" />
          </div>
          <div className="field">
            <label className="label">Total Students</label>
            <input className="input" inputMode="numeric" value={form.total_students} onChange={event => set('total_students', event.target.value)} placeholder="Number of students" />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding...' : 'Add College'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddModal;
