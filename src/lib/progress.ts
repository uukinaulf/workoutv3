export interface HistoryEntry {
	date: string;
	workout: string;
	minutes: number;
}

export const WEEK_KEY_PREFIX = 'gerak-progress';
export const HISTORY_KEY = 'gerak-history';
export const GOAL_KEY = 'gerak-goal';
export const LAST_WORKOUT_KEY = 'gerak-last-workout';
export const LAST_PROGRAM_KEY = 'gerak-last-program';
export const MUTE_KEY = 'gerak-muted';
export const DEFAULT_GOAL = 4;

/** Monday-first short day names, index 0 = Monday. */
export const DAY_LABELS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** Local (not UTC) `YYYY-MM-DD` for a date. */
export const localDate = (date: Date): string =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** `5 Jan` for a `YYYY-MM-DD` string. */
export const formatShortDate = (isoDate: string): string => {
	const [, month, day] = isoDate.split('-').map(Number);
	if (!month || !day || month < 1 || month > 12) return isoDate;
	return `${day} ${MONTH_LABELS[month - 1]}`;
};

/** Monday 00:00 of the week containing `date`. */
export const weekStart = (date: Date): Date => {
	const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
	return start;
};

/** localStorage key for the week containing `date`. */
export const weekKey = (date: Date): string => `${WEEK_KEY_PREFIX}-${localDate(weekStart(date))}`;

/** Monday-first day index (0 = Monday, 6 = Sunday). */
export const dayIndex = (date: Date): number => (date.getDay() === 0 ? 6 : date.getDay() - 1);

/** Consecutive days ending today. Breaks when today has no entry. */
export const computeStreak = (dates: string[], today: Date): number => {
	const unique = new Set(dates);
	let streak = 0;
	const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	while (unique.has(localDate(cursor))) {
		streak++;
		cursor.setDate(cursor.getDate() - 1);
	}
	return streak;
};

/** Weekly completion percentage, capped at 100. */
export const progressPercent = (completed: number, goal: number): number =>
	goal > 0 ? Math.min((completed / goal) * 100, 100) : 0;

export const totalMinutes = (history: HistoryEntry[]): number =>
	history.reduce((sum, item) => sum + item.minutes, 0);

/** Keep only well-formed history entries; used for imports and localStorage reads. */
export const sanitizeHistory = (input: unknown): HistoryEntry[] => {
	if (!Array.isArray(input)) return [];
	const valid: HistoryEntry[] = [];
	for (const item of input) {
		if (!item || typeof item !== 'object') continue;
		const entry = item as Partial<HistoryEntry>;
		if (typeof entry.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) continue;
		if (typeof entry.workout !== 'string' || entry.workout.length === 0) continue;
		if (typeof entry.minutes !== 'number' || !Number.isFinite(entry.minutes) || entry.minutes <= 0) continue;
		valid.push({ date: entry.date, workout: entry.workout, minutes: Math.round(entry.minutes) });
	}
	return valid;
};

/** Append imported entries, skipping duplicates, sorted by date. */
export const mergeHistory = (existing: HistoryEntry[], incoming: HistoryEntry[]): HistoryEntry[] => {
	const seen = new Set(existing.map(entry => `${entry.date}|${entry.workout}|${entry.minutes}`));
	const merged = [...existing];
	for (const entry of incoming) {
		const key = `${entry.date}|${entry.workout}|${entry.minutes}`;
		if (seen.has(key)) continue;
		seen.add(key);
		merged.push(entry);
	}
	return merged.sort((a, b) => a.date.localeCompare(b.date));
};
