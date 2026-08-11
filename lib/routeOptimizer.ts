// 동선 최적화 연동 메모(claude_prompt.md)를 구현한 것.
// Google Distance Matrix API로 구간별 실제 이동시간을 구하고,
// nearest-neighbor + 2-opt로 총 이동시간이 최소가 되는 순서를 계산한다.
// 첫 번째 지점(index 0)은 숙소/시작점으로 고정하고 나머지만 재배치한다.

export interface RoutePoint { id: string; lat: number; lng: number; }
export type TravelMode = 'walking' | 'transit' | 'driving' | 'bicycling';

export async function buildDurationMatrix(points: RoutePoint[], mode: TravelMode, apiKey: string): Promise<number[][]> {
  const coords = points.map((p) => `${p.lat},${p.lng}`).join('|');
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${coords}&destinations=${coords}&mode=${mode}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK') throw new Error(`Distance Matrix API 오류: ${data.status}`);
  return data.rows.map((row: any) => row.elements.map((el: any) => (el.status === 'OK' ? el.duration.value : Infinity)));
}

export function nearestNeighborTour(matrix: number[][]): number[] {
  const n = matrix.length;
  const visited = new Array(n).fill(false);
  const tour = [0];
  visited[0] = true;
  for (let step = 1; step < n; step++) {
    const last = tour[tour.length - 1];
    let nearest = -1, nearestDist = Infinity;
    for (let j = 0; j < n; j++) {
      if (!visited[j] && matrix[last][j] < nearestDist) { nearest = j; nearestDist = matrix[last][j]; }
    }
    tour.push(nearest);
    visited[nearest] = true;
  }
  return tour;
}

export function twoOptImprove(initialTour: number[], matrix: number[][]): number[] {
  let tour = [...initialTour];
  const n = tour.length;
  const tourLength = (t: number[]) => {
    let total = 0;
    for (let i = 0; i < t.length - 1; i++) total += matrix[t[i]][t[i + 1]];
    return total;
  };
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < n - 2; i++) {
      for (let j = i + 1; j < n - 1; j++) {
        const candidate = [...tour.slice(0, i), ...tour.slice(i, j + 1).reverse(), ...tour.slice(j + 1)];
        if (tourLength(candidate) < tourLength(tour) - 1) { tour = candidate; improved = true; }
      }
    }
  }
  return tour;
}

export interface LegInfo { fromIndex: number; toIndex: number; durationMin: number; isAnomaly: boolean; }
export function analyzeLegs(tour: number[], matrix: number[][], anomalyThresholdMin = 45): LegInfo[] {
  const legs: LegInfo[] = [];
  for (let i = 0; i < tour.length - 1; i++) {
    const durationMin = Math.round(matrix[tour[i]][tour[i + 1]] / 60);
    legs.push({ fromIndex: tour[i], toIndex: tour[i + 1], durationMin, isAnomaly: durationMin > anomalyThresholdMin });
  }
  return legs;
}

export interface OptimizeResult {
  originalOrderIds: string[];
  optimizedOrderIds: string[];
  originalTotalMin: number;
  optimizedTotalMin: number;
  improvementPct: number;
  legs: LegInfo[];
  wasReordered: boolean;
}

export async function optimizeDayRoute(points: RoutePoint[], mode: TravelMode, apiKey: string): Promise<OptimizeResult> {
  if (points.length < 3) {
    const matrix = points.length === 2 ? await buildDurationMatrix(points, mode, apiKey) : [[0]];
    const originalTotalMin = points.length === 2 ? Math.round(matrix[0][1] / 60) : 0;
    return {
      originalOrderIds: points.map((p) => p.id),
      optimizedOrderIds: points.map((p) => p.id),
      originalTotalMin, optimizedTotalMin: originalTotalMin,
      improvementPct: 0, legs: [], wasReordered: false,
    };
  }

  const matrix = await buildDurationMatrix(points, mode, apiKey);
  const originalTour = points.map((_, i) => i);
  const nnTour = nearestNeighborTour(matrix);
  const optimizedTour = twoOptImprove(nnTour, matrix);

  const totalMin = (tour: number[]) => {
    let total = 0;
    for (let i = 0; i < tour.length - 1; i++) total += matrix[tour[i]][tour[i + 1]];
    return Math.round(total / 60);
  };

  const originalTotalMin = totalMin(originalTour);
  const optimizedTotalMin = totalMin(optimizedTour);
  const improvementPct = originalTotalMin > 0 ? Math.round((1 - optimizedTotalMin / originalTotalMin) * 100) : 0;
  const wasReordered = improvementPct >= 5; // 개선폭 5% 미만이면 사용자가 의도한 원래 순서를 유지

  return {
    originalOrderIds: originalTour.map((i) => points[i].id),
    optimizedOrderIds: (wasReordered ? optimizedTour : originalTour).map((i) => points[i].id),
    originalTotalMin,
    optimizedTotalMin: wasReordered ? optimizedTotalMin : originalTotalMin,
    improvementPct: wasReordered ? improvementPct : 0,
    legs: analyzeLegs(wasReordered ? optimizedTour : originalTour, matrix),
    wasReordered,
  };
}
