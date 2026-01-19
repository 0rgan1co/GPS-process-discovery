
import { Dataset } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a process dataset for core integrity before processing.
 * Acts as an internal "automated test" for data consistency.
 */
export const validateDataset = (dataset: Dataset): ValidationResult => {
  const errors: string[] = [];

  if (!dataset.name || dataset.name.length < 3) {
    errors.push("Dataset name must be at least 3 characters long.");
  }

  if (dataset.nodes.length < 2) {
    errors.push("Dataset must contain at least 2 process nodes.");
  }

  if (dataset.links.length === 0) {
    errors.push("Dataset must contain at least one transition (link).");
  }

  // Cross-reference integrity
  const nodeIds = new Set(dataset.nodes.map(n => n.id));
  dataset.links.forEach(link => {
    if (!nodeIds.has(link.source)) {
      errors.push(`Orphaned link source detected: ${link.source}`);
    }
    if (!nodeIds.has(link.target)) {
      errors.push(`Orphaned link target detected: ${link.target}`);
    }
  });

  // Numeric sanity checks
  if (dataset.stats.cases <= 0) errors.push("Dataset must contain at least 1 case.");
  if (dataset.stats.efficiency < 0 || dataset.stats.efficiency > 100) {
    errors.push("Efficiency score must be between 0 and 100.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
