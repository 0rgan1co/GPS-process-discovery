
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
      { id: '1', label: 'Oferta Aceptada' },
      { id: '2', label: 'Verificación Documental' },
      { id: '3', label: 'Firma de Contrato' },
      { id: '4', label: 'Solicitud IT (Cuentas/Hardware)' },
      { id: '5', label: 'Bienvenida Corporativa' },
      { id: '6', label: 'Training de Puesto' },
      { id: '7', label: 'Evaluación Mes 1' }
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
      { id: '1', label: 'Detección de Necesidad' },
      { id: '2', label: 'Solicitud de Cotizaciones' },
      { id: '3', label: 'Comparativa Técnica' },
      { id: '4', label: 'Aprobación de Gasto' },
      { id: '5', label: 'Emisión PO' },
      { id: '6', label: 'Seguimiento Logístico' },
      { id: '7', label: 'Ingreso a Almacén' }
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
      { id: '1', label: 'Recepción de Carpeta' },
      { id: '2', label: 'Análisis de Estados Contables' },
      { id: '3', label: 'Consulta Buró Externo' },
      { id: '4', label: 'Visita Técnica' },
      { id: '5', label: 'Dictamen de Riesgo' },
      { id: '6', label: 'Comité de Crédito' },
      { id: '7', label: 'Formalización' }
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
  },
  {
    id: 'manufacturing-flow',
    name: '[FÁBRICA] Línea de Ensamble',
    description: 'Monitoreo de tiempos en celda de manufactura robotizada.',
    nodes: [
      { id: '1', label: 'Ingreso Chasis' },
      { id: '2', label: 'Soldadura Robot' },
      { id: '3', label: 'Pintura Electroestática' },
      { id: '4', label: 'Secado Térmico' },
      { id: '5', label: 'Control Óptico' },
      { id: '6', label: 'Embalaje Final' },
      { id: '7', label: 'Despacho' }
    ],
    links: [
      { source: '1', target: '2', weight: 1200 },
      { source: '2', target: '3', weight: 1180 },
      { source: '3', target: '4', weight: 1150 },
      { source: '4', target: '5', weight: 1140 },
      { source: '5', target: '6', weight: 1130 },
      { source: '6', target: '7', weight: 1125 }
    ],
    stats: { 
      events: 8400, cases: 1200, activities: 7,
      medianDuration: '45 min', meanDuration: '52 min',
      start: '01.11.2025', end: '30.11.2025',
      efficiency: 91, roi: '$240k/mo', throughput: '40 unidades/hr' 
    },
    wastes: LOW_WASTE(5, 10, 15, 5, 2, 5, 30, 5),
    dora: { deploymentFrequency: 'Elite', leadTime: '0.8 hrs', failureRate: '0.5%', timeToRestore: '15 min' }
  },
  {
    id: 'it-support-tickets',
    name: '[IT] Resolución de Incidencias',
    description: 'Flujo de soporte técnico N1 a N3 para servicios cloud.',
    nodes: [
      { id: '1', label: 'Ticket Creado' },
      { id: '2', label: 'Clasificación N1' },
      { id: '3', label: 'Escalamiento N2' },
      { id: '4', label: 'Diagnóstico Técnico' },
      { id: '5', label: 'Hotfix Aplicado' },
      { id: '6', label: 'Validación Usuario' },
      { id: '7', label: 'Cierre Ticket' }
    ],
    links: [
      { source: '1', target: '2', weight: 500 },
      { source: '2', target: '3', weight: 320 },
      { source: '3', target: '4', weight: 310 },
      { source: '4', target: '5', weight: 300 },
      { source: '5', target: '6', weight: 295 },
      { source: '6', target: '7', weight: 290 }
    ],
    stats: { 
      events: 3500, cases: 500, activities: 7,
      medianDuration: '1.2 días', meanDuration: '2.4 días',
      start: '01.11.2025', end: '30.11.2025',
      efficiency: 66, roi: '$48k/mo', throughput: '16 tickets/día' 
    },
    wastes: HIGH_WASTE(0, 15, 65, 20, 25, 10, 5, 20),
    dora: { deploymentFrequency: 'Media', leadTime: '57.6 hrs', failureRate: '12%', timeToRestore: '8 hrs' }
  }
];
