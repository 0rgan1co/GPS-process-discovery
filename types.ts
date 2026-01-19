
export interface ProcessNode {
  id: string;
  label: string;
  category?: string; // New field for high-level grouping
  x?: number;
  y?: number;
}

export interface ProcessLink {
  source: string;
  target: string;
  weight: number;
  avgDuration?: number; // Optional: to detect time-based bottlenecks
}

export interface WasteMetric {
  category: string;
  score: number;
  example: string;
}

export interface DoraMetrics {
  deploymentFrequency: string;
  leadTime: string;
  failureRate: string;
  timeToRestore: string;
}

export interface CustomMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  color: string;
}

export interface Initiative {
  id: string;
  title: string;
  status: 'pending' | 'active' | 'completed';
  progress: number;
  impact: 'low' | 'medium' | 'high';
  owner: string;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  nodes: ProcessNode[];
  links: ProcessLink[];
  stats: {
    events: number;
    cases: number;
    activities: number;
    medianDuration: string;
    meanDuration: string;
    start: string;
    end: string;
    efficiency: number;
    roi: string;
    throughput: string;
  };
  wastes: WasteMetric[];
  dora?: DoraMetrics;
  customMetrics?: CustomMetric[];
  initiatives?: Initiative[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isAudio?: boolean;
}
