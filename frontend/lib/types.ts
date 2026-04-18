export type LineItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type Invoice = {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  freelancerName: string;
  freelancerEmail: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paymentTerms: string;
  notes: string;
};
