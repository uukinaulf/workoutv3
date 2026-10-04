export const DEFAULT_WORK = 30;
export const DEFAULT_REST = 15;
export const READY_SECONDS = 3;

export type Phase = 'ready' | 'work' | 'rest';

export interface IntervalOption {
	value: string;
	label: string;
}

/** Interval presets offered in the workout modal. */
export const INTERVAL_OPTIONS: IntervalOption[] = [
	{ value: '20,10', label: '20 / 10' },
	{ value: `${DEFAULT_WORK},${DEFAULT_REST}`, label: `${DEFAULT_WORK} / ${DEFAULT_REST}` },
	{ value: '40,20', label: '40 / 20' },
];

export interface Position {
	exerciseIndex: number;
	round: number;
	done: boolean;
}

/** Position of the set after the current one. `done` once every round is finished. */
export const advance = (
	exerciseIndex: number,
	round: number,
	exerciseCount: number,
	totalRounds: number,
): Position => {
	let nextExercise = exerciseIndex + 1;
	let nextRound = round;
	if (nextExercise >= exerciseCount) {
		nextExercise = 0;
		nextRound += 1;
	}
	if (nextRound > totalRounds) return { exerciseIndex, round, done: true };
	return { exerciseIndex: nextExercise, round: nextRound, done: false };
};

/** True when the current set is the very last one of the session. */
export const isFinalSet = (
	exerciseIndex: number,
	round: number,
	exerciseCount: number,
	totalRounds: number,
): boolean => round >= totalRounds && exerciseIndex >= exerciseCount - 1;

/** Planned session length in whole minutes for a given interval. */
export const estimateMinutes = (
	exerciseCount: number,
	totalRounds: number,
	work: number,
	rest: number,
): number => Math.max(1, Math.round((exerciseCount * totalRounds * (work + rest)) / 60));

/** Length of one phase, used to size the countdown ring. */
export const phaseSeconds = (phase: Phase, work: number, rest: number): number => {
	if (phase === 'rest') return rest;
	if (phase === 'ready') return READY_SECONDS;
	return work;
};

/** Human label for the set that follows the current one, shown during rest. */
export const nextUpLabel = (
	exercises: string[],
	exerciseIndex: number,
	round: number,
	totalRounds: number,
): string => {
	const next = advance(exerciseIndex, round, exercises.length, totalRounds);
	if (next.done) return 'Gerakan terakhir sudah lewat.';
	const name = exercises[next.exerciseIndex];
	return next.round === round ? `Berikutnya: ${name}` : `Ronde ${next.round}: ${name}`;
};

/** Parse an interval option such as `"30,15"`, falling back to the defaults. */
export const parseInterval = (value: string): [number, number] => {
	const [work, rest] = value.split(',').map(Number);
	return [
		Number.isFinite(work) && work > 0 ? work : DEFAULT_WORK,
		Number.isFinite(rest) && rest >= 0 ? rest : DEFAULT_REST,
	];
};
