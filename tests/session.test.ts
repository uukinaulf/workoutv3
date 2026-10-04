import { test } from 'node:test';
import assert from 'node:assert/strict';

import { workouts } from '../src/data/workouts.ts';
import { advance, estimateMinutes, isFinalSet, DEFAULT_REST, DEFAULT_WORK } from '../src/lib/timer.ts';

interface SessionResult {
	workPhases: number;
	restPhases: number;
	elapsedSeconds: number;
	minutes: number;
}

/**
 * Mirrors the client loop: work -> (rest -> next set)* -> finish.
 * The last set never gets a trailing rest.
 */
const simulateSession = (exerciseCount: number, rounds: number, work: number, rest: number): SessionResult => {
	let index = 0;
	let round = 1;
	let workPhases = 0;
	let restPhases = 0;
	let elapsedSeconds = 0;
	for (;;) {
		elapsedSeconds += work;
		workPhases++;
		if (isFinalSet(index, round, exerciseCount, rounds)) break;
		elapsedSeconds += rest;
		restPhases++;
		const next = advance(index, round, exerciseCount, rounds);
		assert.equal(next.done, false, 'session must not finish while a set remains');
		index = next.exerciseIndex;
		round = next.round;
	}
	return { workPhases, restPhases, elapsedSeconds, minutes: Math.max(1, Math.round(elapsedSeconds / 60)) };
};

test('every program runs exactly one work phase per set', () => {
	for (const workout of workouts) {
		const result = simulateSession(workout.exercises.length, workout.rounds, DEFAULT_WORK, DEFAULT_REST);
		assert.equal(result.workPhases, workout.exercises.length * workout.rounds, workout.id);
	}
});

test('the last set is not followed by a rest phase', () => {
	for (const workout of workouts) {
		const result = simulateSession(workout.exercises.length, workout.rounds, DEFAULT_WORK, DEFAULT_REST);
		assert.equal(result.restPhases, result.workPhases - 1, workout.id);
	}
});

test('simulated session length matches the advertised duration', () => {
	for (const workout of workouts) {
		const result = simulateSession(workout.exercises.length, workout.rounds, DEFAULT_WORK, DEFAULT_REST);
		assert.equal(result.minutes, workout.duration, `${workout.id}: ran ${result.minutes}m, advertised ${workout.duration}m`);
	}
});

test('a single-set program has no rest phase', () => {
	const result = simulateSession(1, 1, DEFAULT_WORK, DEFAULT_REST);
	assert.deepEqual(result, { workPhases: 1, restPhases: 0, elapsedSeconds: DEFAULT_WORK, minutes: 1 });
});

test('switching interval keeps the same set count but changes the length', () => {
	const fast = simulateSession(4, 5, 20, 10);
	const slow = simulateSession(4, 5, 40, 20);
	assert.equal(fast.workPhases, slow.workPhases);
	assert.ok(slow.elapsedSeconds > fast.elapsedSeconds);
	assert.equal(fast.minutes, estimateMinutes(4, 5, 20, 10));
	assert.equal(slow.minutes, estimateMinutes(4, 5, 40, 20));
});
