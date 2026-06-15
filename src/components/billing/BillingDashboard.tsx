import React, { useState, useEffect } from 'react';
import { College, BillingDoc, BillingDocItem } from '../../types';
import { ProposalGenerator } from './ProposalGenerator';

interface BillingDashboardProps {
  data: { colleges: College[] };
  updateCollege: (id: string, fn: (c: College) => College) => void;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({ data, updateCollege }) => {
  const [tab, setTab] = useState<'quotations' | 'invoices' | 'proposals'>('quotations');
  const [docs, setDocs] = useState<{
    quotations: BillingDoc[];
    invoices: BillingDoc[];
    proposals: any[];
  }>({ quotations: [], invoices: [], proposals: [] });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BillingDoc | null>(null);

  // Sync with API database
  useEffect(() => {
    fetch('/api/billing')
      .then(res => res.json())
      .then(d => {
        setDocs({
          quotations: d.quotations || [],
          invoices: d.invoices || [],
          proposals: d.proposals || []
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const saveDocs = (newDocs: typeof docs) => {
    setDocs(newDocs);
    fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDocs)
    }).catch(err => console.error('Error auto-syncing billing doc data to API', err));
  };

  const STATUSES = {
    quotations: [
      { v: 'draft', l: '📝 Draft', c: '#6B7280', bg: '#F3F4F6' },
      { v: 'sent', l: '📤 Sent', c: '#3B5AA3', bg: '#EBF0FA' },
      { v: 'accepted', l: '✅ Accepted', c: '#2D7A4F', bg: '#E8F3EC' },
      { v: 'rejected', l: '❌ Rejected', c: '#DC2626', bg: '#FEF2F2' },
      { v: 'expired', l: '⏰ Expired', c: '#B8410A', bg: '#FFF7ED' }
    ],
    invoices: [
      { v: 'draft', l: '📝 Draft', c: '#6B7280', bg: '#F3F4F6' },
      { v: 'sent', l: '📤 Sent', c: '#3B5AA3', bg: '#EBF0FA' },
      { v: 'paid', l: '✅ Paid', c: '#2D7A4F', bg: '#E8F3EC' },
      { v: 'overdue', l: '🔴 Overdue', c: '#DC2626', bg: '#FEF2F2' },
      { v: 'partial', l: '🟡 Partial', c: '#B8410A', bg: '#FFF7ED' }
    ],
    proposals: [
      { v: 'draft', l: '📝 Draft', c: '#6B7280', bg: '#F3F4F6' },
      { v: 'sent', l: '📤 Sent', c: '#3B5AA3', bg: '#EBF0FA' },
      { v: 'accepted', l: '✅ Accepted', c: '#2D7A4F', bg: '#E8F3EC' },
      { v: 'rejected', l: '❌ Rejected', c: '#DC2626', bg: '#FEF2F2' },
      { v: 'revision', l: '🔄 Revision', c: '#6B46C1', bg: '#F2EDFB' }
    ]
  };

  const TAB_INFO = {
    quotations: { label: 'Quotations', icon: '📋', prefix: 'QT' },
    invoices: { label: 'Invoices', icon: '🧾', prefix: 'INV' },
    proposals: { label: 'Proposals', icon: '📄', prefix: 'PR' }
  };

  const list = docs[tab] || [];
  const info = TAB_INFO[tab];
  const statuses = STATUSES[tab];

  const newForm = (): BillingDoc => ({
    id: '',
    type: tab,
    college: '',
    contact_person: '',
    date: new Date().toISOString().slice(0, 10),
    valid_until: '',
    reference: info.prefix + '-' + String(list.length + 1).padStart(4, '0'),
    items: [{ description: 'Maths.Engineering Content Platform License', qty: '', rate: '', amount: '' }],
    subtotal: 0,
    gst: 18,
    total: 0,
    notes: '',
    payment_terms: '',
    status: 'draft',
    academic_year: '2025-2026',
    created_at: '',
    updated_at: ''
  });

  const openCreate = () => {
    setForm(newForm());
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (doc: BillingDoc) => {
    setForm({ ...doc });
    setEditId(doc.id);
    setShowForm(true);
  };

  const calcTotals = (items: BillingDocItem[], gst: number) => {
    const subtotal = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const gstAmt = subtotal * (parseFloat(gst as any) || 0) / 100;
    return { subtotal, total: subtotal + gstAmt };
  };

  const updItem = (idx: number, field: keyof BillingDocItem, val: string) => {
    if (!form) return;
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: val };
    if (field === 'qty' || field === 'rate') {
      items[idx].amount = ((parseFloat(items[idx].qty) || 0) * (parseFloat(items[idx].rate) || 0)).toFixed(2);
    }
    const { subtotal, total } = calcTotals(items, form.gst);
    setForm({ ...form, items, subtotal, total });
  };

  const addItem = () => {
    if (!form) return;
    setForm({ ...form, items: [...form.items, { description: '', qty: '', rate: '', amount: '' }] });
  };

  const removeItem = (idx: number) => {
    if (!form) return;
    const items = form.items.filter((_, i) => i !== idx);
    const { subtotal, total } = calcTotals(items, form.gst);
    setForm({ ...form, items, subtotal, total });
  };

  const saveDoc = () => {
    if (!form) return;
    if (!form.college || !form.date) {
      alert('College and date are required to save billing documents');
      return;
    }
    const { subtotal, total } = calcTotals(form.items, form.gst);
    const doc: BillingDoc = {
      ...form,
      subtotal,
      total,
      id: editId || (tab.slice(0, 3) + '_' + Date.now()),
      updated_at: new Date().toISOString()
    };
    if (!editId) doc.created_at = new Date().toISOString();
    const updated = editId ? list.map(d => d.id === editId ? doc : d) : [doc, ...list];
    saveDocs({ ...docs, [tab]: updated });
    setShowForm(false);
    setForm(null);
    setEditId(null);
  };

  const deleteDoc = (id: string) => {
    if (!confirm('Are you sure you want to delete this billing document?')) return;
    saveDocs({ ...docs, [tab]: list.filter(d => d.id !== id) });
  };

  const updateStatus = (id: string, status: string) => {
    saveDocs({ ...docs, [tab]: list.map(d => d.id === id ? { ...d, status, updated_at: new Date().toISOString() } : d) });
  };

  const downloadDoc = (doc: BillingDoc) => {
    const type = tab.slice(0, -1).toUpperCase();
    let html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + type + ' - ' + doc.reference + '</title>';
    html += '<style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#333}';
    html += '.header{display:flex;justify-content:space-between;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid #175CD3}';
    html += '.logo{font-size:24px;font-weight:bold;color:#175CD3}.doc-type{font-size:28px;font-weight:bold;color:#333;text-align:right}';
    html += '.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px}';
    html += '.info-box{padding:15px;background:#f8f9fa;border-radius:8px}.info-box h4{margin:0 0 8px;color:#666;font-size:12px;text-transform:uppercase}';
    html += '.info-box p{margin:0;font-size:14px}';
    html += 'table{width:100%;border-collapse:collapse;margin-bottom:20px}th{background:#175CD3;color:white;padding:10px;text-align:left;font-size:12px}';
    html += 'td{padding:10px;border-bottom:1px solid #eee;font-size:13px}.right{text-align:right}';
    html += '.totals{margin-left:auto;width:300px}.totals tr td{padding:6px 10px;font-size:13px}.totals .grand{font-size:16px;font-weight:bold;border-top:2px solid #333}';
    html += '.notes{margin-top:30px;padding:15px;background:#f0f7ff;border-radius:8px;font-size:13px}';
    html += '.footer{margin-top:40px;text-align:center;color:#999;font-size:11px;border-top:1px solid #eee;padding-top:15px}';
    html += '@media print{body{margin:0;padding:20px}}</style></head><body>';
    html += '<div class="header"><div class="logo">Maths.Engineering<br><span style="font-size:12px;color:#666;font-weight:normal">Promath Technology Pvt. Ltd.</span></div>';
    html += '<div class="doc-type">' + type + '<br><span style="font-size:14px;color:#666">' + doc.reference + '</span></div></div>';
    html += '<div class="info-grid">';
    html += '<div class="info-box"><h4>Bill To</h4><p><strong>' + doc.college + '</strong></p><p>' + (doc.contact_person || '') + '</p></div>';
    html += '<div class="info-box"><h4>Details</h4><p>Date: ' + doc.date + '</p>';
    if (doc.valid_until) html += '<p>Valid Until: ' + doc.valid_until + '</p>';
    html += '<p>Academic Year: ' + (doc.academic_year || '') + '</p></div></div>';
    html += '<table><thead><tr><th>#</th><th>Description</th><th class="right">Qty</th><th class="right">Rate (₹)</th><th class="right">Amount (₹)</th></tr></thead><tbody>';
    doc.items.forEach((item, i) => {
      html += '<tr><td>' + (i + 1) + '</td><td>' + item.description + '</td><td class="right">' + item.qty + '</td><td class="right">' + parseFloat(item.rate || '0').toLocaleString('en-IN') + '</td><td class="right">' + parseFloat(item.amount || '0').toLocaleString('en-IN') + '</td></tr>';
    });
    html += '</tbody></table>';
    html += '<table class="totals"><tr><td>Subtotal</td><td class="right">₹ ' + doc.subtotal.toLocaleString('en-IN') + '</td></tr>';
    html += '<tr><td>GST (' + doc.gst + '%)</td><td class="right">₹ ' + (doc.subtotal * doc.gst / 100).toLocaleString('en-IN') + '</td></tr>';
    html += '<tr class="grand"><td>Total</td><td class="right">₹ ' + doc.total.toLocaleString('en-IN') + '</td></tr></table>';
    if (doc.notes) html += '<div class="notes"><strong>Notes:</strong> ' + doc.notes + '</div>';
    if (doc.payment_terms) html += '<div class="notes"><strong>Payment Terms:</strong> ' + doc.payment_terms + '</div>';
    html += '<div class="footer">Promath Technology Pvt. Ltd. | Maths.Engineering | Generated on ' + new Date().toLocaleDateString('en-IN') + '</div>';
    html += '</body></html>';

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.reference + '_' + doc.college.replace(/[^a-zA-Z0-9]/g, '_') + '.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const inp = { width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '12px', background: 'white', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' as const };
  const lbl = { fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px', display: 'block' };

  // Calculate totals
  const totalVal = list.reduce((s, d) => s + (d.total || 0), 0);
  const draftCount = list.filter(d => d.status === 'draft').length;
  const sentCount = list.filter(d => d.status === 'sent').length;

  if (loading) {
    return <div className="p-12 text-center text-sm font-medium text-[var(--muted)]">Loading billing operations...</div>;
  }

  return (
    <div className="fade-in">
      <div className="header mb-6">
        <div>
          <h1>Billing & Accounts</h1>
          <div className="subtitle">Quotations, invoices & proposals generation</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        <div className="stat-card border border-[var(--border)] p-4 rounded-xl flex flex-col justify-between min-h-[110px] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-[var(--muted)] uppercase">Total Documents</span>
          <span className="text-3xl font-bold font-serif">{list.length}</span>
        </div>
        <div className="stat-card border border-[var(--border)] p-4 rounded-xl flex flex-col justify-between min-h-[110px] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-[var(--muted)] uppercase">Draft Docs</span>
          <span className="text-3xl font-bold font-serif">{draftCount}</span>
        </div>
        <div className="stat-card border border-[var(--border)] p-4 rounded-xl flex flex-col justify-between min-h-[110px] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-[var(--muted)] uppercase">Sent Docs</span>
          <span className="text-3xl font-bold font-serif">{sentCount}</span>
        </div>
        <div className="stat-card border border-[var(--border)] p-4 rounded-xl flex flex-col justify-between min-h-[110px] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-[var(--muted)] uppercase">Total Value (in INR)</span>
          <span className="text-2xl font-bold font-serif">₹ {Math.round(totalVal).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '6px', background: 'var(--surface)', borderRadius: '10px', padding: '5px', width: 'fit-content' }}>
          {(['quotations', 'invoices', 'proposals'] as const).map(k => (
            <button
              key={k}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                background: tab === k ? 'var(--accent)' : 'transparent',
                color: tab === k ? 'white' : 'var(--muted)',
                transition: 'all 0.15s'
              }}
              onClick={() => {
                setTab(k);
                setShowForm(false);
              }}
            >
              {TAB_INFO[k].icon} {TAB_INFO[k].label}
            </button>
          ))}
        </div>
        {tab !== 'proposals' && (
          <button
            onClick={openCreate}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--accent)',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + Create {info.label.slice(0, -1)}
          </button>
        )}
      </div>

      {tab === 'proposals' ? (
        <ProposalGenerator data={data} docs={docs} saveDocs={saveDocs} />
      ) : (
        <>
          {showForm && form && (
            <div className="card bg-white p-6 rounded-2xl border-2 border-[var(--accent)] mb-6 shadow-sm">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="serif" style={{ fontSize: '17px', fontWeight: 600 }}>
                  {editId ? 'Edit' : 'New'} {info.label.slice(0, -1)}
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setForm(null);
                    setEditId(null);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: 'var(--muted)'
                  }}
                >
                  ✕ Close
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={lbl}>College *</label>
                  <select
                    style={inp}
                    value={form.college}
                    onChange={e => setForm({ ...form, college: e.target.value })}
                  >
                    <option value="">— Select college —</option>
                    {data.colleges.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Contact Person</label>
                  <input
                    style={inp}
                    value={form.contact_person}
                    onChange={e => setForm({ ...form, contact_person: e.target.value })}
                    placeholder="Recipient's Name/Title"
                  />
                </div>
                <div>
                  <label style={lbl}>Reference No.</label>
                  <input
                    style={inp}
                    value={form.reference}
                    onChange={e => setForm({ ...form, reference: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={lbl}>Due/Execution Date *</label>
                  <input
                    type="date"
                    style={inp}
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <label style={lbl}>Validity/Extended date</label>
                  <input
                    type="date"
                    style={inp}
                    value={form.valid_until || ''}
                    onChange={e => setForm({ ...form, valid_until: e.target.value })}
                  />
                </div>
                <div>
                  <label style={lbl}>Academic Year</label>
                  <select
                    style={inp}
                    value={form.academic_year}
                    onChange={e => setForm({ ...form, academic_year: e.target.value })}
                  >
                    <option value="2024-2025">2024 – 2025</option>
                    <option value="2025-2026">2025 – 2026</option>
                    <option value="2026-2027">2026 – 2027</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...lbl, marginBottom: 0 }}>Itemized list</label>
                  <button
                    onClick={addItem}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--accent)',
                      background: 'white',
                      color: 'var(--accent)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    + Add row
                  </button>
                </div>
                <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr 1.5fr 1.5fr 40px', gap: '0', background: 'var(--surface-alt)', padding: '8px 12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Description</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textAlign: 'right' }}>Qty</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textAlign: 'right' }}>Rate (₹)</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textAlign: 'right' }}>Amount (₹)</div>
                    <div></div>
                  </div>
                  {form.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '4fr 1fr 1.5fr 1.5fr 40px',
                        gap: '8px',
                        padding: '8px 12px',
                        borderTop: '1px solid var(--border)',
                        alignItems: 'center'
                      }}
                    >
                      <input
                        style={{ ...inp, border: 'none', padding: '4px 0' }}
                        value={item.description}
                        onChange={e => updItem(idx, 'description', e.target.value)}
                        placeholder="Item detail"
                      />
                      <input
                        type="number"
                        style={{ ...inp, border: 'none', padding: '4px 0', textAlign: 'right' }}
                        value={item.qty}
                        onChange={e => updItem(idx, 'qty', e.target.value)}
                        placeholder="0"
                      />
                      <input
                        type="number"
                        style={{ ...inp, border: 'none', padding: '4px 0', textAlign: 'right' }}
                        value={item.rate}
                        onChange={e => updItem(idx, 'rate', e.target.value)}
                        placeholder="0"
                      />
                      <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                        ₹{parseFloat(item.amount || '0').toLocaleString('en-IN')}
                      </div>
                      {form.items.length > 1 && (
                        <button
                          onClick={() => removeItem(idx)}
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: 'none',
                            background: '#FEF2F2',
                            color: '#DC2626',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
                <div style={{ width: '280px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: 'var(--muted)' }}>
                    <span>Subtotal</span>
                    <span>₹ {calcTotals(form.items, form.gst).subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: 'var(--muted)', alignItems: 'center' }}>
                    <span>GST (CGST + SGST)</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        style={{ ...inp, width: '60px', textAlign: 'right' }}
                        value={form.gst}
                        onChange={e => setForm({ ...form, gst: parseFloat(e.target.value) || 0 })}
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      borderTop: '2px solid var(--ink)'
                    }}
                  >
                    <span>Total</span>
                    <span>₹ {calcTotals(form.items, form.gst).total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={lbl}>Notes & Terms</label>
                  <textarea
                    style={{ ...inp, minHeight: '60px', resize: 'vertical' }}
                    value={form.notes || ''}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Provide additional instructions..."
                  />
                </div>
                <div>
                  <label style={lbl}>Payment Schedule</label>
                  <textarea
                    style={{ ...inp, minHeight: '60px', resize: 'vertical' }}
                    value={form.payment_terms || ''}
                    onChange={e => setForm({ ...form, payment_terms: e.target.value })}
                    placeholder="e.g. 50% advance, 50% upon deployment rollout"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setForm(null);
                    setEditId(null);
                  }}
                  className="py-2 px-4 shadow-sm font-semibold border rounded-lg hover:bg-gray-50 text-xs text-[var(--muted)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={saveDoc}
                  className="py-2 px-5 font-semibold text-white bg-[var(--accent)] hover:opacity-95 shadow-lg shadow-indigo-50 border rounded-lg text-xs cursor-pointer"
                >
                  💾 Save Document
                </button>
              </div>
            </div>
          )}

          <div className="card bg-white p-0 rounded-2xl border border-[var(--border-soft)] shadow-sm overflow-hidden">
            {list.length === 0 ? (
              <div className="empty-state text-center py-12 text-[var(--muted)]">
                <div className="empty-state-icon text-3xl mb-2">{info.icon}</div>
                No {tab} records entered yet. Create one through the top right action button!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-[12px] bg-white text-[var(--ink)]">
                  <thead>
                    <tr className="bg-[var(--surface-alt)] border-b border-[var(--border)]">
                      <th className="py-3 px-4 font-semibold text-[var(--muted)] border-b border-[var(--border)] text-left">Ref</th>
                      <th className="py-3 px-4 font-semibold text-[var(--muted)] border-b border-[var(--border)] text-left">College</th>
                      <th className="py-3 px-4 font-semibold text-[var(--muted)] border-b border-[var(--border)] text-left">Due/Date</th>
                      <th className="py-3 px-4 font-semibold text-[var(--muted)] border-b border-[var(--border)] text-right">Amount (INR)</th>
                      <th className="py-3 px-4 font-semibold text-[var(--muted)] border-b border-[var(--border)] text-center">Status</th>
                      <th className="py-3 px-4 font-semibold text-[var(--muted)] border-b border-[var(--border)] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map(doc => {
                      const st = statuses.find(s => s.v === doc.status) || statuses[0];
                      return (
                        <tr key={doc.id} className="border-b border-[var(--border-soft)] hover:bg-[var(--surface-alt)]">
                          <td className="py-3 px-4 font-bold text-[var(--accent)]">{doc.reference}</td>
                          <td className="py-3 px-4 font-semibold">
                            {doc.college}
                            <span className="block text-[10px] text-[var(--muted)] font-normal mt-0.5">{doc.contact_person || ''}</span>
                          </td>
                          <td className="py-3 px-4 text-[var(--muted)] font-medium">
                            {doc.date}
                            {doc.valid_until && <span className="block text-[10px] opacity-80 mt-0.5">Valid: {doc.valid_until}</span>}
                          </td>
                          <td className="py-3 px-4 font-bold text-right text-sm">₹ {Math.round(doc.total || 0).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-center">
                            <select
                              value={doc.status}
                              onChange={e => updateStatus(doc.id, e.target.value)}
                              className="py-1 px-2 border rounded font-semibold text-[11px] cursor-pointer outline-none"
                              style={{ border: `1px solid ${st.c}44`, background: st.bg, color: st.c }}
                            >
                              {statuses.map(s => (
                                <option key={s.v} value={s.v}>
                                  {s.l}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => openEdit(doc)}
                                className="py-1 px-2 rounded border border-[var(--border)] hover:bg-gray-50 text-[10.5px] font-semibold text-[var(--ink)] cursor-pointer"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => downloadDoc(doc)}
                                className="py-1 px-2 rounded border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)] text-[10.5px] font-semibold cursor-pointer"
                              >
                                📥 Download
                              </button>
                              <button
                                onClick={() => deleteDoc(doc.id)}
                                className="py-1 px-2 rounded border border-red-200 bg-[#FEF3F2] text-[#B42318] text-[10.5px] font-semibold cursor-pointer hover:bg-red-100"
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
