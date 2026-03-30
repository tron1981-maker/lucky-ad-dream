// 전체 추첨 번호 통계 관리

const STATS_KEY = "minority-report-number-stats";
const FIXED_STATS_KEY = "minority-report-fixed-stats";
const DRAW_LOG_KEY = "minority-report-draw-log";

export interface NumberStats {
  [num: number]: number; // 번호 -> 출현 횟수
}

export interface DrawLog {
  id: string;
  numbers: number[];
  fixedNumbers: number[];
  dateNumbers: number[];
  baseDate: string;
  createdAt: string;
}

// === 추첨 번호 통계 ===

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

// === 고정수 통계 ===

export function loadFixedStats(): NumberStats {
  try {
    const data = localStorage.getItem(FIXED_STATS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveFixedStats(stats: NumberStats) {
  localStorage.setItem(FIXED_STATS_KEY, JSON.stringify(stats));
}

export function recordFixedNumber(num: number) {
  const stats = loadFixedStats();
  stats[num] = (stats[num] || 0) + 1;
  saveFixedStats(stats);
}

export function removeFixedNumber(num: number) {
  const stats = loadFixedStats();
  if (stats[num] && stats[num] > 0) {
    stats[num] = stats[num] - 1;
  }
  saveFixedStats(stats);
}

export function getFixedStatsRanking(): { number: number; count: number }[] {
  const stats = loadFixedStats();
  const ranking = [];
  for (let i = 1; i <= 45; i++) {
    const count = stats[i] || 0;
    if (count > 0) {
      ranking.push({ number: i, count });
    }
  }
  return ranking.sort((a, b) => b.count - a.count);
}

// === 회차별 추첨 로그 ===

const MAX_DRAW_LOG = 100;

export function loadDrawLog(): DrawLog[] {
  try {
    const data = localStorage.getItem(DRAW_LOG_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveDrawLog(log: DrawLog[]) {
  const trimmed = log.slice(0, MAX_DRAW_LOG);
  localStorage.setItem(DRAW_LOG_KEY, JSON.stringify(trimmed));
}

export function recordDrawLog(entry: DrawLog) {
  const log = loadDrawLog();
  saveDrawLog([entry, ...log]);
}

// === 기존 기록 마이그레이션 ===

const MIGRATION_KEY = "minority-report-stats-migrated";

export function migrateExistingHistory() {
  // 이미 마이그레이션 완료된 경우 스킵
  if (localStorage.getItem(MIGRATION_KEY)) return;

  try {
    const historyData = localStorage.getItem("minority-report-history");
    if (!historyData) {
      localStorage.setItem(MIGRATION_KEY, "1");
      return;
    }

    const history: { id: string; numbers: number[]; baseDate: string; createdAt: string }[] =
      JSON.parse(historyData);

    if (history.length === 0) {
      localStorage.setItem(MIGRATION_KEY, "1");
      return;
    }

    // 기존 통계가 이미 있으면 그 위에 덧씌우지 않기 위해 현재 totalDraws 확인
    const currentTotal = getTotalDraws();
    if (currentTotal > 0) {
      localStorage.setItem(MIGRATION_KEY, "1");
      return;
    }

    // 기존 기록을 통계에 반영
    const stats = loadStats();
    for (const draw of history) {
      for (const num of draw.numbers) {
        stats[num] = (stats[num] || 0) + 1;
      }
    }
    saveStats(stats);
    localStorage.setItem("minority-report-total-draws", String(history.length));

    // 기존 기록을 회차별 로그에도 반영 (고정수/기념일 정보는 없으므로 빈 배열)
    const existingLog = loadDrawLog();
    if (existingLog.length === 0) {
      const logEntries: DrawLog[] = history.map(draw => ({
        id: draw.id,
        numbers: draw.numbers,
        fixedNumbers: [],
        dateNumbers: [],
        baseDate: draw.baseDate,
        createdAt: draw.createdAt,
      }));
      saveDrawLog(logEntries);
    }

    localStorage.setItem(MIGRATION_KEY, "1");
  } catch {
    localStorage.setItem(MIGRATION_KEY, "1");
  }
}
