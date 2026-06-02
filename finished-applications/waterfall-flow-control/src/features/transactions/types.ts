export interface Transaction {
  id: string;
  date: string;
  name: string;
  inflow: number;
  outflow: number;
  person: string;
  enabled: boolean;
  fin_chart_id?: string | null;
  created_at?: string;
  updated_at?: string;
  /** Running balance after this transaction (computed by UI) */
  balance?: number;
}

export interface Chart {
  id: string;
  name: string;
  created_at: string;
}
