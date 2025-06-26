import { Address } from "./Address";

export interface Quote {
  id: number;
  Service: Service;
  description: string;
  quantity: number;
  dimensions?: string;
  status: string;
  colors?: string;
  desired_delivery_date?: string;
  created_at?: string;
  final_quote?: FinalQuote;
}
interface Service {
  id?: number;
  name: string;
}

interface FinalQuote {
  id: number;
  quote_requests_id: number;
  final_cost: number;
  final_delivery_date: string;
  status: string;
  payment_status: string;
  notes?: string;
  address?: Address;
  created_at?: string;
}