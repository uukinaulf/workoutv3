import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createStore, type StorageLike } from '../src/lib/storage.ts';

/** Minimal in-memory localStorage stand-in. */
const fakeStorage = (): StorageLike & { data: Map<string, string> } => {
	const data = new Map<string, string>();
	return {
		data,
		getItem: key => data.get(key) ?? null,
		setItem: (key, value) => { data.set(key, value); },
		removeItem: key => { data.delete(key); },
	};
};

/** Storage that rejects every write, like Safari private mode. */
const readOnlyStorage = (): StorageLike => ({
	getItem: () => null,
	setItem: () => { throw new Error('QuotaExceededError'); },
	removeItem: () => { throw new Error('QuotaExceededError'); },
});

test('get parses JSON and falls back on missing keys', () => {
	const store = createStore(fakeStorage());
	assert.deepEqual(store.get('missing', { a: 1 }), { a: 1 });
	store.set('list', JSON.stringify([1, 2]));
	assert.deepEqual(store.get('list', []), [1, 2]);
});

test('get falls back on corrupt JSON instead of throwing', () => {
	const storage = fakeStorage();
	storage.data.set('broken', '{not json');
	const store = createStore(storage);
	assert.equal(store.get('broken', 'fallback'), 'fallback');
});

test('a failing setItem does not throw and is readable afterwards', () => {
	const store = createStore(readOnlyStorage());
	assert.doesNotThrow(() => store.set('history', JSON.stringify([{ date: '2024-01-01' }])));
	assert.deepEqual(store.get('history', []), [{ date: '2024-01-01' }]);
	assert.equal(store.degraded, true);
});

test('the degraded callback fires once, not on every write', () => {
	let calls = 0;
	const store = createStore(readOnlyStorage(), () => { calls++; });
	store.set('a', '1');
	store.set('b', '2');
	store.set('c', '3');
	assert.equal(calls, 1);
	assert.equal(store.degraded, true);
});

test('a working storage never reports degraded', () => {
	const store = createStore(fakeStorage(), () => { throw new Error('should not fire'); });
	store.set('goal', '4');
	assert.equal(store.degraded, false);
	assert.equal(store.get('goal', 0), 4);
});

test('a missing storage object still works from memory', () => {
	const store = createStore(undefined);
	store.set('x', JSON.stringify(1));
	assert.equal(store.get('x', 0), 1);
});

test('remove clears both storage and the memory copy', () => {
	const storage = fakeStorage();
	const store = createStore(storage);
	store.set('week', JSON.stringify([0, 1]));
	store.remove('week');
	assert.deepEqual(store.get('week', []), []);
	assert.equal(storage.data.has('week'), false);
});

test('memory copy is read when storage returns null', () => {
	const storage = fakeStorage();
	const store = createStore(storage);
	store.set('muted', 'true');
	storage.data.clear();
	assert.equal(store.get('muted', false), true);
});
