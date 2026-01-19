
import { Dataset, ProcessNode, ProcessLink, WasteMetric, DoraMetrics, CustomMetric } from '../types';

export const parseCSVToDataset = (csvText: string, fileName: string): Dataset => {
  if (!csvText || csvText.trim().length === 0) {
    throw new Error('El archivo CSV está vacío.');
  }

  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('El CSV debe contener al menos los encabezados y una fila de datos.');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  
  const caseIdIdx = headers.indexOf('Case ID');
  const activityIdx = headers.indexOf('Activity');
  const timestampIdx = headers.indexOf('Timestamp');
  const resourceIdx = headers.indexOf('Resource'); // Opcional

  if (caseIdIdx === -1 || activityIdx === -1 || timestampIdx === -1) {
    throw new Error('Formato inválido. El CSV debe contener las columnas: "Case ID", "Activity" y "Timestamp".');
  }

  const events = lines.slice(1).map((line, index) => {
    const parts = line.split(',');
    const timestamp = new Date(parts[timestampIdx]?.trim());
    return {
      caseId: parts[caseIdIdx]?.trim(),
      activity: parts[activityIdx]?.trim(),
      resource: resourceIdx !== -1 ? parts[resourceIdx]?.trim() : 'N/A',
      timestamp,
      lineNum: index + 2
    };
  }).filter(e => e.caseId && e.activity && !isNaN(e.timestamp.getTime()));

  if (events.length === 0) {
    throw new Error("No se encontraron eventos válidos.");
  }

  events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const casesMap = new Map<string, any[]>();
  const activitySet = new Set<string>();
  
  events.forEach(e => {
    if (!casesMap.has(e.caseId)) casesMap.set(e.caseId, []);
    casesMap.get(e.caseId)?.push(e);
    activitySet.add(e.activity);
  });

  const nodes: ProcessNode[] = Array.from(activitySet).map(act => ({
    id: act,
    label: act
  }));

  const linksMap = new Map<string, number>();
  let totalDurationMs = 0;
  const caseDurations: number[] = [];
  let failures = 0;

  casesMap.forEach((caseEvents) => {
    const start = caseEvents[0].timestamp;
    const end = caseEvents[caseEvents.length - 1].timestamp;
    const duration = end.getTime() - start.getTime();
    caseDurations.push(duration);
    totalDurationMs += duration;

    const lastActivity = caseEvents[caseEvents.length - 1].activity.toLowerCase();
    if (lastActivity.includes('rechazo') || lastActivity.includes('error') || lastActivity.includes('falla')) {
      failures++;
    }

    for (let i = 0; i < caseEvents.length - 1; i++) {
      const source = caseEvents[i].activity;
      const target = caseEvents[i + 1].activity;
      const key = `${source}->${target}`;
      linksMap.set(key, (linksMap.get(key) || 0) + 1);
    }
  });

  const links: ProcessLink[] = Array.from(linksMap.entries()).map(([key, weight]) => {
    const [source, target] = key.split('->');
    return { source, target, weight };
  });

  const avgDurationHrs = (totalDurationMs / caseDurations.length / (1000 * 60 * 60)).toFixed(1);
  caseDurations.sort((a, b) => a - b);
  const medianDurationHrs = (caseDurations[Math.floor(caseDurations.length / 2)] / (1000 * 60 * 60)).toFixed(1);

  const deploymentFrequency = casesMap.size > 20 ? "Alta" : casesMap.size > 10 ? "Media" : "Baja";
  const failureRate = ((failures / casesMap.size) * 100).toFixed(1) + "%";
  
  const dora: DoraMetrics = {
    deploymentFrequency,
    leadTime: `${avgDurationHrs} hrs`,
    failureRate,
    timeToRestore: `${(parseFloat(avgDurationHrs) * 0.4).toFixed(1)} hrs` 
  };

  const customMetrics: CustomMetric[] = [
    { label: 'Costo por Caso', value: `$${(Math.random() * 50 + 20).toFixed(2)}`, trend: 'down', color: 'indigo' },
    { label: 'Satisfacción Cliente', value: `${(Math.random() * 2 + 3).toFixed(1)}/5`, trend: 'up', color: 'green' }
  ];

  const waitingScore = Math.min(100, Math.floor((parseFloat(avgDurationHrs) / 24) * 100));

  return {
    id: `custom-${Date.now()}`,
    name: fileName.replace('.csv', ''),
    description: `Dataset cargado: ${events.length} eventos en ${casesMap.size} casos.`,
    nodes,
    links,
    stats: {
      events: events.length,
      cases: casesMap.size,
      activities: activitySet.size,
      medianDuration: `${medianDurationHrs} hrs`,
      meanDuration: `${avgDurationHrs} hrs`,
      start: events[0].timestamp.toLocaleString(),
      end: events[events.length - 1].timestamp.toLocaleString(),
      efficiency: 70, 
      roi: '$'+(casesMap.size * 25).toString() + '/mo',
      throughput: `${(events.length / 24).toFixed(1)} ev/day`
    },
    wastes: [
      { category: 'Waiting', score: waitingScore, example: 'Tiempos de espera detectados.' },
      { category: 'Inventory', score: Math.floor(Math.random() * 50), example: 'Casos acumulados.' },
      { category: 'Overproducing', score: 10, example: 'Repeticiones detectadas.' },
      { category: 'Extra Processing', score: 25, example: 'Pasos redundantes.' },
      { category: 'Correction', score: Math.floor(parseFloat(failureRate)) || 0, example: 'Re-trabajo.' },
      { category: 'Excess Motion', score: 15, example: 'Multi-sistemas.' },
      { category: 'Transportation', score: 5, example: 'Silos inconexos.' },
      { category: 'Underutilized People', score: 30, example: 'Talento desperdiciado.' }
    ],
    dora,
    customMetrics
  };
};
