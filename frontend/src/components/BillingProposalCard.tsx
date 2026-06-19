import type { ProposalDoc } from '../types/billing.types';

interface BillingProposalCardProps {
  proposal: ProposalDoc;
  onEdit: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export function BillingProposalCard({ proposal, onEdit, onDownload, onDelete }: BillingProposalCardProps) {
  return (
    <article className="card card-hover">
      <div className="page-heading">
        <div>
          <strong>{proposal.college_name}</strong>
          <p>{proposal.contact_name} · {proposal.location} · {proposal.academic_year}</p>
          <div className="filter-pills">
            {proposal.features.slice(0, 4).map(feature => <span key={feature} className="pill">{feature}</span>)}
            {proposal.features.length > 4 && <span className="pill">+{proposal.features.length - 4} more</span>}
          </div>
        </div>
        <div>
          <div className="mono">₹{proposal.total_value.toLocaleString('en-IN')}</div>
          <div className="state-message">{proposal.students} students @ ₹{proposal.price_per_student}</div>
          <div className="page-actions">
            <button className="btn-icon" onClick={onEdit} title="Edit">✎</button>
            <button className="btn-icon" onClick={onDownload} title="Download">⇩</button>
            <button className="btn-icon" onClick={onDelete} title="Delete">⌫</button>
          </div>
        </div>
      </div>
    </article>
  );
}
