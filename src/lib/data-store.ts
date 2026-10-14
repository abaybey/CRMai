import {
  Organization,
  Store,
  Profile,
  SalesDaily,
  Customer,
  ClientelingTask,
  ClientelingInteraction,
  Appointment,
  AiInsight,
  KpiSummary,
  UserRole,
} from '@/types';
import {
  DEMO_ORGANIZATION,
  DEMO_STORES,
  DEMO_PROFILES,
  generateDemoDsrData,
  DEMO_CUSTOMERS,
  DEMO_TASKS,
  DEMO_APPOINTMENTS,
  DEMO_INTERACTIONS,
  DEMO_AI_INSIGHTS,
} from './demo-data';
import { summarizeSales } from './kpi';
import { buildStoreEvidence } from './ai-engine';

class RetailDataStore {
  private organization: Organization = DEMO_ORGANIZATION;
  private stores: Store[] = [...DEMO_STORES];
  private profiles: Profile[] = [...DEMO_PROFILES];
  private salesDaily: SalesDaily[] = generateDemoDsrData();
  private customers: Customer[] = [...DEMO_CUSTOMERS];
  private tasks: ClientelingTask[] = [...DEMO_TASKS];
  private appointments: Appointment[] = [...DEMO_APPOINTMENTS];
  private interactions: ClientelingInteraction[] = [...DEMO_INTERACTIONS];
  private insights: AiInsight[] = [...DEMO_AI_INSIGHTS];

  // Current session state: Focused on Plaza Senayan Boutique
  private currentProfileId: string = DEMO_PROFILES[1].id; // Default to Store Manager (Diana Putri)
  private selectedStoreId: string = '10000000-0000-0000-0000-000000000003'; // Plaza Senayan (ST-PS-03)

  constructor() {
    // Note: Do not load localStorage synchronously here to prevent SSR hydration mismatch.
    // Call loadFromStorage explicitly in client-side useEffect.
  }

