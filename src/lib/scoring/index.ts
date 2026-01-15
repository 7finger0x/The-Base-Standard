/**
 * PVC Scoring System
 * 
 * Main entry point for Provable Value Contribution scoring
 */

export { PVCFramework, type PVCMetrics, type PVCScore, type PVCCardScores } from './pvc-framework';
export { MetricsCollector, type OnChainData, type ZoraData, type FarcasterData, type IdentityData } from './metrics-collector';

// Re-export MetricsCollector for dynamic import
export { MetricsCollector as MetricsCollectorExport } from './metrics-collector';

/**
 * Calculate reputation score using PVC framework
 */
export async function calculateReputationScore(
  address: string,
  metrics?: Partial<import('./pvc-framework').PVCMetrics>
): Promise<import('./pvc-framework').PVCScore> {
  const { PVCFramework } = await import('./pvc-framework');
  const { MetricsCollector } = await import('./metrics-collector');
  
  let pvcMetrics: import('./pvc-framework').PVCMetrics;
  
  if (metrics) {
    // Use provided metrics (for testing or cached data)
    pvcMetrics = metrics as import('./pvc-framework').PVCMetrics;
  } else {
    // Collect metrics from various sources
    pvcMetrics = await MetricsCollector.collectMetrics(address);
  }
  
  return PVCFramework.calculateScore(pvcMetrics);
}
