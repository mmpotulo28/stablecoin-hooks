import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";

/**
 * A custom hook for caching values in cookies with a specified maximum age.
 *
 * @param maxAge - The maximum age (in milliseconds) for which the cached value is considered valid. Defaults to 60000 ms (1 minute).
 * @returns An object containing:
 * - `setCache(key: string, value: any)`: Stores a value in a cookie under the given key, along with a timestamp.
 * - `getCache(key: string)`: Retrieves the cached value for the given key if it is still valid; otherwise, returns `undefined`.
 *
 * @example
 * const { setCache, getCache } = useCache(120000);
 * setCache('user', { name: 'Alice' });
 * const user = getCache('user'); // Returns cached value if not expired
 *
 */

interface iUseCache {
	setCache: (key: string, value: any) => void;
	getCache: <T = any>(key: string) => T | undefined;
	clearCache: () => void;
	cacheCleared: boolean;
	cacheError: string | null;
	cacheMessage: string | null;
}

//

const useCache = (maxAge: number = 60000) => {
	const [cacheCleared, setCacheCleared] = useState(false);
	const [cacheError, setCacheError] = useState<string | null>(null);
	const [cacheMessage, setCacheMessage] = useState<string | null>(null);

	// clear cache error and message after 3 seconds
	useEffect(() => {
		if (cacheError) {
			const timer = setTimeout(() => setCacheError(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [cacheError]);

	useEffect(() => {
		if (cacheMessage) {
			const timer = setTimeout(() => setCacheMessage(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [cacheMessage]);

	const setCache = useCallback(
		(key: string, value: any) => {
			Cookies.set(key, JSON.stringify({ value, ts: Date.now() }), { expires: maxAge / 1000 }); // valid for max age
		},
		[maxAge],
	);

	const getCache = useCallback(
		<T = any>(key: string): T | undefined => {
			const raw = Cookies.get(key);
			if (!raw) return undefined;
			try {
				const { value, ts } = JSON.parse(raw);
				if (Date.now() - ts < maxAge) return value as T; // valid for maxAge
			} catch {
				return undefined;
			}
			return undefined;
		},
		[maxAge],
	);

	const clearCache = useCallback(() => {
		try {
			localStorage.clear();
			sessionStorage.clear();
			document.cookie.split(";").forEach((c) => {
				document.cookie = c
					.replace(/^ +/, "")
					.replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
			});
			setCacheCleared(true);
			setTimeout(() => setCacheCleared(false), 1500);
		} catch (e) {
			setCacheCleared(false);
			console.error("Failed to clear cache:", e);
		}
	}, []);

	return { setCache, getCache, clearCache, cacheCleared, cacheError, cacheMessage };
};

export { useCache };
export type { iUseCache };
