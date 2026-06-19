import React, { useState } from 'react';
import type { BillingDoc, BillingStore, LineItem } from '../../types/billing.types';
import { greeting, formatDate } from '../../utils/college';

const emptyStore = (): BillingStore => ({ quotations: [], invoices: [], proposals: [] });

const emptyDoc = (type: 'quotation' | 'invoice'): BillingDoc => ({
  id: Date.now().toString(), type, number: '', college_name: '', contact_name: '',
  date: new Date().toISOString().slice(0, 10), due_date: '', line_items: [{ description: '', qty: 1, rate: 0, amount: 0 }],
  subtotal: 0, tax: 0, total: 0, notes: '', status: 'draft', created_at: new Date().toISOString(),
});

const BillingDash: React.FC = () => {
  const [store, setStore] = useState<BillingStore>(emptyStore());
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [tab, setTab] = useState<'quotation' | 'invoice'>('quotation');
  const [editDoc, setEditDoc] = useState<BillingDoc | null>(null);

  const persist = (s: BillingStore) => {
    setStore(s);
  };

  const docs = tab === 'quotation' ? store.quotations : store.invoices;

  const startNew = () => { setEditDoc(emptyDoc(tab)); setView('edit'); };
  const startEdit = (d: BillingDoc) => { setEditDoc({ ...d }); setView('edit'); };

  const deleteDoc = (id: string) => {
    const key = tab === 'quotation' ? 'quotations' : 'invoices';
    persist({ ...store, [key]: store[key].filter(d => d.id !== id) });
  };

  const saveDoc = () => {
    if (!editDoc) return;
    const key = editDoc.type === 'quotation' ? 'quotations' : 'invoices';
    const list = store[key];
    const idx = list.findIndex(d => d.id === editDoc.id);
    const next = idx >= 0 ? list.map((d, i) => i === idx ? editDoc : d) : [...list, editDoc];
    persist({ ...store, [key]: next });
    setView('list');
    setEditDoc(null);
  };

  const updLine = (idx: number, field: keyof LineItem, val: string | number) => {
    if (!editDoc) return;
    const items = editDoc.line_items.map((li, i) => {
      if (i !== idx) return li;
      const next = { ...li, [field]: val };
      next.amount = next.qty * next.rate;
      return next;
    });
    const subtotal = items.reduce((s, li) => s + li.amount, 0);
    const tax = editDoc.tax;
    setEditDoc({ ...editDoc, line_items: items, subtotal, total: subtotal + tax });
  };

  const addLine = () => {
    if (!editDoc) return;
    setEditDoc({ ...editDoc, line_items: [...editDoc.line_items, { description: '', qty: 1, rate: 0, amount: 0 }] });
  };

  const removeLine = (idx: number) => {
    if (!editDoc) return;
    const items = editDoc.line_items.filter((_, i) => i !== idx);
    const subtotal = items.reduce((s, li) => s + li.amount, 0);
    setEditDoc({ ...editDoc, line_items: items, subtotal, total: subtotal + editDoc.tax });
  };

  const downloadDoc = (d: BillingDoc) => {
    const lines = d.line_items.map(li => `${li.description}\t${li.qty}\t${li.rate}\t${li.amount}`).join('\n');
    const txt = `${d.type.toUpperCase()} #${d.number}\nCollege: ${d.college_name}\nContact: ${d.contact_name}\nDate: ${d.date}\n\nDescription\tQty\tRate\tAmount\n${lines}\n\nSubtotal: ${d.subtotal}\nTax: ${d.tax}\nTotal: ${d.total}\n\nNotes: ${d.notes}`;
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${d.type}_${d.number || d.id}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  if (view === 'edit' && editDoc) {
    return (
      <div className="fade-in">
        <button className="btn btn-secondary" onClick={() => { setView('list'); setEditDoc(null); }} style={{ marginBottom: 16 }}>← Back</button>
        <h2>{editDoc.number ? `Edit ${tab}` : `New ${tab}`}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div className="field">
            <label className="label">Number</label>
            <input className="input" value={editDoc.number} onChange={e => setEditDoc({ ...editDoc, number: e.target.value })} placeholder={`${tab} number`} />
          </div>
          <div className="field">
            <label className="label">Status</label>
            <select className="input" value={editDoc.status} onChange={e => setEditDoc({ ...editDoc, status: e.target.value as BillingDoc['status'] })}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="field">
            <label className="label">College Name</label>
            <input className="input" value={editDoc.college_name} onChange={e => setEditDoc({ ...editDoc, college_name: e.target.value })} />
          </div>
          <div className="field">
            <label className="label">Contact Name</label>
            <input className="input" value={editDoc.contact_name} onChange={e => setEditDoc({ ...editDoc, contact_name: e.target.value })} />
          </div>
          <div className="field">
            <label className="label">Date</label>
            <input className="input" type="date" value={editDoc.date} onChange={e => setEditDoc({ ...editDoc, date: e.target.value })} />
          </div>
          {tab === 'invoice' && (
            <div className="field">
              <label className="label">Due Date</label>
              <input className="input" type="date" value={editDoc.due_date || ''} onChange={e => setEditDoc({ ...editDoc, due_date: e.target.value })} />
            </div>
          )}
        </div>

        <h4>Line Items</h4>
        <table className="table" style={{ marginBottom: 12 }}>
          <thead>
            <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th><th></th></tr>
          </thead>
          <tbody>
            {editDoc.line_items.map((li, i) => (
              <tr key={i}>
                <td><input className="input" value={li.description} onChange={e => updLine(i, 'description', e.target.value)} /></td>
                <td><input className="input" type="number" style={{ width: 70 }} value={li.qty} onChange={e => updLine(i, 'qty', Number(e.target.value))} /></td>
                <td><input className="input" type="number" style={{ width: 90 }} value={li.rate} onChange={e => updLine(i, 'rate', Number(e.target.value))} /></td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{li.amount.toLocaleString('en-IN')}</td>
                <td><button className="btn-icon" onClick={() => removeLine(i)}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn-secondary" onClick={addLine} style={{ marginBottom: 16 }}>+ Add Line</button>

        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <div className="field" style={{ width: 120 }}>
            <label className="label">Tax</label>
            <input className="input" type="number" value={editDoc.tax} onChange={e => {
              const tax = Number(e.target.value);
              setEditDoc({ ...editDoc, tax, total: editDoc.subtotal + tax });
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Subtotal: {editDoc.subtotal.toLocaleString('en-IN')}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700 }}>Total: {editDoc.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="field">
          <label className="label">Notes</label>
          <textarea className="input" rows={2} value={editDoc.notes} onChange={e => setEditDoc({ ...editDoc, notes: e.target.value })} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-primary" onClick={saveDoc}>Save</button>
          <button className="btn btn-secondary" onClick={() => { setView('list'); setEditDoc(null); }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h2>{greeting()}, Billing Team</h2>
      <p style={{ color: '#6B7280', marginTop: -8, marginBottom: 24 }}>Quotations and invoices</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`btn ${tab === 'quotation' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('quotation')}>Quotations ({store.quotations.length})</button>
        <button className={`btn ${tab === 'invoice' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('invoice')}>Invoices ({store.invoices.length})</button>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={startNew}>+ New {tab}</button>
      </div>

      {docs.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 8 }}>💳</div>
          <div>No {tab}s yet</div>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr><th>#</th><th>College</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {docs.map(d => (
              <tr key={d.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{d.number || '—'}</td>
                <td><strong>{d.college_name}</strong></td>
                <td>{formatDate(d.date)}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{d.total.toLocaleString('en-IN')}</td>
                <td>
                  <span className="pill" style={{
                    background: d.status === 'paid' ? '#DCFCE7' : d.status === 'sent' ? '#FEF3C7' : '#F3F4F6',
                    color: d.status === 'paid' ? '#166534' : d.status === 'sent' ? '#92400E' : '#6B7280',
                  }}>{d.status}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={() => startEdit(d)} title="Edit">✏️</button>
                    <button className="btn-icon" onClick={() => downloadDoc(d)} title="Download">⬇️</button>
                    <button className="btn-icon" onClick={() => deleteDoc(d.id)} title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BillingDash;
