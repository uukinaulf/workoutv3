import { test } from 'node:test';
import assert from 'node:assert/strict';

import { exerciseGuide, workouts } from '../src/data/workouts.ts';
import { DEFAULT_REST, DEFAULT_WORK, estimateMinutes } from '../src/lib/timer.ts';

const LEVELS = ['Pemula', 'Menengah', 'Lanjutan', 'Semua level'];

test('workout ids are unique', () => {
	const ids = workouts.map(workout => workout.id);
	assert.equal(new Set(ids).size, ids.length);
});

test('every workout has a known level and non-empty fields', () => {
	for (const workout of workouts) {
		assert.ok(LEVELS.includes(workout.level), `${workout.id}: unknown level ${workout.level}`);
		assert.ok(workout.duration > 0, `${workout.id}: duration must be positive`);
		assert.ok(workout.rounds > 0, `${workout.id}: rounds must be positive`);
		assert.ok(workout.title.length > 0 && workout.focus.length > 0 && workout.tip.length > 0);
		assert.ok(workout.exercises.length > 0, `${workout.id}: needs exercises`);
	}
});

test('every programmed exercise has a guide entry', () => {
	for (const workout of workouts) {
		for (const name of workout.exercises) {
			assert.ok(exerciseGuide[name], `missing guide for "${name}" (${workout.id})`);
		}
	}
});

test('advertised duration matches the timer for the default interval', () => {
	for (const workout of workouts) {
		const expected = estimateMinutes(workout.exercises.length, workout.rounds, DEFAULT_WORK, DEFAULT_REST);
		assert.equal(workout.duration, expected, `${workout.id}: duration ${workout.duration} != timer ${expected}`);
	}
});

test('every guide entry is complete and used by at least one workout', () => {
	const used = new Set(workouts.flatMap(workout => workout.exercises));
	for (const [name, guide] of Object.entries(exerciseGuide)) {
		for (const field of ['target', 'steps', 'breath', 'avoid', 'easier'] as const) {
			assert.ok(guide[field]?.length > 0, `${name}: empty ${field}`);
		}
		assert.ok(used.has(name), `orphan guide entry: ${name}`);
	}
});
