import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	advance,
	estimateMinutes,
	isFinalSet,
	nextUpLabel,
	parseInterval,
	phaseSeconds,
	DEFAULT_REST,
	DEFAULT_WORK,
	INTERVAL_OPTIONS,
	READY_SECONDS,
} from '../src/lib/timer.ts';

test('advance walks exercises then rounds', () => {
	assert.deepEqual(advance(0, 1, 4, 3), { exerciseIndex: 1, round: 1, done: false });
	assert.deepEqual(advance(3, 1, 4, 3), { exerciseIndex: 0, round: 2, done: false });
	assert.deepEqual(advance(2, 3, 4, 3), { exerciseIndex: 3, round: 3, done: false });
});

test('advance reports done only after the last set', () => {
	assert.deepEqual(advance(3, 3, 4, 3), { exerciseIndex: 3, round: 3, done: true });
	assert.deepEqual(advance(3, 4, 4, 3), { exerciseIndex: 3, round: 4, done: true });
});

test('advance handles a single exercise program', () => {
	assert.deepEqual(advance(0, 1, 1, 2), { exerciseIndex: 0, round: 2, done: false });
	assert.deepEqual(advance(0, 2, 1, 2), { exerciseIndex: 0, round: 2, done: true });
});

test('isFinalSet is true only on the last set', () => {
	assert.equal(isFinalSet(3, 3, 4, 3), true);
	assert.equal(isFinalSet(3, 2, 4, 3), false);
	assert.equal(isFinalSet(2, 3, 4, 3), false);
	assert.equal(isFinalSet(0, 1, 1, 1), true);
});

test('walking a whole session ends exactly once', () => {
	const exercises = 4, rounds = 3;
	let index = 0, round = 1, steps = 0;
	while (!isFinalSet(index, round, exercises, rounds)) {
		const next = advance(index, round, exercises, rounds);
		assert.equal(next.done, false);
		index = next.exerciseIndex;
		round = next.round;
		steps++;
		assert.ok(steps < 100, 'session should terminate');
	}
	assert.equal(steps, exercises * rounds - 1);
	assert.equal(advance(index, round, exercises, rounds).done, true);
});

test('estimateMinutes matches the interval math', () => {
	assert.equal(estimateMinutes(4, 3, 30, 15), 9);
	assert.equal(estimateMinutes(4, 6, 30, 15), 18);
	assert.equal(estimateMinutes(4, 2, 30, 15), 6);
	assert.equal(estimateMinutes(1, 1, 20, 10), 1);
	assert.equal(estimateMinutes(4, 4, 20, 10), 8);
});

test('phaseSeconds sizes the countdown ring', () => {
	assert.equal(phaseSeconds('work', 40, 20), 40);
	assert.equal(phaseSeconds('rest', 40, 20), 20);
	assert.equal(phaseSeconds('ready', 40, 20), READY_SECONDS);
});

test('nextUpLabel names the next exercise inside the same round', () => {
	assert.equal(nextUpLabel(['A', 'B', 'C', 'D'], 0, 1, 3), 'Berikutnya: B');
});

test('nextUpLabel announces a new round at the round boundary', () => {
	assert.equal(nextUpLabel(['A', 'B', 'C', 'D'], 3, 1, 3), 'Ronde 2: A');
});

test('nextUpLabel handles the end of the session', () => {
	assert.equal(nextUpLabel(['A', 'B', 'C', 'D'], 3, 3, 3), 'Gerakan terakhir sudah lewat.');
});

test('parseInterval accepts valid pairs and falls back on garbage', () => {
	assert.deepEqual(parseInterval('30,15'), [30, 15]);
	assert.deepEqual(parseInterval('20,10'), [20, 10]);
	assert.deepEqual(parseInterval('40,20'), [40, 20]);
	assert.deepEqual(parseInterval('nonsense'), [DEFAULT_WORK, DEFAULT_REST]);
	assert.deepEqual(parseInterval('abc,def'), [DEFAULT_WORK, DEFAULT_REST]);
});

test('parseInterval rejects zero and negative work', () => {
	assert.deepEqual(parseInterval('0,10'), [DEFAULT_WORK, 10]);
	assert.deepEqual(parseInterval('-5,10'), [DEFAULT_WORK, 10]);
});

test('interval presets include the default', () => {
	const values = INTERVAL_OPTIONS.map(option => option.value);
	assert.ok(values.includes(`${DEFAULT_WORK},${DEFAULT_REST}`));
	assert.equal(values.length, 3);
});
