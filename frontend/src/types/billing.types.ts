export interface LineItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface BillingDoc {
  id: string;
  type: 'quotation' | 'invoice';
  number: string;
  college_name: string;
  contact_name: string;
  date: string;
  due_date?: string;
  line_items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  status: 'draft' | 'sent' | 'paid';
  created_at: string;
}

export interface ProposalDoc {
  id: string;
  college_id: string;
  college_name: string;
  contact_name: string;
  location: string;
  students: number;
  price_per_student: number;
  total_value: number;
  academic_year: string;
  features: string[];
  notes: string;
  created_at: string;
  proposal_number?: string;
  status?: string;
}

export interface BillingStore {
  quotations: BillingDoc[];
  invoices: BillingDoc[];
  proposals: ProposalDoc[];
}
