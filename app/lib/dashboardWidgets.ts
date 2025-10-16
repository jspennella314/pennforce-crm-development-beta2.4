// Dashboard widget definitions and utilities

export interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  category: 'metric' | 'chart' | 'list' | 'quick-action';
  size: 'small' | 'medium' | 'large' | 'full';
  defaultEnabled: boolean;
  order: number;
}

export const AVAILABLE_WIDGETS: WidgetConfig[] = [
  // Metric Widgets
  {
    id: 'pipeline-value',
    name: 'Pipeline Value',
    description: 'Total value of open opportunities',
    category: 'metric',
    size: 'small',
    defaultEnabled: true,
    order: 1,
  },
  {
    id: 'won-revenue',
    name: 'Won Revenue',
    description: 'Total revenue from won opportunities',
    category: 'metric',
    size: 'small',
    defaultEnabled: true,
    order: 2,
  },
  {
    id: 'win-rate',
    name: 'Win Rate',
    description: 'Percentage of won vs total opportunities',
    category: 'metric',
    size: 'small',
    defaultEnabled: true,
    order: 3,
  },
  {
    id: 'open-tasks',
    name: 'Open Tasks',
    description: 'Number of open and overdue tasks',
    category: 'metric',
    size: 'small',
    defaultEnabled: true,
    order: 4,
  },
  {
    id: 'total-accounts',
    name: 'Total Accounts',
    description: 'Total number of accounts',
    category: 'metric',
    size: 'small',
    defaultEnabled: true,
    order: 5,
  },
  {
    id: 'total-contacts',
    name: 'Total Contacts',
    description: 'Total number of contacts',
    category: 'metric',
    size: 'small',
    defaultEnabled: true,
    order: 6,
  },
  {
    id: 'total-aircraft',
    name: 'Total Aircraft',
    description: 'Total number of aircraft',
    category: 'metric',
    size: 'small',
    defaultEnabled: true,
    order: 7,
  },
  {
    id: 'task-completion',
    name: 'Task Completion Rate',
    description: 'Percentage of completed tasks',
    category: 'metric',
    size: 'small',
    defaultEnabled: true,
    order: 8,
  },

  // Chart Widgets
  {
    id: 'opportunity-trend',
    name: 'Opportunity Trend',
    description: 'Monthly opportunity count and value',
    category: 'chart',
    size: 'medium',
    defaultEnabled: true,
    order: 9,
  },
  {
    id: 'opportunities-by-stage',
    name: 'Opportunities by Stage',
    description: 'Distribution of opportunities across stages',
    category: 'chart',
    size: 'medium',
    defaultEnabled: true,
    order: 10,
  },
  {
    id: 'accounts-by-type',
    name: 'Accounts by Type',
    description: 'Distribution of accounts by type',
    category: 'chart',
    size: 'medium',
    defaultEnabled: true,
    order: 11,
  },
  {
    id: 'aircraft-by-status',
    name: 'Aircraft by Status',
    description: 'Distribution of aircraft by status',
    category: 'chart',
    size: 'medium',
    defaultEnabled: false,
    order: 12,
  },

  // List Widgets
  {
    id: 'recent-opportunities',
    name: 'Recent Opportunities',
    description: 'Most recently created opportunities',
    category: 'list',
    size: 'medium',
    defaultEnabled: true,
    order: 13,
  },
  {
    id: 'recent-activities',
    name: 'Recent Activities',
    description: 'Latest logged activities',
    category: 'list',
    size: 'medium',
    defaultEnabled: true,
    order: 14,
  },

  // Quick Actions
  {
    id: 'quick-actions',
    name: 'Quick Actions',
    description: 'Shortcuts to common tasks',
    category: 'quick-action',
    size: 'full',
    defaultEnabled: true,
    order: 15,
  },
];

export interface DashboardLayout {
  widgets: string[]; // Array of widget IDs
  customOrder?: Record<string, number>; // Custom ordering
}

export const DEFAULT_LAYOUT: DashboardLayout = {
  widgets: AVAILABLE_WIDGETS.filter((w) => w.defaultEnabled).map((w) => w.id),
};

// Helper to get widget by ID
export function getWidgetById(id: string): WidgetConfig | undefined {
  return AVAILABLE_WIDGETS.find((w) => w.id === id);
}

// Helper to get enabled widgets in order
export function getEnabledWidgets(layout: DashboardLayout): WidgetConfig[] {
  const widgets = layout.widgets
    .map((id) => getWidgetById(id))
    .filter(Boolean) as WidgetConfig[];

  // Apply custom order if provided
  if (layout.customOrder) {
    return widgets.sort((a, b) => {
      const orderA = layout.customOrder![a.id] ?? a.order;
      const orderB = layout.customOrder![b.id] ?? b.order;
      return orderA - orderB;
    });
  }

  return widgets.sort((a, b) => a.order - b.order);
}

// Helper to save layout to user preferences
export async function saveDashboardLayout(layout: DashboardLayout): Promise<void> {
  try {
    const response = await fetch('/api/user/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dashboardLayout: layout,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save dashboard layout');
    }
  } catch (error) {
    console.error('Error saving dashboard layout:', error);
    throw error;
  }
}

// Helper to load layout from user preferences
export async function loadDashboardLayout(): Promise<DashboardLayout> {
  try {
    const response = await fetch('/api/user/preferences');
    if (!response.ok) {
      return DEFAULT_LAYOUT;
    }

    const prefs = await response.json();
    return prefs.dashboardLayout || DEFAULT_LAYOUT;
  } catch (error) {
    console.error('Error loading dashboard layout:', error);
    return DEFAULT_LAYOUT;
  }
}
