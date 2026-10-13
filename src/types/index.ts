export type UserRole = 'org_admin' | 'area_manager' | 'store_manager' | 'sales_associate';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  currency: string;
  created_at: string;
}

export interface Store {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  location?: string | null;
  active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  active: boolean;
  store_id?: string | null; // Primary or current active store assignment
  created_at: string;
}

export interface StoreMember {
  id: string;
  store_id: string;
  profile_id: string;
  assignment_start: string;
  assignment_end?: string | null;
  active: boolean;
}

export interface SalesDaily {
  id: string;
  organization_id: string;
  store_id: string;
  sales_date: string;
  net_sales: number;
  target_amount?: number | null;
  transaction_count?: number | null;
  units_sold?: number | null;
  source_import_id?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  organization_id: string;
  store_id: string;
  transaction_ref: string;
  customer_id?: string | null;
  staff_id?: string | null;
  transaction_date: string;
  net_amount: number;
  units: number;
  currency: string;
  status: 'completed' | 'refunded' | 'cancelled';
  source_import_id?: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  organization_id: string;
  customer_ref: string;
  full_name: string;
  phone?: string | null;
  birthday?: string | null; // YYYY-MM-DD
  consent_status: 'opted_in' | 'opted_out' | 'pending';
  consent_source?: string | null;
  consent_updated_at?: string | null;
  do_not_contact: boolean;
  tier?: 'VIP' | 'Platinum' | 'Gold' | 'Regular';
  total_spend?: number;
  last_purchase_date?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CustomerAssignment {
  id: string;
  organization_id: string;
  customer_id: string;
  staff_id: string;
  store_id: string;
  assigned_by: string;
  active: boolean;
  created_at: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'snoozed';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskType = 
  | 'birthday_greeting'
  | 'vip_new_arrival'
  | 'inactive_reactivation'
  | 'appointment_prep'
  | 'after_sales_care'
  | 'customer_request';

export interface ClientelingTask {
  id: string;
  organization_id: string;
  store_id: string;
  customer_id: string;
  assigned_staff_id: string;
  created_by: string;
  task_type: TaskType;
  priority: TaskPriority;
  due_at: string;
  status: TaskStatus;
  recommended_action: string;
  notes?: string | null;
  completed_at?: string | null;
  outcome?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ClientelingInteraction {
  id: string;
  organization_id: string;
  customer_id: string;
  staff_id: string;
  task_id?: string | null;
  channel: 'whatsapp' | 'phone' | 'store_visit' | 'email';
  interaction_type: 'outreach' | 'customer_reply' | 'appointment' | 'feedback';
  interaction_date: string;
  outcome: 'positive' | 'neutral' | 'no_response' | 'declined' | 'opt_out';
  notes?: string | null;
  related_transaction_id?: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  organization_id: string;
  store_id: string;
  customer_id: string;
  staff_id: string;
  scheduled_at: string;
  status: 'scheduled' | 'attended' | 'cancelled' | 'no_show';
  outcome?: string | null;
  related_transaction_id?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface ImportJob {
  id: string;
  organization_id: string;
  uploaded_by: string;
  original_filename: string;
  file_type: 'store_daily_sales' | 'staff_sales' | 'transactions' | 'customer_master';
  file_hash: string;
  status: 'processing' | 'completed' | 'failed' | 'partial';
  row_count: number;
  success_count: number;
  error_count: number;
  mapping_config?: Record<string, string>;
  created_at: string;
  completed_at?: string | null;
}

export interface ImportRow {
  id: string;
  import_job_id: string;
  row_number: number;
  status: 'success' | 'failed';
  error_code?: string | null;
  error_message?: string | null;
  sanitized_payload?: Record<string, unknown> | null;
  created_at: string;
}

export interface AiInsightEvidence {
  metric: string;
  actual: number;
  comparison?: number | null;
  target?: number | null;
  unit: 'percent' | 'currency_idr' | 'count' | 'units';
  context?: string;
}

export interface AiInsight {
  id: string;
  organization_id: string;
  scope_type: 'store' | 'area' | 'staff';
  scope_id: string;
  insight_type: 'achievement_gap' | 'upt_drop' | 'atv_opportunity' | 'clienteling_boost' | 'coaching_needed';
  title: string;
  summary: string;
  period_start: string;
  period_end: string;
  evidence: AiInsightEvidence[];
  possible_explanations: string[];
  recommended_actions: string[];
  priority: 'urgent' | 'high' | 'medium' | 'low';
  limitations?: string[];
  model_version?: string | null;
  status: 'active' | 'archived' | 'actioned';
  generated_at: string;
  reviewed_by?: string | null;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface KpiSummary {
  actualSales: number;
  targetSales: number | null;
  salesAchievement: number | null; // % or null if no target
  salesGap: number | null; // target - actual
  transactionCount: number | null;
  unitsSold: number | null;
  atv: number | null; // net_sales / tx_count
  upt: number | null; // units_sold / tx_count
  averageDailySales: number | null;
  daysElapsed: number;
  totalDaysInPeriod: number;
  growthVsPrevious: number | null; // %
  forecastSales: number | null;
  forecastGap: number | null;
  forecastMethod: string;
}
