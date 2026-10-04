export interface StorageLike {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
}

export interface Store {
	/** Parsed value, or `fallback` when missing or corrupt. */
	get<T>(key: string, fallback: T): T;
	/** Write; falls back to memory when the browser refuses (private mode, quota). */
	set(key: string, value: string): void;
	remove(key: string): void;
	/** True once a write has failed and memory is being used instead. */
	readonly degraded: boolean;
}

/**
 * localStorage wrapper that never throws. Safari private mode and a full quota
 * both throw on write, which would otherwise abort a finished session mid-flow.
 */
export const createStore = (storage: StorageLike | undefined, onDegraded?: () => void): Store => {
	const memory = new Map<string, string>();
	let degraded = false;

	const readRaw = (key: string): string | null => {
		try {
			const value = storage?.getItem(key);
			if (value !== null && value !== undefined) return value;
		} catch {}
		return memory.get(key) ?? null;
	};

	return {
		get<T>(key: string, fallback: T): T {
			const raw = readRaw(key);
			if (raw === null) return fallback;
			try {
				return JSON.parse(raw) as T;
			} catch {
				return fallback;
			}
		},
		set(key: string, value: string) {
			memory.set(key, value);
			try {
				storage?.setItem(key, value);
			} catch {
				if (degraded) return;
				degraded = true;
				onDegraded?.();
			}
		},
		remove(key: string) {
			memory.delete(key);
			try {
				storage?.removeItem(key);
			} catch {}
		},
		get degraded() {
			return degraded;
		},
	};
};
