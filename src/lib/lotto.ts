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

export function dateToNumbers(slot: DateSlot): number[] {
  const nums: number[] = [];

  // Year: split into 2-digit chunks (e.g., 2026 → 20, 26)
  if (slot.year && slot.year.length === 4) {
    const y1 = parseInt(slot.year.substring(0, 2));
    const y2 = parseInt(slot.year.substring(2, 4));
    if (y1 >= 1 && y1 <= 45) nums.push(y1);
    if (y2 >= 1 && y2 <= 45) nums.push(y2);
  }

  // Month as-is (e.g., 3 → 3)
  if (slot.month) {
    const m = parseInt(slot.month);
    if (m >= 1 && m <= 45) nums.push(m);
  }

  // Day as-is (e.g., 12 → 12)
  if (slot.day) {
    const d = parseInt(slot.day);
    if (d >= 1 && d <= 45) nums.push(d);
  }

  return [...new Set(nums)];
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
    label: "",
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
