import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	computeStreak,
	dayIndex,
	formatShortDate,
	localDate,
	mergeHistory,
	progressPercent,
	sanitizeHistory,
	totalMinutes,
	weekKey,
	weekStart,
} from '../src/lib/progress.ts';

test('localDate uses local time and zero-pads', () => {
	assert.equal(localDate(new Date(2026, 0, 5)), '2026-01-05');
	assert.equal(localDate(new Date(2026, 11, 31)), '2026-12-31');
});

test('formatShortDate renders Indonesian month labels', () => {
	assert.equal(formatShortDate('2026-01-05'), '5 Jan');
	assert.equal(formatShortDate('2026-08-17'), '17 Agu');
	assert.equal(formatShortDate('2026-12-31'), '31 Des');
});

test('formatShortDate passes through malformed input', () => {
	assert.equal(formatShortDate('bukan-tanggal'), 'bukan-tanggal');
	assert.equal(formatShortDate('2026-13-01'), '2026-13-01');
});

test('weekStart returns the Monday of the week', () => {
	assert.equal(localDate(weekStart(new Date(2024, 0, 1))), '2024-01-01'); // Monday
	assert.equal(localDate(weekStart(new Date(2024, 0, 3))), '2024-01-01'); // Wednesday
	assert.equal(localDate(weekStart(new Date(2024, 0, 7))), '2024-01-01'); // Sunday
	assert.equal(localDate(weekStart(new Date(2024, 0, 8))), '2024-01-08'); // next Monday
});

test('weekStart does not mutate its argument', () => {
	const input = new Date(2024, 0, 7);
	weekStart(input);
	assert.equal(localDate(input), '2024-01-07');
});

test('weekKey is stable within a week and changes across weeks', () => {
	assert.equal(weekKey(new Date(2024, 0, 3)), 'gerak-progress-2024-01-01');
	assert.equal(weekKey(new Date(2024, 0, 7)), 'gerak-progress-2024-01-01');
	assert.equal(weekKey(new Date(2024, 0, 8)), 'gerak-progress-2024-01-08');
});

test('dayIndex maps Sunday to 6 and Monday to 0', () => {
	assert.equal(dayIndex(new Date(2024, 0, 1)), 0); // Monday
	assert.equal(dayIndex(new Date(2024, 0, 6)), 5); // Saturday
	assert.equal(dayIndex(new Date(2024, 0, 7)), 6); // Sunday
});

test('computeStreak counts consecutive days ending today', () => {
	const dates = ['2024-01-01', '2024-01-02', '2024-01-03'];
	assert.equal(computeStreak(dates, new Date(2024, 0, 3)), 3);
	assert.equal(computeStreak(dates, new Date(2024, 0, 4)), 0);
	assert.equal(computeStreak([], new Date(2024, 0, 4)), 0);
});

test('computeStreak ignores duplicates and unordered input', () => {
	const dates = ['2024-01-03', '2024-01-01', '2024-01-03', '2024-01-02'];
	assert.equal(computeStreak(dates, new Date(2024, 0, 3)), 3);
});

test('computeStreak stops at the first gap', () => {
	const dates = ['2024-01-01', '2024-01-03', '2024-01-04'];
	assert.equal(computeStreak(dates, new Date(2024, 0, 4)), 2);
});

test('computeStreak crosses month and year boundaries', () => {
	assert.equal(computeStreak(['2024-02-29', '2024-03-01'], new Date(2024, 2, 1)), 2);
	assert.equal(computeStreak(['2024-12-31', '2025-01-01'], new Date(2025, 0, 1)), 2);
});

test('progressPercent is capped at 100 and safe for zero goal', () => {
	assert.equal(progressPercent(0, 4), 0);
	assert.equal(progressPercent(2, 4), 50);
	assert.equal(progressPercent(9, 4), 100);
	assert.equal(progressPercent(3, 0), 0);
});

test('totalMinutes sums history entries', () => {
	assert.equal(totalMinutes([]), 0);
	assert.equal(totalMinutes([
		{ date: '2024-01-01', workout: 'Core', minutes: 10 },
		{ date: '2024-01-02', workout: 'HIIT', minutes: 20 },
	]), 30);
});

test('sanitizeHistory drops malformed entries', () => {
	assert.deepEqual(sanitizeHistory('nope'), []);
	assert.deepEqual(sanitizeHistory([null, 42, {}, { date: 'x' }]), []);
	assert.deepEqual(sanitizeHistory([
		{ date: '2024-01-01', workout: 'Core', minutes: 9 },
		{ date: '01-01-2024', workout: 'Core', minutes: 9 },
		{ date: '2024-01-02', workout: '', minutes: 9 },
		{ date: '2024-01-03', workout: 'Core', minutes: 0 },
		{ date: '2024-01-04', workout: 'Core', minutes: 'banyak' },
	]), [{ date: '2024-01-01', workout: 'Core', minutes: 9 }]);
});

test('sanitizeHistory rounds fractional minutes', () => {
	assert.deepEqual(sanitizeHistory([{ date: '2024-01-01', workout: 'Core', minutes: 8.6 }]), [
		{ date: '2024-01-01', workout: 'Core', minutes: 9 },
	]);
});

test('mergeHistory skips duplicates and sorts by date', () => {
	const existing = [{ date: '2024-01-02', workout: 'Core', minutes: 9 }];
	const incoming = [
		{ date: '2024-01-02', workout: 'Core', minutes: 9 },
		{ date: '2024-01-01', workout: 'HIIT', minutes: 15 },
	];
	assert.deepEqual(mergeHistory(existing, incoming), [
		{ date: '2024-01-01', workout: 'HIIT', minutes: 15 },
		{ date: '2024-01-02', workout: 'Core', minutes: 9 },
	]);
});

test('mergeHistory keeps entries that differ only by duration', () => {
	const merged = mergeHistory([], [
		{ date: '2024-01-01', workout: 'Core', minutes: 9 },
		{ date: '2024-01-01', workout: 'Core', minutes: 10 },
	]);
	assert.equal(merged.length, 2);
});
