
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

export const EXAMPLE_DATASETS: Dataset[] = [
  {
    id: 'hr-onboarding',
    name: '[RRHH] Onboarding de Talento',
    description: 'Proceso de incorporación desde oferta hasta integración total.',
    nodes: [
      { id: '1', label: 'Oferta Aceptada', category: 'ADMIN' },
      { id: '2', label: 'Verificación Documental', category: 'ADMIN' },
      { id: '3', label: 'Firma de Contrato', category: 'ADMIN' },
      { id: '4', label: 'Solicitud IT (Cuentas/Hardware)', category: 'OPS' },
      { id: '5', label: 'Bienvenida Corporativa', category: 'CULTURA' },
      { id: '6', label: 'Training de Puesto', category: 'TALENTO' },
      { id: '7', label: 'Evaluación Mes 1', category: 'TALENTO' }
    ],
    links: [
      { source: '1', target: '2', weight: 100 },
      { source: '2', target: '3', weight: 98 },
      { source: '3', target: '4', weight: 95 },
      { source: '4', target: '5', weight: 92 },
      { source: '5', target: '6', weight: 92 },
      { source: '6', target: '7', weight: 90 }
    ],
    stats: { 
      events: 700, cases: 100, activities: 7,
      medianDuration: '14 días', meanDuration: '16.5 días',
      start: '01.11.2025', end: '30.11.2025',
      efficiency: 58, roi: '$12k/mo', throughput: '3.3 onboarding/día' 
    },
    wastes: HIGH_WASTE(5, 30, 85, 40, 10, 20, 10, 45),
    dora: { deploymentFrequency: 'Baja', leadTime: '396 hrs', failureRate: '8%', timeToRestore: '48 hrs' }
  },
  {
    id: 'supply-chain-proc',
    name: '[COMPRAS] Cadena de Suministro',
    description: 'Adquisición de insumos críticos para producción.',
    nodes: [
      { id: '1', label: 'Detección de Necesidad', category: 'SOURCING' },
      { id: '2', label: 'Solicitud de Cotizaciones', category: 'SOURCING' },
      { id: '3', label: 'Comparativa Técnica', category: 'TECH' },
      { id: '4', label: 'Aprobación de Gasto', category: 'FINANCE' },
      { id: '5', label: 'Emisión PO', category: 'FINANCE' },
      { id: '6', label: 'Seguimiento Logístico', category: 'LOGISTICS' },
      { id: '7', label: 'Ingreso a Almacén', category: 'LOGISTICS' }
    ],
    links: [
      { source: '1', target: '2', weight: 450 },
      { source: '2', target: '3', weight: 440 },
      { source: '3', target: '4', weight: 420 },
      { source: '4', target: '5', weight: 410 },
      { source: '5', target: '6', weight: 405 },
      { source: '6', target: '7', weight: 400 }
    ],
    stats: { 
      events: 3150, cases: 450, activities: 7,
      medianDuration: '5 días', meanDuration: '7.2 días',
      start: '01.11.2025', end: '25.11.2025',
      efficiency: 74, roi: '$35k/mo', throughput: '18 PO/día' 
    },
    wastes: LOW_WASTE(2, 45, 40, 15, 5, 10, 60, 10),
    dora: { deploymentFrequency: 'Media', leadTime: '172 hrs', failureRate: '3%', timeToRestore: '24 hrs' }
  },
  {
    id: 'risk-analysis-flow',
    name: '[RIESGOS] Análisis de Riesgo Crédito',
    description: 'Evaluación técnica de solvencia para clientes B2B.',
    nodes: [
      { id: '1', label: 'Recepción de Carpeta', category: 'ENTRY' },
      { id: '2', label: 'Análisis de Estados Contables', category: 'TECH' },
      { id: '3', label: 'Consulta Buró Externo', category: 'TECH' },
      { id: '4', label: 'Visita Técnica', category: 'FIELD' },
      { id: '5', label: 'Dictamen de Riesgo', category: 'LEGAL' },
      { id: '6', label: 'Comité de Crédito', category: 'EXEC' },
      { id: '7', label: 'Formalización', category: 'LEGAL' }
    ],
    links: [
      { source: '1', target: '2', weight: 200 },
      { source: '2', target: '3', weight: 195 },
      { source: '3', target: '4', weight: 180 },
      { source: '4', target: '5', weight: 175 },
      { source: '5', target: '6', weight: 170 },
      { source: '6', target: '7', weight: 110 }
    ],
    stats: { 
      events: 1400, cases: 200, activities: 7,
      medianDuration: '72 hrs', meanDuration: '94 hrs',
      start: '01.11.2025', end: '15.11.2025',
      efficiency: 42, roi: '$90k/mo', throughput: '13 dictámenes/día' 
    },
    wastes: HIGH_WASTE(10, 50, 95, 30, 15, 25, 5, 35),
    dora: { deploymentFrequency: 'Media', leadTime: '94 hrs', failureRate: '15%', timeToRestore: '72 hrs' }
  }
];
