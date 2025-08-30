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
	purgeCache: (key: string) => void;
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

	/**
	 * Stores a value in cookies under the specified key, along with a timestamp.
	 *
	 * @param key - The key to store the cached value under.
	 * @param value - The value to cache (any serializable type).
	 *
	 * @remarks
	 * - The value is wrapped with a timestamp (`ts`) to track expiration.
	 * - The cookie's expiration is set based on `maxAge` (converted to seconds).
	 * - If an error occurs during serialization or storage, sets an error message and logs the error.
	 */
	const setCache = useCallback(
		(key: string, value: any) => {
			try {
				const payload = JSON.stringify({ value, ts: Date.now() });
				// Cookie expires after maxAge (converted from ms to days)
				Cookies.set(key, payload, { expires: maxAge / (1000 * 60 * 60 * 24) });
				setCacheMessage(`Cache for ${key} set successfully.`);
			} catch (e) {
				setCacheError(`Failed to set cache for ${key}.`);
				console.error("Failed to set cache:", e);
			}
		},
		[maxAge],
	);

	/**
	 * Retrieves a cached value from cookies by key, if it exists and is not expired.
	 *
	 * @template T - The expected type of the cached value.
	 * @param {string} key - The key used to store the cached value in cookies.
	 * @returns {(T | undefined)} The cached value of type T if present and valid, otherwise undefined.
	 *
	 * @remarks
	 * - The cached value is considered valid if its timestamp (`ts`) is within the allowed `maxAge`.
	 * - If the cookie is missing, invalid, or expired, `undefined` is returned.
	 */
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

	/**
	 * Removes the specified cache entry by key using cookies, updates cache state, and displays a message.
	 * If an error occurs during removal, sets an error message and logs the error to the console.
	 *
	 * @param key - The key of the cache entry to be cleared.
	 */
	const purgeCache = useCallback((key: string) => {
		try {
			Cookies.remove(key);
			setCacheCleared(true);
			setCacheMessage(`Cache ${key} cleared successfully.`);
			setTimeout(() => setCacheCleared(false), 1500);
		} catch (e) {
			setCacheCleared(false);
			setCacheError(`Failed to clear cache for ${key}.`);
			console.error("Failed to clear cache:", e);
		}
	}, []);

	/**
	 * Clears all browser cache related to the application, including cookies, localStorage, and sessionStorage.
	 *
	 * - Iterates through all cookies and sets their expiration date to the past, effectively deleting them.
	 * - Clears all data from localStorage and sessionStorage.
	 * - Updates the `cacheCleared` state to `true` and resets it to `false` after 1.5 seconds.
	 *
	 * @remarks
	 * This function is intended to be used as a React callback to reset cached data for the current user session.
	 */
	const clearCache = useCallback(() => {
		document.cookie.split(";").forEach((c) => {
			document.cookie = c
				.replace(/^ +/, "")
				.replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
		});
		localStorage.clear();
		sessionStorage.clear();
		setCacheCleared(true);
		setTimeout(() => setCacheCleared(false), 1500);
	}, []);

	return { setCache, getCache, clearCache, purgeCache, cacheCleared, cacheError, cacheMessage };
};

export { useCache };
export type { iUseCache };
