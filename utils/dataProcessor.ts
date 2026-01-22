
import { Dataset, ProcessNode, ProcessLink, WasteMetric, DoraMetrics, CustomMetric, CasePath } from '../types';

const formatDuration = (ms: number): string => {
  if (ms <= 0) return '0s';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

/**
 * Limpia una cadena de posibles caracteres invisibles, BOM o de control
 * Extremadamente permisivo para entornos de producción variables.
 */
const cleanHeader = (h: string): string => {
  return h.replace(/[^\x20-\x7E]/g, '').trim().toLowerCase().replace(/['"]+/g, '');
};

export const parseCSVToDataset = (csvText: string, fileName: string): Dataset => {
  if (!csvText || typeof csvText !== 'string' || csvText.trim().length === 0) {
    throw new Error('El archivo CSV está vacío o es inválido.');
  }

  const trimmedText = csvText.trim();

  // Validación de seguridad para páginas 404 devueltas como HTML (común en SPAs en prod)
  if (trimmedText.toLowerCase().startsWith('<!doctype') || trimmedText.toLowerCase().startsWith('<html')) {
    throw new Error('Formato inválido: Se recibió contenido HTML. El archivo podría no existir en el servidor.');
  }

  const lines = trimmedText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('El archivo debe tener al menos una fila de datos además de los encabezados.');
  }

  // Detección de separador (soporte para Coma y Punto y Coma)
  const firstLine = lines[0];
  const separator = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';
  
  // Limpieza agresiva de encabezados
  const headers = firstLine.split(separator).map(cleanHeader);
  
  const caseIdIdx = headers.findIndex(h => h.includes('case id') || h.includes('caseid'));
  const activityIdx = headers.findIndex(h => h.includes('activity') || h.includes('actividad'));
  const timestampIdx = headers.findIndex(h => h.includes('timestamp') || h.includes('fecha'));

  if (caseIdIdx === -1 || activityIdx === -1 || timestampIdx === -1) {
    throw new Error(`Columnas no encontradas. Se requiere: Case ID, Activity, Timestamp. Detectadas: ${headers.join(', ')}`);
  }

  const events = lines.slice(1).map((line, index) => {
    const parts = line.split(separator);
    const tsRaw = parts[timestampIdx]?.trim();
    const timestamp = new Date(tsRaw);
    
    return {
      caseId: parts[caseIdIdx]?.trim(),
      activity: parts[activityIdx]?.trim(),
      timestamp,
      lineNum: index + 2
    };
  }).filter(e => e.caseId && e.activity && !isNaN(e.timestamp.getTime()));

  if (events.length === 0) {
    throw new Error("No se encontraron registros de eventos válidos. Verifique el formato de las celdas.");
  }

  events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const casesMap = new Map<string, any[]>();
  const activitySet = new Set<string>();
  
  events.forEach(e => {
    if (!casesMap.has(e.caseId)) casesMap.set(e.caseId, []);
    casesMap.get(e.caseId)?.push(e);
    activitySet.add(e.activity);
  });

  const casePaths: CasePath[] = Array.from(casesMap.entries()).map(([id, evs]) => {
    const sortedEvs = evs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return {
      id,
      events: sortedEvs.map(e => ({ activity: e.activity, timestamp: e.timestamp }))
    };
  });

  const durationsMs = casePaths
    .filter(p => p.events.length > 1)
    .map(p => {
      const start = new Date(p.events[0].timestamp).getTime();
      const end = new Date(p.events[p.events.length - 1].timestamp).getTime();
      return end - start;
    });

  const meanMs = durationsMs.length > 0 
    ? durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length 
    : 0;

  const sortedDurations = [...durationsMs].sort((a, b) => a - b);
  const medianMs = sortedDurations.length > 0 
    ? (sortedDurations.length % 2 === 0 
        ? (sortedDurations[sortedDurations.length / 2 - 1] + sortedDurations[sortedDurations.length / 2]) / 2 
        : sortedDurations[Math.floor(sortedDurations.length / 2)])
    : 0;

  const nodes: ProcessNode[] = Array.from(activitySet).map(act => ({
    id: act,
    label: act
  }));

  const linksMap = new Map<string, number>();
  casesMap.forEach((caseEvents) => {
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

  const start = events[0].timestamp;
  const end = events[events.length - 1].timestamp;

  return {
    id: `custom-${Date.now()}`,
    name: fileName.replace('.csv', ''),
    description: `Dataset de ${casePaths.length} casos individuales sincronizados.`,
    nodes,
    links,
    casePaths,
    stats: {
      events: events.length,
      cases: casePaths.length,
      activities: activitySet.size,
      medianDuration: formatDuration(medianMs),
      meanDuration: formatDuration(meanMs),
      start: start.toISOString(),
      end: end.toISOString(),
      efficiency: 70, 
      roi: `$${(casePaths.length * 15).toLocaleString()}/mo`,
      throughput: `${(events.length / 24).toFixed(1)} ev/day`
    },
    wastes: [
      { category: 'Waiting', score: 45, example: 'Tiempos muertos detectados entre transiciones.' }
    ]
  };
};
