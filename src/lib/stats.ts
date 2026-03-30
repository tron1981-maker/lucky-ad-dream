// 전체 추첨 번호 통계 관리

const STATS_KEY = "minority-report-number-stats";

export interface NumberStats {
  [num: number]: number; // 번호 -> 출현 횟수
}

export function loadStats(): NumberStats {
  try {
    const data = localStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveStats(stats: NumberStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordNumbers(numbers: number[]) {
  const stats = loadStats();
  for (const num of numbers) {
    stats[num] = (stats[num] || 0) + 1;
  }
  saveStats(stats);
}

export function getTotalDraws(): number {
  try {
    const val = localStorage.getItem("minority-report-total-draws");
    return val ? parseInt(val) : 0;
  } catch {
    return 0;
  }
}

export function incrementTotalDraws() {
  const current = getTotalDraws();
  localStorage.setItem("minority-report-total-draws", String(current + 1));
}

export function getStatsRanking(): { number: number; count: number; percentage: number }[] {
  const stats = loadStats();
  const totalDraws = getTotalDraws();

  const ranking = [];
  for (let i = 1; i <= 45; i++) {
    const count = stats[i] || 0;
    ranking.push({
      number: i,
      count,
      percentage: totalDraws > 0 ? (count / totalDraws) * 100 : 0,
    });
  }

  return ranking.sort((a, b) => b.count - a.count);
}