  public loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('retail_os_store_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.salesDaily) this.salesDaily = parsed.salesDaily;
        if (parsed.tasks) this.tasks = parsed.tasks;
        if (parsed.interactions) this.interactions = parsed.interactions;
        if (parsed.appointments) this.appointments = parsed.appointments;
        if (parsed.currentProfileId) this.currentProfileId = parsed.currentProfileId;
        if (parsed.selectedStoreId) this.selectedStoreId = parsed.selectedStoreId;
      }
    } catch {
      // Fallback to in-memory state
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        'retail_os_store_v1',
        JSON.stringify({
          salesDaily: this.salesDaily,
          tasks: this.tasks,
          interactions: this.interactions,
          appointments: this.appointments,
          currentProfileId: this.currentProfileId,
          selectedStoreId: this.selectedStoreId,
        })
      );
    } catch {
      // Ignore
    }
  }

  public resetDemoData() {
    this.salesDaily = generateDemoDsrData();
    this.customers = [...DEMO_CUSTOMERS];
    this.tasks = [...DEMO_TASKS];
    this.appointments = [...DEMO_APPOINTMENTS];
    this.interactions = [...DEMO_INTERACTIONS];
    this.insights = [...DEMO_AI_INSIGHTS];
    this.saveToStorage();
  }

  // Current Profile & Role management
  public getCurrentProfile(): Profile {
    return this.profiles.find(p => p.id === this.currentProfileId) || this.profiles[0];
  }

  public setCurrentProfile(profileId: string) {
    const profile = this.profiles.find(p => p.id === profileId);
    if (profile) {
      this.currentProfileId = profileId;
      if (profile.role === 'store_manager' || profile.role === 'sales_associate') {
        this.selectedStoreId = profile.store_id || this.stores[0].id;
      } else {
        this.selectedStoreId = 'all';
      }
      this.saveToStorage();
    }
  }

  public getProfiles(): Profile[] {
    return [...this.profiles];
  }

  public getStores(): Store[] {
    const profile = this.getCurrentProfile();
    if (profile.role === 'area_manager' || profile.role === 'org_admin') {
      return [...this.stores];
    }
    // Store Manager / SA only see their assigned store
    return this.stores.filter(s => s.id === profile.store_id);
  }

  public getSelectedStoreId(): string {
    const profile = this.getCurrentProfile();
    if (profile.role === 'store_manager' || profile.role === 'sales_associate') {
      return profile.store_id || this.stores[0].id;
    }
    return this.selectedStoreId;
  }

  public setSelectedStoreId(storeId: string) {
    this.selectedStoreId = storeId;
    this.saveToStorage();
  }

  // DSR Sales Querying
  public getSalesDaily(storeId?: string, startDate?: string, endDate?: string): SalesDaily[] {
    return this.salesDaily.filter(record => {
      if (storeId && storeId !== 'all' && record.store_id !== storeId) return false;
      if (startDate && record.sales_date < startDate) return false;
      if (endDate && record.sales_date > endDate) return false;
      return true;
    });
  }

  public addSalesDailyBatch(records: Omit<SalesDaily, 'id' | 'created_at'>[]): number {
    let added = 0;
    records.forEach(rec => {
      // Upsert by store_id and sales_date
      const existingIdx = this.salesDaily.findIndex(
        s => s.store_id === rec.store_id && s.sales_date === rec.sales_date
      );
      if (existingIdx >= 0) {
        this.salesDaily[existingIdx] = {
          ...this.salesDaily[existingIdx],
          ...rec,
          updated_at: new Date().toISOString(),
        };
      } else {
        this.salesDaily.push({
          ...rec,
          id: `dsr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          created_at: new Date().toISOString(),
        });
        added++;
      }
    });
    this.saveToStorage();
    return added;
  }

  public getKpiSummary(storeId?: string, startDate = '2026-10-01', endDate = '2026-10-14'): KpiSummary {
    const records = this.getSalesDaily(storeId, startDate, endDate);
    const daysElapsed = 14;
    const totalDaysInPeriod = 31;
    // Comparison baseline (previous month or period ~90% of target)
    const prevEstimate = storeId && storeId !== 'all' ? 850_000_000 : 2_400_000_000;
    return summarizeSales(records, daysElapsed, totalDaysInPeriod, prevEstimate);
  }

  // Customers Querying with strict Access Control
  public getCustomers(forProfile?: Profile): Customer[] {
    const profile = forProfile || this.getCurrentProfile();

    if (profile.role === 'sales_associate') {
      // SA can ONLY see customers assigned to them
      if (profile.id === '20000000-0000-0000-0000-000000000003') {
        // Muhamad Ridwan Saputra
        return this.customers.filter(c => c.customer_ref === 'CUST-001' || c.customer_ref === 'CUST-002');
      } else if (profile.id === '20000000-0000-0000-0000-000000000004') {
        // Keisha Suhendra
        return this.customers.filter(c => c.customer_ref === 'CUST-003' || c.customer_ref === 'CUST-004');
      }
      return this.customers.slice(0, 2);
    }

    // Area & Store Managers see all customers
    return [...this.customers];
  }

  public getCustomerById(id: string, forProfile?: Profile): Customer | undefined {
    const customers = this.getCustomers(forProfile);
    return customers.find(c => c.id === id);
  }

  // Tasks Management
  public getTasks(forProfile?: Profile): ClientelingTask[] {
    const profile = forProfile || this.getCurrentProfile();

    if (profile.role === 'sales_associate') {
      // Only personal tasks
      return this.tasks.filter(t => t.assigned_staff_id === profile.id);
    } else if (profile.role === 'store_manager') {
      // Store tasks
      return this.tasks.filter(t => t.store_id === profile.store_id);
    }
    // Area Manager & Org Admin: all tasks
    return [...this.tasks];
  }

  public updateTaskStatus(taskId: string, status: ClientelingTask['status'], outcome?: string): boolean {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return false;

    task.status = status;
    if (outcome) task.outcome = outcome;
    if (status === 'completed') {
      task.completed_at = new Date().toISOString();
    }
    this.saveToStorage();
    return true;
  }

  public addTask(task: Omit<ClientelingTask, 'id' | 'created_at' | 'updated_at'>): ClientelingTask {
    const newTask: ClientelingTask = {
      ...task,
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);
    this.saveToStorage();
    return newTask;
  }

  // Interactions Logging
  public logInteraction(interaction: Omit<ClientelingInteraction, 'id' | 'created_at'>): ClientelingInteraction {
    const newInt: ClientelingInteraction = {
      ...interaction,
      id: `int-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.interactions.unshift(newInt);
    this.saveToStorage();
    return newInt;
  }

  public getInteractions(customerId?: string): ClientelingInteraction[] {
    if (customerId) {
      return this.interactions.filter(i => i.customer_id === customerId);
    }
    return [...this.interactions];
  }

  // Appointments
  public getAppointments(storeId?: string): Appointment[] {
    const profile = this.getCurrentProfile();
    return this.appointments.filter(app => {
      if (profile.role === 'sales_associate' && app.staff_id !== profile.id) return false;
      if (storeId && storeId !== 'all' && app.store_id !== storeId) return false;
      return true;
    });
  }

  // AI Insights Generation & Access
  public getAiInsights(storeId?: string): AiInsight[] {
    const stores = this.getStores();
    const insights: AiInsight[] = [];

    stores.forEach(store => {
      if (storeId && storeId !== 'all' && store.id !== storeId) return;
      const kpi = this.getKpiSummary(store.id);
      const insight = buildStoreEvidence(store, kpi, '2026-10-01', '2026-10-14');
      insights.push(insight);
    });

    return insights;
  }
}

export const retailDataStore = new RetailDataStore();
