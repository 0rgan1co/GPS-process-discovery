
import { Dataset, WasteMetric } from './types';

const LOW_WASTE = (over: number, inv: number, wait: number, proc: number, corr: number, mot: number, trans: number, people: number): WasteMetric[] => [
  { category: 'Overproducing', score: over, example: 'Ajustado a demanda.' },
  { category: 'Inventory', score: inv, example: 'Flujo continuo.' },
  { category: 'Waiting', score: wait, example: 'Sincronización total.' },
  { category: 'Extra Processing', score: proc, example: 'Zero redundancia.' },
  { category: 'Correction', score: corr, example: 'Error < 1%.' },
  { category: 'Excess Motion', score: mot, example: 'Herramientas unificadas.' },
  { category: 'Transportation', score: trans, example: 'Transferencia instantánea.' },
  { category: 'Underutilized People', score: people, example: 'Foco en valor.' },
];

const HIGH_WASTE = (over: number, inv: number, wait: number, proc: number, corr: number, mot: number, trans: number, people: number): WasteMetric[] => [
  { category: 'Overproducing', score: over, example: 'Informes duplicados.' },
  { category: 'Inventory', score: inv, example: 'Cuellos de botella.' },
  { category: 'Waiting', score: wait, example: 'Aprobaciones lentas.' },
  { category: 'Extra Processing', score: proc, example: 'Data-entry manual.' },
  { category: 'Correction', score: corr, example: 'Alta tasa rechazo.' },
  { category: 'Excess Motion', score: mot, example: 'Multi-sistemas.' },
  { category: 'Transportation', score: trans, example: 'Silos inconexos.' },
  { category: 'Underutilized People', score: people, example: 'Talento desperdiciado.' },
];

export interface DemoConfig {
  id: string;
  name: string;
  csvPath: string;
  description: string;
  wastes: WasteMetric[];
  dora: any;
  baseStats: any;
}

export const DEMO_CONFIGS: DemoConfig[] = [
  {
    id: 'hr-onboarding',
    name: '[RRHH] Onboarding de Talento',
    csvPath: '/data/hr_onboarding.csv',
    description: 'Proceso de incorporación desde oferta hasta integración total.',
    wastes: HIGH_WASTE(5, 30, 85, 40, 10, 20, 10, 45),
    dora: { deploymentFrequency: 'Baja', leadTime: '396 hrs', failureRate: '8%', timeToRestore: '48 hrs' },
    baseStats: { efficiency: 58, roi: '$12k/mo', throughput: '3.3 onboarding/día' }
  },
  {
    id: 'supply-chain-proc',
    name: '[COMPRAS] Cadena de Suministro',
    csvPath: '/data/supply_chain.csv',
    description: 'Adquisición de insumos críticos para producción.',
    wastes: LOW_WASTE(2, 45, 40, 15, 5, 10, 60, 10),
    dora: { deploymentFrequency: 'Media', leadTime: '172 hrs', failureRate: '3%', timeToRestore: '24 hrs' },
    baseStats: { efficiency: 74, roi: '$35k/mo', throughput: '18 PO/día' }
  },
  {
    id: 'risk-analysis-flow',
    name: '[RIESGOS] Análisis de Riesgo Crédito',
    csvPath: '/data/risk_analysis.csv',
    description: 'Evaluación técnica de solvencia para clientes B2B.',
    wastes: HIGH_WASTE(10, 50, 95, 30, 15, 25, 5, 35),
    dora: { deploymentFrequency: 'Media', leadTime: '94 hrs', failureRate: '15%', timeToRestore: '72 hrs' },
    baseStats: { efficiency: 42, roi: '$90k/mo', throughput: '13 dictámenes/día' }
  },
  {
    id: 'manufacturing-flow',
    name: '[FÁBRICA] Línea de Ensamble',
    csvPath: '/data/manufacturing.csv',
    description: 'Monitoreo de tiempos en celda de manufactura robotizada.',
    wastes: LOW_WASTE(5, 10, 15, 5, 2, 5, 30, 5),
    dora: { deploymentFrequency: 'Elite', leadTime: '0.8 hrs', failureRate: '0.5%', timeToRestore: '15 min' },
    baseStats: { efficiency: 91, roi: '$240k/mo', throughput: '40 unidades/hr' }
  },
  {
    id: 'it-support-tickets',
    name: '[IT] Resolución de Incidencias',
    csvPath: '/data/it_support.csv',
    description: 'Flujo de soporte técnico N1 a N3 para servicios cloud.',
    wastes: HIGH_WASTE(0, 15, 65, 20, 25, 10, 5, 20),
    dora: { deploymentFrequency: 'Media', leadTime: '57.6 hrs', failureRate: '12%', timeToRestore: '8 hrs' },
    baseStats: { efficiency: 66, roi: '$48k/mo', throughput: '16 tickets/día' }
  }
];

export const EXAMPLE_DATASETS: Dataset[] = [];
