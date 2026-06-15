import React, { useState } from 'react';
import { College, Proposal } from '../../types';

interface ProposalGeneratorProps {
  data: { colleges: College[] };
  docs: {
    quotations: any[];
    invoices: any[];
    proposals: Proposal[];
  };
  saveDocs: (newDocs: any) => void;
}

export const ProposalGenerator: React.FC<ProposalGeneratorProps> = ({ data, docs, saveDocs }) => {
  const [pf, setPf] = useState<Partial<Proposal>>({
    college: '',
    address: '',
    quote_no: 'B2B - TN - ' + String((docs.proposals || []).length + 1).padStart(4, '0'),
    quote_date: new Date().toISOString().slice(0, 10),
    type: 'with_app',
    m1_price: '500',
    m2_price: '500',
    m3_price: '600',
    m1_year: '2025-2026',
    m2_year: '2025-2026',
    m3_year: '2025-2026',
    include_m3: true,
    status: 'draft',
  });
  const [saved, setSaved] = useState(false);

  const propList = docs.proposals || [];

  const saveProp = () => {
    if (!pf.college) {
      alert('College name is required to save a proposal');
      return;
    }
    const prop: Proposal = {
      id: 'pr_' + Date.now(),
      college: pf.college || '',
      address: pf.address || '',
      quote_no: pf.quote_no || '',
      quote_date: pf.quote_date || '',
      type: (pf.type as any) || 'with_app',
      m1_price: pf.m1_price || '500',
      m2_price: pf.m2_price || '500',
      m3_price: pf.m3_price || '600',
      m1_year: pf.m1_year || '2025-2026',
      m2_year: pf.m2_year || '2025-2026',
      m3_year: pf.m3_year || '2025-2026',
      include_m3: pf.include_m3 !== false,
      status: pf.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [prop, ...propList];
    saveDocs({ ...docs, proposals: updated });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const deleteProp = (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;
    saveDocs({ ...docs, proposals: propList.filter(d => d.id !== id) });
  };

  const updatePropStatus = (id: string, status: string) => {
    saveDocs({
      ...docs,
      proposals: propList.map(d => (d.id === id ? { ...d, status, updated_at: new Date().toISOString() } : d)),
    });
  };

  const downloadProposal = (p: Partial<Proposal>) => {
    const col = p.college || 'Selected College';
    const addr = p.address || '';
    const withApp = p.type === 'with_app';
    let rows = '<tr><td style="padding:12px;border:1px solid #ddd;text-align:center">1</td><td style="padding:12px;border:1px solid #ddd">First Semester - M1</td><td style="padding:12px;border:1px solid #ddd;text-align:center">' + (p.m1_year || '2025-2026') + '</td><td style="padding:12px;border:1px solid #ddd;text-align:center">₹ ' + (p.m1_price || '***') + '</td></tr>';
    rows += '<tr><td style="padding:12px;border:1px solid #ddd;text-align:center">2</td><td style="padding:12px;border:1px solid #ddd">Second Semester - M2</td><td style="padding:12px;border:1px solid #ddd;text-align:center">' + (p.m2_year || '2025-2026') + '</td><td style="padding:12px;border:1px solid #ddd;text-align:center">₹ ' + (p.m2_price || '***') + '</td></tr>';
    if (p.include_m3) {
      rows += '<tr><td style="padding:12px;border:1px solid #ddd;text-align:center">3</td><td style="padding:12px;border:1px solid #ddd">Third Semester - M3</td><td style="padding:12px;border:1px solid #ddd;text-align:center">' + (p.m3_year || '2025-2026') + '</td><td style="padding:12px;border:1px solid #ddd;text-align:center">₹ ' + (p.m3_price || '***') + '</td></tr>';
    }

    let html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Proposal - ' + col + '</title>';
    html += '<style>body{font-family:Arial,sans-serif;max-width:850px;margin:0 auto;padding:20px;color:#333;line-height:1.7}';
    html += '.page{page-break-after:always;min-height:1100px;position:relative;padding-bottom:60px}';
    html += '.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:15px;border-bottom:3px solid #175CD3;margin-bottom:30px}';
    html += '.logo-text{font-size:20px;font-weight:bold;color:#175CD3}.logo-sub{font-size:11px;color:#666;margin-top:2px;line-height:1.4}';
    html += '.brand-badge{text-align:right;font-size:13px;color:#175CD3;font-weight:bold}';
    html += '.quote-info{text-align:right;margin-bottom:20px;font-size:14px;font-weight:bold;color:#333}';
    html += '.to-section{margin-bottom:30px;font-size:14px}.to-section strong{font-size:15px}';
    html += 'h2{color:#175CD3;font-size:18px;margin-top:30px;margin-bottom:12px}';
    html += 'ul{padding-left:20px}li{margin-bottom:10px;font-size:14px}';
    html += 'table.pricing{width:100%;border-collapse:collapse;margin:20px 0}table.pricing th{background:#175CD3;color:white;padding:12px;text-align:center;font-size:13px}';
    html += '.payment-terms{margin-top:20px;font-size:13px}.payment-terms p{margin:4px 0}';
    html += '.signature{text-align:right;margin-top:40px;font-size:14px}';
    html += '.conclusion{margin-top:20px;font-size:14px;line-height:1.8}';
    html += '.footer-bar{position:absolute;bottom:0;left:0;right:0;height:8px;background:linear-gradient(90deg,#2D7A4F,#175CD3)}';
    html += '@media print{.page{page-break-after:always}.footer-bar{position:fixed;bottom:0}}</style></head><body>';

    // PAGE 1
    html += '<div class="page"><div class="header"><div><div class="logo-text">PROMATH TECHNOLOGY PVT LTD</div><div class="logo-sub">3/4, 3rd Floor, Rams Apartments,<br>No.40, Vijayaraghava Road,<br>T.Nagar, Chennai - 600017.<br>+91 93609 22729<br>support@maths.engineering</div></div>';
    html += '<div class="brand-badge">MATHS<br>ENGINEERING<br><span style="font-size:11px;color:#666">www.maths.engineering</span></div></div>';
    html += '<div class="quote-info">QUOTE NO.: ' + p.quote_no + '<br>QUOTE DT.: ' + p.quote_date + '</div>';
    html += '<div class="to-section"><strong>To:</strong><br>' + col + ',<br>' + (addr || 'Address.') + '</div>';
    html += '<p style="font-size:15px"><strong>Dear Sir/Madam,</strong></p>';
    html += '<p style="font-size:14px">Thank you for the opportunity to collaborate with <strong>' + col + '</strong>.</p>';
    html += '<p style="font-size:14px">At Promath Technology, we are committed to enhancing the learning experience of students through our comprehensive <strong>Engineering Mathematics Content Platform,</strong> we aim to offer content that is designed to simplify complex topics, improve comprehension, and ultimately support academic success.</p>';
    html += '<div class="footer-bar"></div></div>';

    // PAGE 2
    html += '<div class="page"><div class="header"><div><div class="logo-text">PROMATH TECHNOLOGY PVT LTD</div><div class="logo-sub">3/4, 3rd Floor, Rams Apartments,<br>No.40, Vijayaraghava Road,<br>T.Nagar, Chennai - 600017.<br>+91 93609 22729<br>support@maths.engineering</div></div>';
    html += '<div class="brand-badge">MATHS<br>ENGINEERING<br><span style="font-size:11px;color:#666">www.maths.engineering</span></div></div>';
    html += '<h2>Course Coverage:</h2><ul>';
    html += '<li>Our content platform will cover <strong>All major engineering mathematics subjects</strong> designed for undergraduate engineering students <strong>as per your College Syllabus</strong></li>';
    html += '<li><strong>Interactive Learning Modules:</strong> Our platform uses <strong>engaging multimedia, such as videos, simulations, quizzes, and practice problems</strong>, to help students master engineering mathematics concepts.</li>';
    html += '<li><strong>Exam Preparation:</strong> We offer <strong>Revision content and Mock tests</strong> to help students prepare effectively for exams.</li></ul>';
    html += '<h2>Key Features:</h2><ul>';
    html += '<li><strong>Comprehensive Curriculum:</strong> Covering all relevant semesters of engineering mathematics.</li>';
    html += '<li><strong>Real-Time Feedback &amp; Progress Tracking:</strong> Continuous assessment tools to track student performance and provide immediate feedback.</li>';
    html += '<li><strong>24/7 Access &amp; Multi-Platform Availability -</strong> Students can access the platform anytime through the <strong>Android and iOS apps.</strong></li>';
    html += '<li><strong>Engagement:</strong> <strong>WhatsApp engagement</strong> and <strong>Calling students</strong> on behalf of faculty regarding reports, revisions, and syllabus completion.</li></ul>';
    html += '<h2>Support Services:</h2><ul>';
    html += '<li><strong>Training &amp; Onboarding for Faculty:</strong> We offer training sessions for faculty to help them integrate our content platform into their teaching.</li></ul>';
    if (withApp) {
      html += '<h2>Value-added offerings</h2>';
      html += '<p><strong>White-Label Mobile App</strong> – We will develop and provide an exclusive Android Mobile App under your college\'s name, accessible only to your students and faculty.</p>';
    }
    html += '<div class="footer-bar"></div></div>';

    // PAGE 3
    html += '<div class="page"><div class="header"><div><div class="logo-text">PROMATH TECHNOLOGY PVT LTD</div><div class="logo-sub">3/4, 3rd Floor, Rams Apartments,<br>No.40, Vijayaraghava Road,<br>T.Nagar, Chennai - 600017.<br>+91 93609 22729<br>support@maths.engineering</div></div>';
    html += '<div class="brand-badge">MATHS<br>ENGINEERING<br><span style="font-size:11px;color:#666">www.maths.engineering</span></div></div>';
    html += '<h2 style="text-align:center">Quotation for Engineering Mathematics Content Delivery</h2>';
    html += '<table class="pricing"><thead><tr><th>Sl.No</th><th>Course Description</th><th>Academic Year</th><th>Cost Per Student<br>Per Semester (INR)</th></tr></thead><tbody>';
    html += rows;
    html += '</tbody></table>';
    html += '<div class="conclusion"><h2>Conclusion</h2>';
    html += '<p>We believe that our platform will provide <strong>' + col + '</strong> students with the tools they need to succeed in their engineering mathematics courses. We are excited about the possibility of working together to improve the learning experience and support academic achievement.</p>';
    html += '<p>We look forward to your response and are happy to discuss any further details or answer any queries you may have.</p></div>';
    html += '<div class="signature"><strong>Best regards,</strong><br><br>For <strong>Promath Technology</strong><br><br><em>Authorised Signatory</em></div>';
    html += '<div class="payment-terms"><h2>Payment Terms</h2>';
    html += '<p><strong>Price:</strong> GST will be added as applicable.</p>';
    html += '<p><strong>Validity:</strong> This quote is valid for 15 days.</p>';
    html += '<p><strong>Delivery Timeline:</strong> Content will be delivered within a week after order confirmation.</p></div>';
    html += '<div class="footer-bar"></div></div>';
    html += '</body></html>';

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Proposal_' + col.replace(/[^a-zA-Z0-9]/g, '_') + '.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const inp = { width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '12px', background: 'white', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' as const };
  const lbl = { fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px', display: 'block' };
  const PROP_STATUSES = [
    { v: 'draft', l: '📝 Draft', c: '#6B7280', bg: '#F3F4F6' },
    { v: 'sent', l: '📤 Sent', c: '#3B5AA3', bg: '#EBF0FA' },
    { v: 'accepted', l: '✅ Accepted', c: '#2D7A4F', bg: '#E8F3EC' },
    { v: 'rejected', l: '❌ Rejected', c: '#DC2626', bg: '#FEF2F2' },
    { v: 'revision', l: '🔄 Revision', c: '#6B46C1', bg: '#F2EDFB' },
  ];

  return (
    <div style={{ display: 'grid', gap: '16px' }} className="fade-in">
      <div className="card bg-white p-6 rounded-2xl border border-[var(--border)] shadow-xs">
        <div className="serif text-[17px] font-semibold mb-4 leading-tight">Generate B2B Proposal Document</div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={lbl}>College *</label>
            <select
              style={inp}
              value={pf.college}
              onChange={e => {
                const col = data.colleges.find(c => c.name === e.target.value);
                setPf({ ...pf, college: e.target.value, address: col ? col.location : '' });
              }}
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
            <label style={lbl}>Address</label>
            <input
              style={inp}
              value={pf.address || ''}
              onChange={e => setPf({ ...pf, address: e.target.value })}
              placeholder="e.g. T.Nagar, Chennai"
            />
          </div>
          <div>
            <label style={lbl}>Quote No.</label>
            <input
              style={inp}
              value={pf.quote_no || ''}
              onChange={e => setPf({ ...pf, quote_no: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={lbl}>Quote Date</label>
            <input
              type="date"
              style={inp}
              value={pf.quote_date}
              onChange={e => setPf({ ...pf, quote_date: e.target.value })}
            />
          </div>
          <div>
            <label style={lbl}>Layout & Service Type</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['with_app', 'without_app'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setPf({ ...pf, type: v })}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '2px solid',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderColor: pf.type === v ? '#0E7490' : 'var(--border)',
                    background: pf.type === v ? '#ECFEFF' : 'white',
                    color: pf.type === v ? '#0E7490' : 'var(--muted)',
                  }}
                >
                  {v === 'with_app' ? '📱 With App' : '📄 Without App'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ ...lbl, marginBottom: '8px' }}>Semester pricing index (per student per semester in INR)</label>
          <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '50px 2fr 1.5fr 1.5fr', background: 'var(--surface-alt)', padding: '8px 12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Sl.</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Semester Term</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textAlign: 'center' }}>Academic Year</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textAlign: 'center' }}>Price (₹)</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '50px 2fr 1.5fr 1.5fr', padding: '8px 12px', borderTop: '1px solid var(--border)', alignItems: 'center', background: 'white' }}>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>1</div>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>First Semester - M1</div>
              <select style={{ ...inp, textAlign: 'center' }} value={pf.m1_year} onChange={e => setPf({ ...pf, m1_year: e.target.value })}><option>2024-2025</option><option>2025-2026</option><option>2026-2027</option></select>
              <input style={{ ...inp, textAlign: 'center' }} value={pf.m1_price} onChange={e => setPf({ ...pf, m1_price: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '50px 2fr 1.5fr 1.5fr', padding: '8px 12px', borderTop: '1px solid var(--border)', alignItems: 'center', background: 'white' }}>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>2</div>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>Second Semester - M2</div>
              <select style={{ ...inp, textAlign: 'center' }} value={pf.m2_year} onChange={e => setPf({ ...pf, m2_year: e.target.value })}><option>2024-2025</option><option>2025-2026</option><option>2026-2027</option></select>
              <input style={{ ...inp, textAlign: 'center' }} value={pf.m2_price} onChange={e => setPf({ ...pf, m2_price: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '50px 2fr 1.5fr 1.5fr', padding: '8px 12px', borderTop: '1px solid var(--border)', alignItems: 'center', background: 'white', opacity: pf.include_m3 ? 1 : 0.45 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="checkbox" checked={pf.include_m3 !== false} onChange={e => setPf({ ...pf, include_m3: e.target.checked })} style={{ cursor: 'pointer' }} />
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>3</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>Third Semester - M3</div>
              <select style={{ ...inp, textAlign: 'center' }} value={pf.m3_year} onChange={e => setPf({ ...pf, m3_year: e.target.value })} disabled={pf.include_m3 === false}><option>2024-2025</option><option>2025-2026</option><option>2026-2027</option></select>
              <input style={{ ...inp, textAlign: 'center' }} value={pf.m3_price} onChange={e => setPf({ ...pf, m3_price: e.target.value })} disabled={pf.include_m3 === false} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
          {saved && <div style={{ padding: '8px 14px', borderRadius: '8px', background: '#E8F3EC', color: '#2D7A4F', fontSize: '12px', fontWeight: 600 }}>✅ Proposal saved in CRM database!</div>}
          <button
            onClick={saveProp}
            className="py-2.5 px-4 rounded-xl border border-[var(--accent)] hover:bg-[#EFF4FF] font-semibold text-xs text-[var(--accent)] cursor-pointer"
          >
            💾 Save Proposal
          </button>
          <button
            onClick={() => downloadProposal(pf)}
            disabled={!pf.college}
            className={`py-2.5 px-5 font-semibold text-xs text-white border-0 rounded-xl transition shadow-xs ${pf.college ? 'bg-[var(--accent)] hover:opacity-95 cursor-pointer' : 'bg-gray-200 cursor-not-allowed'}`}
          >
            📥 Download Document (PR)
          </button>
        </div>
      </div>

      <div className="card bg-white p-0 rounded-2xl border border-[var(--border-soft)] shadow-xs overflow-hidden mt-6">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="serif text-[15px] font-semibold">Saved B2B Proposals</div>
        </div>
        {propList.length === 0 ? (
          <div className="empty-state text-center py-10 text-[var(--muted)]">
            <div className="empty-state-icon text-2xl mb-2">📄</div>No proposals saved previously. Build one above and tap "Save Proposal".
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-[12px] bg-white text-[var(--ink)]">
            <thead>
              <tr className="bg-[var(--surface-alt)] border-b border-[var(--border)]">
                <th className="py-3 px-4 font-semibold text-[var(--muted)] border-b border-[var(--border)] text-left">Ref</th>
                <th className="py-3 px-4 font-semibold text-[var(--muted)] border-b border-[var(--border)] text-left">College Name</th>
                <th className="py-3 px-4 font-semibold text-[var(--muted)] border-b border-[var(--border)] text-center">Type</th>
                <th className="py-3 px-4 font-semibold text-[var(--muted)] border-b border-[var(--border)] text-center">Date</th>
                <th className="py-3 px-4 font-semibold text-[var(--muted)] border-b border-[var(--border)] text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-[var(--muted)] border-b border-[var(--border)] text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {propList.map(p => {
                const st = PROP_STATUSES.find(s => s.v === p.status) || PROP_STATUSES[0];
                return (
                  <tr key={p.id} className="border-b border-[var(--border-soft)] hover:bg-[var(--surface-alt)]">
                    <td className="py-3 px-4 font-bold text-[var(--accent)]">{p.quote_no}</td>
                    <td className="py-3 px-4 font-semibold">{p.college}</td>
                    <td className="py-3 px-4 text-center font-semibold text-[11px]" style={{ color: p.type === 'with_app' ? '#0E7490' : '#6B7280' }}>
                      {p.type === 'with_app' ? '📱 With App' : '📄 Without App'}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-500 font-medium">{p.quote_date}</td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={p.status}
                        onChange={e => updatePropStatus(p.id, e.target.value)}
                        className="py-1 px-2 border rounded font-semibold text-[11px] cursor-pointer outline-none"
                        style={{ border: `1px solid ${st.c}44`, background: st.bg, color: st.c }}
                      >
                        {PROP_STATUSES.map(s => (
                          <option key={s.v} value={s.v}>
                            {s.l}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => downloadProposal(p)}
                          className="py-1 px-2.5 rounded border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)] text-[10.5px] font-semibold cursor-pointer"
                        >
                          👁️ View / Print
                        </button>
                        <button
                          onClick={() => deleteProp(p.id)}
                          className="py-1 px-2.5 rounded border border-red-200 bg-[#FEF3F2] text-[#B42318] text-[10.5px] font-semibold cursor-pointer hover:bg-red-100"
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
        )}
      </div>
    </div>
  );
};
