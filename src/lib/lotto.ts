// Lotto number generation logic

export interface DrawResult {
  id: string;
  numbers: number[];
  baseDate: string;
  createdAt: string;
}

export interface FixedSlot {
  index: number;
  value: number | null;
  isLocked: boolean;
}

export interface DateSlot {
  id: string;
  label: string;
  month: string;
  day: string;
  year: string; // optional, can be empty
}

export function dateSlotToString(slot: DateSlot): string {
  const parts = [];
  if (slot.year) parts.push(slot.year);
  parts.push(slot.month.padStart(2, "0"), slot.day.padStart(2, "0"));
  return parts.join("");
}

export function getBallColor(num: number): string {
  if (num <= 10) return "ball-yellow";
  if (num <= 20) return "ball-blue";
  if (num <= 30) return "ball-red";
  if (num <= 40) return "ball-gray";
  return "ball-green";
}

export function getBallBgClass(num: number): string {
  if (num <= 10) return "bg-ball-yellow text-foreground";
  if (num <= 20) return "bg-ball-blue text-primary-foreground";
  if (num <= 30) return "bg-ball-red text-primary-foreground";
  if (num <= 40) return "bg-ball-gray text-primary-foreground";
  return "bg-ball-green text-primary-foreground";
}

export function dateToNumbers(dateStr: string): number[] {
  const nums: number[] = [];
  const cleaned = dateStr.replace(/\D/g, "");
  for (const ch of cleaned) {
    const n = parseInt(ch);
    if (n >= 1 && n <= 9) nums.push(n);
  }
  // Also generate composite numbers from pairs
  for (let i = 0; i < cleaned.length - 1; i++) {
    const pair = parseInt(cleaned.substring(i, i + 2));
    if (pair >= 1 && pair <= 45) nums.push(pair);
  }
  return [...new Set(nums)].filter(n => n >= 1 && n <= 45);
}

export function generateLottoNumbers(
  fixedNumbers: number[],
  dateNumbers: number[]
): number[] {
  const result = new Set<number>();

  // Add fixed numbers first (up to 6)
  for (const n of fixedNumbers) {
    if (result.size >= 6) break;
    if (n >= 1 && n <= 45) result.add(n);
  }

  // Add date-derived numbers with some randomness
  const shuffledDate = [...dateNumbers].sort(() => Math.random() - 0.5);
  for (const n of shuffledDate) {
    if (result.size >= 6) break;
    result.add(n);
  }

  // Fill remaining with random
  while (result.size < 6) {
    const rand = Math.floor(Math.random() * 45) + 1;
    result.add(rand);
  }

  return [...result].sort((a, b) => a - b);
}

export function createInitialSlots(): FixedSlot[] {
  return Array.from({ length: 20 }, (_, i) => ({
    index: i + 1,
    value: null,
    isLocked: i >= 5, // slots 6-20 are locked
  }));
}

// Local storage helpers
const HISTORY_KEY = "minority-report-history";
const SLOTS_KEY = "minority-report-slots";
const DATE_SLOTS_KEY = "minority-report-date-slots";

export function createInitialDateSlots(): DateSlot[] {
  return [{
    id: crypto.randomUUID(),
    label: "기념일 1",
    month: "",
    day: "",
    year: "",
  }];
}

export function saveDateSlots(slots: DateSlot[]) {
  localStorage.setItem(DATE_SLOTS_KEY, JSON.stringify(slots));
}

export function loadDateSlots(): DateSlot[] {
  try {
    const data = localStorage.getItem(DATE_SLOTS_KEY);
    return data ? JSON.parse(data) : createInitialDateSlots();
  } catch { return createInitialDateSlots(); }
}

const MAX_HISTORY = 10;

export function saveHistory(draws: DrawResult[]) {
  const trimmed = draws.slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function loadHistory(): DrawResult[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function saveSlots(slots: FixedSlot[]) {
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
}

export function loadSlots(): FixedSlot[] {
  try {
    const data = localStorage.getItem(SLOTS_KEY);
    return data ? JSON.parse(data) : createInitialSlots();
  } catch { return createInitialSlots(); }
}
